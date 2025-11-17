import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X, Filter } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

interface Filters {
  minScore?: number;
  essentialSkills?: string[];
  minExperience?: number;
  availability?: string;
}

interface RankingFiltersProps {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
}

export const RankingFilters = ({ filters, onFiltersChange }: RankingFiltersProps) => {
  const [localFilters, setLocalFilters] = useState<Filters>(filters);
  const [skillInput, setSkillInput] = useState("");

  const handleAddSkill = () => {
    if (skillInput.trim()) {
      const currentSkills = localFilters.essentialSkills || [];
      setLocalFilters({
        ...localFilters,
        essentialSkills: [...currentSkills, skillInput.trim()]
      });
      setSkillInput("");
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setLocalFilters({
      ...localFilters,
      essentialSkills: localFilters.essentialSkills?.filter(s => s !== skillToRemove)
    });
  };

  const handleApplyFilters = () => {
    onFiltersChange(localFilters);
  };

  const handleResetFilters = () => {
    const emptyFilters = {};
    setLocalFilters(emptyFilters);
    onFiltersChange(emptyFilters);
  };

  const activeFiltersCount = Object.keys(filters).length;

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" className="relative">
          <Filter className="h-4 w-4 mr-2" />
          Filtri
          {activeFiltersCount > 0 && (
            <Badge className="ml-2 px-1.5 py-0.5 h-5 min-w-5">
              {activeFiltersCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Filtri Avanzati</SheetTitle>
          <SheetDescription>
            Filtra i candidati per trovare il match perfetto
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 mt-6">
          {/* Min Score */}
          <div>
            <Label htmlFor="minScore">Punteggio Minimo</Label>
            <Input
              id="minScore"
              type="number"
              min="0"
              max="100"
              placeholder="Es: 70"
              value={localFilters.minScore || ""}
              onChange={(e) => setLocalFilters({
                ...localFilters,
                minScore: e.target.value ? parseInt(e.target.value) : undefined
              })}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Mostra solo candidati con punteggio ≥ a questo valore
            </p>
          </div>

          {/* Essential Skills */}
          <div>
            <Label>Skill Essenziali</Label>
            <div className="flex gap-2 mt-2">
              <Input
                placeholder="Aggiungi skill..."
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddSkill()}
              />
              <Button onClick={handleAddSkill} size="sm">
                Aggiungi
              </Button>
            </div>
            {localFilters.essentialSkills && localFilters.essentialSkills.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {localFilters.essentialSkills.map((skill) => (
                  <Badge key={skill} variant="secondary" className="gap-1">
                    {skill}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => handleRemoveSkill(skill)}
                    />
                  </Badge>
                ))}
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              Il candidato deve avere TUTTE queste skill
            </p>
          </div>

          {/* Min Experience */}
          <div>
            <Label htmlFor="minExperience">Anni di Esperienza Minima</Label>
            <Input
              id="minExperience"
              type="number"
              min="0"
              placeholder="Es: 3"
              value={localFilters.minExperience || ""}
              onChange={(e) => setLocalFilters({
                ...localFilters,
                minExperience: e.target.value ? parseInt(e.target.value) : undefined
              })}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Mostra solo candidati con almeno N anni di esperienza
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4 border-t">
            <Button onClick={handleApplyFilters} className="flex-1">
              Applica Filtri
            </Button>
            <Button onClick={handleResetFilters} variant="outline">
              Reset
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};