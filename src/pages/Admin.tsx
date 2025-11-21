import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Shield, Users, Gift, CreditCard, Mail, LogOut, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import PremiumBadge from "@/components/PremiumBadge";

const Admin = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [referrals, setReferrals] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      // Check if user has admin role using secure function
      const { data, error } = await supabase.rpc("has_role", {
        _user_id: user.id,
        _role: "admin" as any,
      });

      if (error) throw error;

      if (!data) {
        toast.error("Accesso negato. Solo gli amministratori possono accedere a questa pagina.");
        navigate("/dashboard");
        return;
      }

      setIsAdmin(true);
      await loadData();
    } catch (error) {
      console.error("Error checking admin access:", error);
      toast.error("Errore nella verifica dei permessi");
      navigate("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const loadData = async () => {
    try {
      // Load users
      const { data: usersData } = await supabase
        .from("profiles")
        .select("id, full_name, role, city, is_premium, created_at")
        .order("created_at", { ascending: false })
        .limit(100);

      // Load referrals
      const { data: referralsData } = await supabase
        .from("ambassador_referrals")
        .select(`
          *,
          ambassador:profiles!ambassador_referrals_ambassador_id_fkey(full_name),
          referred:profiles!ambassador_referrals_referred_user_id_fkey(full_name)
        `)
        .order("created_at", { ascending: false })
        .limit(100);

      // Load subscriptions as payments proxy
      const { data: paymentsData } = await supabase
        .from("subscriptions")
        .select("*, profile:profiles(full_name)")
        .order("created_at", { ascending: false })
        .limit(100);

      setUsers(usersData || []);
      setReferrals(referralsData || []);
      setPayments(paymentsData || []);
    } catch (error) {
      console.error("Error loading admin data:", error);
      toast.error("Errore nel caricamento dei dati");
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-lg text-muted-foreground">Verifica accesso amministratore...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-gradient-to-r from-primary/10 via-primary/5 to-background">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
              <p className="text-sm text-muted-foreground">Pausilio Pro</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Dashboard
            </Button>
            <Button variant="outline" onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              Esci
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="users">
              <Users className="mr-2 h-4 w-4" />
              Utenti
            </TabsTrigger>
            <TabsTrigger value="referrals">
              <Gift className="mr-2 h-4 w-4" />
              Referral
            </TabsTrigger>
            <TabsTrigger value="payments">
              <CreditCard className="mr-2 h-4 w-4" />
              Pagamenti
            </TabsTrigger>
            <TabsTrigger value="emails">
              <Mail className="mr-2 h-4 w-4" />
              Log Email
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Gestione Utenti
                </CardTitle>
                <CardDescription>
                  {users.length} utenti totali registrati
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Ruolo</TableHead>
                      <TableHead>Città</TableHead>
                      <TableHead>Piano</TableHead>
                      <TableHead>Data Iscrizione</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.full_name}</TableCell>
                        <TableCell>
                          <Badge variant={user.role === "recruiter" ? "default" : "secondary"}>
                            {user.role}
                          </Badge>
                        </TableCell>
                        <TableCell>{user.city || "-"}</TableCell>
                        <TableCell>
                          <PremiumBadge isPremium={user.is_premium} size="sm" />
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(user.created_at).toLocaleDateString("it-IT")}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="referrals">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gift className="h-5 w-5" />
                  Programma Referral
                </CardTitle>
                <CardDescription>
                  {referrals.length} referral totali
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ambassador</TableHead>
                      <TableHead>Utente Invitato</TableHead>
                      <TableHead>Stato</TableHead>
                      <TableHead>Data Signup</TableHead>
                      <TableHead>Primo Pagamento</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {referrals.map((ref) => (
                      <TableRow key={ref.id}>
                        <TableCell className="font-medium">{ref.ambassador?.full_name}</TableCell>
                        <TableCell>{ref.referred?.full_name}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              ref.status === "completed" || ref.status === "paid"
                                ? "default"
                                : "outline"
                            }
                          >
                            {ref.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(ref.signup_date).toLocaleDateString("it-IT")}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {ref.first_payment_date
                            ? new Date(ref.first_payment_date).toLocaleDateString("it-IT")
                            : "-"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payments">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Gestione Pagamenti
                </CardTitle>
                <CardDescription>
                  {payments.length} sottoscrizioni totali
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Utente</TableHead>
                      <TableHead>Stato</TableHead>
                      <TableHead>Stripe Customer ID</TableHead>
                      <TableHead>Trial End</TableHead>
                      <TableHead>Current Period End</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell className="font-medium">{payment.profile?.full_name}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              payment.status === "active"
                                ? "default"
                                : payment.status === "trial"
                                ? "secondary"
                                : "outline"
                            }
                          >
                            {payment.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs font-mono">
                          {payment.stripe_customer_id?.substring(0, 20) || "-"}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {payment.trial_end
                            ? new Date(payment.trial_end).toLocaleDateString("it-IT")
                            : "-"}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {payment.current_period_end
                            ? new Date(payment.current_period_end).toLocaleDateString("it-IT")
                            : "-"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="emails">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Log Email
                </CardTitle>
                <CardDescription>
                  Cronologia delle email inviate dal sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 space-y-4">
                  <Mail className="h-16 w-16 text-muted-foreground mx-auto opacity-50" />
                  <p className="text-muted-foreground">
                    I log delle email verranno visualizzati qui quando implementato
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Admin;
