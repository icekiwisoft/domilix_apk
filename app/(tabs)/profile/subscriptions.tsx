import { SafeAreaView, ScrollView, StyleSheet, Text, View, Pressable } from 'react-native';
import { router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { PlanCard } from '@/components/ui/plan-card';
import { Colors, Spacing, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const PLANS = [
  {
    id: 'starter',
    title: 'Starter',
    price: null,
    features: [
      '3 annonces actives max',
      'Photos standard',
      'Support email 48h',
    ],
  },
  {
    id: 'pro',
    title: 'Pro',
    price: 15000,
    recommended: true,
    features: [
      'Annonces illimitées',
      'Photos HD',
      'Boost hebdomadaire',
      'Statistiques de base',
      'Support WhatsApp',
    ],
  },
  {
    id: 'business',
    title: 'Business',
    price: 35000,
    features: [
      'Tout le plan Pro',
      'Boosts illimités',
      'Dashboard avancé',
      'Label agence white-label',
      'Chargé de compte dédié',
    ],
  },
] as const;

export default function SubscriptionsScreen() {
  const scheme = useColorScheme();
  const C = Colors[scheme ?? 'light'];

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: C.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: C.outlineVariant, backgroundColor: C.surface }]}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <MaterialIcons name="arrow-back" size={24} color={C.onSurface} />
        </Pressable>
        <Text style={[Typography.headlineMd, { color: C.onSurface, fontSize: 20 }]}>
          Abonnements
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Intro */}
        <View style={styles.intro}>
          <Text style={[Typography.headlineLg, { color: C.onSurface, textAlign: 'center', fontSize: 24, fontFamily: 'PlusJakartaSans_700Bold' }]}>
            Boostez votre visibilité
          </Text>
          <Text style={[Typography.bodyMd, { color: C.onSurfaceVariant, textAlign: 'center', marginTop: Spacing.sm, lineHeight: 22 }]}>
            Choisissez le plan qui correspond à vos ambitions. Annulez à tout moment.
          </Text>
        </View>

        {/* Plans */}
        {PLANS.map((plan) => (
          <PlanCard
            key={plan.id}
            title={plan.title}
            price={plan.price}
            features={[...plan.features]}
            recommended={plan.id === 'pro'}
            current={plan.id === 'pro'}
            ctaLabel={plan.price === null ? 'Plan actuel' : `Passer au ${plan.title}`}
            onPress={() => {
              if (plan.id === 'pro') {
                // CamPay payment flow
              }
            }}
          />
        ))}

        {/* CamPay note */}
        <View style={[styles.campayNote, { backgroundColor: C.surfaceContainer, borderColor: C.outlineVariant }]}>
          <MaterialIcons name="payment" size={18} color={C.onSurfaceVariant} />
          <Text style={[Typography.caption, { color: C.onSurfaceVariant, flex: 1, lineHeight: 18 }]}>
            Paiement sécurisé via CamPay · MTN Mobile Money · Orange Money
          </Text>
        </View>

        <View style={{ height: Spacing.xxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.marginMobile,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  scroll: {
    paddingHorizontal: Spacing.marginMobile,
    paddingTop: Spacing.xl,
    gap: Spacing.lg,
  },
  intro: {
    marginBottom: Spacing.sm,
  },
  campayNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: 12,
    borderWidth: 1,
  },
});
