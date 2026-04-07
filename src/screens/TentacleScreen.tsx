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
    backgroundColor: '#D9D9D9',
    justifyContent: 'center',
  },
});