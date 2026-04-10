import { StyleSheet, View } from 'react-native';
import DoveLetterSplash from '../components/Dove/DoveLetterSplash';

export function DoveLetterScreen() {
  return (
    <View style={styles.container}>
      <DoveLetterSplash />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7F5',
  },
});
