import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { Briefcase, UserCircle } from "lucide-react";

const Auth = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<"recruiter" | "candidate">("candidate");

  // Guardia di navigazione: redirect solo se c'è una sessione attiva
  useEffect(() => {
    let isMounted = true;

    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (isMounted && session) {
          navigate("/dashboard", { replace: true });
        }
      } catch (error) {
        console.error("Error checking session:", error);
      } finally {
        if (isMounted) {
          setCheckingSession(false);
        }
      }
    };

    checkSession();

    return () => {
      isMounted = false;
    };
  }, [navigate]);

  if (checkingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4 animate-fade-in">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-lg text-muted-foreground">Caricamento...</p>
        </div>
      </div>
    );
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !fullName) {
      toast.error("Compila tutti i campi");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Le password non corrispondono");
      return;
    }

    if (password.length < 6) {
      toast.error("La password deve essere di almeno 6 caratteri");
      return;
    }

    setLoading(true);
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      });

      if (authError) throw authError;

      if (authData.user) {
        const { error: profileError } = await supabase
          .from("profiles")
          .insert({
            id: authData.user.id,
            role,
            full_name: fullName,
          });

        if (profileError) throw profileError;

        // Send welcome email
        try {
          await supabase.functions.invoke("send-welcome-email", {
            body: { name: fullName, email },
          });
        } catch (emailError) {
          console.error("Error sending welcome email:", emailError);
        }

        // Check for referral code
        const referralCode = localStorage.getItem("referral_code");
        if (referralCode) {
          try {
            const { data: ambassador } = await supabase
              .from("profiles")
              .select("id")
              .eq("referral_code", referralCode)
              .single();

            if (ambassador) {
              await supabase.from("ambassador_referrals").insert({
                ambassador_id: ambassador.id,
                referred_user_id: authData.user.id,
                referral_code: referralCode,
              });
            }
            localStorage.removeItem("referral_code");
          } catch (refError) {
            console.error("Error creating referral:", refError);
          }
        }

        // Create trial subscription
        const trialStart = new Date();
        const trialEnd = new Date();
        trialEnd.setDate(trialEnd.getDate() + 30);

        await supabase.from("subscriptions").insert({
          user_id: authData.user.id,
          status: "trial",
          trial_start: trialStart.toISOString(),
          trial_end: trialEnd.toISOString(),
        });

        // Segnala il primo login per mostrare il welcome toast
        sessionStorage.setItem("show_welcome", "true");

      toast.success("Account creato con successo!");
        navigate("/dashboard", { replace: true });
      }
    } catch (error: any) {
      toast.error(error.message || "Errore durante la registrazione");
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Inserisci email e password");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        // Segnala il primo login per mostrare il welcome toast
        sessionStorage.setItem("show_welcome", "true");
      }

      toast.success("Login effettuato!");
      navigate("/dashboard", { replace: true });
    } catch (error: any) {
      toast.error(error.message || "Errore durante il login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-accent via-background to-accent/50 p-4">
      <Card className="w-full max-w-md shadow-xl animate-scale-in border-border/50">
        <CardHeader className="text-center space-y-3 pb-6">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-2">
            <Briefcase className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Recruit Base
          </CardTitle>
          <CardDescription className="text-base">Connetti recruiter e candidati in modo semplice</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="signin">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Accedi</TabsTrigger>
              <TabsTrigger value="signup">Registrati</TabsTrigger>
            </TabsList>

            <TabsContent value="signin" className="animate-fade-in">
              <form onSubmit={handleSignIn} className="space-y-5 pt-2">
                <div className="space-y-2">
                  <Label htmlFor="email-signin" className="text-sm font-medium">Email</Label>
                  <Input
                    id="email-signin"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nome@esempio.com"
                    className="h-11"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password-signin" className="text-sm font-medium">Password</Label>
                  <Input
                    id="password-signin"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="h-11"
                    required
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full h-11 font-semibold transition-all hover:scale-[1.02]" 
                  disabled={loading}
                >
                  {loading ? "Accesso..." : "Accedi"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup" className="animate-fade-in">
              <form onSubmit={handleSignUp} className="space-y-5 pt-2">
                <div className="space-y-2">
                  <Label htmlFor="fullname" className="text-sm font-medium">Nome completo</Label>
                  <Input
                    id="fullname"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Mario Rossi"
                    className="h-11"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email-signup" className="text-sm font-medium">Email</Label>
                  <Input
                    id="email-signup"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nome@esempio.com"
                    className="h-11"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password-signup" className="text-sm font-medium">Password</Label>
                  <Input
                    id="password-signup"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="h-11"
                    required
                    minLength={6}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password" className="text-sm font-medium">Conferma Password</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="h-11"
                    required
                  />
                </div>
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Tipo di account</Label>
                  <RadioGroup value={role} onValueChange={(value: any) => setRole(value)}>
                    <div className="flex items-center space-x-3 p-4 border-2 rounded-xl hover:border-primary/50 hover:bg-accent/50 transition-all cursor-pointer group">
                      <RadioGroupItem value="candidate" id="candidate" />
                      <Label htmlFor="candidate" className="flex items-center gap-3 cursor-pointer flex-1">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                          <UserCircle className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <div className="font-semibold">Candidato</div>
                          <div className="text-xs text-muted-foreground">Cerca opportunità di lavoro</div>
                        </div>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-3 p-4 border-2 rounded-xl hover:border-primary/50 hover:bg-accent/50 transition-all cursor-pointer group">
                      <RadioGroupItem value="recruiter" id="recruiter" />
                      <Label htmlFor="recruiter" className="flex items-center gap-3 cursor-pointer flex-1">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                          <Briefcase className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <div className="font-semibold">Recruiter</div>
                          <div className="text-xs text-muted-foreground">Pubblica offerte e trova talenti</div>
                        </div>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
                <Button 
                  type="submit" 
                  className="w-full h-11 font-semibold transition-all hover:scale-[1.02]" 
                  disabled={loading}
                >
                  {loading ? "Registrazione..." : "Crea Account Gratis"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
