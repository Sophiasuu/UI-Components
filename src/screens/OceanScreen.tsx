import { StyleSheet, View } from 'react-native';
import OceanPersonalityCard from '../components/Ocean/OceanPersonalityCard';

export function OceanScreen() {
  return (
    <View style={styles.container}>
      <OceanPersonalityCard />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#010B18',
  },
});
