import { MaterialIcons } from '@expo/vector-icons';
import { useEffect, useMemo, useState } from 'react';
import { View } from 'react-native';

import {
  AppText,
  Button,
  Card,
  EmptyState,
  ErrorState,
  Field,
  ListRow,
  LoadingState,
  OfflineState,
  PlanCard,
  Screen,
  ScreenHeader,
  Section,
  Sheet,
  formatAmount,
  useToast,
  type IconName,
} from '@/components/ui';
import { Sizes, Spacing } from '@/constants/theme';
import { useCreateSubscription, usePlans, useSubscriptions } from '@/hooks/queries/use-subscriptions';
import { useThemeColors } from '@/hooks/use-theme-color';
import { isNetworkError } from '@/lib/network-error';
import { isPackUsable } from '@/lib/subscription-helpers';
import type { Subscription, SubscriptionPlan, SubscriptionPlanName } from '@/types/notification';

// ─── Display metadata for each internal Domicoin plan name ────────────────────
// The API's plan_name is the internal (English, sometimes misspelled) DB
// identifier — "Standart" not "Standard". We only use it as an opaque key for
// display copy and for round-tripping back to the API unchanged; the French
// labels below are presentation-only, matching the domilix.com web app.

const PLAN_ORDER: SubscriptionPlanName[] = ['Standart', 'Advantage', 'Premium', 'Ultimate'];

const PLAN_DISPLAY: Record<SubscriptionPlanName, { title: string; tagline: string; recommended?: boolean }> = {
  Standart: {
    title: 'Pack Standard',
    tagline: 'Idéal pour tester Domilix et contacter quelques annonceurs ciblés.',
  },
  Advantage: {
    title: 'Pack Avantage',
    tagline: 'Pour comparer plusieurs logements sans bloquer votre recherche.',
  },
  Premium: {
    title: 'Pack Premium',
    tagline: 'Le meilleur choix pour chercher activement et ne pas rater les bonnes annonces.',
    recommended: true,
  },
  Ultimate: {
    title: 'Pack Ultime',
    tagline: 'Pour une recherche intensive avec un maximum d’opportunités de contact.',
  },
};

const PLAN_FEATURES = [
  "Voir les informations de base d'une annonce.",
  'Partagez les annonces avec vos contacts.',
];

function formatValidity(days: number): string {
  if (days >= 7 && days % 7 === 0) {
    const weeks = days / 7;
    return `${weeks} semaine${weeks > 1 ? 's' : ''} de validité`;
  }
  return `${days} jour${days > 1 ? 's' : ''} de validité`;
}

// ─── Payment methods ──────────────────────────────────────────────────────────

type MethodId = 'mtn' | 'orange';

interface PaymentMethod {
  id: MethodId;
  label: string;
  icon: IconName;
}

const PAYMENT_METHODS: PaymentMethod[] = [
  { id: 'mtn', label: 'MTN Mobile Money', icon: 'phone-android' },
  { id: 'orange', label: 'Orange Money', icon: 'phone-android' },
];

// ─── Active packs ──────────────────────────────────────────────────────────────
// A Domicoin pack isn't a recurring "current plan" — a user can hold several
// active packs at once, each with its own remaining credits and expiry.

