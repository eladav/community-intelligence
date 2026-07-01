import React from 'react';
import { render } from '@testing-library/react-native';
import { SwipeDeck } from '../SwipeDeck';
import { MockProvider } from '../../services/mockProvider';
import { DeckItem, Tweet } from '../../types/deck';

describe('SwipeDeck Boundary Contract Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'warn').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Acceptance Path - Valid Fully Populated Items', () => {
    it('should render a fully populated DeckItem without crashing', () => {
      const item = MockProvider.getFullyPopulatedItem();
      const { getByText, queryByText } = render(<SwipeDeck items={[item]} />);

      expect(queryByText('Data Error')).toBeNull();
      expect(getByText('@emidiopepe')).toBeTruthy();
      expect(getByText(/Bottling the new vintage today/)).toBeTruthy();
    });

    it('should display fully populated item metadata correctly', () => {
      const item = MockProvider.getFullyPopulatedItem();
      const { getByText } = render(<SwipeDeck items={[item]} />);

      expect(getByText('@emidiopepe')).toBeTruthy();
      expect(getByText(/From your followed handle/)).toBeTruthy();
      expect(getByText(/450 likes/)).toBeTruthy();
    });

    it('should display engagement count when estimated_likes is present', () => {
      const item = MockProvider.getFullyPopulatedItem();
      const { getByText } = render(<SwipeDeck items={[item]} />);

      expect(getByText(/450 likes/)).toBeTruthy();
    });

    it('should display recency information for recent tweets', () => {
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

      const item: DeckItem = {
        id: 'test-1',
        type: 'tweet',
        contentSummary: 'This is a recent tweet',
        timestamp: oneHourAgo.toISOString(),
        sourceUrl: 'https://x.com/testuser/status/123',
        user_id: 'user-123',
        tweet_id: 'recent-tweet',
        deck_date: now.toISOString().split('T')[0],
        rank: 1,
        source: 'handle',
        reason_for_selection: 'Recent post',
        status: 'pending',
        tweet: {
          tweet_id: 'recent-tweet',
          author_handle: '@testuser',
          text: 'This is a recent tweet',
          text_is_verbatim: true,
          url: 'https://x.com/testuser/status/123',
          posted_at: oneHourAgo.toISOString(),
        },
      };

      const { getByText } = render(<SwipeDeck items={[item]} />);
      expect(getByText(/ago/)).toBeTruthy();
    });
  });

  describe('Acceptance Path - Sparse Items with Optional Fields', () => {
    it('should render a sparse DeckItem (missing optional fields) without crashing', () => {
      const item = MockProvider.getSparseItem();
      const { getByText, queryByText } = render(<SwipeDeck items={[item]} />);

      expect(queryByText('Data Error')).toBeNull();
      expect(getByText('@vintner_jane')).toBeTruthy();
      expect(getByText(/The 2024 season/)).toBeTruthy();
    });

    it('should normalize missing estimated_likes to undefined (not displayed)', () => {
      const item: DeckItem = {
        id: 'sparse-1',
        type: 'tweet',
        contentSummary: 'Tweet without engagement metrics',
        timestamp: '2026-07-01T00:00:00Z',
        sourceUrl: 'https://x.com/sparse_author/status/123',
        user_id: 'user-123',
        tweet_id: 'sparse-tweet',
        deck_date: '2026-07-01',
        rank: 1,
        source: 'interest',
        reason_for_selection: 'Sparse item test',
        status: 'pending',
        tweet: {
          tweet_id: 'sparse-tweet',
          author_handle: '@sparse_author',
          text: 'Tweet without engagement metrics',
          text_is_verbatim: true,
          url: 'https://x.com/sparse_author/status/123',
        },
      };

      const { getByText, queryByText } = render(<SwipeDeck items={[item]} />);

      expect(getByText('@sparse_author')).toBeTruthy();
      expect(getByText(/Tweet without engagement/)).toBeTruthy();
      expect(queryByText(/likes/)).toBeNull();
    });

    it('should hide media description when has_media is false', () => {
      const item: DeckItem = {
        id: 'no-media-1',
        type: 'tweet',
        contentSummary: 'Tweet without media',
        timestamp: '2026-07-01T00:00:00Z',
        sourceUrl: 'https://x.com/no_media_author/status/123',
        user_id: 'user-123',
        tweet_id: 'no-media-tweet',
        deck_date: '2026-07-01',
        rank: 1,
        source: 'interest',
        reason_for_selection: 'No media item',
        status: 'pending',
        tweet: {
          tweet_id: 'no-media-tweet',
          author_handle: '@no_media_author',
          text: 'Tweet without media',
          text_is_verbatim: true,
          url: 'https://x.com/no_media_author/status/123',
          has_media: false,
        },
      };

      const { queryByText } = render(<SwipeDeck items={[item]} />);
      expect(queryByText(/📸/)).toBeNull();
    });

    it('should display media description when has_media is true and media_description exists', () => {
      const item: DeckItem = {
        id: 'with-media-1',
        type: 'tweet',
        contentSummary: 'Tweet with media content',
        timestamp: '2026-07-01T00:00:00Z',
        sourceUrl: 'https://x.com/media_author/status/123',
        user_id: 'user-123',
        tweet_id: 'media-tweet',
        deck_date: '2026-07-01',
        rank: 1,
        source: 'interest',
        reason_for_selection: 'Tweet with media',
        status: 'pending',
        tweet: {
          tweet_id: 'media-tweet',
          author_handle: '@media_author',
          text: 'Tweet with media content',
          text_is_verbatim: true,
          url: 'https://x.com/media_author/status/123',
          has_media: true,
          media_description: 'A scenic landscape photo',
        },
      };

      const { getByText } = render(<SwipeDeck items={[item]} />);
      expect(getByText(/A scenic landscape photo/)).toBeTruthy();
    });

    it('should display "AI Summary:" prefix when text_is_verbatim is false', () => {
      const item: DeckItem = {
        id: 'summary-1',
        type: 'tweet',
        contentSummary: 'This is an AI-generated summary',
        timestamp: '2026-07-01T00:00:00Z',
        sourceUrl: 'https://x.com/ai_author/status/123',
        user_id: 'user-123',
        tweet_id: 'summary-tweet',
        deck_date: '2026-07-01',
        rank: 1,
        source: 'interest',
        reason_for_selection: 'AI summary item',
        status: 'pending',
        tweet: {
          tweet_id: 'summary-tweet',
          author_handle: '@ai_author',
          text: 'This is an AI-generated summary',
          text_is_verbatim: false,
          url: 'https://x.com/ai_author/status/123',
        },
      };

      const { getByText } = render(<SwipeDeck items={[item]} />);
      expect(getByText(/AI Summary:/)).toBeTruthy();
    });
  });

  describe('Rejection Path - Critical Missing Fields', () => {
    it('should reject item with missing tweet_id and show error card', () => {
      const invalidItem = {
        id: 'bad-1',
        type: 'tweet' as const,
        contentSummary: 'Test text',
        timestamp: '2026-07-01T00:00:00Z',
        sourceUrl: 'https://x.com/test/status/123',
        user_id: 'user-123',
        deck_date: '2026-07-01',
        rank: 1,
        source: 'handle' as const,
        reason_for_selection: 'Invalid item',
        status: 'pending' as const,
        tweet: {
          author_handle: '@test',
          text: 'Test text',
          text_is_verbatim: true,
          url: 'https://x.com/test/status/123',
        },
      };

      const { getByText } = render(<SwipeDeck items={[invalidItem as DeckItem]} />);

      expect(getByText('Data Error')).toBeTruthy();
      expect(getByText(/Missing critical field: tweet_id/)).toBeTruthy();
    });

    it('should reject item with missing tweet object and show error card', () => {
      const invalidItem = {
        id: 'bad-2',
        type: 'tweet' as const,
        contentSummary: '',
        timestamp: '2026-07-01T00:00:00Z',
        sourceUrl: '',
        user_id: 'user-123',
        tweet_id: 'tweet-123',
        deck_date: '2026-07-01',
        rank: 1,
        source: 'handle' as const,
        reason_for_selection: 'Invalid item',
        status: 'pending' as const,
      };

      const { getByText } = render(<SwipeDeck items={[invalidItem as DeckItem]} />);

      expect(getByText('Data Error')).toBeTruthy();
      expect(getByText(/Missing critical field: tweet/)).toBeTruthy();
    });

    it('should reject item with missing tweet.text and show error card', () => {
      const invalidItem = {
        id: 'bad-3',
        type: 'tweet' as const,
        contentSummary: '',
        timestamp: '2026-07-01T00:00:00Z',
        sourceUrl: 'https://x.com/test/status/123',
        user_id: 'user-123',
        tweet_id: 'tweet-123',
        deck_date: '2026-07-01',
        rank: 1,
        source: 'handle' as const,
        reason_for_selection: 'Invalid item',
        status: 'pending' as const,
        tweet: {
          tweet_id: 'tweet-123',
          author_handle: '@test',
          text_is_verbatim: true,
          url: 'https://x.com/test/status/123',
        },
      };

      const { getByText } = render(<SwipeDeck items={[invalidItem as DeckItem]} />);

      expect(getByText('Data Error')).toBeTruthy();
      expect(getByText(/Missing critical field: text/)).toBeTruthy();
    });

    it('should log rejection reason to console when item is invalid', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      const invalidItem = {
        id: 'bad-4',
        type: 'tweet' as const,
        contentSummary: '',
        timestamp: '2026-07-01T00:00:00Z',
        sourceUrl: '',
        user_id: 'user-123',
        tweet_id: 'tweet-123',
        deck_date: '2026-07-01',
        rank: 1,
        source: 'handle' as const,
        reason_for_selection: 'Invalid item',
        status: 'pending' as const,
        tweet: {},
      };

      render(<SwipeDeck items={[invalidItem as DeckItem]} />);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Dropped invalid DeckItem'),
        expect.anything(),
      );

      consoleSpy.mockRestore();
    });
  });

  describe('Mixed Valid and Invalid Items', () => {
    it('should render valid items and show error cards for invalid items', () => {
      const validItem = MockProvider.getFullyPopulatedItem();
      const invalidItem = {
        id: 'bad-5',
        type: 'tweet' as const,
        contentSummary: '',
        timestamp: '2026-07-01T00:00:00Z',
        sourceUrl: '',
        user_id: 'user-123',
        tweet_id: 'tweet-123',
        deck_date: '2026-07-01',
        rank: 2,
        source: 'interest' as const,
        reason_for_selection: 'Invalid item',
        status: 'pending' as const,
        tweet: {},
      };

      const { getByText } = render(
        <SwipeDeck items={[validItem, invalidItem as DeckItem]} />,
      );

      expect(getByText('@emidiopepe')).toBeTruthy();
      expect(getByText('Data Error')).toBeTruthy();
      expect(getByText(/⚠️.*1 item/)).toBeTruthy();
    });

    it('should display diagnostics message when there are invalid items', () => {
      const invalidItem = {
        id: 'bad-6',
        type: 'tweet' as const,
        contentSummary: '',
        timestamp: '2026-07-01T00:00:00Z',
        sourceUrl: '',
        user_id: 'user-123',
        tweet_id: 'tweet-123',
        deck_date: '2026-07-01',
        rank: 1,
        source: 'handle' as const,
        reason_for_selection: 'Invalid item',
        status: 'pending' as const,
        tweet: {},
      };

      const { getByText } = render(<SwipeDeck items={[invalidItem as DeckItem]} />);

      expect(getByText(/⚠️.*1 item\(s\) skipped/)).toBeTruthy();
    });

    it('should count multiple invalid items in diagnostics', () => {
      const invalidItem1 = {
        id: 'bad-7',
        type: 'tweet' as const,
        contentSummary: '',
        timestamp: '2026-07-01T00:00:00Z',
        sourceUrl: '',
        user_id: 'user-123',
        tweet_id: 'tweet-123',
        deck_date: '2026-07-01',
        rank: 1,
        source: 'handle' as const,
        reason_for_selection: 'Invalid item',
        status: 'pending' as const,
        tweet: {},
      };

      const invalidItem2 = {
        id: 'bad-8',
        type: 'tweet' as const,
        contentSummary: 'Valid text',
        timestamp: '2026-07-01T00:00:00Z',
        sourceUrl: '',
        user_id: 'user-123',
        tweet_id: undefined,
        deck_date: '2026-07-01',
        rank: 2,
        source: 'interest' as const,
        reason_for_selection: 'Another invalid item',
        status: 'pending' as const,
        tweet: {
          text: 'Valid text',
          text_is_verbatim: true,
        },
      };

      const { getByText } = render(
        <SwipeDeck items={[invalidItem1 as DeckItem, invalidItem2 as DeckItem]} />,
      );

      expect(getByText(/⚠️.*2 item/)).toBeTruthy();
    });
  });

  describe('Empty and Edge Cases', () => {
    it('should display empty state when no items provided', () => {
      const { getByText } = render(<SwipeDeck items={[]} />);

      expect(getByText('No items to display')).toBeTruthy();
    });

    it('should display deck item count in footer', () => {
      const items = [
        MockProvider.getFullyPopulatedItem(),
        MockProvider.getSparseItem(),
      ];

      const { getByText } = render(<SwipeDeck items={items} />);

      expect(getByText(/2 items in your deck/)).toBeTruthy();
    });

    it('should display singular form for single item count', () => {
      const { getByText } = render(<SwipeDeck items={[MockProvider.getFullyPopulatedItem()]} />);

      expect(getByText(/1 item in your deck/)).toBeTruthy();
    });

    it('should handle null/undefined items gracefully', () => {
      const items = [MockProvider.getFullyPopulatedItem(), null] as unknown as DeckItem[];

      const { getByText } = render(<SwipeDeck items={items} />);

      expect(getByText('@emidiopepe')).toBeTruthy();
      expect(getByText('Data Error')).toBeTruthy();
    });
  });

  describe('Provider Output Format Verification', () => {
    it('should accept mock provider fully populated item without modification', () => {
      const item = MockProvider.getFullyPopulatedItem();

      expect(item.tweet_id).toBeDefined();
      expect(item.tweet?.text).toBeDefined();
      expect(item.tweet?.author_handle).toBeDefined();

      const { getByText } = render(<SwipeDeck items={[item]} />);
      expect(getByText('@emidiopepe')).toBeTruthy();
    });

    it('should accept mock provider sparse item and normalize missing fields', () => {
      const item = MockProvider.getSparseItem();

      expect(item.tweet_id).toBeDefined();
      expect(item.tweet?.text).toBeDefined();
      expect(item.tweet?.estimated_likes).toBeUndefined();

      const { getByText, queryByText } = render(<SwipeDeck items={[item]} />);
      expect(getByText('@vintner_jane')).toBeTruthy();
      expect(queryByText('Data Error')).toBeNull();
    });

    it('should handle all items from mock provider daily deck', () => {
      const items = MockProvider.getDailyDeck();

      expect(items.length).toBeGreaterThan(0);

      const { queryByText } = render(<SwipeDeck items={items} />);
      expect(queryByText('Data Error')).toBeNull();
    });
  });
});
