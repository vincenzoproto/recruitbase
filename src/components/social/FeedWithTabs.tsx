import { useState, useRef } from "react";
import { CreatePost } from "./CreatePost";
import { PostCard } from "./PostCard";
import { PostSkeleton } from "./PostSkeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, TrendingUp, Users, Briefcase, Loader2, MessageSquare } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSocialFeed } from "@/hooks/useSocialFeed";

interface FeedWithTabsProps {
  highlightPostId?: string;
}

export const FeedWithTabs = ({ highlightPostId }: FeedWithTabsProps = {}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const postRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  
  const { 
    posts, 
    loading, 
    hasMore, 
    loadMore, 
    refreshPosts 
  } = useSocialFeed({ pageSize: 20 });

  const getFilteredPosts = () => {
    let filtered = posts;

    // Filter by tab
    if (activeTab === "recruiters") {
      filtered = filtered.filter(post => post.profiles?.role === "recruiter");
    } else if (activeTab === "candidates") {
      filtered = filtered.filter(post => post.profiles?.role === "candidate");
    } else if (activeTab === "trending") {
      // Trending: just show top 20 for now
      filtered = [...filtered].slice(0, 20);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(post => {
        const contentMatch = post.content?.toLowerCase().includes(query);
        const hashtagMatch = post.hashtags?.some((tag: string) => 
          tag.toLowerCase().includes(query)
        );
        const authorMatch = post.profiles?.full_name?.toLowerCase().includes(query);
        
        return contentMatch || hashtagMatch || authorMatch;
      });
    }

    return filtered;
  };

  const filteredPosts = getFilteredPosts();

  return (
    <div className="space-y-4 md:space-y-6">
      <CreatePost onPostCreated={refreshPosts} />

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Cerca per hashtag, contenuto o autore..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 h-10 text-sm"
        />
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full grid grid-cols-4 mb-4 md:mb-6 h-auto p-1">
          <TabsTrigger value="all" className="flex items-center gap-1.5 px-2 py-2 text-xs md:text-sm">
            <Users className="h-3.5 w-3.5 md:h-4 md:w-4" />
            <span className="hidden sm:inline">Tutti</span>
          </TabsTrigger>
          <TabsTrigger value="trending" className="flex items-center gap-1.5 px-2 py-2 text-xs md:text-sm">
            <TrendingUp className="h-3.5 w-3.5 md:h-4 md:w-4" />
            <span className="hidden sm:inline">Trend</span>
          </TabsTrigger>
          <TabsTrigger value="recruiters" className="flex items-center gap-1.5 px-2 py-2 text-xs md:text-sm">
            <Briefcase className="h-3.5 w-3.5 md:h-4 md:w-4" />
            <span className="hidden sm:inline">HR</span>
          </TabsTrigger>
          <TabsTrigger value="candidates" className="flex items-center gap-1.5 px-2 py-2 text-xs md:text-sm">
            <Users className="h-3.5 w-3.5 md:h-4 md:w-4" />
            <span className="hidden sm:inline">Talent</span>
          </TabsTrigger>
        </TabsList>

        {["all", "trending", "recruiters", "candidates"].map((tab) => (
          <TabsContent key={tab} value={tab} className="mt-0 space-y-4">
            {loading && filteredPosts.length === 0 ? (
              <div className="space-y-3 md:space-y-4">
                {[1, 2, 3].map(i => (
                  <PostSkeleton key={i} />
                ))}
              </div>
            ) : filteredPosts.length === 0 ? (
              <EmptyState
                icon={searchQuery ? Search : MessageSquare}
                title={searchQuery ? "Nessun risultato" : "Nessun post"}
                description={searchQuery 
                  ? `Nessun post trovato per "${searchQuery}"` 
                  : "Sii il primo a pubblicare nella community!"}
              />
            ) : (
              <>
                <div className="space-y-3 md:space-y-4">
                  {filteredPosts.map((post) => (
                    <div
                      key={post.id}
                      ref={el => postRefs.current[post.id] = el}
                      className={highlightPostId === post.id ? 'ring-2 ring-primary rounded-lg animate-pulse' : ''}
                    >
                      <PostCard post={post} />
                    </div>
                  ))}
                </div>
                
                {hasMore && !searchQuery && (
                  <div className="flex justify-center pt-4">
                    <Button
                      variant="outline"
                      onClick={loadMore}
                      disabled={loading}
                      className="min-w-[200px]"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Caricamento...
                        </>
                      ) : (
                        'Carica altri post'
                      )}
                    </Button>
                  </div>
                )}
              </>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};
