import { Redirect } from 'expo-router';
import { useState, type ReactNode } from 'react';
import { View } from 'react-native';

import {
  AppText,
  Avatar,
  Badge,
  Button,
  Card,
  Chip,
  ChipGroup,
  Dialog,
  Divider,
  EmptyState,
  ErrorState,
  Field,
  IconButton,
  ListRow,
  LoadingState,
  OfflineState,
  PriceTag,
  ProgressBar,
  RadioRow,
  Screen,
  ScreenHeader,
  SegmentedControl,
  Section,
  Sheet,
  Skeleton,
  StepHeader,
  Stepper,
  Switch,
  useToast,
  type ButtonVariant,
} from '@/components/ui';
import { Radii, Sizes, Spacing, type TextVariant } from '@/constants/theme';
import { useThemeColors } from '@/hooks/use-theme-color';
import { useThemeStore, type ThemePreference } from '@/stores/theme.store';

// Hidden QA screen (UI-06): every shared component in its main states, with
// local mock values only. Reachable only in builds with
// EXPO_PUBLIC_SHOW_CATALOGUE=1; otherwise it redirects to the home screen.
const ENABLED = process.env.EXPO_PUBLIC_SHOW_CATALOGUE === '1';

const TEXT_VARIANTS: TextVariant[] = ['title', 'headline', 'body', 'bodyStrong', 'label', 'caption', 'price', 'priceSm', 'priceLg'];
const BUTTON_VARIANTS: ButtonVariant[] = ['primary', 'secondary', 'text', 'danger', 'google'];
const LONG_LABEL = 'Un libellé de bouton vraiment très long pour vérifier le retour à la ligne';
const THEMES = [
  { value: 'light', label: 'Clair', icon: 'light-mode' },
  { value: 'dark', label: 'Sombre', icon: 'dark-mode' },
  { value: 'system', label: 'Système', icon: 'settings-suggest' },
] as const;
const CITIES = [
  { value: 'douala', label: 'Douala' },
  { value: 'yaounde', label: 'Yaoundé' },
  { value: 'bafoussam', label: 'Bafoussam' },
  { value: 'kribi', label: 'Kribi' },
  { value: 'limbe', label: 'Limbé' },
  { value: 'garoua', label: 'Garoua' },
];
const PERIODS = [
  { value: 'day', label: 'Jour' },
  { value: 'week', label: 'Semaine' },
  { value: 'month', label: 'Mois' },
  { value: 'year', label: 'An' },
];

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={{ gap: Spacing.md }}>
      <AppText variant="headline">{title}</AppText>
      {children}
      <Divider />
    </View>
  );
}

function Caption({ children }: { children: string }) {
  return (
    <AppText variant="caption" color="onSurfaceVariant">
      {children}
    </AppText>
  );
}

