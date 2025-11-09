import React from "react";
import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface LanguageSelectorProps {
  currentLang: "it" | "en";
  onLanguageChange: (lang: "it" | "en") => void;
}

export const LanguageSelector = ({ currentLang, onLanguageChange }: LanguageSelectorProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <Globe className="h-4 w-4" />
          {currentLang.toUpperCase()}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => onLanguageChange("it")}>
          🇮🇹 Italiano
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onLanguageChange("en")}>
          🇬🇧 English
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
