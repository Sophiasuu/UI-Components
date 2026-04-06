import { StyleSheet, View } from 'react-native';
import YinYangMeditation from '../components/YinYang/YinYangMeditation';

export function YinYangScreen() {
  return (
    <View style={styles.container}>
      <YinYangMeditation />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7F5',
  },
});
