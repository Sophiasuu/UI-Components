import { StyleSheet, View } from 'react-native';
import LotusBloom from '../components/Vedic/LotusBloom';

export function VedicScreen() {
  return (
    <View style={styles.container}>
      <LotusBloom />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#D9D9D9',
  },
});
