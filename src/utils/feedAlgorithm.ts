interface Post {
  id: string;
  user_id: string;
  created_at: string;
  like_count: number;
  comment_count: number;
  repost_count: number;
  profiles?: {
    industry?: string;
  };
}

interface AlgorithmConfig {
  currentUserId: string;
  userIndustry?: string;
  userConnections?: string[];
}

export const calculatePostScore = (
  post: Post,
  config: AlgorithmConfig
): number => {
  let score = 0;

  // Base recency score (newer posts get higher scores)
  const hoursOld = (Date.now() - new Date(post.created_at).getTime()) / (1000 * 60 * 60);
  const recencyScore = Math.max(0, 100 - hoursOld * 2); // Decay over time
  score += recencyScore * 1.2;

  // Connection boost
  if (config.userConnections?.includes(post.user_id)) {
    score *= 1.5;
  }

  // Industry relevance
  if (config.userIndustry && post.profiles?.industry === config.userIndustry) {
    score *= 1.3;
  }

  // Engagement score
  const engagementScore =
    (post.like_count || 0) * 1 +
    (post.comment_count || 0) * 2 +
    (post.repost_count || 0) * 3;
  score += engagementScore * 1.1;

  // Avoid showing user's own posts with high priority
  if (post.user_id === config.currentUserId) {
    score *= 0.5;
  }

  return score;
};

export const sortFeedByAlgorithm = (
  posts: Post[],
  config: AlgorithmConfig
): Post[] => {
  return posts
    .map((post) => ({
      post,
      score: calculatePostScore(post, config),
    }))
    .sort((a, b) => b.score - a.score)
    .map((item) => item.post);
};

export const getRelevantHashtags = (
  posts: Post[],
  currentUserId: string
): string[] => {
  const hashtagCounts = new Map<string, number>();

  posts.forEach((post: any) => {
    if (post.hashtags && Array.isArray(post.hashtags)) {
      post.hashtags.forEach((tag: string) => {
        const count = hashtagCounts.get(tag) || 0;
        hashtagCounts.set(tag, count + 1);
      });
    }
  });

  return Array.from(hashtagCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([tag]) => tag);
};
