import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Link } from "react-router-dom";

interface TripsHeaderProps {
  tripCount: number;
}

export function TripsHeader({ tripCount }: TripsHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8">
      <div className="flex items-center gap-3">
        <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent leading-[3rem] py-1">
          I Miei Viaggi
        </h1>
        <span className="px-3 py-1 rounded-full bg-secondary/50 border border-border/50 text-sm font-medium text-muted-foreground self-center">
          {tripCount} {tripCount === 1 ? 'viaggio' : 'viaggi'}
        </span>
      </div>
      <Link to="/trips/new" className="hidden md:block">
        <Button size="lg" className="shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all rounded-full px-6">
          <Plus className="w-5 h-5 mr-2" />
          Nuovo Viaggio
        </Button>
      </Link>
    </div>
  );
}
