import { Text } from 'react-native';
import { Colors, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface ResultsCountProps {
  count: number;
  query?: string;
}

export function ResultsCount({ count, query }: ResultsCountProps) {
  const scheme = useColorScheme();
  const C = Colors[scheme ?? 'light'];

  const label = query
    ? `${count} résultat${count !== 1 ? 's' : ''} pour "${query}"`
    : `${count} annonce${count !== 1 ? 's' : ''}`;

  return (
    <Text style={[Typography.bodyMd, { color: C.onSurfaceVariant }]}>{label}</Text>
  );
}
