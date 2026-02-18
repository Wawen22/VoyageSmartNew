import { Search, LayoutGrid, Map as MapIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface TripsFilterBarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  viewMode: 'grid' | 'map';
  onViewModeChange: (mode: 'grid' | 'map') => void;
  statusFilter: string[];
  onStatusFilterChange: (status: string) => void;
}

export function TripsFilterBar({
  searchQuery,
  onSearchChange,
  viewMode,
  onViewModeChange,
}: TripsFilterBarProps) {
  return (
    <div className="flex items-center gap-3 mb-6 sticky top-20 z-20 bg-background/80 backdrop-blur-md p-3 md:p-4 rounded-xl border border-border/40 shadow-sm">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Cerca viaggi..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9 h-10 bg-muted/50 border-border/50 focus:bg-background transition-all"
        />
      </div>
      
      <div className="flex items-center shrink-0 bg-muted/50 border border-border/50 p-1 rounded-lg">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'ghost'}
            size="sm"
            className="h-8 w-9 px-0 md:w-auto md:px-3 rounded-md"
            onClick={() => onViewModeChange('grid')}
          >
            <LayoutGrid className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === 'map' ? 'default' : 'ghost'}
            size="sm"
            className="h-8 w-9 px-0 md:w-auto md:px-3 rounded-md"
            onClick={() => onViewModeChange('map')}
          >
            <MapIcon className="w-4 h-4" />
          </Button>
      </div>
    </div>
  );
}
