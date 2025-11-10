import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { SlidersHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface SmartFiltersProps {
  onFiltersChange: (filters: FilterState) => void;
}

export interface FilterState {
  sector?: string;
  city?: string;
  minTRS?: number;
  availability?: string;
}

export const SmartFilters = ({ onFiltersChange }: SmartFiltersProps) => {
  const [open, setOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    minTRS: 0,
  });

  const handleApply = () => {
    onFiltersChange(filters);
    setOpen(false);
  };

  const handleReset = () => {
    const resetFilters = { minTRS: 0 };
    setFilters(resetFilters);
    onFiltersChange(resetFilters);
  };

  const activeFiltersCount = Object.entries(filters).filter(
    ([key, value]) => value && (key !== 'minTRS' || value > 0)
  ).length;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <SlidersHorizontal className="h-4 w-4" />
          {activeFiltersCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
            >
              {activeFiltersCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <SlidersHorizontal className="h-5 w-5" />
            Filtri Smart
          </SheetTitle>
        </SheetHeader>
        
        <div className="space-y-6 mt-6">
          <div className="space-y-2">
            <Label htmlFor="sector">Settore</Label>
            <Input
              id="sector"
              placeholder="es. IT, Marketing, Sales"
              value={filters.sector || ""}
              onChange={(e) => setFilters({ ...filters, sector: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="city">Località</Label>
            <Input
              id="city"
              placeholder="es. Milano, Roma"
              value={filters.city || ""}
              onChange={(e) => setFilters({ ...filters, city: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label>TRS Minimo: {filters.minTRS || 0}</Label>
            <Slider
              value={[filters.minTRS || 0]}
              onValueChange={(value) => setFilters({ ...filters, minTRS: value[0] })}
              max={100}
              step={5}
              className="mt-2"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="availability">Disponibilità</Label>
            <Input
              id="availability"
              placeholder="es. Immediata, 1 mese"
              value={filters.availability || ""}
              onChange={(e) => setFilters({ ...filters, availability: e.target.value })}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button onClick={handleApply} className="flex-1">
              Applica Filtri
            </Button>
            <Button onClick={handleReset} variant="outline">
              Reset
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
