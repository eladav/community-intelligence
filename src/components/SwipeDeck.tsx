import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { DeckItem, Tweet } from '../types/deck';

interface SwipeDeckProps {
  items: DeckItem[];
  onSwipe?: (itemId: string, direction: 'left' | 'right') => void;
}

interface ValidationError {
  itemId: string | unknown;
  reason: string;
  item: unknown;
}

const validateDeckItem = (item: unknown): { valid: boolean; error?: string } => {
  if (!item || typeof item !== 'object') {
    return { valid: false, error: 'Item is not an object' };
  }

  const deckItem = item as Record<string, unknown>;

  if (typeof deckItem.tweet_id !== 'string' || !deckItem.tweet_id) {
    return { valid: false, error: 'Missing critical field: tweet_id' };
  }

  if (!deckItem.tweet || typeof deckItem.tweet !== 'object') {
    return { valid: false, error: 'Missing critical field: tweet' };
  }

  const tweet = deckItem.tweet as Record<string, unknown>;
  if (typeof tweet.text !== 'string' || !tweet.text) {
    return { valid: false, error: 'Tweet missing critical field: text' };
  }

  return { valid: true };
};

const normalizeTweet = (tweet: unknown): Partial<Tweet> => {
  if (!tweet || typeof tweet !== 'object') {
    return {};
  }

  const t = tweet as Record<string, unknown>;
  return {
    tweet_id: typeof t.tweet_id === 'string' ? t.tweet_id : undefined,
    author_handle: typeof t.author_handle === 'string' ? t.author_handle : 'Unknown author',
    text: typeof t.text === 'string' ? t.text : '',
    text_is_verbatim: typeof t.text_is_verbatim === 'boolean' ? t.text_is_verbatim : false,
    url: typeof t.url === 'string' ? t.url : undefined,
    estimated_likes: typeof t.estimated_likes === 'number' ? t.estimated_likes : undefined,
    has_media: typeof t.has_media === 'boolean' ? t.has_media : false,
    media_description: typeof t.media_description === 'string' ? t.media_description : undefined,
    context: typeof t.context === 'string' ? t.context : undefined,
    posted_at: typeof t.posted_at === 'string' ? t.posted_at : undefined,
  };
};

const formatRecency = (postedAt?: string): string => {
  if (!postedAt) return 'timing unknown';

  const posted = new Date(postedAt);
  const now = new Date();
  const diffMs = now.getTime() - posted.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

  if (diffHours < 1) return '< 1 hour ago';
  if (diffHours < 24) return `${diffHours}h ago`;

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
};

const Card: React.FC<{
  item: DeckItem;
  tweet: Partial<Tweet>;
  onSwipe?: (direction: 'left' | 'right') => void;
}> = ({ item, tweet, onSwipe }) => {
  const engagementText = tweet.estimated_likes !== undefined
    ? `${tweet.estimated_likes} likes`
    : '';

  const recency = formatRecency(tweet.posted_at);

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.authorHandle}>{tweet.author_handle || 'Unknown'}</Text>
        <Text style={styles.recency}>{recency}</Text>
      </View>

      <View style={styles.cardContent}>
        {!tweet.text_is_verbatim && <Text style={styles.aiSummaryPrefix}>AI Summary:</Text>}
        <Text style={styles.tweetText}>{tweet.text}</Text>

        {tweet.has_media && tweet.media_description && (
          <View style={styles.mediaDescription}>
            <Text style={styles.mediaLabel}>📸 {tweet.media_description}</Text>
          </View>
        )}

        {tweet.context && (
          <Text style={styles.context}>{tweet.context}</Text>
        )}
      </View>

      <View style={styles.cardFooter}>
        <Text style={styles.reasonForSelection}>{item.reason_for_selection}</Text>
        {engagementText && <Text style={styles.engagement}>{engagementText}</Text>}
      </View>

      <View style={styles.swipeHint}>
        <Text style={styles.swipeHintText}>← Swipe to interact →</Text>
      </View>
    </View>
  );
};

