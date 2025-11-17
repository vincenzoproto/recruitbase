import { useParams } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { AIMatchView } from "@/components/match/AIMatchView";

const AIMatch = () => {
  const { jobId } = useParams<{ jobId: string }>();

  if (!jobId) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <p className="text-center text-muted-foreground">ID offerta mancante</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <AIMatchView jobOfferId={jobId} />
      </div>
    </MainLayout>
  );
};

export default AIMatch;
