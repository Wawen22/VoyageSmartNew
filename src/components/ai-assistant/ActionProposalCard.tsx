import { Check, X, Wallet, Calendar, Plus, Building2, Plane, Lightbulb, ListChecks, MapPin, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/lib/currency";
import { cn } from "@/lib/utils";

interface ActionProposalCardProps {
  functionName: string;
  args: any;
  onConfirm: () => void;
  onCancel: () => void;
  isExecuting?: boolean;
  isExecuted?: boolean;
}

export function ActionProposalCard({ functionName, args, onConfirm, onCancel, isExecuting, isExecuted }: ActionProposalCardProps) {
  
  // 1. STATE: COMPLETED
  if (isExecuted) {
    const getSuccessMessage = () => {
      switch (functionName) {
        case 'add_expense': return `Spesa di ${formatCurrency(args.amount, args.currency || 'EUR')} salvata.`;
        case 'add_activity': return `Attività aggiunta.`;
        case 'add_accommodation': return `Alloggio salvato.`;
        case 'add_transport': return `Trasporto aggiunto.`;
        case 'add_idea': return `Idea salvata.`;
        case 'create_checklist_items': return `Checklist aggiornata.`;
        default: return "Fatto!";
      }
    };

    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg max-w-[280px]">
        <div className="bg-emerald-500 rounded-full p-0.5 shrink-0">
          <Check className="w-3 h-3 text-white" />
        </div>
        <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 truncate">
          {getSuccessMessage()}
        </span>
      </div>
    );
  }

  // 2. COMPONENT: COMPACT WRAPPER
  const CompactActionCard = ({ 
    title, 
    icon: Icon, 
    themeColor, // "emerald", "indigo", "purple", "amber", "violet", "primary"
    children 
  }: { 
    title: string, 
    icon: any, 
    themeColor: "emerald" | "indigo" | "purple" | "amber" | "violet" | "primary", 
    children: React.ReactNode 
  }) => {
    
    const themeStyles = {
      emerald: {
        header: "bg-emerald-500/10 border-emerald-500/20",
        text: "text-emerald-600 dark:text-emerald-400",
        button: "bg-emerald-600 hover:bg-emerald-700"
      },
      indigo: {
        header: "bg-indigo-500/10 border-indigo-500/20",
        text: "text-indigo-600 dark:text-indigo-400",
        button: "bg-indigo-600 hover:bg-indigo-700"
      },
      purple: {
        header: "bg-purple-500/10 border-purple-500/20",
        text: "text-purple-600 dark:text-purple-400",
        button: "bg-purple-600 hover:bg-purple-700"
      },
      amber: {
        header: "bg-amber-500/10 border-amber-500/20",
        text: "text-amber-600 dark:text-amber-400",
        button: "bg-amber-500 hover:bg-amber-600"
      },
      violet: {
        header: "bg-violet-500/10 border-violet-500/20",
        text: "text-violet-600 dark:text-violet-400",
        button: "bg-violet-600 hover:bg-violet-700"
      },
      primary: {
        header: "bg-slate-500/10 border-slate-500/20",
        text: "text-slate-600 dark:text-slate-400",
        button: "bg-primary hover:bg-primary/90"
      }
    };

    const style = themeStyles[themeColor];

    return (
      <Card className="w-full max-w-[280px] overflow-hidden border shadow-md bg-card">
        {/* Compact Header */}
        <div className={cn("px-3 py-2 flex items-center gap-2 border-b", style.header)}>
          <Icon className={cn("w-3.5 h-3.5", style.text)} />
          <span className={cn("text-[10px] font-black uppercase tracking-wider", style.text)}>
            {title}
          </span>
        </div>

        {/* Content */}
        <div className="p-3 text-sm">
          {children}
        </div>

        {/* Footer Actions */}
        <div className="p-2 bg-muted/30 grid grid-cols-2 gap-2 border-t">
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 text-[10px] font-black uppercase tracking-widest text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors" 
            onClick={onCancel} 
            disabled={isExecuting}
          >
            Annulla
          </Button>
          <Button 
            size="sm" 
            className={cn("h-8 text-[10px] font-black uppercase tracking-widest text-white shadow-sm border-0 transition-all active:scale-95", style.button)} 
            onClick={onConfirm} 
            disabled={isExecuting}
          >
            Conferma
          </Button>
        </div>
      </Card>
    );
  };

  // --- SPECIFIC CARDS ---

  if (functionName === 'add_expense') {
    return (
      <CompactActionCard title="Nuova Spesa" icon={Wallet} themeColor="emerald">
        <div className="flex flex-col gap-1">
          <span className="text-xl font-black text-foreground">
            {formatCurrency(args.amount, args.currency || 'EUR')}
          </span>
          <span className="text-xs text-muted-foreground font-medium line-clamp-2">
            {args.description}
          </span>
        </div>
      </CompactActionCard>
    );
  }

  if (functionName === 'add_transport') {
    return (
      <CompactActionCard title={args.type || "Trasporto"} icon={Plane} themeColor="indigo">
        <div className="flex gap-3 py-1">
          {/* Column 1: Visual Timeline (Perfectly centered dots) */}
          <div className="flex flex-col items-center pt-1.5">
            <div className="w-2.5 h-2.5 rounded-full border-[2.5px] border-indigo-500 bg-background shrink-0" />
            <div className="w-0.5 flex-1 bg-indigo-200 dark:bg-indigo-800/50 my-0.5 min-h-[20px]" />
            <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 shrink-0" />
          </div>

          {/* Column 2: Content */}
          <div className="flex flex-col gap-4 flex-1 min-w-0">
            {/* Departure */}
            <div className="flex flex-col gap-0.5">
              <span className="text-[9px] text-muted-foreground font-black uppercase tracking-tighter leading-none">Partenza</span>
              <span className="font-bold text-sm leading-tight truncate">{args.departure_location}</span>
              {args.departure_date && <span className="text-[10px] font-medium opacity-70">{args.departure_date}</span>}
            </div>

            {/* Arrival */}
            <div className="flex flex-col gap-0.5">
              <span className="text-[9px] text-muted-foreground font-black uppercase tracking-tighter leading-none">Arrivo</span>
              <span className="font-bold text-sm leading-tight truncate">{args.arrival_location}</span>
              {args.arrival_date && <span className="text-[10px] font-medium opacity-70">{args.arrival_date}</span>}
            </div>
          </div>
        </div>

        {/* Extra Info: Stops & Price */}
        {(args.stops || args.price) && (
          <div className="mt-3 pt-2 border-t border-indigo-100 dark:border-indigo-900/30 flex justify-between items-center">
            <div className="text-[10px] text-muted-foreground italic truncate max-w-[60%]">
              {args.stops && <span>Via: {args.stops}</span>}
            </div>
            {args.price && <span className="font-black text-indigo-600 text-sm">{formatCurrency(args.price, 'EUR')}</span>}
          </div>
        )}
      </CompactActionCard>
    );
  }

  if (functionName === 'add_accommodation') {
    return (
      <CompactActionCard title="Hotel / Alloggio" icon={Building2} themeColor="indigo">
        <div className="flex flex-col gap-2">
          <div className="font-bold text-sm leading-tight truncate">{args.name}</div>
          {args.address && (
            <div className="flex items-start gap-1 text-[10px] text-muted-foreground font-medium">
              <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <span className="line-clamp-2">{args.address}</span>
            </div>
          )}
          <div className="flex gap-2 mt-1">
            <div className="flex-1 bg-muted/50 p-1.5 rounded-md text-center border border-indigo-100/20">
              <div className="text-[8px] text-muted-foreground uppercase font-black">In</div>
              <div className="text-[10px] font-black text-indigo-700 dark:text-indigo-300">{args.check_in}</div>
            </div>
            <div className="flex-1 bg-muted/50 p-1.5 rounded-md text-center border border-rose-100/20">
              <div className="text-[8px] text-muted-foreground uppercase font-black">Out</div>
              <div className="text-[10px] font-black text-rose-700 dark:text-rose-300">{args.check_out}</div>
            </div>
          </div>
          {args.price && <div className="text-right font-black text-indigo-600 text-xs mt-1">{formatCurrency(args.price, 'EUR')}</div>}
        </div>
      </CompactActionCard>
    );
  }

  if (functionName === 'add_activity') {
    return (
      <CompactActionCard title="Attività" icon={Calendar} themeColor="purple">
        <div className="flex flex-col gap-2">
          <div className="font-bold text-sm">{args.title}</div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground font-medium">
            {args.date && <div className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {args.date}</div>}
            {args.time && <div className="flex items-center gap-1"><Clock className="w-3 h-3" /> {args.time}</div>}
          </div>
        </div>
      </CompactActionCard>
    );
  }

  if (functionName === 'add_idea') {
    return (
      <CompactActionCard title="Salva Idea" icon={Lightbulb} themeColor="amber">
        <div className="flex flex-col gap-1">
          <span className="font-bold text-xs truncate">{args.title}</span>
          <div className="bg-amber-50 dark:bg-amber-950/20 p-2 rounded text-[10px] text-muted-foreground italic border-l-2 border-amber-300 font-medium">
            "{args.content}"
          </div>
        </div>
      </CompactActionCard>
    );
  }

  if (functionName === 'create_checklist_items') {
    return (
      <CompactActionCard title="Checklist" icon={ListChecks} themeColor="violet">
        <div className="flex flex-col gap-2">
          <span className="text-xs font-medium text-foreground">Aggiungi <b>{(args.items || []).length}</b> elementi:</span>
          <div className="flex flex-wrap gap-1">
            {(args.items || []).slice(0, 4).map((item: string, i: number) => (
              <span key={i} className="text-[9px] px-1.5 py-0.5 bg-muted rounded border border-violet-100/50 truncate max-w-[80px] font-bold">
                {item}
              </span>
            ))}
            {(args.items || []).length > 4 && <span className="text-[9px] text-muted-foreground font-bold">+{args.items.length - 4}</span>}
          </div>
        </div>
      </CompactActionCard>
    );
  }

  // Fallback
  return (
    <CompactActionCard title="Azione" icon={Plus} themeColor="primary">
      <pre className="text-[9px] bg-muted p-2 rounded overflow-x-hidden whitespace-pre-wrap font-mono">
        {JSON.stringify(args, null, 2)}
      </pre>
    </CompactActionCard>
  );
}