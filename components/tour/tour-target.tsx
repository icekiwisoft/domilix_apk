import { useEffect, useRef, type ComponentRef, type ReactNode } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';

// Elements the guided tour can point at, by id.
type TargetNode = ComponentRef<typeof View>;
const targets = new Map<string, TargetNode>();

export function getTourTarget(id: string) {
  return targets.get(id) ?? null;
}

export function TourTarget({ id, children, style }: { id: string; children: ReactNode; style?: StyleProp<ViewStyle> }) {
  const ref = useRef<TargetNode>(null);

  useEffect(() => {
    const node = ref.current;
    if (node) targets.set(id, node);
    return () => {
      if (targets.get(id) === node) targets.delete(id);
    };
  }, [id]);

  return (
    <View ref={ref} collapsable={false} style={style}>
      {children}
    </View>
  );
}