const ErrorCard: React.FC<{ error: ValidationError }> = ({ error }) => {
  return (
    <View style={[styles.card, styles.errorCard]}>
      <Text style={styles.errorTitle}>Data Error</Text>
      <Text style={styles.errorReason}>{error.reason}</Text>
      <Text style={styles.errorDetail}>
        This item was invalid and could not be displayed.
      </Text>
    </View>
  );
};

export const SwipeDeck: React.FC<SwipeDeckProps> = ({ items, onSwipe }) => {
  const { validItems, invalidItems } = useMemo(() => {
    const valid: DeckItem[] = [];
    const invalid: ValidationError[] = [];

    items.forEach((item) => {
      const validation = validateDeckItem(item);

      if (validation.valid) {
        valid.push(item);
      } else {
        invalid.push({
          itemId: item.id || 'unknown',
          reason: validation.error || 'Unknown error',
          item,
        });
        console.warn(
          `[SwipeDeck] Dropped invalid DeckItem: ${item.id || 'unknown'} - ${validation.error}`,
          item,
        );
      }
    });

    return { validItems: valid, invalidItems: invalid };
  }, [items]);

  const allCards = useMemo(() => {
    const cards: React.ReactNode[] = [];

    validItems.forEach((item) => {
      const tweet = normalizeTweet(item.tweet);
      cards.push(
        <Card
          key={item.id}
          item={item}
          tweet={tweet}
          onSwipe={(direction) => onSwipe?.(item.id, direction)}
        />,
      );
    });

    invalidItems.forEach((error) => {
      cards.push(<ErrorCard key={`error-${error.itemId}`} error={error} />);
    });

    return cards;
  }, [validItems, invalidItems, onSwipe]);

  const isEmpty = validItems.length === 0 && invalidItems.length === 0;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Your Daily Digest</Text>
        {invalidItems.length > 0 && (
          <Text style={styles.diagnostics}>
            ⚠️ {invalidItems.length} item(s) skipped due to validation errors
          </Text>
        )}
      </View>

      {isEmpty ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>No items to display</Text>
        </View>
      ) : (
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          {allCards}
        </ScrollView>
      )}

      {validItems.length > 0 && (
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            {validItems.length} item{validItems.length !== 1 ? 's' : ''} in your deck
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  diagnostics: {
    fontSize: 12,
    color: '#d9534f',
    marginTop: 4,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 12,
    gap: 12,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 8,
  },
  errorCard: {
    backgroundColor: '#ffe6e6',
    borderWidth: 1,
    borderColor: '#d9534f',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  authorHandle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a73e8',
  },
  recency: {
    fontSize: 12,
    color: '#999',
  },
  cardContent: {
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  aiSummaryPrefix: {
    fontSize: 11,
    fontStyle: 'italic',
    color: '#999',
    marginBottom: 4,
  },
  tweetText: {
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
    marginBottom: 8,
  },
  mediaDescription: {
    backgroundColor: '#f9f9f9',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 4,
    marginVertical: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#1a73e8',
  },
  mediaLabel: {
    fontSize: 13,
    color: '#555',
  },
  context: {
    fontSize: 12,
    color: '#888',
    fontStyle: 'italic',
    marginTop: 8,
  },
  cardFooter: {
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  reasonForSelection: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  engagement: {
    fontSize: 12,
    color: '#999',
  },
  swipeHint: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#f0f8ff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  swipeHintText: {
    fontSize: 11,
    color: '#666',
    textAlign: 'center',
  },
  errorTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#d9534f',
    paddingHorizontal: 12,
    paddingTop: 12,
  },
  errorReason: {
    fontSize: 13,
    color: '#c9302c',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  errorDetail: {
    fontSize: 12,
    color: '#999',
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  footerText: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#999',
  },
});
