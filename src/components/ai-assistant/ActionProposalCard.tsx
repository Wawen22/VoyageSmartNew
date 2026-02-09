
import { Check, X, Wallet, Calendar, Plus, Building2, TicketsPlane, Lightbulb, ListChecks } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/currency";

interface ActionProposalCardProps {
  functionName: string;
  args: any;
  onConfirm: () => void;
  onCancel: () => void;
  isExecuting?: boolean;
  isExecuted?: boolean;
}

export function ActionProposalCard({ functionName, args, onConfirm, onCancel, isExecuting, isExecuted }: ActionProposalCardProps) {
  
  if (isExecuted) {
    const getSuccessMessage = () => {
      switch (functionName) {
        case 'add_expense': return `Spesa di ${formatCurrency(args.amount, args.currency || 'EUR')} aggiunta.`;
        case 'add_activity': return `Attività "${args.title}" aggiunta all'itinerario.`;
        case 'add_accommodation': return `Alloggio "${args.name}" aggiunto.`;
        case 'add_transport': return `Trasporto ${args.type} per ${args.arrival_location} aggiunto.`;
        case 'add_idea': return `Idea "${args.title}" salvata nella bacheca.`;
        case 'create_checklist_items': return `${args.items?.length || 0} elementi aggiunti alla checklist.`;
        default: return "Azione completata con successo.";
      }
    };

    return (
      <Card className="w-full border border-emerald-200 bg-emerald-50/50 dark:bg-emerald-950/20 overflow-hidden opacity-80">
        <CardContent className="p-3 flex items-center gap-3">
          <div className="p-1.5 rounded-full bg-emerald-100 text-emerald-600">
            <Check className="w-4 h-4" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-emerald-800 dark:text-emerald-400">Azione Completata</p>
            <p className="text-xs text-muted-foreground">{getSuccessMessage()}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // --- RENDERING CARDS FOR DIFFERENT TOOLS ---

  if (functionName === 'add_expense') {
    return (
      <Card className="w-full border-2 border-primary/20 bg-primary/5 overflow-hidden">
        <CardHeader className="p-4 pb-2 flex flex-row items-center gap-3 space-y-0">
          <div className="p-2 rounded-full bg-emerald-100 text-emerald-600">
            <Wallet className="w-5 h-5" />
          </div>
          <CardTitle className="text-sm font-medium text-emerald-700">Nuova Spesa</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-2">
          <div className="text-lg font-bold">{formatCurrency(args.amount, args.currency || 'EUR')}</div>
          <p className="text-sm text-muted-foreground">{args.description}</p>
        </CardContent>
        <CardFooter className="p-2 bg-background/50 flex gap-2">
          <Button variant="ghost" size="sm" className="flex-1 h-8 text-xs" onClick={onCancel} disabled={isExecuting}><X className="w-3 h-3 mr-1" /> Annulla</Button>
          <Button size="sm" className="flex-1 h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white" onClick={onConfirm} disabled={isExecuting}><Check className="w-3 h-3 mr-1" /> Conferma</Button>
        </CardFooter>
      </Card>
    );
  }

  if (functionName === 'add_activity') {
    return (
      <Card className="w-full border-2 border-primary/20 bg-primary/5 overflow-hidden">
        <CardHeader className="p-4 pb-2 flex flex-row items-center gap-3 space-y-0">
          <div className="p-2 rounded-full bg-purple-100 text-purple-600">
            <Calendar className="w-5 h-5" />
          </div>
          <CardTitle className="text-sm font-medium text-purple-700">Nuova Attività</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-2">
          <div className="text-lg font-bold">{args.title}</div>
          <div className="flex gap-2 text-xs text-muted-foreground mt-1">
            {args.date && <span>📅 {args.date}</span>}
            {args.time && <span>⏰ {args.time}</span>}
          </div>
        </CardContent>
        <CardFooter className="p-2 bg-background/50 flex gap-2">
          <Button variant="ghost" size="sm" className="flex-1 h-8 text-xs" onClick={onCancel} disabled={isExecuting}><X className="w-3 h-3 mr-1" /> Annulla</Button>
          <Button size="sm" className="flex-1 h-8 text-xs bg-purple-600 hover:bg-purple-700 text-white" onClick={onConfirm} disabled={isExecuting}><Check className="w-3 h-3 mr-1" /> Conferma</Button>
        </CardFooter>
      </Card>
    );
  }

  if (functionName === 'add_accommodation') {
    return (
      <Card className="w-full border-2 border-indigo-200 bg-indigo-50/10 dark:bg-indigo-950/10 overflow-hidden">
        <CardHeader className="p-4 pb-2 flex flex-row items-center gap-3 space-y-0">
          <div className="p-2 rounded-full bg-indigo-100 text-indigo-600">
            <Building2 className="w-5 h-5" />
          </div>
          <CardTitle className="text-sm font-medium text-indigo-700">Nuovo Alloggio</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-2">
          <div className="text-lg font-bold">{args.name}</div>
          <p className="text-xs text-muted-foreground mb-2">{args.address}</p>
          <div className="flex gap-3 text-xs font-medium">
            <span className="bg-indigo-100 dark:bg-indigo-900/50 px-2 py-1 rounded">IN: {args.check_in}</span>
            <span className="bg-rose-100 dark:bg-rose-950/50 px-2 py-1 rounded">OUT: {args.check_out}</span>
          </div>
          {args.price && <p className="mt-2 text-sm font-bold text-indigo-600">{formatCurrency(args.price, 'EUR')}</p>}
        </CardContent>
        <CardFooter className="p-2 bg-background/50 flex gap-2">
          <Button variant="ghost" size="sm" className="flex-1 h-8 text-xs" onClick={onCancel} disabled={isExecuting}><X className="w-3 h-3 mr-1" /> Annulla</Button>
          <Button size="sm" className="flex-1 h-8 text-xs bg-indigo-600 hover:bg-indigo-700 text-white" onClick={onConfirm} disabled={isExecuting}><Check className="w-3 h-3 mr-1" /> Conferma</Button>
        </CardFooter>
      </Card>
    );
  }

  if (functionName === 'add_transport') {
    return (
      <Card className="w-full border-2 border-sky-200 bg-sky-50/10 dark:bg-sky-950/10 overflow-hidden">
        <CardHeader className="p-4 pb-2 flex flex-row items-center gap-3 space-y-0">
          <div className="p-2 rounded-full bg-sky-100 text-sky-600">
            <TicketsPlane className="w-5 h-5" />
          </div>
          <CardTitle className="text-sm font-medium text-sky-700 uppercase">{args.type || 'Trasporto'}</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-2">
          <div className="flex items-center justify-between mb-2">
            <div className="text-center flex-1">
              <div className="text-xs text-muted-foreground uppercase">Partenza</div>
              <div className="font-bold">{args.departure_location}</div>
            </div>
            <div className="px-4 text-sky-400">→</div>
            <div className="text-center flex-1">
              <div className="text-xs text-muted-foreground uppercase">Arrivo</div>
              <div className="font-bold">{args.arrival_location}</div>
            </div>
          </div>
          <div className="text-xs text-center text-muted-foreground">
            📅 {args.departure_date}
          </div>
        </CardContent>
        <CardFooter className="p-2 bg-background/50 flex gap-2">
          <Button variant="ghost" size="sm" className="flex-1 h-8 text-xs" onClick={onCancel} disabled={isExecuting}><X className="w-3 h-3 mr-1" /> Annulla</Button>
          <Button size="sm" className="flex-1 h-8 text-xs bg-sky-600 hover:bg-sky-700 text-white" onClick={onConfirm} disabled={isExecuting}><Check className="w-3 h-3 mr-1" /> Conferma</Button>
        </CardFooter>
      </Card>
    );
  }

  if (functionName === 'add_idea') {
    return (
      <Card className="w-full border-2 border-amber-200 bg-amber-50/10 dark:bg-amber-950/10 overflow-hidden">
        <CardHeader className="p-4 pb-2 flex flex-row items-center gap-3 space-y-0">
          <div className="p-2 rounded-full bg-amber-100 text-amber-600">
            <Lightbulb className="w-5 h-5" />
          </div>
          <CardTitle className="text-sm font-medium text-amber-700">Salva Idea</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-2">
          <div className="text-lg font-bold">{args.title}</div>
          <p className="text-sm text-muted-foreground line-clamp-2 italic">"{args.content}"</p>
        </CardContent>
        <CardFooter className="p-2 bg-background/50 flex gap-2">
          <Button variant="ghost" size="sm" className="flex-1 h-8 text-xs" onClick={onCancel} disabled={isExecuting}><X className="w-3 h-3 mr-1" /> Annulla</Button>
          <Button size="sm" className="flex-1 h-8 text-xs bg-amber-500 hover:bg-amber-600 text-white" onClick={onConfirm} disabled={isExecuting}><Check className="w-3 h-3 mr-1" /> Conferma</Button>
        </CardFooter>
      </Card>
    );
  }

  if (functionName === 'create_checklist_items') {
    return (
      <Card className="w-full border-2 border-violet-200 bg-violet-50/10 dark:bg-violet-950/10 overflow-hidden">
        <CardHeader className="p-4 pb-2 flex flex-row items-center gap-3 space-y-0">
          <div className="p-2 rounded-full bg-violet-100 text-violet-600">
            <ListChecks className="w-5 h-5" />
          </div>
          <CardTitle className="text-sm font-medium text-violet-700">Checklist</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-2">
          <div className="text-sm font-bold mb-2">Aggiungi {(args.items || []).length} elementi:</div>
          <div className="flex flex-wrap gap-1">
            {(args.items || []).slice(0, 5).map((item: string, i: number) => (
              <span key={i} className="text-[10px] bg-violet-100 dark:bg-violet-900/50 px-2 py-0.5 rounded-full">{item}</span>
            ))}
            {(args.items || []).length > 5 && <span className="text-[10px] text-muted-foreground">+{args.items.length - 5} altri</span>}
          </div>
        </CardContent>
        <CardFooter className="p-2 bg-background/50 flex gap-2">
          <Button variant="ghost" size="sm" className="flex-1 h-8 text-xs" onClick={onCancel} disabled={isExecuting}><X className="w-3 h-3 mr-1" /> Annulla</Button>
          <Button size="sm" className="flex-1 h-8 text-xs bg-violet-600 hover:bg-violet-700 text-white" onClick={onConfirm} disabled={isExecuting}><Check className="w-3 h-3 mr-1" /> Conferma</Button>
        </CardFooter>
      </Card>
    );
  }

  // Fallback
  return (
    <Card className="w-full border border-border overflow-hidden">
      <CardHeader className="p-3 bg-muted/30">
        <CardTitle className="text-sm flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Azione Richiesta: {functionName}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 text-xs text-muted-foreground">
        <div className="bg-slate-950 rounded p-2 overflow-x-auto">
          <pre className="text-slate-300 font-mono">{JSON.stringify(args, null, 2)}</pre>
        </div>
      </CardContent>
      <CardFooter className="p-2 bg-muted/10 flex gap-2">
        <Button variant="ghost" size="sm" className="flex-1 h-8 text-xs" onClick={onCancel} disabled={isExecuting}><X className="w-3 h-3 mr-1" /> Annulla</Button>
        <Button size="sm" className="flex-1 h-8 text-xs" onClick={onConfirm} disabled={isExecuting}><Check className="w-3 h-3 mr-1" /> Conferma</Button>
      </CardFooter>
    </Card>
  );
}

