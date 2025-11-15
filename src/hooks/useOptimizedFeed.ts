import { useCallback, useEffect, useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

const POSTS_PER_PAGE = 10;

export const useOptimizedFeed = (userId: string) => {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const offsetRef = useRef(0);
  const channelRef = useRef<any>(null);

  const loadPosts = useCallback(async (reset = false) => {
    try {
      setLoading(true);
      const offset = reset ? 0 : offsetRef.current;

      const { data: postsData, error: fetchError } = await supabase
        .from('posts')
        .select(`
          id,
          content,
          created_at,
          user_id,
          media_url,
          media_type,
          profiles:user_id (
            full_name,
            avatar_url,
            job_title
          )
        `)
        .order('created_at', { ascending: false })
        .range(offset, offset + POSTS_PER_PAGE - 1);

      if (fetchError) throw fetchError;

      // Batch fetch reactions and comments counts
      if (postsData && postsData.length > 0) {
        const postIds = postsData.map(p => p.id);

        const [reactionsResult, commentsResult, userReactionsResult] = await Promise.all([
          supabase
            .from('post_reactions')
            .select('post_id', { count: 'exact', head: false })
            .in('post_id', postIds),
          supabase
            .from('post_comments')
            .select('post_id', { count: 'exact', head: false })
            .in('post_id', postIds),
          supabase
            .from('post_reactions')
            .select('post_id')
            .in('post_id', postIds)
            .eq('user_id', userId)
        ]);

        const reactionsCounts = new Map<string, number>();
        reactionsResult.data?.forEach(r => {
          reactionsCounts.set(r.post_id, (reactionsCounts.get(r.post_id) || 0) + 1);
        });

        const commentsCounts = new Map<string, number>();
        commentsResult.data?.forEach(c => {
          commentsCounts.set(c.post_id, (commentsCounts.get(c.post_id) || 0) + 1);
        });

        const userReactions = new Set(userReactionsResult.data?.map(r => r.post_id) || []);

        const enrichedPosts = postsData.map(post => ({
          ...post,
          reactions_count: reactionsCounts.get(post.id) || 0,
          comments_count: commentsCounts.get(post.id) || 0,
          user_has_reacted: userReactions.has(post.id)
        }));

        if (reset) {
          setPosts(enrichedPosts);
          offsetRef.current = POSTS_PER_PAGE;
        } else {
          setPosts(prev => [...prev, ...enrichedPosts]);
          offsetRef.current += POSTS_PER_PAGE;
        }

        setHasMore(postsData.length === POSTS_PER_PAGE);
      } else {
        if (reset) {
          setPosts([]);
        }
        setHasMore(false);
      }

      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadPosts(true);

    // Setup realtime for new posts
    channelRef.current = supabase
      .channel(`feed_${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'posts'
        },
        () => {
          loadPosts(true);
        }
      )
      .subscribe();

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [userId, loadPosts]);

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      loadPosts(false);
    }
  }, [loading, hasMore, loadPosts]);

  return { posts, loading, hasMore, error, loadMore, refetch: () => loadPosts(true) };
};
