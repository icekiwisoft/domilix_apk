import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Radius, Spacing, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useSubscriptions, useCreateSubscription } from '@/hooks/queries/use-subscriptions';
import { useToast } from '@/components/ui/toast';
import type { Subscription } from '@/types/notification';

// ─── Plan definitions (from Domilix mockup) ──────────────────────────────────

type PlanId = 'starter' | 'pro' | 'business';

interface Plan {
  id: PlanId;
  title: string;
  price: number | null;
  tagline: string;
  features: string[];
}

const PLANS: Plan[] = [
  {
    id: 'starter',
    title: 'Starter',
    price: null,
    tagline: 'Pour débuter et tester la plateforme.',
    features: [
      "Jusqu'à 3 annonces actives",
      'Photos en qualité standard',
      'Support par email (48h)',
    ],
  },
  {
    id: 'pro',
    title: 'Pro',
    price: 15000,
    tagline: 'Pour les agents indépendants ambitieux.',
    features: [
      'Annonces illimitées',
      'Photos Haute Définition',
      'Mise en avant 1x/semaine',
      'Statistiques de base',
      'Support prioritaire WhatsApp',
    ],
  },
  {
    id: 'business',
    title: 'Business',
    price: 35000,
    tagline: 'La solution complète pour les agences.',
    features: [
      'Tout du plan Pro',
      'Mise en avant illimitée',
      'Tableau de bord avancé',
      'Marque blanche agence',
      'Agent de compte dédié',
    ],
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getActivePlan(subs: Subscription[]): PlanId | null {
  const active = subs.find((s) => s.status === 'active');
  if (!active) return null;
  const name = active.plan_name.toLowerCase();
  if (name.includes('business')) return 'business';
  if (name.includes('pro')) return 'pro';
  if (name.includes('starter')) return 'starter';
  return null;
}

function formatPrice(price: number) {
  return new Intl.NumberFormat('fr-FR').format(price);
}

// ─── PlanCard ─────────────────────────────────────────────────────────────────

function PlanCard({
  plan,
  isActive,
  isRecommended,
  onSubscribe,
}: {
  plan: Plan;
  isActive: boolean;
  isRecommended: boolean;
  onSubscribe: (plan: Plan) => void;
}) {
  const scheme = useColorScheme();
  const C = Colors[scheme ?? 'light'];

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: isActive ? C.primaryContainer + '22' : C.surface,
          borderColor: isActive ? C.primary : isRecommended ? C.primary + '66' : C.outlineVariant,
          borderWidth: isActive || isRecommended ? 2 : 1,
        },
      ]}
    >
      {isRecommended && (
        <View style={[styles.recommendedBadge, { backgroundColor: C.primary }]}>
          <Text style={[Typography.caption, { color: C.onPrimary, fontFamily: 'PlusJakartaSans_700Bold', letterSpacing: 0.8 }]}>
            RECOMMANDÉ
          </Text>
        </View>
      )}

      {/* Header */}
      <View style={styles.cardHeader}>
        <View style={{ flex: 1 }}>
          <Text style={[Typography.headlineMd, { color: C.onSurface, fontFamily: 'PlusJakartaSans_700Bold' }]}>
            {plan.title}
          </Text>
          <Text style={[Typography.caption, { color: C.onSurfaceVariant, marginTop: 2, lineHeight: 18 }]}>
            {plan.tagline}
          </Text>
        </View>
        <View style={styles.priceCol}>
          {plan.price === null ? (
            <Text style={[Typography.headlineMd, { color: C.primary, fontFamily: 'PlusJakartaSans_700Bold' }]}>
              Gratuit
            </Text>
          ) : (
            <>
              <Text style={[Typography.headlineMd, { color: C.primary, fontFamily: 'PlusJakartaSans_700Bold', fontSize: 20 }]}>
                {formatPrice(plan.price)}
              </Text>
              <Text style={[Typography.caption, { color: C.onSurfaceVariant }]}>XAF/mois</Text>
            </>
          )}
        </View>
      </View>

      {/* Features */}
      <View style={styles.featureList}>
        {plan.features.map((f) => (
          <View key={f} style={styles.featureRow}>
            <MaterialIcons name="check-circle" size={16} color={C.primary} />
            <Text style={[Typography.bodyMd, { color: C.onSurface, flex: 1, fontSize: 14 }]}>
              {f}
            </Text>
          </View>
        ))}
      </View>

      {/* CTA */}
      {isActive ? (
        <View style={[styles.ctaBtn, { backgroundColor: C.surfaceContainerLow, borderColor: C.outlineVariant, borderWidth: 1 }]}>
          <MaterialIcons name="check-circle" size={16} color={C.primary} />
          <Text style={[Typography.labelSm, { color: C.primary, textTransform: 'uppercase', letterSpacing: 0.8 }]}>
            Plan actuel
          </Text>
        </View>
      ) : plan.price === null ? (
        <View style={[styles.ctaBtn, { backgroundColor: C.surfaceContainerLow }]}>
          <Text style={[Typography.labelSm, { color: C.onSurfaceVariant, textTransform: 'uppercase', letterSpacing: 0.8 }]}>
            Plan de base
          </Text>
        </View>
      ) : (
        <Pressable
          onPress={() => onSubscribe(plan)}
          style={[styles.ctaBtn, { backgroundColor: isRecommended ? C.primary : C.surfaceContainer }]}
        >
          <MaterialIcons name="workspace-premium" size={16} color={isRecommended ? C.onPrimary : C.onSurface} />
          <Text style={[Typography.labelSm, {
            color: isRecommended ? C.onPrimary : C.onSurface,
            textTransform: 'uppercase',
            letterSpacing: 0.8,
          }]}>
            Passer au {plan.title}
          </Text>
        </Pressable>
      )}
    </View>
  );
}

