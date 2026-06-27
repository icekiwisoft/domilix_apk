import { useEffect, useState } from 'react';
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
import { Colors, Radius, Shadows, Spacing, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useSubscriptions, useCreateSubscription } from '@/hooks/queries/use-subscriptions';
import { useToast } from '@/components/ui/toast';
import { PlanCard } from '@/components/ui/plan-card';
import type { Subscription } from '@/types/notification';

// ─── Plans ────────────────────────────────────────────────────────────────────

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

// ─── Payment methods ──────────────────────────────────────────────────────────

type MethodId = 'mtn_money' | 'orange_money' | 'campay';

interface PaymentMethod {
  id: MethodId;
  label: string;
  icon: React.ComponentProps<typeof MaterialIcons>['name'];
  accent: string;
}

const PAYMENT_METHODS: PaymentMethod[] = [
  { id: 'mtn_money',    label: 'MTN Mobile Money', icon: 'phone-android',   accent: '#FFCB05' },
  { id: 'orange_money', label: 'Orange Money',      icon: 'phone-android',   accent: '#FF6600' },
  { id: 'campay',       label: 'CamPay',            icon: 'account-balance', accent: '#1A73E8' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getActivePlanId(subs: Subscription[]): PlanId | null {
  const active = subs.find((s) => s.status === 'active');
  if (!active) return null;
  const name = active.plan_name.toLowerCase();
  if (name.includes('business')) return 'business';
  if (name.includes('pro')) return 'pro';
  if (name.includes('starter')) return 'starter';
  return null;
}

function formatExpiry(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

// ─── Active subscription banner ───────────────────────────────────────────────

function ActiveSubBanner({ sub }: { sub: Subscription }) {
  const scheme = useColorScheme();
  const C = Colors[scheme ?? 'light'];

  return (
    <View style={[banner.wrap, { backgroundColor: C.primaryContainer + '22', borderColor: C.primary + '55' }]}>
      <View style={banner.row}>
        <View style={[banner.iconCircle, { backgroundColor: C.primary + '22' }]}>
          <MaterialIcons name="workspace-premium" size={20} color={C.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[Typography.labelSm, { color: C.primary, textTransform: 'uppercase', letterSpacing: 0.8 }]}>
            Plan actif
          </Text>
          <Text style={[Typography.bodyMd, { color: C.onSurface, fontFamily: 'PlusJakartaSans_600SemiBold', marginTop: 1 }]}>
            {sub.plan_name}
          </Text>
        </View>
        {sub.expires_at ? (
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={[Typography.caption, { color: C.onSurfaceVariant }]}>Expire le</Text>
            <Text style={[Typography.caption, { color: C.onSurface, fontFamily: 'PlusJakartaSans_600SemiBold', marginTop: 1 }]}>
              {formatExpiry(sub.expires_at)}
            </Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}

const banner = StyleSheet.create({
  wrap: {
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    padding: Spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

// ─── Payment modal ─────────────────────────────────────────────────────────────

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
  onConfirm: (phone: string, method: MethodId) => void;
  loading: boolean;
}) {
  const scheme = useColorScheme();
  const C = Colors[scheme ?? 'light'];

  const [step, setStep] = useState<'method' | 'phone'>('method');
  const [method, setMethod] = useState<PaymentMethod | null>(null);
  const [phone, setPhone] = useState('');

  useEffect(() => {
    if (visible) {
      setStep('method');
      setMethod(null);
      setPhone('');
    }
  }, [visible]);

  function handleClose() {
    onClose();
  }

  function handleMethodSelect(m: PaymentMethod) {
    setMethod(m);
    setStep('phone');
  }

  function handleConfirm() {
    const cleaned = phone.replace(/\s/g, '');
    if (cleaned.length < 9 || !method) return;
    onConfirm(cleaned.startsWith('+') ? cleaned : `+237${cleaned}`, method.id);
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      <KeyboardAvoidingView
        style={styles.modalOverlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={handleClose} />
        <View style={[styles.modalSheet, { backgroundColor: C.surface }]}>
          {/* Handle */}
          <View style={styles.handleWrapper}>
            <View style={[styles.handle, { backgroundColor: C.outlineVariant }]} />
          </View>

          {/* Icon */}
          <View style={[styles.modalIconCircle, { backgroundColor: C.primaryFixed }]}>
            <MaterialIcons name="payment" size={28} color={C.primary} />
          </View>

          <Text style={[Typography.headlineMd, { color: C.onSurface, textAlign: 'center', fontSize: 20, marginBottom: Spacing.xs }]}>
            {step === 'method' ? 'Méthode de paiement' : 'Numéro Mobile Money'}
          </Text>
          <Text style={[Typography.bodyMd, { color: C.onSurfaceVariant, textAlign: 'center', marginBottom: Spacing.lg, fontSize: 14 }]}>
            Plan {plan?.title} — {plan?.price ? `${plan.price.toLocaleString('fr-FR')} FCFA/mois` : 'Gratuit'}
          </Text>

          {step === 'method' ? (
            /* ── Step 1 : method selection ─── */
            <View style={{ gap: Spacing.sm }}>
              {PAYMENT_METHODS.map((m) => (
                <Pressable
                  key={m.id}
                  onPress={() => handleMethodSelect(m)}
                  style={({ pressed }) => [
                    styles.methodBtn,
                    {
                      backgroundColor: pressed ? C.surfaceContainerLow : C.surfaceContainer,
                      borderColor: C.outlineVariant,
                    },
                  ]}
                >
                  <View style={[styles.methodIconWrap, { backgroundColor: m.accent + '22' }]}>
                    <MaterialIcons name={m.icon} size={20} color={m.accent} />
                  </View>
                  <Text style={[Typography.bodyMd, { color: C.onSurface, flex: 1, fontFamily: 'PlusJakartaSans_600SemiBold' }]}>
                    {m.label}
                  </Text>
                  <MaterialIcons name="chevron-right" size={20} color={C.onSurfaceVariant} />
                </Pressable>
              ))}

              <Pressable onPress={handleClose} style={{ marginTop: Spacing.sm, alignItems: 'center', padding: Spacing.sm }}>
                <Text style={[Typography.labelSm, { color: C.onSurfaceVariant, textTransform: 'uppercase', letterSpacing: 0.8 }]}>
                  Annuler
                </Text>
              </Pressable>
            </View>
          ) : (
            /* ── Step 2 : phone input ─── */
            <View>
              {/* Selected method badge */}
              {method && (
                <Pressable
                  onPress={() => setStep('method')}
                  style={[styles.selectedMethodRow, { backgroundColor: C.surfaceContainerLow, borderColor: C.outlineVariant }]}
                >
                  <View style={[styles.methodIconWrap, { backgroundColor: method.accent + '22' }]}>
                    <MaterialIcons name={method.icon} size={18} color={method.accent} />
                  </View>
                  <Text style={[Typography.bodyMd, { color: C.onSurface, flex: 1, fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 14 }]}>
                    {method.label}
                  </Text>
                  <Text style={[Typography.caption, { color: C.primary }]}>Changer</Text>
                </Pressable>
              )}

              {/* Phone field */}
              <Text style={[Typography.labelSm, { color: C.onSurfaceVariant, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: Spacing.xs, marginTop: Spacing.md }]}>
                Numéro associé
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

              <View style={[styles.operatorsNote, { backgroundColor: C.surfaceContainerLow, borderColor: C.outlineVariant }]}>
                <MaterialIcons name="info-outline" size={14} color={C.onSurfaceVariant} />
                <Text style={[Typography.caption, { color: C.onSurfaceVariant, flex: 1 }]}>
                  Un code de confirmation vous sera envoyé par votre opérateur.
                </Text>
              </View>

              {/* Confirm */}
              <Pressable
                onPress={handleConfirm}
                disabled={loading || phone.replace(/\s/g, '').length < 9}
                style={[
                  styles.confirmBtn,
                  {
                    backgroundColor: C.primary,
                    opacity: loading || phone.replace(/\s/g, '').length < 9 ? 0.5 : 1,
                    marginTop: Spacing.lg,
                    ...Shadows.button,
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

              <Pressable onPress={handleClose} style={{ marginTop: Spacing.md, alignItems: 'center', padding: Spacing.sm }}>
                <Text style={[Typography.labelSm, { color: C.onSurfaceVariant, textTransform: 'uppercase', letterSpacing: 0.8 }]}>
                  Annuler
                </Text>
              </Pressable>
            </View>
          )}
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

  const activePlanId = getActivePlanId(subs);
  const activeSub = subs.find((s) => s.status === 'active') ?? null;

  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  function handleSubscribe(plan: Plan) {
    setSelectedPlan(plan);
    setModalVisible(true);
  }

  function handleConfirmPayment(phone: string, method: MethodId) {
    if (!selectedPlan) return;
    createSub.mutate(
      {
        plan_name: selectedPlan.title,
        method,
        payment_info: { phone_number: phone },
      },
      {
        onSuccess: () => {
          setModalVisible(false);
          toast.show('Demande envoyée. Confirmez sur votre téléphone.', 'success');
        },
        onError: () => {
          toast.show('Échec du paiement. Réessayez.', 'error');
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
        <View>
          <Text style={[Typography.headlineLg, { color: C.onSurface, textAlign: 'center', fontSize: 24, fontFamily: 'PlusJakartaSans_700Bold' }]}>
            Propulsez vos annonces
          </Text>
          <Text style={[Typography.bodyMd, { color: C.onSurfaceVariant, textAlign: 'center', marginTop: Spacing.sm, lineHeight: 22 }]}>
            Choisissez le plan qui correspond à votre ambition. Une tarification transparente pour les professionnels de l'immobilier au Cameroun.
          </Text>
        </View>

        {/* Active subscription banner */}
        {activeSub && <ActiveSubBanner sub={activeSub} />}

        {/* Plans */}
        {PLANS.map((plan) => (
          <PlanCard
            key={plan.id}
            title={plan.title}
            tagline={plan.tagline}
            price={plan.price}
            features={plan.features}
            recommended={plan.id === 'pro'}
            current={activePlanId === plan.id}
            ctaLabel={`Passer au ${plan.title}`}
            onPress={() => handleSubscribe(plan)}
          />
        ))}

        {/* Security note */}
        <View style={[styles.securityNote, { backgroundColor: C.surfaceContainer, borderColor: C.outlineVariant }]}>
          <MaterialIcons name="verified-user" size={18} color={C.onSurfaceVariant} />
          <Text style={[Typography.caption, { color: C.onSurfaceVariant, flex: 1, lineHeight: 18 }]}>
            Paiement sécurisé · MTN Mobile Money · Orange Money · CamPay
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

// ─── Styles ───────────────────────────────────────────────────────────────────

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
  securityNote: {
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
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
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
    height: 5,
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
  methodBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  methodIconWrap: {
    width: 38,
    height: 38,
    borderRadius: Radius.sm + 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedMethodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  phoneInput: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    borderWidth: 1,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    height: 52,
  },
  operatorsNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    padding: Spacing.sm,
    borderRadius: Radius.sm,
    borderWidth: 1,
    marginTop: Spacing.sm,
  },
  confirmBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    height: 52,
    borderRadius: Radius.md,
  },
});