function Catalogue() {
  const C = useThemeColors();
  const toast = useToast();
  const preference = useThemeStore((s) => s.preference);
  const setPreference = useThemeStore((s) => s.setPreference);

  const [chip, setChip] = useState(true);
  const [chipRemovable, setChipRemovable] = useState(true);
  const [single, setSingle] = useState<string | null>('douala');
  const [multi, setMulti] = useState<string[]>(['douala', 'kribi']);
  const [seg2, setSeg2] = useState<'a' | 'b'>('a');
  const [seg4, setSeg4] = useState('month');
  const [text, setText] = useState('Appartement 2 pièces');
  const [secret, setSecret] = useState('motdepasse');
  const [phone, setPhone] = useState('677 00 00 00');
  const [price, setPrice] = useState('150 000');
  const [notes, setNotes] = useState('');
  const [sw, setSw] = useState(true);
  const [radio, setRadio] = useState('a');
  const [card, setCard] = useState('monthly');
  const [rooms, setRooms] = useState(2);
  const [sheet, setSheet] = useState(false);
  const [dialog, setDialog] = useState(false);
  const [dialogDanger, setDialogDanger] = useState(false);
  const [fav, setFav] = useState(false);
  const [step, setStep] = useState(2);

  return (
    <Screen header={<ScreenHeader title="Catalogue des composants" />}>
      <View style={{ gap: Spacing.lg }}>
        <Group title="Thème">
          <SegmentedControl
            label="Thème de l'application"
            options={THEMES.map((t) => ({ value: t.value, label: t.label, icon: t.icon }))}
            value={preference}
            onChange={(v) => setPreference(v as ThemePreference)}
          />
        </Group>

        <Group title="AppText">
          {TEXT_VARIANTS.map((v) => (
            <AppText key={v} variant={v}>
              {v} : Appartement meublé à Douala
            </AppText>
          ))}
          <AppText color="onSurfaceVariant">onSurfaceVariant</AppText>
          <AppText color="error">error</AppText>
          <AppText color="link">link</AppText>
        </Group>

        <Group title="Button">
          {BUTTON_VARIANTS.map((v) => (
            <View key={v} style={{ gap: Spacing.sm }}>
              <Caption>{v}</Caption>
              <Button label="Continuer" variant={v} onPress={() => {}} />
              <Button label="Désactivé" variant={v} disabled />
              <Button label="Chargement" variant={v} loading />
            </View>
          ))}
          <Caption>Libellé long, avec icône, taille lg, pleine largeur</Caption>
          <Button label={LONG_LABEL} onPress={() => {}} />
          <Button label="Publier" icon="add" size="lg" onPress={() => {}} />
          <Button label="Pleine largeur" fullWidth variant="secondary" onPress={() => {}} />
        </Group>

        <Group title="IconButton">
          <View style={{ flexDirection: 'row', gap: Spacing.md, alignItems: 'center' }}>
            <IconButton icon="share" label="Partager" onPress={() => {}} />
            <IconButton
              icon="favorite-border"
              selectedIcon="favorite"
              selected={fav}
              label="Favori"
              onPress={() => setFav((v) => !v)}
            />
            <IconButton icon="favorite" selected label="Favori sélectionné" onPress={() => {}} />
            <IconButton icon="close" label="Désactivé" disabled />
          </View>
          <Caption>Superposé à une photo</Caption>
          <View
            style={{
              height: Sizes.skeletonMedia,
              borderRadius: Radii.card,
              backgroundColor: C.surfaceContainerHighest,
              padding: Spacing.sm,
              flexDirection: 'row',
              justifyContent: 'space-between',
            }}
          >
            <IconButton icon="arrow-back" label="Retour" overlay onPress={() => {}} />
            <IconButton icon="favorite-border" label="Favori" overlay onPress={() => {}} />
          </View>
        </Group>

        <Group title="Card">
          <Card>
            <AppText variant="bodyStrong">Carte statique</AppText>
            <AppText color="onSurfaceVariant">Contenu de la carte.</AppText>
          </Card>
          <Card onPress={() => toast.show('Carte touchée', 'info')} accessibilityLabel="Carte touchable">
            <AppText variant="bodyStrong">Carte touchable</AppText>
            <AppText color="onSurfaceVariant">Touchez pour afficher un toast.</AppText>
          </Card>
          <Card outlined surface="surface">
            <AppText variant="bodyStrong">Carte avec contour</AppText>
          </Card>
        </Group>

        <Group title="Chip et ChipGroup">
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm }}>
            <Chip label="Sélectionnable" selected={false} onPress={() => {}} />
            <Chip label="Sélectionné" selected={chip} onPress={() => setChip((v) => !v)} />
            {chipRemovable ? (
              <Chip label="Amovible" selected onRemove={() => setChipRemovable(false)} />
            ) : (
              <Chip label="Rétablir" icon="refresh" onPress={() => setChipRemovable(true)} />
            )}
          </View>
          <ChipGroup label="Ville (un choix, retour à la ligne)" options={CITIES} value={single} onChange={setSingle} />
          <ChipGroup
            label="Villes (plusieurs, défilement)"
            layout="scroll"
            multiple
            options={CITIES}
            value={multi}
            onChange={setMulti}
          />
        </Group>

        <Group title="SegmentedControl">
          <SegmentedControl
            label="Deux options"
            options={[
              { value: 'a', label: 'Louer' },
              { value: 'b', label: 'Acheter' },
            ]}
            value={seg2}
            onChange={setSeg2}
          />
          <SegmentedControl label="Quatre options" options={PERIODS} value={seg4} onChange={setSeg4} />
        </Group>

        <Group title="Field">
          <Field label="Vide avec indication" placeholder="Titre de l'annonce" value="" onChangeText={() => {}} />
          <Field label="Rempli" value={text} onChangeText={setText} helper="Texte d'aide sous le champ" />
          <Field label="Avec erreur" value="abc" onChangeText={() => {}} error="Ce champ est invalide" />
          <Field label="Mot de passe" secure value={secret} onChangeText={setSecret} />
          <Field label="Téléphone" prefix={<AppText>+237</AppText>} value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
          <Field label="Loyer" suffix={<AppText>FCFA</AppText>} value={price} onChangeText={setPrice} keyboardType="number-pad" />
          <Field label="Description" multiline placeholder="Décrivez le logement" value={notes} onChangeText={setNotes} />
          <Caption>Touchez un champ pour voir l&apos;état actif.</Caption>
        </Group>

        <Group title="PriceTag">
          <PriceTag amount={150000} size="sm" period="month" />
          <PriceTag amount={150000} size="md" period="month" />
          <PriceTag amount={150000} size="lg" period="month" />
          <PriceTag amount={25000} size="md" />
          <PriceTag amount={90000000} size="lg" />
          <PriceTag amount={90000000} size="md" period="year" />
        </Group>

        <Group title="Badge et Avatar">
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm }}>
            <Badge label="primary" variant="primary" />
            <Badge label="secondary" variant="secondary" />
            <Badge label="tertiary" variant="tertiary" />
            <Badge label="error" variant="error" />
            <Badge label="success" variant="success" />
            <Badge label="neutral" variant="neutral" />
          </View>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm }}>
            <Badge status label="Disponible" variant="success" icon="check-circle" />
            <Badge status label="Expiré" variant="error" icon="error" />
            <Badge status label="En attente" variant="neutral" />
          </View>
          <View style={{ flexDirection: 'row', gap: Spacing.md, alignItems: 'center' }}>
            <Avatar name="Jean Dupont" size="sm" />
            <Avatar name="Jean Dupont" size="md" />
            <Avatar name="Jean Dupont" size="lg" />
            <Avatar size="md" />
          </View>
        </Group>

        <Group title="Divider">
          <Divider />
          <View style={{ flexDirection: 'row', height: Sizes.touchTarget, gap: Spacing.md, alignItems: 'center' }}>
            <AppText>Gauche</AppText>
            <Divider orientation="vertical" />
            <AppText>Droite</AppText>
          </View>
        </Group>

        <Group title="ListRow, Section, Switch">
          <Section title="Compte" footer="Pied de section explicatif.">
            <ListRow title="Modifier le profil" icon="person" chevron onPress={() => {}} />
            <ListRow title="Langue" subtitle="Français" icon="language" value="FR" chevron onPress={() => {}} />
            <ListRow
              title="Notifications"
              icon="notifications"
              switchValue={sw}
              onSwitchChange={setSw}
            />
            <ListRow title="Supprimer le compte" icon="delete" destructive onPress={() => {}} />
          </Section>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.md }}>
            <Switch value={sw} onValueChange={setSw} accessibilityLabel="Interrupteur seul" />
            <Switch value={false} onValueChange={() => {}} disabled accessibilityLabel="Interrupteur désactivé" />
          </View>
        </Group>

        <Group title="RadioRow">
          <Section accessibilityRole="radiogroup">
            <RadioRow title="Option A" subtitle="Ligne" selected={radio === 'a'} onPress={() => setRadio('a')} />
            <RadioRow title="Option B" selected={radio === 'b'} onPress={() => setRadio('b')} />
          </Section>
          <RadioRow
            variant="card"
            title="Mensuel"
            subtitle="Carte sélectionnable"
            selected={card === 'monthly'}
            onPress={() => setCard('monthly')}
          />
          <RadioRow
            variant="card"
            title="Annuel"
            selected={card === 'yearly'}
            onPress={() => setCard('yearly')}
            trailing={<Badge label="-20 %" variant="success" />}
          />
        </Group>

        <Group title="Stepper">
          <Stepper label="Chambres" value={rooms} onChange={setRooms} min={0} max={6} helper="Entre 0 et 6" />
        </Group>

        <Group title="StepHeader et ProgressBar">
          <StepHeader
            title="Informations"
            step={step}
            total={5}
            onBack={() => setStep((s) => Math.max(1, s - 1))}
            action={<Button label="Suivant" variant="text" onPress={() => setStep((s) => Math.min(5, s + 1))} />}
          />
          <ProgressBar value={step / 5} label={`Étape ${step} sur 5`} />
        </Group>

        <Group title="Sheet et Dialog">
          <Button label="Ouvrir la feuille" variant="secondary" onPress={() => setSheet(true)} />
          <Button label="Ouvrir la boîte de dialogue" variant="secondary" onPress={() => setDialog(true)} />
          <Button label="Boîte de dialogue destructive" variant="secondary" onPress={() => setDialogDanger(true)} />
        </Group>

        <Group title="États">
          <Caption>LoadingState (squelettes)</Caption>
          <LoadingState count={2} />
          <Caption>Skeleton seul</Caption>
          <Skeleton />
          <Caption>EmptyState</Caption>
          <EmptyState title="Aucune annonce" description="Modifiez vos filtres." actionLabel="Réinitialiser" onAction={() => {}} />
          <Caption>ErrorState</Caption>
          <ErrorState onRetry={() => {}} />
          <Caption>OfflineState, écran</Caption>
          <OfflineState onRetry={() => {}} />
          <Caption>OfflineState, bandeau</Caption>
          <OfflineState variant="banner" />
        </Group>

        <Group title="Toast">
          <Button label="Info" variant="secondary" onPress={() => toast.show('Information', 'info')} />
          <Button label="Succès" variant="secondary" onPress={() => toast.show('Enregistré avec succès', 'success')} />
          <Button label="Erreur" variant="secondary" onPress={() => toast.show('Une erreur est survenue', 'error')} />
        </Group>

        <Group title="Screen et ScreenHeader">
          <AppText color="onSurfaceVariant">
            Cette page est elle-même un Screen avec un ScreenHeader (retour, titre).
          </AppText>
        </Group>
      </View>

      <Sheet
        visible={sheet}
        onClose={() => setSheet(false)}
        title="Feuille du bas"
        footer={<Button label="Appliquer" fullWidth onPress={() => setSheet(false)} />}
      >
        <AppText>Contenu de la feuille.</AppText>
      </Sheet>
      <Dialog
        visible={dialog}
        title="Confirmer ?"
        message="Voulez-vous vraiment continuer ?"
        confirmLabel="Confirmer"
        onConfirm={() => setDialog(false)}
        onCancel={() => setDialog(false)}
      />
      <Dialog
        visible={dialogDanger}
        danger
        title="Supprimer l'annonce ?"
        message="Cette action est définitive."
        confirmLabel="Supprimer"
        onConfirm={() => setDialogDanger(false)}
        onCancel={() => setDialogDanger(false)}
      />
    </Screen>
  );
}

export default function CatalogueRoute() {
  if (!ENABLED) return <Redirect href="/" />;
  return <Catalogue />;
}
