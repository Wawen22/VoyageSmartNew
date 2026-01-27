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
  owner: "text-amber-500",
  admin: "text-primary",
  member: "text-muted-foreground",
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
      <div className="app-surface p-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="app-surface p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-foreground">
            Viaggiatori ({members.length})
          </h3>
        </div>
        {isAdmin && (
          <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <UserPlus className="w-4 h-4 mr-2" />
                Invita
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card">
              <DialogHeader>
                <DialogTitle>Invita un viaggiatore</DialogTitle>
                <DialogDescription>
                  Inserisci l'email della persona che vuoi invitare al viaggio.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Input
                    type="email"
                    placeholder="email@esempio.com"
                    value={inviteEmail}
                    onChange={(e) => {
                      setInviteEmail(e.target.value);
                      setEmailError(null);
                    }}
                    className={cn(emailError && "border-destructive")}
                  />
                  {emailError && (
                    <p className="text-sm text-destructive">{emailError}</p>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setInviteDialogOpen(false)}
                >
                  Annulla
                </Button>
                <Button onClick={handleInvite} disabled={inviting}>
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

      {/* Members List */}
      <div className="space-y-3">
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
        <div className="mt-6 pt-6 border-t border-border/60">
          <h4 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Inviti in sospeso ({invitations.length})
          </h4>
          <div className="space-y-2">
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

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ delay: index * 0.05 }}
      className="flex items-center gap-3 p-3 rounded-xl bg-muted/40 hover:bg-muted/70 transition-colors border border-border/40"
    >
      <Avatar className="w-10 h-10">
        <AvatarImage src={member.profile?.avatar_url || undefined} />
        <AvatarFallback className="bg-primary/10 text-primary font-medium">
          {getInitials(member.profile?.full_name)}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <p className="font-medium text-foreground truncate">
          {member.profile?.full_name || "Utente"}
        </p>
        <div className="flex items-center gap-1.5">
          <RoleIcon className={cn("w-3 h-3", roleColors[member.role])} />
          <span className={cn("text-xs", roleColors[member.role])}>
            {roleLabels[member.role]}
          </span>
        </div>
      </div>

      {isAdmin && member.role !== "owner" && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-card">
            <DropdownMenuItem
              onClick={() => onUpdateRole(member.role === "admin" ? "member" : "admin")}
            >
              <Shield className="w-4 h-4 mr-2" />
              {member.role === "admin" ? "Rimuovi Admin" : "Promuovi ad Admin"}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={onRemove}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Rimuovi dal viaggio
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
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
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex items-center gap-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20"
    >
      <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
        <Mail className="w-5 h-5 text-amber-500" />
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-medium text-foreground truncate">
          {invitation.invited_email}
        </p>
        <p className="text-xs text-muted-foreground">In attesa di risposta</p>
      </div>

      {isAdmin && (
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-destructive"
          onClick={onCancel}
        >
          <X className="w-4 h-4" />
        </Button>
      )}
    </motion.div>
  );
}
