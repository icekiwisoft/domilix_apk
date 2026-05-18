import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Radius, Spacing, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { Announcer } from '@/types/announcer';

interface AnnouncerContactProps {
  announcer: Announcer;
}

export function AnnouncerContact({ announcer }: AnnouncerContactProps) {
  const scheme = useColorScheme();
  const C = Colors[scheme ?? 'light'];
  const phone = announcer.professional_phone ?? announcer.contact;

  function handleWhatsApp() {
    if (!phone) return;
    const digits = phone.replace(/\D/g, '');
    Linking.openURL(`https://wa.me/${digits}`);
  }

  function handleCall() {
    if (!phone) return;
    Linking.openURL(`tel:${phone}`);
  }

  return (
    <View style={styles.row}>
      <Pressable
        onPress={handleWhatsApp}
        style={({ pressed }) => [
          styles.btn,
          styles.btnOutline,
          { borderColor: C.outlineVariant, opacity: pressed ? 0.8 : 1 },
        ]}
      >
        <MaterialIcons name="chat" size={18} color={C.onSurface} />
        <Text style={[Typography.labelSm, { color: C.onSurface, textTransform: 'uppercase', letterSpacing: 0.8 }]}>
          WhatsApp
        </Text>
      </Pressable>

      <Pressable
        onPress={handleCall}
        style={({ pressed }) => [
          styles.btn,
          { backgroundColor: C.primary, opacity: pressed ? 0.88 : 1 },
        ]}
      >
        <MaterialIcons name="call" size={18} color={C.onPrimary} />
        <Text style={[Typography.labelSm, { color: C.onPrimary, textTransform: 'uppercase', letterSpacing: 0.8 }]}>
          Appeler
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  btn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    height: 48,
    borderRadius: Radius.md,
  },
  btnOutline: {
    borderWidth: 1,
  },
});
