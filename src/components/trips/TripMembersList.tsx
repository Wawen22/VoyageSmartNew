import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  UserPlus,
  Crown,
  Shield,
  User,
  MoreVertical,
  Trash2,
  Mail,
  Clock,
  X,
  Loader2,
  Check,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  useTripMembers,
  TripMember,
  TripInvitation,
  TripMemberRole,
} from "@/hooks/useTripMembers";
import { cn } from "@/lib/utils";
import { z } from "zod";

const emailSchema = z.string().email("Email non valida");

interface TripMembersListProps {
  tripId: string;
}

const roleIcons: Record<TripMemberRole, typeof Crown> = {
  owner: Crown,
  admin: Shield,
  member: User,
};

const roleLabels: Record<TripMemberRole, string> = {
  owner: "Proprietario",
  admin: "Admin",
  member: "Membro",
};

const roleColors: Record<TripMemberRole, string> = {
  owner: "text-amber-500 bg-amber-500/10 border-amber-500/20",
  admin: "text-blue-500 bg-blue-500/10 border-blue-500/20",
  member: "text-slate-500 bg-slate-500/10 border-slate-500/20",
};

export function TripMembersList({ tripId }: TripMembersListProps) {
  const {
    members,
    invitations,
    loading,
    isAdmin,
    inviteMember,
    cancelInvitation,
    removeMember,
    updateMemberRole,
  } = useTripMembers(tripId);

  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviting, setInviting] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);

  const handleInvite = async () => {
    setEmailError(null);
    
    const result = emailSchema.safeParse(inviteEmail);
    if (!result.success) {
      setEmailError(result.error.errors[0]?.message || "Email non valida");
      return;
    }

    setInviting(true);
    const { success } = await inviteMember(inviteEmail);
    setInviting(false);

    if (success) {
      setInviteEmail("");
      setInviteDialogOpen(false);
    }
  };

  const getInitials = (name: string | null) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary/50" />
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden bg-card/40 backdrop-blur-xl border border-border/60 rounded-3xl p-6 shadow-sm">
      {/* Decorative Background */}
      <div className="absolute -right-20 -top-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      
      {/* Header */}
      <div className="flex items-center justify-between mb-6 relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-primary/10 text-primary border border-primary/20 shadow-sm">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-foreground leading-tight">
              Viaggiatori
            </h3>
            <p className="text-xs text-muted-foreground font-medium">
              {members.length} {members.length === 1 ? 'partecipante' : 'partecipanti'}
            </p>
          </div>
        </div>

        {isAdmin && (
          <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="rounded-xl border-primary/20 hover:bg-primary/5 hover:text-primary transition-all shadow-sm">
                <UserPlus className="w-4 h-4 mr-2" />
                Invita
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card/95 backdrop-blur-xl border-border/60 rounded-[2rem]">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold">Invita un viaggiatore</DialogTitle>
                <DialogDescription className="font-medium">
                  Inserisci l'email della persona che vuoi invitare al viaggio.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-6">
                <div className="space-y-2">
                  <Input
                    type="email"
                    placeholder="email@esempio.com"
                    value={inviteEmail}
                    onChange={(e) => {
                      setInviteEmail(e.target.value);
                      setEmailError(null);
                    }}
                    className={cn(
                        "rounded-xl border-border/60 bg-muted/30 focus-visible:ring-primary/20",
                        emailError && "border-destructive focus-visible:ring-destructive/20"
                    )}
                  />
                  {emailError && (
                    <p className="text-sm text-destructive font-medium pl-1">{emailError}</p>
                  )}
                </div>
              </div>
              <DialogFooter className="gap-2 sm:gap-0">
                <Button
                  variant="ghost"
                  onClick={() => setInviteDialogOpen(false)}
                  className="rounded-xl"
                >
                  Annulla
                </Button>
                <Button onClick={handleInvite} disabled={inviting} className="rounded-xl bg-primary shadow-lg shadow-primary/20">
                  {inviting ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Mail className="w-4 h-4 mr-2" />
                  )}
                  Invia Invito
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Members Grid/List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 relative z-10">
        <AnimatePresence mode="popLayout">
          {members.map((member, index) => (
            <MemberCard
              key={member.id}
              member={member}
              index={index}
              isAdmin={isAdmin}
              onRemove={() => removeMember(member.id)}
              onUpdateRole={(role) => updateMemberRole(member.id, role)}
              getInitials={getInitials}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Pending Invitations */}
      {invitations.length > 0 && (
        <div className="mt-8 pt-6 border-t border-border/40 relative z-10">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <Clock className="w-3.5 h-3.5" />
                Inviti in sospeso ({invitations.length})
            </h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            <AnimatePresence mode="popLayout">
              {invitations.map((invitation) => (
                <InvitationCard
                  key={invitation.id}
                  invitation={invitation}
                  isAdmin={isAdmin}
                  onCancel={() => cancelInvitation(invitation.id)}
                />
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
}

interface MemberCardProps {
  member: TripMember;
  index: number;
  isAdmin: boolean;
  onRemove: () => void;
  onUpdateRole: (role: TripMemberRole) => void;
  getInitials: (name: string | null) => string;
}

function MemberCard({
  member,
  index,
  isAdmin,
  onRemove,
  onUpdateRole,
  getInitials,
}: MemberCardProps) {
  const RoleIcon = roleIcons[member.role];
  const roleStyle = roleColors[member.role] || "text-slate-500 bg-slate-500/10 border-slate-500/20";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: index * 0.05 }}
      className="group flex items-center gap-3 p-3.5 rounded-2xl bg-background/50 border border-border/40 hover:border-primary/20 hover:bg-background transition-all shadow-sm hover:shadow-md"
    >
      <div className="relative">
        <Avatar className="w-11 h-11 border-2 border-background shadow-sm">
            <AvatarImage src={member.profile?.avatar_url || undefined} />
            <AvatarFallback className="bg-primary/5 text-primary font-bold text-sm">
            {getInitials(member.profile?.full_name)}
            </AvatarFallback>
        </Avatar>
        <div className={cn(
            "absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-background flex items-center justify-center shadow-sm",
            roleStyle.split(' ')[1], // bg color
            roleStyle.split(' ')[0]  // text color
        )}>
            <RoleIcon className="w-2.5 h-2.5" />
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
            <p className="font-bold text-foreground/90 truncate text-sm">
            {member.profile?.full_name || "Utente"}
            </p>
        </div>
        <p className="text-[10px] font-bold uppercase tracking-tighter text-muted-foreground/70">
            {roleLabels[member.role]}
        </p>
      </div>

      {isAdmin && member.role !== "owner" ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
              <MoreVertical className="w-4 h-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-card/95 backdrop-blur-xl border-border/60 rounded-xl">
            <DropdownMenuItem
              className="rounded-lg gap-2 font-medium"
              onClick={() => onUpdateRole(member.role === "admin" ? "member" : "admin")}
            >
              <Shield className="w-4 h-4 text-blue-500" />
              {member.role === "admin" ? "Rimuovi Admin" : "Promuovi ad Admin"}
            </DropdownMenuItem>
            <DropdownMenuSeparator className="opacity-50" />
            <DropdownMenuItem
              onClick={onRemove}
              className="text-destructive focus:text-destructive rounded-lg gap-2 font-medium"
            >
              <Trash2 className="w-4 h-4" />
              Rimuovi dal viaggio
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
          <div className="h-8 w-8 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <ChevronRight className="w-4 h-4 text-muted-foreground/30" />
          </div>
      )}
    </motion.div>
  );
}

interface InvitationCardProps {
  invitation: TripInvitation;
  isAdmin: boolean;
  onCancel: () => void;
}

function InvitationCard({ invitation, isAdmin, onCancel }: InvitationCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="flex items-center gap-3 p-3 rounded-2xl bg-amber-500/5 border border-amber-500/10 hover:bg-amber-500/10 transition-colors group"
    >
      <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
        <Mail className="w-5 h-5 text-amber-500" />
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-bold text-foreground/90 truncate text-xs">
          {invitation.invited_email}
        </p>
        <div className="flex items-center gap-1.5 mt-0.5">
            <div className="w-1 h-1 rounded-full bg-amber-500 animate-pulse" />
            <p className="text-[10px] font-bold text-amber-600/70 uppercase tracking-tight">In attesa</p>
        </div>
      </div>

      {isAdmin && (
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-destructive rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={onCancel}
        >
          <X className="w-4 h-4" />
        </Button>
      )}
    </motion.div>
  );
}