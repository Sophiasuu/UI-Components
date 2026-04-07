import { StyleSheet, View } from 'react-native';
import SplooshBounce from '../components/Surface/SplooshBounce';

export function SplooshScreen() {
  return (
    <View style={styles.container}>
      <SplooshBounce />
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