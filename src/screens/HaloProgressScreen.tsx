import { StyleSheet, Text, View } from 'react-native';
import { HaloProgressCard } from '../components/Awesome/HaloProgressCard';

export function HaloProgressScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Halo Progress Card</Text>
      <HaloProgressCard
        value={84}
        title="Aura Readiness"
        subtitle="A radial signal meter for confidence, completion, or readiness states."
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
