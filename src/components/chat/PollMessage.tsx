import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Loader2, Check, Users, Trophy } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import { it } from "date-fns/locale";

interface PollOption {
  id: string;
  text: string;
  votes_count: number;
}

interface VoteDetail {
  user_id: string;
  option_id: string;
  created_at: string;
  profile?: {
    full_name: string | null;
    username: string | null;
    avatar_url: string | null;
  };
}

interface PollData {
  id: string;
  question: string;
  allow_multiple_answers: boolean;
  options: PollOption[];
  user_votes: string[]; // IDs of selected options
  all_votes: VoteDetail[];
}

interface PollMessageProps {
  pollId: string;
  isMe: boolean;
}

export function PollMessage({ pollId, isMe }: PollMessageProps) {
  const { user } = useAuth();
  const [poll, setPoll] = useState<PollData | null>(null);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState<string | null>(null);
  const [isVotesDialogOpen, setIsVotesDialogOpen] = useState(false);

  const fetchPollData = useCallback(async () => {
    if (!user) return;

    try {
      // Fetch poll and options
      const { data: pollData, error: pollError } = await supabase
        .from('trip_polls')
        .select(`
          id,
          question,
          allow_multiple_answers,
          trip_poll_options (
            id,
            text
          )
        `)
        .eq('id', pollId)
        .single();

      if (pollError) throw pollError;

      // Fetch votes with profiles
      const { data: votesData, error: votesError } = await supabase
        .from('trip_poll_votes')
        .select(`
          option_id, 
          user_id, 
          created_at
        `)
        .eq('poll_id', pollId);

      if (votesError) throw votesError;

      // Fetch voter profiles
      const userIds = [...new Set(votesData.map(v => v.user_id))];
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('user_id, full_name, username, avatar_url')
        .in('user_id', userIds);

      const votesWithProfiles: VoteDetail[] = votesData.map(vote => ({
        ...vote,
        profile: profilesData?.find(p => p.user_id === vote.user_id)
      }));

      const userVotes = votesData
        .filter(v => v.user_id === user.id)
        .map(v => v.option_id);
      
      const optionsWithVotes = pollData.trip_poll_options.map((opt: { id: string; text: string }) => ({
        id: opt.id,
        text: opt.text,
        votes_count: votesData.filter(v => v.option_id === opt.id).length
      }));

      setPoll({
        id: pollData.id,
        question: pollData.question,
        allow_multiple_answers: pollData.allow_multiple_answers,
        options: optionsWithVotes,
        user_votes: userVotes,
        all_votes: votesWithProfiles
      });
    } catch (error) {
      console.error("Error fetching poll:", error);
    } finally {
      setLoading(false);
    }
  }, [pollId, user]);

  useEffect(() => {
    fetchPollData();

    // Subscribe to vote changes
    const channel = supabase
      .channel(`poll-${pollId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'trip_poll_votes', filter: `poll_id=eq.${pollId}` },
        () => {
          fetchPollData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [pollId, user, fetchPollData]);

  const handleVote = async (optionId: string) => {
    if (!user || voting || !poll) return;

    const isAlreadyVoted = poll.user_votes.includes(optionId);
    setVoting(optionId);
    
    // Save current state for rollback
    const previousPoll = JSON.parse(JSON.stringify(poll));
    
    // Optimistic Update
    setPoll(prev => {
      if (!prev) return null;
      
      let newUserVotes = [...prev.user_votes];
      let newOptions = prev.options.map(opt => ({ ...opt }));
      
      if (isAlreadyVoted) {
        // Remove vote
        newUserVotes = newUserVotes.filter(id => id !== optionId);
        newOptions = newOptions.map(opt => 
          opt.id === optionId ? { ...opt, votes_count: Math.max(0, opt.votes_count - 1) } : opt
        );
      } else {
        // Add vote
        if (!prev.allow_multiple_answers) {
          // If single choice, remove previous votes from counts
          newOptions = newOptions.map(opt => {
            if (newUserVotes.includes(opt.id)) {
              return { ...opt, votes_count: Math.max(0, opt.votes_count - 1) };
            }
            return opt;
          });
          newUserVotes = [];
        }
        
        newUserVotes.push(optionId);
        newOptions = newOptions.map(opt => 
          opt.id === optionId ? { ...opt, votes_count: opt.votes_count + 1 } : opt
        );
      }
      
      return {
        ...prev,
        user_votes: newUserVotes,
        options: newOptions
      };
    });

    try {
      if (isAlreadyVoted) {
        // Remove vote from DB
        const { error } = await supabase
          .from('trip_poll_votes')
          .delete()
          .eq('poll_id', pollId)
          .eq('option_id', optionId)
          .eq('user_id', user.id);
        if (error) throw error;
      } else {
        // If single choice, delete all existing votes for this user/poll first
        if (!poll.allow_multiple_answers) {
          const { error: deleteError } = await supabase
            .from('trip_poll_votes')
            .delete()
            .eq('poll_id', pollId)
            .eq('user_id', user.id);
          
          if (deleteError) throw deleteError;
        }

        // Insert new vote
        const { error } = await supabase
          .from('trip_poll_votes')
          .insert({
            poll_id: pollId,
            option_id: optionId,
            user_id: user.id
          });
        if (error) throw error;
      }
    } catch (error) {
      console.error("Error voting:", error);
      setPoll(previousPoll); // Rollback on error
    } finally {
      setVoting(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="w-4 h-4 animate-spin" />
      </div>
    );
  }

  if (!poll) return <p className="text-destructive italic">Sondaggio non disponibile.</p>;

  const totalVotes = poll.options.reduce((sum, opt) => sum + opt.votes_count, 0);
  const sortedOptionsByVotes = [...poll.options].sort((a, b) => b.votes_count - a.votes_count);
  const winner = sortedOptionsByVotes[0].votes_count > 0 ? sortedOptionsByVotes[0] : null;

  return (
    <>
      <div className="space-y-4 min-w-[220px] sm:min-w-[300px] py-1">
        <div className="flex items-start gap-2">
          <div className="bg-emerald-500/20 p-1.5 rounded-lg shrink-0">
            <Check className="w-4 h-4 text-emerald-600" />
          </div>
          <h3 className="font-bold text-sm sm:text-base text-emerald-900 leading-tight pt-0.5">
            {poll.question}
          </h3>
        </div>
        
        <div className="space-y-2">
          {poll.options.map((option) => {
            const percentage = totalVotes > 0 ? (option.votes_count / totalVotes) * 100 : 0;
            const isSelected = poll.user_votes.includes(option.id);
            
            return (
              <div key={option.id} className="group">
                <button
                  onClick={() => handleVote(option.id)}
                  disabled={!!voting}
                  className={`
                    w-full text-left transition-all relative overflow-hidden rounded-xl p-3
                    ${isSelected 
                      ? "bg-emerald-500/15 border-emerald-500/40 ring-1 ring-emerald-500/20" 
                      : "bg-white/50 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 border-transparent"
                    }
                    border shadow-sm
                  `}
                >
                  <div className="flex justify-between items-center relative z-10 mb-2">
                    <span className={`flex items-center gap-2 text-sm font-medium ${isSelected ? "text-emerald-900" : "text-muted-foreground group-hover:text-foreground"}`}>
                      {option.text}
                      {isSelected && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                    </span>
                    <span className="text-[10px] font-bold text-emerald-700/70 bg-emerald-500/10 px-1.5 py-0.5 rounded-full">
                      {Math.round(percentage)}%
                    </span>
                  </div>
                  
                  <div className="relative h-1.5 w-full bg-emerald-100/50 dark:bg-emerald-950/30 rounded-full overflow-hidden">
                    <div 
                      className={`absolute left-0 top-0 h-full transition-all duration-500 ease-out rounded-full ${isSelected ? "bg-emerald-500" : "bg-emerald-400/50"}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  
                  <div className="flex justify-end mt-1 relative z-10">
                    <span className="text-[9px] font-medium text-emerald-800/60 uppercase tracking-wider">
                      {option.votes_count} {option.votes_count === 1 ? 'voto' : 'voti'}
                    </span>
                  </div>
                </button>
              </div>
            );
          })}
        </div>
        
        <div className="flex items-center justify-between pt-2 border-t border-emerald-200/50">
          <button 
            onClick={() => setIsVotesDialogOpen(true)}
            className="text-[10px] font-bold text-emerald-600 hover:text-emerald-700 underline underline-offset-2 flex items-center gap-1 transition-colors"
          >
            <Users className="w-3 h-3" />
            Mostra voti
          </button>
          
          <div className="flex items-center gap-2">
            <p className="text-[10px] font-medium text-emerald-800/50 uppercase tracking-tighter">
              {totalVotes} {totalVotes === 1 ? 'voto' : 'voti'} • {poll.allow_multiple_answers ? "Multi" : "Singola"}
            </p>
            {poll.user_votes.length > 0 && (
              <span className="text-[9px] bg-emerald-500/10 text-emerald-700 px-2 py-0.5 rounded-full font-bold">
                Votato
              </span>
            )}
          </div>
        </div>
      </div>

      <Dialog open={isVotesDialogOpen} onOpenChange={setIsVotesDialogOpen}>
        <DialogContent className="sm:max-w-[400px] p-0 overflow-hidden gap-0 border-emerald-100 shadow-2xl">
          <DialogHeader className="p-6 bg-emerald-500 text-white">
            <DialogTitle className="flex items-center gap-3 text-lg">
              <Users className="w-5 h-5" />
              Dettagli Voti
            </DialogTitle>
            <p className="text-emerald-50/80 text-xs mt-1 font-medium uppercase tracking-widest">
              {poll.question}
            </p>
          </DialogHeader>

          <div className="max-h-[60vh] overflow-y-auto p-0">
            {winner && (
              <div className="bg-emerald-50 p-4 border-b border-emerald-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-yellow-100 p-2 rounded-full border border-yellow-200 shadow-sm">
                    <Trophy className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-emerald-800/50 uppercase tracking-tighter leading-none">
                      Opzione più votata
                    </p>
                    <p className="font-bold text-emerald-900 text-sm">{winner.text}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-black text-emerald-600">{winner.votes_count}</p>
                  <p className="text-[9px] font-bold text-emerald-800/40 uppercase -mt-1">Voti</p>
                </div>
              </div>
            )}

            <div className="bg-slate-50/30">
              {poll.options.map((option, index) => {
                const voters = poll.all_votes.filter(v => v.option_id === option.id);
                if (voters.length === 0) return null;

                return (
                  <div key={option.id} className={`mb-4 last:mb-0 bg-white border-y border-slate-100 shadow-sm`}>
                    <div className="bg-emerald-50/50 px-6 py-3 flex justify-between items-center sticky top-0 z-10 backdrop-blur-md border-b border-emerald-100/50">
                      <div className="flex items-center gap-2 overflow-hidden">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                        <span className="font-bold text-sm text-emerald-900 truncate">{option.text}</span>
                      </div>
                      <span className="bg-emerald-100 text-emerald-700 text-[10px] font-black px-2.5 py-1 rounded-full border border-emerald-200 shrink-0">
                        {voters.length} {voters.length === 1 ? 'VOTO' : 'VOTI'}
                      </span>
                    </div>
                    <div className="px-6 py-4 space-y-4">
                      {voters.map((vote) => (
                        <div key={`${vote.user_id}-${vote.option_id}`} className="flex items-center justify-between group animate-in fade-in slide-in-from-left-2 duration-300">
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <Avatar className="w-9 h-9 border-2 border-white shadow-sm group-hover:scale-105 transition-transform ring-1 ring-slate-100">
                                <AvatarImage src={vote.profile?.avatar_url || ""} />
                                <AvatarFallback className="text-[10px] bg-emerald-100 text-emerald-700 font-bold">
                                  {vote.profile?.full_name?.charAt(0) || vote.profile?.username?.charAt(0) || "?"}
                                </AvatarFallback>
                              </Avatar>
                              {vote.user_id === user.id && (
                                <div className="absolute -bottom-1 -right-1 bg-emerald-500 rounded-full p-0.5 border-2 border-white shadow-sm">
                                  <Check className="w-2 h-2 text-white" />
                                </div>
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-900 leading-tight">
                                {vote.profile?.full_name || vote.profile?.username || "Utente"}
                              </p>
                              <p className="text-[10px] text-slate-400 font-medium">
                                {format(new Date(vote.created_at), "d MMMM, HH:mm", { locale: it })}
                              </p>
                            </div>
                          </div>
                          {vote.user_id === user.id && (
                            <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-100 uppercase tracking-tighter shadow-sm">
                              Tu
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
            
            {poll.all_votes.length === 0 && (
              <div className="p-12 text-center text-muted-foreground opacity-50 italic text-sm">
                Nessun voto registrato.
              </div>
            )}
          </div>
          
          <div className="p-4 bg-slate-50 border-t border-slate-100 text-center">
            <p className="text-[10px] text-slate-400 font-medium">
              Totale {poll.all_votes.length} {poll.all_votes.length === 1 ? 'voto espresso' : 'voti espressi'}
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
