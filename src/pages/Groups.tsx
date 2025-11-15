import { MainLayout } from "@/components/layout/MainLayout";
import { GroupChatSection } from "@/components/chat/GroupChatSection";

const Groups = () => {
  return (
    <MainLayout>
      <div className="container mx-auto p-4">
        <GroupChatSection />
      </div>
    </MainLayout>
  );
};

export default Groups;
