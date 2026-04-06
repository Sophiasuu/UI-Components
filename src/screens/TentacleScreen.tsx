import { StyleSheet, View } from 'react-native';
import GlowingTentacle from '../components/Energy/GlowingTentacle';

export function TentacleScreen() {
  return (
    <View style={styles.container}>
      <GlowingTentacle />
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