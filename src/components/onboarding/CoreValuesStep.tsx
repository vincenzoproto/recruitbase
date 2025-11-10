import { CoreValuesSelector } from "@/components/ui/core-values-selector";
import { Heart } from "lucide-react";

interface CoreValuesStepProps {
  selectedValues: string[];
  onChange: (values: string[]) => void;
}

export const CoreValuesStep = ({ selectedValues, onChange }: CoreValuesStepProps) => {
  return (
    <div className="space-y-4 animate-fade-in">
      <div className="w-20 h-20 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
        <Heart className="h-10 w-10 text-primary" />
      </div>
      
      <div className="text-center space-y-2">
        <h3 className="text-xl font-semibold">
          I tuoi valori aziendali
        </h3>
        <p className="text-muted-foreground text-sm">
          Seleziona fino a 5 valori che rappresentano la tua cultura aziendale o personale.
          Questo ci aiuterà a trovare i match perfetti!
        </p>
      </div>

      <CoreValuesSelector
        selectedValues={selectedValues}
        onChange={onChange}
      />
    </div>
  );
};
