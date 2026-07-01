export interface Tweet {
  tweet_id: string;
  author_handle: string;
  text: string;
  text_is_verbatim: boolean;
  url: string;
  embedded_url?: string;
  og?: {
    title?: string;
    image?: string;
    description?: string;
  };
  has_media?: boolean;
  media_description?: string;
  quoted_tweet?: {
    author: string;
    text: string;
  };
  posted_at?: string;
  estimated_likes?: number;
  context?: string;
  raw_json?: Record<string, unknown>;
}

export interface DeckItem {
  // Acceptance criteria fields (shared schema contract)
  id: string;
  type: 'tweet'; // content type discriminator
  contentSummary: string; // text content
  timestamp: string; // ISO timestamp
  sourceUrl: string; // URL to source content
  depthLabel?: string; // optional categorization

  // Tweet-specific extensions
  user_id: string;
  tweet_id: string;
  deck_date: string;
  rank: number;
  source: 'handle' | 'interest';
  reason_for_selection: string;
  status: 'pending' | 'liked' | 'disliked';
  tweet: Tweet;
}

export interface DeckWithItems {
  items: DeckItem[];
  date: string;
}

export interface BoundaryContractResult {
  valid: DeckItem[];
  invalid: Array<{
    item: unknown;
    reason: string;
  }>;
}
