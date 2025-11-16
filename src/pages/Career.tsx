import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, TrendingUp, Target, BookOpen, Award } from "lucide-react";
import { TinderMatch } from "@/components/match/TinderMatch";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { CVATSReview } from "@/components/candidate/CVATSReview";

const Career = () => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string>("");

  useEffect(() => {
    const loadUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setUserId(user.id);
    };
    loadUser();
  }, []);

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-4xl mx-auto p-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Indietro
        </Button>

        <div className="space-y-6">
          <CVATSReview />
          
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Job Match
              </CardTitle>
            </CardHeader>
            <CardContent>
              {userId && <TinderMatch userId={userId} userRole="candidate" />}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Obiettivi di Carriera
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Imposta i tuoi obiettivi di carriera e traccia i progressi.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Corsi Consigliati
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Scopri i corsi per migliorare le tue competenze.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Certificazioni
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Gestisci le tue certificazioni professionali.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Career;
