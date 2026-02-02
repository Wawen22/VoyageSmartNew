import { Search, Filter, LayoutGrid, Map as MapIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuHeader,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
  statusFilter,
  onStatusFilterChange,
}: TripsFilterBarProps) {
  return (
    <div className="flex flex-col md:flex-row gap-4 mb-6 sticky top-20 z-20 bg-background/80 backdrop-blur-md p-4 rounded-xl border border-border/40 shadow-sm">
      <div className="relative flex-1">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Cerca per destinazione o nome..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 h-10 bg-secondary/30 border-border/50 focus:bg-background transition-all"
        />
      </div>
      <div className="flex gap-2">
        <DropdownMenu>
           <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-10 px-4 border-border/50 bg-secondary/30">
              <Filter className="w-4 h-4 mr-2" />
              Filtra
              {statusFilter.length > 0 && <span className="ml-2 bg-primary text-primary-foreground text-[10px] px-1.5 py-0.5 rounded-full">{statusFilter.length}</span>}
            </Button>
           </DropdownMenuTrigger>
           <DropdownMenuContent align="end" className="w-56">
             <DropdownMenuLabel>Stato Viaggio</DropdownMenuLabel>
             <DropdownMenuSeparator />
             {['planning', 'upcoming', 'active', 'completed'].map((status) => (
               <DropdownMenuCheckboxItem
                  key={status}
                  checked={statusFilter.includes(status)}
                  onCheckedChange={() => onStatusFilterChange(status)}
               >
                 {status === 'planning' && 'In Pianificazione'}
                 {status === 'upcoming' && 'In Arrivo'}
                 {status === 'active' && 'In Corso'}
                 {status === 'completed' && 'Completato'}
               </DropdownMenuCheckboxItem>
             ))}
           </DropdownMenuContent>
        </DropdownMenu>

        <div className="flex items-center bg-secondary/30 border border-border/50 p-1 rounded-lg">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'ghost'}
            size="sm"
            className="h-8 px-3 rounded-md"
            onClick={() => onViewModeChange('grid')}
          >
            <LayoutGrid className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === 'map' ? 'default' : 'ghost'}
            size="sm"
            className="h-8 px-3 rounded-md"
            onClick={() => onViewModeChange('map')}
          >
            <MapIcon className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