function formatExpiry(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

function ActivePackCard({ sub }: { sub: Subscription }) {
  const expiry = sub.expires_at ?? sub.end_date;
  return (
    <Card outlined accessible style={{ gap: Spacing.xs }}>
      <AppText variant="label" color="success">
        Pack actif
      </AppText>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', columnGap: Spacing.ms }}>
        <AppText variant="headline">
          {PLAN_DISPLAY[sub.plan_name as SubscriptionPlanName]?.title ?? sub.plan_name}
        </AppText>
        <AppText variant="bodyStrong">{sub.credits} Domicoins restants</AppText>
      </View>
      {expiry ? <AppText color="onSurfaceVariant">Valable jusqu&apos;au {formatExpiry(expiry)}</AppText> : null}
    </Card>
  );
}

// ─── Payment sheet ─────────────────────────────────────────────────────────────

function PaymentSheet({
  plan,
  visible,
  onClose,
  onConfirm,
  loading,
}: {
  plan: SubscriptionPlan | null;
  visible: boolean;
  onClose: () => void;
  onConfirm: (phone: string, method: MethodId) => void;
  loading: boolean;
}) {
  const C = useThemeColors();
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

  function handleMethodSelect(m: PaymentMethod) {
    setMethod(m);
    setStep('phone');
  }

  const cleaned = phone.replace(/\s/g, '');
  const phoneReady = cleaned.length >= 9;

  function handleConfirm() {
    if (!phoneReady || !method) return;
    onConfirm(cleaned.startsWith('+') ? cleaned : `+237${cleaned}`, method.id);
  }

  const planTitle = plan ? (PLAN_DISPLAY[plan.name]?.title ?? plan.name) : '';
  const summary = plan ? `${planTitle} · ${formatAmount(plan.price)} FCFA` : '';

  return (
    <Sheet
      visible={visible}
      onClose={onClose}
      title={step === 'method' ? 'Méthode de paiement' : 'Numéro Mobile Money'}
      footer={
        step === 'phone' ? (
          <>
            <Button
              label="Confirmer le paiement"
              icon="lock"
              size="lg"
              fullWidth
              loading={loading}
              disabled={!phoneReady}
              onPress={handleConfirm}
            />
            <Button label="Annuler" variant="text" fullWidth onPress={onClose} disabled={loading} />
          </>
        ) : (
          <Button label="Annuler" variant="text" fullWidth onPress={onClose} />
        )
      }
    >
      <AppText color="onSurfaceVariant">{summary}</AppText>

      {step === 'method' ? (
        <Section title="Choisissez votre méthode de paiement">
          {PAYMENT_METHODS.map((m) => (
            <ListRow key={m.id} icon={m.icon} title={m.label} onPress={() => handleMethodSelect(m)} />
          ))}
        </Section>
      ) : (
        <>
          {method ? (
            <Section>
              <ListRow
                icon={method.icon}
                title={method.label}
                value="Changer"
                accessibilityLabel={`Changer de méthode de paiement, actuellement ${method.label}`}
                onPress={() => setStep('method')}
              />
            </Section>
          ) : null}
          <Field
            label="Numéro associé"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            placeholder="6XX XXX XXX"
            maxLength={12}
            autoFocus
            prefix="+237"
            helper="Un code de confirmation vous sera envoyé par votre opérateur."
          />
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm }}>
            <MaterialIcons name="verified-user" size={Sizes.iconSm} color={C.onSurfaceVariant} />
            <AppText variant="caption" color="onSurfaceVariant" style={{ flex: 1 }}>
              Vous confirmerez le paiement sur votre téléphone.
            </AppText>
          </View>
        </>
      )}
    </Sheet>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function SubscriptionsScreen() {
  const C = useThemeColors();
  const toast = useToast();

  const { data: subs = [] } = useSubscriptions();
  const { data: plans = [], isLoading: plansLoading, isError: plansError, error: plansErrorValue, refetch: refetchPlans } = usePlans();
  const createSub = useCreateSubscription();

  const activePacks = useMemo(() => subs.filter(isPackUsable), [subs]);

  const orderedPlans = useMemo(() => {
    const byName = new Map(plans.map((p) => [p.name, p] as const));
    return PLAN_ORDER.map((name) => byName.get(name)).filter((p): p is SubscriptionPlan => !!p);
  }, [plans]);

  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [sheetVisible, setSheetVisible] = useState(false);

  function handleChoose(plan: SubscriptionPlan) {
    setSelectedPlan(plan);
    setSheetVisible(true);
  }

  function handleConfirmPayment(phone: string, method: MethodId) {
    if (!selectedPlan) return;
    createSub.mutate(
      {
        // Echo back the exact name the API gave us for this plan — never
        // invent our own string here (French/English casing mismatches
        // silently fail server-side plan lookup).
        plan_name: selectedPlan.name,
        method,
        payment_info: { phone_number: phone },
      },
      {
        onSuccess: () => {
          setSheetVisible(false);
          toast.show('Demande envoyée. Confirmez sur votre téléphone.', 'success');
        },
        onError: () => {
          toast.show('Échec du paiement. Réessayez.', 'error');
        },
      }
    );
  }

  let plansBlock;
  if (plansLoading) {
    plansBlock = <LoadingState label="Chargement des packs…" media={false} count={2} />;
  } else if (plansError && isNetworkError(plansErrorValue)) {
    plansBlock = <OfflineState onRetry={() => refetchPlans()} />;
  } else if (plansError) {
    plansBlock = <ErrorState title="Impossible de charger les packs" onRetry={() => refetchPlans()} />;
  } else if (orderedPlans.length === 0) {
    plansBlock = (
      <EmptyState
        icon="toll"
        title="Aucun pack disponible"
        description="Les packs ne sont pas disponibles pour le moment. Réessayez plus tard."
      />
    );
  } else {
    plansBlock = orderedPlans.map((plan) => {
      const display = PLAN_DISPLAY[plan.name];
      return (
        <PlanCard
          key={plan.id}
          title={display.title}
          tagline={display.tagline}
          price={plan.price}
          credits={plan.credits}
          validityLabel={formatValidity(plan.duration)}
          features={PLAN_FEATURES}
          recommended={display.recommended}
          onPress={() => handleChoose(plan)}
        />
      );
    });
  }

  return (
    <Screen header={<ScreenHeader title="Packs Domicoin" />} contentStyle={{ gap: Spacing.lg }}>
      <View style={{ gap: Spacing.xs }}>
        <AppText variant="title">Choisissez votre pack</AppText>
        <AppText color="onSurfaceVariant">
          Débloquez les coordonnées des biens qui vous intéressent et augmentez vos chances de trouver rapidement.
        </AppText>
      </View>

      {activePacks.map((sub) => (
        <ActivePackCard key={sub.id} sub={sub} />
      ))}

      {plansBlock}

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm }}>
        <MaterialIcons name="verified-user" size={Sizes.icon} color={C.onSurfaceVariant} />
        <AppText variant="caption" color="onSurfaceVariant" style={{ flex: 1 }}>
          Paiement sécurisé · MTN Mobile Money · Orange Money
        </AppText>
      </View>

      <PaymentSheet
        plan={selectedPlan}
        visible={sheetVisible}
        onClose={() => setSheetVisible(false)}
        onConfirm={handleConfirmPayment}
        loading={createSub.isPending}
      />
    </Screen>
  );
}
