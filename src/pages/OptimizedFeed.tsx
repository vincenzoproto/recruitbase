import React, { useCallback, useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw } from 'lucide-react';
import { useOptimizedFeed } from '@/hooks/useOptimizedFeed';
import OptimizedFeedPost from '@/components/optimized/OptimizedFeedPost';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const OptimizedFeed = () => {
  const [userId, setUserId] = useState<string>('');
  const { posts, loading, hasMore, loadMore, refetch } = useOptimizedFeed(userId);

  useEffect(() => {
    const loadUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setUserId(user.id);
    };
    loadUser();
  }, []);

  const handleReact = useCallback(async (postId: string) => {
    try {
      const { data: existing } = await supabase
        .from('post_reactions')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', userId)
        .maybeSingle();

      if (existing) {
        await supabase
          .from('post_reactions')
          .delete()
          .eq('id', existing.id);
      } else {
        await supabase
          .from('post_reactions')
          .insert({ post_id: postId, user_id: userId, reaction_type: 'like' });
      }

      refetch();
    } catch (error) {
      toast.error('Errore nella reazione');
    }
  }, [userId, refetch]);

  const handleComment = useCallback((postId: string) => {
    // Open comment modal or navigate to post detail
    toast.info('Commenti in sviluppo');
  }, []);

  const handleShare = useCallback((postId: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/post/${postId}`);
    toast.success('Link copiato negli appunti');
  }, []);

  if (!userId) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-screen">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto p-4 max-w-2xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Feed</h1>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => refetch()}
          >
            <RefreshCw className="h-5 w-5" />
          </Button>
        </div>

        <div className="space-y-4">
          {posts.map((post) => (
            <OptimizedFeedPost
              key={post.id}
              post={post}
              onReact={handleReact}
              onComment={handleComment}
              onShare={handleShare}
            />
          ))}
        </div>

        {hasMore && (
          <div className="text-center py-6">
            <Button
              variant="outline"
              onClick={loadMore}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Carica altri
            </Button>
          </div>
        )}

        {!loading && posts.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <p>Nessun post disponibile</p>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default React.memo(OptimizedFeed);
