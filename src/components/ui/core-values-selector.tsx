import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { AVAILABLE_VALUES } from "@/lib/culture-fit";
import { Heart } from "lucide-react";

interface CoreValuesSelectorProps {
  selectedValues: string[];
  onChange: (values: string[]) => void;
  maxValues?: number;
}

export const CoreValuesSelector = ({ 
  selectedValues, 
  onChange, 
  maxValues = 5 
}: CoreValuesSelectorProps) => {
  const toggleValue = (value: string) => {
    if (selectedValues.includes(value)) {
      onChange(selectedValues.filter(v => v !== value));
    } else if (selectedValues.length < maxValues) {
      onChange([...selectedValues, value]);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="flex items-center gap-2">
          <Heart className="h-4 w-4 text-primary" />
          Valori aziendali/personali (max {maxValues})
        </Label>
        <span className="text-sm text-muted-foreground">
          {selectedValues.length}/{maxValues}
        </span>
      </div>
      <p className="text-sm text-muted-foreground">
        Seleziona i valori che rappresentano meglio te o la tua azienda
      </p>
      <div className="flex flex-wrap gap-2">
        {AVAILABLE_VALUES.map((value) => {
          const isSelected = selectedValues.includes(value);
          const isDisabled = !isSelected && selectedValues.length >= maxValues;
          
          return (
            <Badge
              key={value}
              variant={isSelected ? "default" : "outline"}
              className={`cursor-pointer transition-all ${
                isSelected 
                  ? "bg-primary text-primary-foreground hover:bg-primary/90" 
                  : isDisabled 
                  ? "opacity-50 cursor-not-allowed" 
                  : "hover:bg-secondary"
              }`}
              onClick={() => !isDisabled && toggleValue(value)}
            >
              {value}
            </Badge>
          );
        })}
      </div>
    </div>
  );
};