// ─── Payment Modal ─────────────────────────────────────────────────────────────

function PaymentModal({
  plan,
  visible,
  onClose,
  onConfirm,
  loading,
}: {
  plan: Plan | null;
  visible: boolean;
  onClose: () => void;
  onConfirm: (phone: string) => void;
  loading: boolean;
}) {
  const scheme = useColorScheme();
  const C = Colors[scheme ?? 'light'];
  const [phone, setPhone] = useState('');

  function handleConfirm() {
    const cleaned = phone.replace(/\s/g, '');
    if (cleaned.length < 9) return;
    onConfirm(cleaned.startsWith('+') ? cleaned : `+237${cleaned}`);
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.modalOverlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={[styles.modalSheet, { backgroundColor: C.surface }]}>
          {/* Handle */}
          <View style={styles.handleWrapper}>
            <View style={[styles.handle, { backgroundColor: C.surfaceVariant }]} />
          </View>

          <View style={[styles.modalIconCircle, { backgroundColor: C.primaryFixed }]}>
            <MaterialIcons name="payment" size={28} color={C.primary} />
          </View>

          <Text style={[Typography.headlineMd, { color: C.onSurface, textAlign: 'center', marginBottom: Spacing.xs }]}>
            Payer avec Mobile Money
          </Text>
          <Text style={[Typography.bodyMd, { color: C.onSurfaceVariant, textAlign: 'center', marginBottom: Spacing.lg }]}>
            Plan {plan?.title} — {plan?.price ? `${formatPrice(plan.price)} XAF/mois` : 'Gratuit'}
          </Text>

          {/* Phone field */}
          <Text style={[Typography.labelSm, { color: C.onSurfaceVariant, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: Spacing.xs }]}>
            Numéro Mobile Money
          </Text>
          <View style={[styles.phoneInput, { borderColor: C.outlineVariant, backgroundColor: C.surfaceContainerLow }]}>
            <Text style={[Typography.bodyMd, { color: C.onSurfaceVariant }]}>+237</Text>
            <TextInput
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              placeholder="6XX XXX XXX"
              placeholderTextColor={C.onSurfaceVariant + '88'}
              style={[Typography.bodyMd, { color: C.onSurface, flex: 1 }]}
              maxLength={12}
              autoFocus
            />
          </View>

          {/* Operators note */}
          <View style={[styles.operatorsRow, { backgroundColor: C.surfaceContainerLow, borderColor: C.outlineVariant }]}>
            <MaterialIcons name="info-outline" size={14} color={C.onSurfaceVariant} />
            <Text style={[Typography.caption, { color: C.onSurfaceVariant, flex: 1 }]}>
              Compatible MTN Mobile Money et Orange Money via CamPay.
            </Text>
          </View>

          {/* Confirm */}
          <Pressable
            onPress={handleConfirm}
            disabled={loading || phone.replace(/\s/g, '').length < 9}
            style={[
              styles.ctaBtn,
              {
                backgroundColor: C.primary,
                opacity: loading || phone.replace(/\s/g, '').length < 9 ? 0.5 : 1,
                marginTop: Spacing.lg,
              },
            ]}
          >
            {loading ? (
              <ActivityIndicator size="small" color={C.onPrimary} />
            ) : (
              <>
                <MaterialIcons name="lock" size={16} color={C.onPrimary} />
                <Text style={[Typography.labelSm, { color: C.onPrimary, textTransform: 'uppercase', letterSpacing: 0.8 }]}>
                  Confirmer le paiement
                </Text>
              </>
            )}
          </Pressable>

          <Pressable onPress={onClose} style={{ marginTop: Spacing.md, alignItems: 'center', padding: Spacing.sm }}>
            <Text style={[Typography.labelSm, { color: C.onSurfaceVariant, textTransform: 'uppercase', letterSpacing: 0.8 }]}>
              Annuler
            </Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function SubscriptionsScreen() {
  const scheme = useColorScheme();
  const C = Colors[scheme ?? 'light'];
  const toast = useToast();

  const { data: subs = [] } = useSubscriptions();
  const createSub = useCreateSubscription();

  const activePlan = getActivePlan(subs);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  function handleSubscribe(plan: Plan) {
    setSelectedPlan(plan);
    setModalVisible(true);
  }

  function handleConfirmPayment(phone: string) {
    if (!selectedPlan) return;
    createSub.mutate(
      {
        plan_name: selectedPlan.title,
        method: 'campay',
        payment_info: { phone_number: phone },
      },
      {
        onSuccess: () => {
          setModalVisible(false);
          toast.show('Demande de paiement envoyée. Confirmez sur votre téléphone.', 'success');
        },
        onError: () => {
          toast.show('Échec de la demande de paiement. Réessayez.', 'error');
        },
      }
    );
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: C.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: C.outlineVariant, backgroundColor: C.surface }]}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <MaterialIcons name="arrow-back" size={24} color={C.onSurface} />
        </Pressable>
        <Text style={[Typography.headlineMd, { color: C.onSurface, fontSize: 20 }]}>
          Plans d'Abonnement
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Intro */}
        <View style={styles.intro}>
          <Text style={[Typography.headlineLg, { color: C.onSurface, textAlign: 'center', fontSize: 24, fontFamily: 'PlusJakartaSans_700Bold' }]}>
            Propulsez vos annonces
          </Text>
          <Text style={[Typography.bodyMd, { color: C.onSurfaceVariant, textAlign: 'center', marginTop: Spacing.sm, lineHeight: 22 }]}>
            Choisissez le plan qui correspond à votre ambition. Une tarification transparente pour les professionnels de l'immobilier au Cameroun.
          </Text>
        </View>

        {/* Plans */}
        {PLANS.map((plan) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            isActive={activePlan === plan.id}
            isRecommended={plan.id === 'pro'}
            onSubscribe={handleSubscribe}
          />
        ))}

        {/* CamPay note */}
        <View style={[styles.campayNote, { backgroundColor: C.surfaceContainer, borderColor: C.outlineVariant }]}>
          <MaterialIcons name="verified-user" size={18} color={C.onSurfaceVariant} />
          <Text style={[Typography.caption, { color: C.onSurfaceVariant, flex: 1, lineHeight: 18 }]}>
            Paiement sécurisé via CamPay · MTN Mobile Money · Orange Money
          </Text>
        </View>

        <View style={{ height: Spacing.xxl }} />
      </ScrollView>

      <PaymentModal
        plan={selectedPlan}
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onConfirm={handleConfirmPayment}
        loading={createSub.isPending}
      />
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
  card: {
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    gap: Spacing.md,
    overflow: 'hidden',
  },
  recommendedBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
    borderBottomLeftRadius: Radius.md,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
  },
  priceCol: {
    alignItems: 'flex-end',
  },
  featureList: {
    gap: Spacing.sm,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  ctaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    height: 48,
    borderRadius: Radius.md,
  },
  campayNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  // Modal
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalSheet: {
    borderTopLeftRadius: Radius.lg,
    borderTopRightRadius: Radius.lg,
    padding: Spacing.marginMobile,
    paddingBottom: Spacing.xxl,
  },
  handleWrapper: {
    alignItems: 'center',
    paddingTop: Spacing.xs,
    paddingBottom: Spacing.md,
  },
  handle: {
    width: 48,
    height: 6,
    borderRadius: Radius.full,
  },
  modalIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: Spacing.md,
  },
  phoneInput: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    borderWidth: 1,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    height: 52,
    marginBottom: Spacing.sm,
  },
  operatorsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    padding: Spacing.sm,
    borderRadius: Radius.sm,
    borderWidth: 1,
  },
});
