import { StyleSheet } from 'react-native';
import { Button } from 'react-native-paper';
import { Radius } from '@/constants/theme';

interface MapListToggleProps {
  mode: 'list' | 'map';
  onToggle: () => void;
}

export function MapListToggle({ mode, onToggle }: MapListToggleProps) {
  const isMap = mode === 'map';

  return (
    <Button
      mode="contained"
      icon={isMap ? 'format-list-bulleted' : 'map'}
      accessibilityLabel={isMap ? 'Afficher la liste' : 'Afficher la carte'}
      onPress={onToggle}
      style={styles.btn}
    >
      {isMap ? 'Liste' : 'Carte'}
    </Button>
  );
}

const styles = StyleSheet.create({
  btn: {
    borderRadius: Radius.full,
    shadowColor: '#633f00',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
});
