import { StyleSheet, View } from 'react-native';
import SineRibbon from '../components/Motion/SineRibbon';

export function SineRibbonScreen() {
  return (
    <View style={styles.container}>
      <SineRibbon />
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