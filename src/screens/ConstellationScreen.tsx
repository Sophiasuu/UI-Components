import { StyleSheet, View } from 'react-native';
import ConstellationSplash from '../components/Zodiac/ConstellationSplash';

export function ConstellationScreen() {
  return (
    <View style={styles.container}>
      <ConstellationSplash />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#D9D9D9',
  },
});
