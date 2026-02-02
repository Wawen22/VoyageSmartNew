import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Link } from "react-router-dom";

interface TripsHeaderProps {
  tripCount: number;
}

export function TripsHeader({ tripCount }: TripsHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8">
      <div>
        <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent mb-2">
          I Miei Viaggi
        </h1>
        <p className="text-muted-foreground text-lg">
          Gestisci le tue avventure ({tripCount} {tripCount === 1 ? 'viaggio' : 'viaggi'})
        </p>
      </div>
      <Link to="/trips/new">
        <Button size="lg" className="shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all rounded-full px-6">
          <Plus className="w-5 h-5 mr-2" />
          Nuovo Viaggio
        </Button>
      </Link>
    </div>
  );
}
