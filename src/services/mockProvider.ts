import { DeckItem, Tweet } from '../types/deck';

const MOCK_TWEETS: Record<string, Tweet> = {
  'tweet-1': {
    tweet_id: 'tweet-1',
    author_handle: '@emidiopepe',
    text: 'Bottling the new vintage today. Excited to share this with the world. [1]',
    text_is_verbatim: true,
    url: 'https://x.com/emidiopepe/status/1806345678910111213',
    estimated_likes: 450,
    context: 'Recent post from wine expert discussing new vintage release.',
    has_media: false,
    posted_at: '2026-07-01T08:30:00Z',
  },
  'tweet-2': {
    tweet_id: 'tweet-2',
    author_handle: '@vintner_jane',
    text: 'The 2024 season has been exceptional for natural wines',
    text_is_verbatim: true,
    url: 'https://x.com/vintner_jane/status/1806345679010111214',
    estimated_likes: 230,
    context: 'Industry discussion on 2024 vintage quality.',
    has_media: true,
    media_description: 'Photo of vineyard during harvest season',
    posted_at: '2026-06-30T15:45:00Z',
  },
  'tweet-3': {
    tweet_id: 'tweet-3',
    author_handle: '@ai_researcher',
    text: 'Just published findings on transformer architecture improvements',
    text_is_verbatim: true,
    url: 'https://x.com/ai_researcher/status/1806345679110111215',
    estimated_likes: 890,
    context: 'New research on deep learning optimization techniques.',
    posted_at: '2026-07-01T12:00:00Z',
  },
  'tweet-4': {
    tweet_id: 'tweet-4',
    author_handle: '@tech_talks',
    text: 'Summary of the latest developments in TypeScript',
    text_is_verbatim: false,
    url: 'https://x.com/tech_talks/status/1806345679210111216',
    estimated_likes: 120,
    context: 'Tech community discussion about language evolution.',
    posted_at: '2026-06-29T10:20:00Z',
  },
  'tweet-5': {
    tweet_id: 'tweet-5',
    author_handle: '@woodworking_pro',
    text: 'New dovetail joint technique produces stronger joints with less material waste',
    text_is_verbatim: true,
    url: 'https://x.com/woodworking_pro/status/1806345679310111217',
    estimated_likes: 340,
    context: 'Woodworking tips from a professional craftsperson.',
    has_media: true,
    media_description: 'Close-up of intricate dovetail joint work',
    posted_at: '2026-06-28T16:00:00Z',
  },
};

const FULLY_POPULATED_ITEM: DeckItem = {
  id: 'deck-item-1',
  user_id: 'user-123',
  tweet_id: 'tweet-1',
  deck_date: '2026-07-01',
  rank: 1,
  source: 'handle',
  reason_for_selection: 'From your followed handle @emidiopepe about wine recommendations.',
  status: 'pending',
  tweet: MOCK_TWEETS['tweet-1'],
};

const SPARSE_ITEM: DeckItem = {
  id: 'deck-item-2',
  user_id: 'user-123',
  tweet_id: 'tweet-2',
  deck_date: '2026-07-01',
  rank: 2,
  source: 'interest',
  reason_for_selection: 'Matches your interest in natural wines.',
  status: 'pending',
  tweet: {
    tweet_id: 'tweet-2',
    author_handle: '@vintner_jane',
    text: 'The 2024 season has been exceptional for natural wines',
    text_is_verbatim: true,
    url: 'https://x.com/vintner_jane/status/1806345679010111214',
  },
};

const TECH_ITEM: DeckItem = {
  id: 'deck-item-3',
  user_id: 'user-123',
  tweet_id: 'tweet-3',
  deck_date: '2026-07-01',
  rank: 3,
  source: 'interest',
  reason_for_selection: 'Recent research matching your AI interests.',
  status: 'pending',
  tweet: MOCK_TWEETS['tweet-3'],
};

const HANDMADE_ITEM: DeckItem = {
  id: 'deck-item-4',
  user_id: 'user-123',
  tweet_id: 'tweet-5',
  deck_date: '2026-07-01',
  rank: 4,
  source: 'interest',
  reason_for_selection: 'New technique in woodworking, matching your interests.',
  status: 'pending',
  tweet: MOCK_TWEETS['tweet-5'],
};

export class MockProvider {
  static getDailyDeck(): DeckItem[] {
    return [
      FULLY_POPULATED_ITEM,
      SPARSE_ITEM,
      TECH_ITEM,
      HANDMADE_ITEM,
    ];
  }

  static getFullyPopulatedItem(): DeckItem {
    return FULLY_POPULATED_ITEM;
  }

  static getSparseItem(): DeckItem {
    return SPARSE_ITEM;
  }

  static getMockTweet(id: string): Tweet | undefined {
    return MOCK_TWEETS[id];
  }
}
