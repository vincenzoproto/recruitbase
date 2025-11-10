import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { CreatePost } from "./CreatePost";
import { PostCard } from "./PostCard";
import { Input } from "@/components/ui/input";
import { Search, TrendingUp, Users, Briefcase } from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

interface FeedWithTabsProps {
  highlightPostId?: string;
}

export const FeedWithTabs = ({ highlightPostId }: FeedWithTabsProps = {}) => {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const postRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  useEffect(() => {
    loadPosts();
    
    // Subscribe to new posts with confirmation
    const channel = supabase
      .channel('posts-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'posts'
        },
        (payload) => {
          // Add new post to the list
          const newPost = payload.new as any;
          loadPosts(); // Reload to get profile data
          toast.success("Nuovo post pubblicato! ✅");
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Scroll to highlighted post
  useEffect(() => {
    if (highlightPostId && posts.length > 0) {
      const postRef = postRefs.current[highlightPostId];
      if (postRef) {
        setTimeout(() => {
          postRef.scrollIntoView({ behavior: 'smooth', block: 'center' });
          // Highlight effect
          postRef.style.animation = 'pulse 1s ease-in-out 2';
        }, 500);
      }
    }
  }, [highlightPostId, posts]);

  const loadPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          profiles:user_id (
            id,
            full_name,
            avatar_url,
            job_title,
            role,
            talent_relationship_score,
            core_values
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Error loading posts:', error);
      toast.error("Errore nel caricamento dei post");
    } finally {
      setLoading(false);
    }
  };

  const getFilteredPosts = () => {
    let filtered = posts;

    // Filter by tab
    if (activeTab === "recruiters") {
      filtered = filtered.filter(post => post.profiles?.role === "recruiter");
    } else if (activeTab === "candidates") {
      filtered = filtered.filter(post => post.profiles?.role === "candidate");
    } else if (activeTab === "trending") {
      // Mock trending logic: posts with more engagement
      filtered = [...filtered].sort((a, b) => {
        const aEngagement = (a.reactions_count || 0) + (a.comments_count || 0);
        const bEngagement = (b.reactions_count || 0) + (b.comments_count || 0);
        return bEngagement - aEngagement;
      }).slice(0, 20);
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

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <CreatePost onPostCreated={loadPosts} />

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Cerca per hashtag, contenuto o autore..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-4">
          <TabsTrigger value="all" className="gap-2">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Tutti</span>
          </TabsTrigger>
          <TabsTrigger value="recruiters" className="gap-2">
            <Briefcase className="h-4 w-4" />
            <span className="hidden sm:inline">Recruiter</span>
          </TabsTrigger>
          <TabsTrigger value="candidates" className="gap-2">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Candidati</span>
          </TabsTrigger>
          <TabsTrigger value="trending" className="gap-2">
            <TrendingUp className="h-4 w-4" />
            <span className="hidden sm:inline">Trend</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4 mt-0">
          {filteredPosts.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground space-y-2">
              <p className="text-lg font-medium">
                {searchQuery ? "Nessun post trovato" : "Nessun post ancora"}
              </p>
              <p className="text-sm">
                {!searchQuery && "Sii il primo a pubblicare!"}
              </p>
            </div>
          ) : (
            <>
              {activeTab === "trending" && filteredPosts.length > 0 && (
                <div className="flex items-center gap-2 p-3 bg-primary/5 rounded-lg border border-primary/20">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium">
                    Post più popolari della settimana
                  </span>
                  <Badge variant="secondary">{filteredPosts.length}</Badge>
                </div>
              )}
              
              <div className="space-y-4">
                {filteredPosts.map((post) => (
                  <div
                    key={post.id}
                    ref={(el) => {
                      if (el) postRefs.current[post.id] = el;
                    }}
                    className={highlightPostId === post.id ? "ring-2 ring-primary rounded-lg" : ""}
                  >
                    <PostCard post={post} />
                  </div>
                ))}
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
