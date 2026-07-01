import React from 'react';
import { SafeAreaView, StatusBar } from 'react-native';
import { SwipeDeck } from './src/components/SwipeDeck';
import { MockProvider } from './src/services/mockProvider';

export default function App(): React.JSX.Element {
  const mockData = MockProvider.getDailyDeck();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <SwipeDeck items={mockData} />
    </SafeAreaView>
  );
}
