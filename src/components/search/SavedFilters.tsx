import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Save, Bookmark, Trash2, Filter } from "lucide-react";
import { useSavedFilters } from "@/hooks/useSavedFilters";
import { Badge } from "@/components/ui/badge";

interface SavedFiltersProps {
  userId: string;
  filterType: "candidates" | "offers";
  currentFilters: Record<string, any>;
  onApplyFilter: (filters: Record<string, any>) => void;
}

export const SavedFilters = ({
  userId,
  filterType,
  currentFilters,
  onApplyFilter,
}: SavedFiltersProps) => {
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [filterName, setFilterName] = useState("");
  const { savedFilters, saveFilter, deleteFilter, applyFilter } = useSavedFilters(
    userId,
    filterType
  );

  const handleSaveFilter = () => {
    if (!filterName.trim()) return;
    saveFilter(filterName, currentFilters);
    setFilterName("");
    setSaveDialogOpen(false);
  };

  const handleApplyFilter = (id: string) => {
    const filters = applyFilter(id);
    if (filters) {
      onApplyFilter(filters);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {/* Saved Filters Dropdown */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <Bookmark className="h-4 w-4" />
            Filtri Salvati
            {savedFilters.length > 0 && (
              <Badge variant="secondary" className="ml-1">
                {savedFilters.length}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80">
          <div className="space-y-3">
            <h4 className="font-semibold text-sm">I tuoi filtri salvati</h4>
            {savedFilters.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Nessun filtro salvato. Salva combinazioni di filtri per trovarli velocemente.
              </p>
            ) : (
              <div className="space-y-2">
                {savedFilters.map((filter) => (
                  <div
                    key={filter.id}
                    className="flex items-center justify-between p-2 rounded-lg border border-border hover:bg-accent smooth-transition"
                  >
                    <button
                      onClick={() => handleApplyFilter(filter.id)}
                      className="flex-1 text-left text-sm font-medium hover:text-primary smooth-transition"
                    >
                      <Filter className="h-3 w-3 inline mr-1" />
                      {filter.name}
                    </button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteFilter(filter.id)}
                      className="h-7 w-7 p-0"
                    >
                      <Trash2 className="h-3 w-3 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>

      {/* Save Current Filter */}
      <Popover open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <Save className="h-4 w-4" />
            Salva Filtro
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80">
          <div className="space-y-3">
            <h4 className="font-semibold text-sm">Salva filtro corrente</h4>
            <Input
              placeholder="Nome filtro (es: Senior Milano IT)"
              value={filterName}
              onChange={(e) => setFilterName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSaveFilter()}
            />
            <Button onClick={handleSaveFilter} className="w-full" disabled={!filterName.trim()}>
              Salva
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};
