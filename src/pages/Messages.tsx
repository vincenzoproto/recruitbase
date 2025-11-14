import ChatList from "@/components/messages/ChatList";
import ChatWindow from "@/components/messages/ChatWindow";
import { MainLayout } from "@/components/layout/MainLayout";

const Messages = () => {
  return (
    <MainLayout>
      <div className="flex h-full">
        <ChatList />
        <ChatWindow />
      </div>
    </MainLayout>
  );
};

export default Messages;
