import { StyleSheet, Text, View } from 'react-native';
import { PrismActionButton } from '../components/Awesome/PrismActionButton';

export function PrismActionScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Prism Action Button</Text>
      <PrismActionButton label="Launch Stellar Flow" caption="Tap to trigger" />
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
