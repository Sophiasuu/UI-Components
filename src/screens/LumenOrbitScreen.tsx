import { StyleSheet, View } from 'react-native';
import LumenOrbit from '../components/Motion/LumenOrbit';

export function LumenOrbitScreen() {
  return (
    <View style={styles.container}>
      <LumenOrbit />
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