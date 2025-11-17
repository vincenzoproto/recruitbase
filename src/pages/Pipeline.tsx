import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft } from "lucide-react";
import KanbanBoard from "@/components/trm/KanbanBoard";
import { KanbanKPIs } from "@/components/trm/KanbanKPIs";
import { AutoFollowUpPanel } from "@/components/pipeline/AutoFollowUpPanel";
import { FollowUpHistory } from "@/components/pipeline/FollowUpHistory";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const Pipeline = () => {
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
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Indietro
        </Button>

        {userId && (
          <>
            <KanbanKPIs recruiterId={userId} />
            
            <div className="grid lg:grid-cols-[1fr_400px] gap-6">
              <div>
                <KanbanBoard />
              </div>
              <div className="lg:sticky lg:top-6 lg:self-start space-y-4">
                <Tabs defaultValue="followup" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="followup">Follow-up</TabsTrigger>
                    <TabsTrigger value="history">Storico</TabsTrigger>
                  </TabsList>
                  <TabsContent value="followup" className="mt-4">
                    <AutoFollowUpPanel recruiterId={userId} />
                  </TabsContent>
                  <TabsContent value="history" className="mt-4">
                    <FollowUpHistory recruiterId={userId} />
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Pipeline;
