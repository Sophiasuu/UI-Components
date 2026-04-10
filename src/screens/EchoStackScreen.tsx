import { StyleSheet, Text, View } from 'react-native';
import { EchoStackCard } from '../components/Awesome/EchoStackCard';

export function EchoStackScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Echo Stack Card</Text>
      <EchoStackCard
        title="Echo Deck"
        description="Layered depth with ambient motion for high-impact content blocks."
        tagA="Parallax"
        tagB="Ambient"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7F5',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2E2A27',
  },
});
