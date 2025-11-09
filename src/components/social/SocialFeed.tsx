import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { CreatePost } from "./CreatePost";
import { PostCard } from "./PostCard";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { toast } from "sonner";

export const SocialFeed = () => {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadPosts();
    
    // Subscribe to new posts
    const channel = supabase
      .channel('posts-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'posts'
        },
        () => {
          loadPosts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

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
            job_title
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

  const filteredPosts = posts.filter(post => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    const contentMatch = post.content?.toLowerCase().includes(query);
    const hashtagMatch = post.hashtags?.some((tag: string) => 
      tag.toLowerCase().includes(query)
    );
    const authorMatch = post.profiles?.full_name?.toLowerCase().includes(query);
    
    return contentMatch || hashtagMatch || authorMatch;
  });

  return (
    <div className="space-y-6">
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

      {loading ? (
        <div className="text-center py-8 text-muted-foreground">
          Caricamento post...
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          {searchQuery ? "Nessun post trovato" : "Nessun post ancora. Sii il primo a pubblicare!"}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredPosts.map((post) => (
            <PostCard key={post.id} post={post} onDelete={loadPosts} />
          ))}
        </div>
      )}
    </div>
  );
};
