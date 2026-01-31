
import { Check, X, Wallet, Calendar, Plus } from "lucide-react";
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
    return (
      <Card className="w-full border border-emerald-200 bg-emerald-50/50 dark:bg-emerald-950/20 overflow-hidden opacity-80">
        <CardContent className="p-3 flex items-center gap-3">
          <div className="p-1.5 rounded-full bg-emerald-100 text-emerald-600">
            <Check className="w-4 h-4" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-emerald-800 dark:text-emerald-400">Azione Completata</p>
            <p className="text-xs text-muted-foreground">
              {functionName === 'add_expense' ? `Spesa di €${args.amount} aggiunta.` : `Attività "${args.title}" aggiunta.`}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (functionName === 'add_expense') {
    return (
      <Card className="w-full border-2 border-primary/20 bg-primary/5 overflow-hidden">
        <CardHeader className="p-4 pb-2 flex flex-row items-center gap-3 space-y-0">
          <div className="p-2 rounded-full bg-emerald-100 text-emerald-600">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <CardTitle className="text-sm font-medium text-emerald-700">Nuova Spesa</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-2">
          <div className="text-lg font-bold">
            {formatCurrency(args.amount, args.currency || 'EUR')}
          </div>
          <p className="text-sm text-muted-foreground">{args.description}</p>
        </CardContent>
        <CardFooter className="p-2 bg-background/50 flex gap-2">
          <Button variant="ghost" size="sm" className="flex-1 h-8 text-xs" onClick={onCancel} disabled={isExecuting}>
            <X className="w-3 h-3 mr-1" /> Annulla
          </Button>
          <Button size="sm" className="flex-1 h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white" onClick={onConfirm} disabled={isExecuting}>
            <Check className="w-3 h-3 mr-1" /> Conferma
          </Button>
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
          <div>
            <CardTitle className="text-sm font-medium text-purple-700">Nuova Attività</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-2">
          <div className="text-lg font-bold">{args.title}</div>
          <div className="flex gap-2 text-xs text-muted-foreground mt-1">
            {args.date && <span>📅 {args.date}</span>}
            {args.time && <span>⏰ {args.time}</span>}
          </div>
        </CardContent>
        <CardFooter className="p-2 bg-background/50 flex gap-2">
          <Button variant="ghost" size="sm" className="flex-1 h-8 text-xs" onClick={onCancel} disabled={isExecuting}>
            <X className="w-3 h-3 mr-1" /> Annulla
          </Button>
          <Button size="sm" className="flex-1 h-8 text-xs bg-purple-600 hover:bg-purple-700 text-white" onClick={onConfirm} disabled={isExecuting}>
            <Check className="w-3 h-3 mr-1" /> Conferma
          </Button>
        </CardFooter>
      </Card>
    );
  }

  // Fallback
  return (
    <Card className="w-full border border-border">
      <CardHeader className="p-3">
        <CardTitle className="text-sm">Azione Richiesta: {functionName}</CardTitle>
      </CardHeader>
      <CardContent className="p-3 pt-0 text-xs text-muted-foreground">
        <pre>{JSON.stringify(args, null, 2)}</pre>
      </CardContent>
      <CardFooter className="p-2 flex gap-2">
        <Button variant="outline" size="sm" className="flex-1" onClick={onCancel}>Cancel</Button>
        <Button size="sm" className="flex-1" onClick={onConfirm}>Confirm</Button>
      </CardFooter>
    </Card>
  );
}
