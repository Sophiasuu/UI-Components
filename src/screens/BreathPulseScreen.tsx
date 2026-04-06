import { StyleSheet, View } from 'react-native';
import BreathPulse from '../components/Motion/BreathPulse';

export function BreathPulseScreen() {
  return (
    <View style={styles.container}>
      <BreathPulse />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7F5',
    justifyContent: 'center',
  },
});