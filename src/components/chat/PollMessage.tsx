import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Loader2, Check } from "lucide-react";

interface PollOption {
  id: string;
  text: string;
  votes_count: number;
}

interface PollData {
  id: string;
  question: string;
  allow_multiple_answers: boolean;
  options: PollOption[];
  user_votes: string[]; // IDs of selected options
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

      // Fetch votes
      const { data: votesData, error: votesError } = await supabase
        .from('trip_poll_votes')
        .select('option_id, user_id')
        .eq('poll_id', pollId);

      if (votesError) throw votesError;

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
        user_votes: userVotes
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

  return (
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
        <p className="text-[10px] font-medium text-emerald-800/50 uppercase tracking-tighter">
          {totalVotes} {totalVotes === 1 ? 'voto' : 'voti'} • {poll.allow_multiple_answers ? "Scelta multipla" : "Scelta singola"}
        </p>
        {poll.user_votes.length > 0 && (
          <span className="text-[9px] bg-emerald-500/10 text-emerald-700 px-2 py-0.5 rounded-full font-bold">
            Hai votato
          </span>
        )}
      </div>
    </div>
  );
}
