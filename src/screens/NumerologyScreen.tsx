import { StyleSheet, View } from 'react-native';
import NumerologyMesh from '../components/Numerology/NumerologyMesh';

export function NumerologyScreen() {
  return (
    <View style={styles.container}>
      <NumerologyMesh />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7F5',
  },
});
