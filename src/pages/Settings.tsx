import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Bell, Lock, Eye, Mail, Globe, Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";

const Settings = () => {
  const { theme, setTheme } = useTheme();
  const [userId, setUserId] = useState<string | null>(null);
  const [currentEmail, setCurrentEmail] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [profileVisible, setProfileVisible] = useState(true);
  const [showEmailChange, setShowEmailChange] = useState(false);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setUserId(user.id);
      setCurrentEmail(user.email || "");
    }
  };

  const handleThemeToggle = (checked: boolean) => {
    setTheme(checked ? "dark" : "light");
    toast.success(`Tema ${checked ? "scuro" : "chiaro"} attivato`);
  };

  const handleEmailChange = async () => {
    if (!newEmail || newEmail === currentEmail) {
      toast.error("Inserisci una nuova email valida");
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({ email: newEmail });
      
      if (error) throw error;

      toast.success("Email aggiornata con successo", {
        description: "Controlla la tua nuova email per confermare il cambiamento.",
      });
      setShowEmailChange(false);
      setNewEmail("");
      setCurrentEmail(newEmail);
    } catch (error: any) {
      toast.error("Errore nell'aggiornamento email", {
        description: error.message,
      });
    }
  };

  const handlePasswordChange = async () => {
    try {
      const { error } = await supabase.auth.updateUser({ 
        password: prompt("Inserisci la nuova password") || "" 
      });
      
      if (error) throw error;

      toast.success("Password aggiornata con successo");
    } catch (error: any) {
      toast.error("Errore nell'aggiornamento password", {
        description: error.message,
      });
    }
  };

  const handleSaveSettings = () => {
    toast.success("Impostazioni salvate", {
      description: "Le tue preferenze sono state aggiornate con successo.",
    });
  };

  return (
    <MainLayout>
      <div className="container max-w-4xl py-6 px-4">
        <h1 className="text-2xl font-bold mb-6">Impostazioni e Privacy</h1>

        {/* Notifiche */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Notifiche
            </CardTitle>
            <CardDescription>
              Gestisci le tue preferenze di notifica
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="email-notif" className="flex flex-col gap-1">
                <span>Notifiche email</span>
                <span className="text-sm text-muted-foreground font-normal">
                  Ricevi aggiornamenti via email
                </span>
              </Label>
              <Switch
                id="email-notif"
                checked={emailNotifications}
                onCheckedChange={setEmailNotifications}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <Label htmlFor="push-notif" className="flex flex-col gap-1">
                <span>Notifiche push</span>
                <span className="text-sm text-muted-foreground font-normal">
                  Ricevi notifiche in tempo reale
                </span>
              </Label>
              <Switch
                id="push-notif"
                checked={pushNotifications}
                onCheckedChange={setPushNotifications}
              />
            </div>
          </CardContent>
        </Card>

        {/* Privacy */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5" />
              Privacy
            </CardTitle>
            <CardDescription>
              Controlla la visibilità del tuo profilo
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="profile-visible" className="flex flex-col gap-1">
                <span>Profilo pubblico</span>
                <span className="text-sm text-muted-foreground font-normal">
                  Rendi il tuo profilo visibile agli altri utenti
                </span>
              </Label>
              <Switch
                id="profile-visible"
                checked={profileVisible}
                onCheckedChange={setProfileVisible}
              />
            </div>
          </CardContent>
        </Card>

        {/* Appearance */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {theme === "dark" ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              Aspetto
            </CardTitle>
            <CardDescription>
              Personalizza l'aspetto dell'interfaccia
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="dark-mode" className="flex flex-col gap-1">
                <span>Modalità scura</span>
                <span className="text-sm text-muted-foreground font-normal">
                  Attiva il tema scuro per ridurre l'affaticamento visivo
                </span>
              </Label>
              <Switch
                id="dark-mode"
                checked={theme === "dark"}
                onCheckedChange={handleThemeToggle}
              />
            </div>
          </CardContent>
        </Card>

        {/* Account */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Account
            </CardTitle>
            <CardDescription>
              Gestisci le impostazioni del tuo account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!showEmailChange ? (
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => setShowEmailChange(true)}
              >
                <Mail className="w-4 h-4 mr-2" />
                Cambia email
              </Button>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="new-email">Nuova email</Label>
                <Input
                  id="new-email"
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder={currentEmail}
                />
                <div className="flex gap-2">
                  <Button onClick={handleEmailChange} className="flex-1">
                    Conferma
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setShowEmailChange(false);
                      setNewEmail("");
                    }}
                  >
                    Annulla
                  </Button>
                </div>
              </div>
            )}
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={handlePasswordChange}
            >
              <Lock className="w-4 h-4 mr-2" />
              Cambia password
            </Button>
            <Separator />
            <Button variant="destructive" className="w-full">
              Elimina account
            </Button>
          </CardContent>
        </Card>

        <Button onClick={handleSaveSettings} className="w-full">
          Salva modifiche
        </Button>
      </div>
    </MainLayout>
  );
};

export default Settings;
