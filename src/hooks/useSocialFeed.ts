import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Post {
  id: string;
  content: string | null;
  media_url: string | null;
  media_type: string | null;
  hashtags: string[] | null;
  created_at: string;
  profiles: {
    id: string;
    full_name: string;
    avatar_url: string | null;
    job_title: string | null;
    role?: string | null;
    talent_relationship_score?: number | null;
  };
}

interface UseSocialFeedProps {
  pageSize?: number;
  filterRole?: "recruiter" | "candidate" | null;
}

export const useSocialFeed = ({ 
  pageSize = 10, 
  filterRole = null 
}: UseSocialFeedProps = {}) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);

  const loadPosts = useCallback(async (pageNum: number, append: boolean = false) => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('posts')
        .select(`
          id,
          content,
          media_url,
          media_type,
          hashtags,
          created_at,
          profiles:user_id (
            id,
            full_name,
            avatar_url,
            job_title,
            role,
            talent_relationship_score
          )
        `)
        .order('created_at', { ascending: false })
        .range(pageNum * pageSize, (pageNum + 1) * pageSize - 1);

      // Apply role filter if specified
      if (filterRole) {
        query = query.eq('profiles.role', filterRole);
      }

      const { data, error } = await query;

      if (error) throw error;

      const newPosts = data || [];
      
      if (append) {
        setPosts(prev => [...prev, ...newPosts]);
      } else {
        setPosts(newPosts);
      }
      
      // Check if there are more posts
      setHasMore(newPosts.length === pageSize);
    } catch (error) {
      console.error('Error loading posts:', error);
      toast.error("Errore nel caricamento dei post");
    } finally {
      setLoading(false);
    }
  }, [pageSize, filterRole]);

  const loadMore = useCallback(() => {
    const nextPage = page + 1;
    setPage(nextPage);
    loadPosts(nextPage, true);
  }, [page, loadPosts]);

  const refreshPosts = useCallback(() => {
    setPage(0);
    loadPosts(0, false);
  }, [loadPosts]);

  const updatePostLocally = useCallback((postId: string, updates: Partial<Post>) => {
    setPosts(prev => prev.map(post => 
      post.id === postId ? { ...post, ...updates } : post
    ));
  }, []);

  const removePostLocally = useCallback((postId: string) => {
    setPosts(prev => prev.filter(post => post.id !== postId));
  }, []);

  useEffect(() => {
    loadPosts(0, false);
  }, [loadPosts]);

  // Subscribe to new posts
  useEffect(() => {
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
          // Only refresh if on first page
          if (page === 0) {
            refreshPosts();
          }
          toast.success("Nuovo post pubblicato! ✅");
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [page, refreshPosts]);

  return {
    posts,
    loading,
    hasMore,
    loadMore,
    refreshPosts,
    updatePostLocally,
    removePostLocally
  };
};
