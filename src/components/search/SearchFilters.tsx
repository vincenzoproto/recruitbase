import { useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

interface SearchFiltersProps {
  userRole: 'recruiter' | 'candidate';
  onSearch: (query: string, filters: SearchFilterValues) => void;
}

export interface SearchFilterValues {
  city?: string;
  experienceLevel?: string;
  sector?: string;
  skills?: string[];
}

const CITIES = [
  'Milano', 'Roma', 'Torino', 'Napoli', 'Bologna', 'Firenze', 'Venezia', 
  'Genova', 'Palermo', 'Bari', 'Verona', 'Padova'
];

const EXPERIENCE_LEVELS = [
  { value: 'junior', label: 'Junior (0-2 anni)' },
  { value: 'mid', label: 'Mid (3-5 anni)' },
  { value: 'senior', label: 'Senior (5+ anni)' },
];

const SECTORS = [
  'IT', 'Marketing', 'Sales', 'Design', 'HR', 'Finance', 
  'Engineering', 'Customer Service', 'Operations', 'Legal'
];

const COMMON_SKILLS = [
  'JavaScript', 'Python', 'React', 'Node.js', 'TypeScript',
  'SQL', 'AWS', 'Docker', 'Git', 'Agile',
  'Leadership', 'Communication', 'Problem Solving'
];

export const SearchFilters = ({ userRole, onSearch }: SearchFiltersProps) => {
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<SearchFilterValues>({});
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);

  const handleSearch = () => {
    onSearch(query, { ...filters, skills: selectedSkills });
  };

  const handleReset = () => {
    setQuery("");
    setFilters({});
    setSelectedSkills([]);
    onSearch("", {});
  };

  const toggleSkill = (skill: string) => {
    setSelectedSkills(prev =>
      prev.includes(skill)
        ? prev.filter(s => s !== skill)
        : [...prev, skill]
    );
  };

  const activeFiltersCount = 
    (filters.city ? 1 : 0) +
    (filters.experienceLevel ? 1 : 0) +
    (filters.sector ? 1 : 0) +
    selectedSkills.length;

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder={
              userRole === 'recruiter'
                ? "Cerca candidati per nome, skill..."
                : "Cerca offerte per titolo, azienda..."
            }
            className="pl-10"
          />
        </div>
        
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="relative">
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              Filtri
              {activeFiltersCount > 0 && (
                <Badge 
                  variant="destructive" 
                  className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                >
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Filtri di Ricerca</SheetTitle>
            </SheetHeader>

            <div className="space-y-6 mt-6">
              {/* City Filter */}
              <div className="space-y-2">
                <Label>Città</Label>
                <Select
                  value={filters.city}
                  onValueChange={(value) => setFilters({ ...filters, city: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleziona città" />
                  </SelectTrigger>
                  <SelectContent>
                    {CITIES.map((city) => (
                      <SelectItem key={city} value={city}>
                        {city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Experience Level (only for recruiters) */}
              {userRole === 'recruiter' && (
                <div className="space-y-2">
                  <Label>Livello di Esperienza</Label>
                  <Select
                    value={filters.experienceLevel}
                    onValueChange={(value) => setFilters({ ...filters, experienceLevel: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleziona livello" />
                    </SelectTrigger>
                    <SelectContent>
                      {EXPERIENCE_LEVELS.map((level) => (
                        <SelectItem key={level.value} value={level.value}>
                          {level.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Sector */}
              <div className="space-y-2">
                <Label>Settore</Label>
                <Select
                  value={filters.sector}
                  onValueChange={(value) => setFilters({ ...filters, sector: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleziona settore" />
                  </SelectTrigger>
                  <SelectContent>
                    {SECTORS.map((sector) => (
                      <SelectItem key={sector} value={sector}>
                        {sector}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Skills (only for recruiters) */}
              {userRole === 'recruiter' && (
                <div className="space-y-2">
                  <Label>Skills</Label>
                  <div className="flex flex-wrap gap-2">
                    {COMMON_SKILLS.map((skill) => (
                      <Badge
                        key={skill}
                        variant={selectedSkills.includes(skill) ? "default" : "outline"}
                        className="cursor-pointer hover:scale-105 transition-transform"
                        onClick={() => toggleSkill(skill)}
                      >
                        {skill}
                        {selectedSkills.includes(skill) && (
                          <X className="ml-1 h-3 w-3" />
                        )}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-4">
                <Button onClick={handleSearch} className="flex-1">
                  Applica Filtri
                </Button>
                <Button onClick={handleReset} variant="outline">
                  Reset
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Active filters display */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {filters.city && (
            <Badge variant="secondary">
              📍 {filters.city}
              <X
                className="ml-1 h-3 w-3 cursor-pointer"
                onClick={() => setFilters({ ...filters, city: undefined })}
              />
            </Badge>
          )}
          {filters.experienceLevel && (
            <Badge variant="secondary">
              💼 {EXPERIENCE_LEVELS.find(l => l.value === filters.experienceLevel)?.label}
              <X
                className="ml-1 h-3 w-3 cursor-pointer"
                onClick={() => setFilters({ ...filters, experienceLevel: undefined })}
              />
            </Badge>
          )}
          {filters.sector && (
            <Badge variant="secondary">
              🏢 {filters.sector}
              <X
                className="ml-1 h-3 w-3 cursor-pointer"
                onClick={() => setFilters({ ...filters, sector: undefined })}
              />
            </Badge>
          )}
          {selectedSkills.map((skill) => (
            <Badge key={skill} variant="secondary">
              {skill}
              <X
                className="ml-1 h-3 w-3 cursor-pointer"
                onClick={() => toggleSkill(skill)}
              />
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};
