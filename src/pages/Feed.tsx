import { MainLayout } from "@/components/layout/MainLayout";
import { SocialFeed } from "@/components/social/SocialFeed";

const Feed = () => {
  return (
    <MainLayout>
      <div className="container max-w-2xl mx-auto">
        <SocialFeed />
      </div>
    </MainLayout>
  );
};

export default Feed;
