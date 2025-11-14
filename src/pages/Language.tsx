import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Globe, Check } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

const Language = () => {
  const [selectedLanguage, setSelectedLanguage] = useState("it");

  useEffect(() => {
    // Load saved language from localStorage
    const savedLang = localStorage.getItem("app-language") || "it";
    setSelectedLanguage(savedLang);
  }, []);

  const languages = [
    { code: "it", name: "Italiano", native: "Italiano" },
    { code: "en", name: "English", native: "English" },
    { code: "es", name: "Spanish", native: "Español" },
    { code: "fr", name: "French", native: "Français" },
    { code: "de", name: "German", native: "Deutsch" },
    { code: "pt", name: "Portuguese", native: "Português" },
  ];

  const handleLanguageChange = (langCode: string) => {
    setSelectedLanguage(langCode);
    localStorage.setItem("app-language", langCode);
    
    const selectedLang = languages.find(l => l.code === langCode);
    toast.success("Lingua aggiornata", {
      description: `Lingua impostata su ${selectedLang?.native}`,
    });
  };

  return (
    <MainLayout>
      <div className="container max-w-4xl py-6 px-4">
        <h1 className="text-2xl font-bold mb-6">Lingua</h1>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5" />
              Seleziona la tua lingua
            </CardTitle>
            <CardDescription>
              Scegli la lingua in cui vuoi utilizzare l'applicazione
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup value={selectedLanguage} onValueChange={handleLanguageChange}>
              <div className="space-y-3">
                {languages.map((language) => (
                  <div
                    key={language.code}
                    className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => handleLanguageChange(language.code)}
                  >
                    <div className="flex items-center space-x-3">
                      <RadioGroupItem value={language.code} id={language.code} />
                      <Label
                        htmlFor={language.code}
                        className="flex flex-col cursor-pointer"
                      >
                        <span className="font-medium">{language.native}</span>
                        <span className="text-sm text-muted-foreground">
                          {language.name}
                        </span>
                      </Label>
                    </div>
                    {selectedLanguage === language.code && (
                      <Check className="w-5 h-5 text-primary" />
                    )}
                  </div>
                ))}
              </div>
            </RadioGroup>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Impostazioni regionali</CardTitle>
            <CardDescription>
              Configura formato data, ora e valuta
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">Formato data</p>
                <p className="text-sm text-muted-foreground">14/11/2025</p>
              </div>
              <Button variant="outline" size="sm">
                Modifica
              </Button>
            </div>
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">Formato ora</p>
                <p className="text-sm text-muted-foreground">24 ore</p>
              </div>
              <Button variant="outline" size="sm">
                Modifica
              </Button>
            </div>
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">Valuta</p>
                <p className="text-sm text-muted-foreground">EUR (€)</p>
              </div>
              <Button variant="outline" size="sm">
                Modifica
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default Language;
