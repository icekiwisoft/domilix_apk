import { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
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
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';

import { Colors, Radius, Spacing, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Input } from '@/components/ui/input';
import { useCategories } from '@/hooks/queries/use-categories';
import { useCreateAnnounce } from '@/hooks/queries/use-announces';
import { AddressesService, type AddressSuggestion } from '@/services/addresses.service';

// ─── Types ────────────────────────────────────────────────────────────────────

interface FormState {
  type: 'realestate' | 'furniture' | '';
  ad_type: 'location' | 'sale' | '';
  category_id: string;
  price: string;
  size: string;
  description: string;
  city: string;
  address: string;
  state: string;
  wifi: boolean;
  air_conditioning: boolean;
  security_24h: boolean;
  smart_tv: boolean;
  equipped_kitchen: boolean;
  gate: boolean;
  pool: boolean;
  medias: { uri: string; mimeType: string; fileName: string }[];
}

const INITIAL: FormState = {
  type: '',
  ad_type: '',
  category_id: '',
  price: '',
  size: '',
  description: '',
  city: '',
  address: '',
  state: '',
  wifi: false,
  air_conditioning: false,
  security_24h: false,
  smart_tv: false,
  equipped_kitchen: false,
  gate: false,
  pool: false,
  medias: [],
};

const AMENITIES: { key: keyof FormState; label: string; icon: React.ComponentProps<typeof MaterialIcons>['name'] }[] = [
  { key: 'wifi', label: 'Wifi', icon: 'wifi' },
  { key: 'air_conditioning', label: 'Climatisation', icon: 'ac-unit' },
  { key: 'security_24h', label: 'Sécurité 24h', icon: 'security' },
  { key: 'smart_tv', label: 'Smart TV', icon: 'tv' },
  { key: 'equipped_kitchen', label: 'Cuisine équipée', icon: 'kitchen' },
  { key: 'gate', label: 'Portail', icon: 'door-sliding' },
  { key: 'pool', label: 'Piscine', icon: 'pool' },
];

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function PublishScreen() {
  const scheme = useColorScheme();
  const C = Colors[scheme ?? 'light'];
  const [form, setForm] = useState<FormState>(INITIAL);
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});

  const categoryType = form.type === 'realestate' ? 'house' : form.type === 'furniture' ? 'furniture' : undefined;
  const { data: categoriesPage } = useCategories({ type: categoryType });
  const categories = categoriesPage?.data ?? [];

  const create = useCreateAnnounce();

  const totalSteps = form.type === 'furniture' ? 4 : 5;

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  // ─── Validation per step ──────────────────────────────────────────────────

  function validate(): boolean {
    const e: Partial<Record<keyof FormState, string>> = {};

    if (step === 1) {
      if (!form.type) e.type = 'Choisissez un type de bien.';
      if (!form.ad_type) e.ad_type = 'Choisissez le mode (location ou vente).';
    }
    if (step === 2) {
      if (!form.category_id) e.category_id = 'Sélectionnez une catégorie.';
      if (!form.price || isNaN(Number(form.price)) || Number(form.price) <= 0)
        e.price = 'Entrez un prix valide.';
    }
    if (step === 3) {
      if (!form.description.trim()) e.description = 'Ajoutez une description.';
      if (!form.city.trim()) e.city = 'Ville obligatoire.';
      if (!form.address.trim()) e.address = 'Adresse obligatoire.';
    }
    if (step === totalSteps) {
      if (form.medias.length === 0) e.medias = 'Ajoutez au moins une photo.';
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function goNext() {
    if (!validate()) return;
    // skip amenities step for furniture
    if (step === 3 && form.type === 'furniture') {
      setStep(totalSteps); // photos
    } else {
      setStep((s) => s + 1);
    }
  }

  function goBack() {
    if (step === 1) {
      router.back();
      return;
    }
    // reverse skip for furniture
    if (step === totalSteps && form.type === 'furniture') {
      setStep(3);
    } else {
      setStep((s) => s - 1);
    }
  }

  // ─── Image picker ─────────────────────────────────────────────────────────

  async function pickImages() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      quality: 0.85,
      selectionLimit: 10,
    });
    if (!result.canceled) {
      const picked = result.assets.map((a) => ({
        uri: a.uri,
        mimeType: a.mimeType ?? 'image/jpeg',
        fileName: a.fileName ?? `photo_${Date.now()}.jpg`,
      }));
      set('medias', [...form.medias, ...picked].slice(0, 10));
    }
  }

  function removeMedia(index: number) {
    set('medias', form.medias.filter((_, i) => i !== index));
  }

  // ─── Submit ───────────────────────────────────────────────────────────────

  async function handleSubmit() {
    if (!validate()) return;

    const fd = new FormData();
    fd.append('type', form.type);
    fd.append('ad_type', form.ad_type);
    fd.append('category_id', form.category_id);
    fd.append('price', form.price);
    fd.append('description', form.description);
    fd.append('city', form.city);
    fd.append('address', form.address);
    if (form.state) fd.append('state', form.state);
    if (form.type === 'realestate') {
      if (form.size) fd.append('size', form.size);
      fd.append('wifi', form.wifi ? '1' : '0');
      fd.append('air_conditioning', form.air_conditioning ? '1' : '0');
      fd.append('security_24h', form.security_24h ? '1' : '0');
      fd.append('smart_tv', form.smart_tv ? '1' : '0');
      fd.append('equipped_kitchen', form.equipped_kitchen ? '1' : '0');
      fd.append('gate', form.gate ? '1' : '0');
      fd.append('pool', form.pool ? '1' : '0');
    }
    form.medias.forEach((m) => {
      fd.append('medias[]', { uri: m.uri, type: m.mimeType, name: m.fileName } as any);
    });

    create.mutate(fd, {
      onSuccess: () => {
        Alert.alert('Succès', 'Votre annonce a été publiée.', [
          { text: 'OK', onPress: () => router.back() },
        ]);
      },
      onError: () => {
        Alert.alert('Erreur', 'Une erreur est survenue. Veuillez réessayer.');
      },
    });
  }

  // ─── Render ───────────────────────────────────────────────────────────────

  const isLastStep = step === totalSteps;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: C.surface }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: C.outlineVariant + '66' }]}>
        <Pressable onPress={goBack} style={[styles.backBtn, { borderColor: C.outlineVariant }]} hitSlop={8}>
          <MaterialIcons name="arrow-back" size={20} color={C.onSurface} />
        </Pressable>
        <Text style={[Typography.bodyMd, { color: C.onSurface, fontFamily: 'PlusJakartaSans_600SemiBold' }]}>
          Publier une annonce
        </Text>
        <Text style={[Typography.caption, { color: C.onSurfaceVariant }]}>
          {step}/{totalSteps}
        </Text>
      </View>

      {/* Progress bar */}
      <View style={[styles.progressTrack, { backgroundColor: C.surfaceVariant }]}>
        <View
          style={[
            styles.progressFill,
            { backgroundColor: C.primary, width: `${(step / totalSteps) * 100}%` },
          ]}
        />
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {step === 1 && <Step1 form={form} set={set} C={C} errors={errors} />}
          {step === 2 && <Step2 form={form} set={set} C={C} errors={errors} categories={categories} />}
          {step === 3 && <Step3 form={form} set={set} C={C} errors={errors} />}
          {step === 4 && form.type === 'realestate' && <Step4 form={form} set={set} C={C} />}
          {step === totalSteps && <Step5 form={form} errors={errors} onPick={pickImages} onRemove={removeMedia} C={C} />}
        </ScrollView>

        {/* Bottom CTA */}
        <View style={[styles.footer, { borderTopColor: C.outlineVariant + '66', backgroundColor: C.surface }]}>
          <Pressable
            onPress={isLastStep ? handleSubmit : goNext}
            disabled={create.isPending}
            style={[styles.cta, { backgroundColor: C.primary, opacity: create.isPending ? 0.7 : 1 }]}
          >
            {create.isPending ? (
              <ActivityIndicator color={C.onPrimary} />
            ) : (
              <Text style={[Typography.labelSm, { color: C.onPrimary, textTransform: 'uppercase', letterSpacing: 1.1 }]}>
                {isLastStep ? 'Publier' : 'Suivant'}
              </Text>
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ─── Step 1 : Type ────────────────────────────────────────────────────────────

type ThemeColors = (typeof Colors)['light'] | (typeof Colors)['dark'];

type StepProps = {
  form: FormState;
  set: <K extends keyof FormState>(key: K, value: FormState[K]) => void;
  C: ThemeColors;
  errors: Partial<Record<keyof FormState, string>>;
};

function Step1({ form, set, C, errors }: StepProps) {
  return (
    <View style={styles.stepBody}>
      <StepHeader title="Type de bien" subtitle="Quel type d'annonce souhaitez-vous publier ?" />

      <Text style={[Typography.labelSm, styles.groupLabel, { color: C.onSurfaceVariant }]}>CATÉGORIE</Text>
      <View style={styles.typeGrid}>
        {([
          { value: 'realestate', label: 'Immobilier', icon: 'home-work' },
          { value: 'furniture', label: 'Mobilier', icon: 'chair' },
        ] as const).map((opt) => (
          <Pressable
            key={opt.value}
            onPress={() => set('type', opt.value)}
            style={[
              styles.typeCard,
              {
                borderColor: form.type === opt.value ? C.primary : C.outlineVariant,
                backgroundColor: form.type === opt.value ? C.primary + '10' : C.surfaceContainerLow,
              },
            ]}
          >
            <View style={[styles.typeIconBox, { backgroundColor: form.type === opt.value ? C.primary : C.surfaceContainerHighest }]}>
              <MaterialIcons name={opt.icon} size={28} color={form.type === opt.value ? C.onPrimary : C.onSurfaceVariant} />
            </View>
            <Text style={[Typography.bodyMd, { color: form.type === opt.value ? C.primary : C.onSurface, fontFamily: 'PlusJakartaSans_600SemiBold', marginTop: Spacing.sm }]}>
              {opt.label}
            </Text>
          </Pressable>
        ))}
      </View>
      {errors.type && <ErrorText msg={errors.type} C={C} />}

      <Text style={[Typography.labelSm, styles.groupLabel, { color: C.onSurfaceVariant, marginTop: Spacing.xl }]}>MODE</Text>
      <View style={styles.pillRow}>
        {([
          { value: 'location', label: 'Location' },
          { value: 'sale', label: 'Vente' },
        ] as const).map((opt) => (
          <Pressable
            key={opt.value}
            onPress={() => set('ad_type', opt.value)}
            style={[
              styles.pill,
              {
                borderColor: form.ad_type === opt.value ? C.primary : C.outlineVariant,
                backgroundColor: form.ad_type === opt.value ? C.primary : 'transparent',
              },
            ]}
          >
            <Text style={[Typography.bodyMd, { color: form.ad_type === opt.value ? C.onPrimary : C.onSurface, fontFamily: 'PlusJakartaSans_500Medium' }]}>
              {opt.label}
            </Text>
          </Pressable>
        ))}
      </View>
      {errors.ad_type && <ErrorText msg={errors.ad_type} C={C} />}
    </View>
  );
}

// ─── Step 2 : Catégorie & Prix ────────────────────────────────────────────────

function Step2({ form, set, C, errors, categories }: StepProps & { categories: { id: string; name: string }[] }) {
  return (
    <View style={styles.stepBody}>
      <StepHeader title="Catégorie & Prix" subtitle="Précisez la catégorie et le prix de votre bien." />

      <Text style={[Typography.labelSm, styles.groupLabel, { color: C.onSurfaceVariant }]}>CATÉGORIE</Text>
      <View style={styles.chipWrap}>
        {categories.map((cat) => (
          <Pressable
            key={cat.id}
            onPress={() => set('category_id', cat.id)}
            style={[
              styles.chip,
              {
                borderColor: form.category_id === cat.id ? C.primary : C.outlineVariant,
                backgroundColor: form.category_id === cat.id ? C.primary + '10' : C.surfaceContainerLow,
              },
            ]}
          >
            <Text style={[Typography.caption, { color: form.category_id === cat.id ? C.primary : C.onSurface, fontFamily: 'PlusJakartaSans_500Medium' }]}>
              {cat.name}
            </Text>
          </Pressable>
        ))}
      </View>
      {errors.category_id && <ErrorText msg={errors.category_id} C={C} />}

      <View style={[styles.formGap, { marginTop: Spacing.xl }]}>
        <Input
          label={`Prix (XAF${form.ad_type === 'location' ? '/mois' : ''})`}
          value={form.price}
          onChangeText={(v) => set('price', v)}
          keyboardType="numeric"
          error={errors.price}
          leftElement={<MaterialIcons name="payments" size={20} color={C.onSurfaceVariant} />}
        />

        {form.type === 'realestate' && (
          <Input
            label="Surface (m²) — optionnel"
            value={form.size}
            onChangeText={(v) => set('size', v)}
            keyboardType="numeric"
            leftElement={<MaterialIcons name="straighten" size={20} color={C.onSurfaceVariant} />}
          />
        )}
      </View>
    </View>
  );
}

// ─── Step 3 : Localisation & Description ─────────────────────────────────────

function Step3({ form, set, C, errors }: StepProps) {
  const [locating, setLocating] = useState(false);
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  async function useMyLocation() {
    setLocating(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission refusée',
          "Autorisez l'accès à la localisation dans les paramètres de votre téléphone pour utiliser cette fonctionnalité."
        );
        return;
      }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const result = await AddressesService.reverseGeocode(loc.coords.longitude, loc.coords.latitude);
      const parts = result.place_name.split(', ');
      set('address', result.text || parts[0] || '');
      set('city', parts.length > 1 ? parts[1] : '');
      set('state', parts.length > 2 ? parts[2] : '');
      setSuggestions([]);
    } catch {
      Alert.alert('Erreur', 'Impossible de récupérer votre position. Réessayez ou saisissez manuellement.');
    } finally {
      setLocating(false);
    }
  }

  function onAddressChange(text: string) {
    set('address', text);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    if (text.length < 3) { setSuggestions([]); return; }
    searchTimeout.current = setTimeout(async () => {
      try {
        const results = await AddressesService.search({
          query: text,
          country: 'cm',
          language: 'fr',
          limit: 5,
          autocomplete: true,
        });
        setSuggestions(results);
      } catch {}
    }, 400);
  }

  function selectSuggestion(s: AddressSuggestion) {
    const parts = s.place_name.split(', ');
    set('address', s.text || parts[0] || '');
    set('city', parts.length > 1 ? parts[1] : '');
    set('state', parts.length > 2 ? parts[2] : '');
    setSuggestions([]);
  }

  return (
    <View style={styles.stepBody}>
      <StepHeader
        title="Localisation & Description"
        subtitle="Utilisez votre position ou saisissez l'adresse de votre bien."
      />

      {/* GPS button */}
      <Pressable
        onPress={useMyLocation}
        disabled={locating}
        style={[styles.locationBtn, { backgroundColor: C.primary + '12', borderColor: C.primary + '40' }]}
      >
        {locating ? (
          <ActivityIndicator size="small" color={C.primary} />
        ) : (
          <MaterialIcons name="my-location" size={20} color={C.primary} />
        )}
        <Text style={[Typography.bodyMd, { color: C.primary, fontFamily: 'PlusJakartaSans_600SemiBold', flex: 1 }]}>
          {locating ? 'Localisation en cours…' : 'Utiliser ma position actuelle'}
        </Text>
        {!locating && <MaterialIcons name="chevron-right" size={18} color={C.primary} />}
      </Pressable>

      <View style={[styles.dividerRow, { marginVertical: Spacing.lg }]}>
        <View style={[styles.dividerLine, { backgroundColor: C.outlineVariant }]} />
        <Text style={[Typography.caption, { color: C.onSurfaceVariant, marginHorizontal: Spacing.sm }]}>ou saisir manuellement</Text>
        <View style={[styles.dividerLine, { backgroundColor: C.outlineVariant }]} />
      </View>

      <View style={styles.formGap}>
        {/* Address with autocomplete */}
        <View>
          <Input
            label="Adresse / Quartier *"
            value={form.address}
            onChangeText={onAddressChange}
            error={errors.address}
            leftElement={<MaterialIcons name="place" size={20} color={C.onSurfaceVariant} />}
          />
          {suggestions.length > 0 && (
            <View style={[styles.suggestionsBox, { backgroundColor: C.surface, borderColor: C.outlineVariant }]}>
              {suggestions.map((s) => (
                <Pressable
                  key={s.id}
                  onPress={() => selectSuggestion(s)}
                  style={[styles.suggestionRow, { borderBottomColor: C.outlineVariant + '55' }]}
                >
                  <MaterialIcons name="place" size={16} color={C.primary} style={{ marginTop: 2 }} />
                  <View style={{ flex: 1 }}>
                    <Text style={[Typography.bodyMd, { color: C.onSurface, fontFamily: 'PlusJakartaSans_500Medium' }]} numberOfLines={1}>
                      {s.text}
                    </Text>
                    <Text style={[Typography.caption, { color: C.onSurfaceVariant }]} numberOfLines={1}>
                      {s.place_name}
                    </Text>
                  </View>
                </Pressable>
              ))}
            </View>
          )}
        </View>

        <Input
          label="Ville *"
          value={form.city}
          onChangeText={(v) => set('city', v)}
          error={errors.city}
          leftElement={<MaterialIcons name="location-city" size={20} color={C.onSurfaceVariant} />}
        />

        <Input
          label="Région / État — optionnel"
          value={form.state}
          onChangeText={(v) => set('state', v)}
          leftElement={<MaterialIcons name="map" size={20} color={C.onSurfaceVariant} />}
        />

        {/* Description */}
        <View
          style={[
            styles.textAreaContainer,
            { borderColor: errors.description ? C.error : C.outlineVariant, backgroundColor: C.surface },
          ]}
        >
          <Text style={[Typography.caption, { color: errors.description ? C.error : C.onSurfaceVariant, marginBottom: Spacing.xs }]}>
            Description *
          </Text>
          <TextAreaInput
            value={form.description}
            onChangeText={(v) => set('description', v)}
            placeholder="Décrivez votre bien : état, atouts, équipements..."
            placeholderTextColor={C.onSurfaceVariant + '66'}
            color={C.onSurface}
          />
        </View>
        {errors.description && <ErrorText msg={errors.description} C={C} />}
      </View>
    </View>
  );
}

// ─── Step 4 : Équipements (realestate only) ───────────────────────────────────

function Step4({ form, set, C }: Omit<StepProps, 'errors'>) {
  return (
    <View style={styles.stepBody}>
      <StepHeader title="Équipements" subtitle="Sélectionnez les équipements disponibles dans votre bien." />

      <View style={styles.amenityGrid}>
        {AMENITIES.map((a) => {
          const active = form[a.key] as boolean;
          return (
            <Pressable
              key={a.key}
              onPress={() => set(a.key, !active as any)}
              style={[
                styles.amenityCard,
                {
                  borderColor: active ? C.primary : C.outlineVariant,
                  backgroundColor: active ? C.primary + '10' : C.surfaceContainerLow,
                },
              ]}
            >
              <MaterialIcons name={a.icon} size={24} color={active ? C.primary : C.onSurfaceVariant} />
              <Text style={[Typography.caption, { color: active ? C.primary : C.onSurface, fontFamily: 'PlusJakartaSans_500Medium', marginTop: 6, textAlign: 'center' }]}>
                {a.label}
              </Text>
              {active && (
                <View style={[styles.amenityCheck, { backgroundColor: C.primary }]}>
                  <MaterialIcons name="check" size={10} color={C.onPrimary} />
                </View>
              )}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

// ─── Step 5 : Photos ──────────────────────────────────────────────────────────

function Step5({
  form,
  errors,
  onPick,
  onRemove,
  C,
}: {
  form: FormState;
  errors: Partial<Record<keyof FormState, string>>;
  onPick: () => void;
  onRemove: (i: number) => void;
  C: ThemeColors;
}) {
  return (
    <View style={styles.stepBody}>
      <StepHeader title="Photos" subtitle="Ajoutez des photos de qualité pour attirer plus de locataires ou acheteurs." />

      <Pressable
        onPress={onPick}
        style={[styles.pickerZone, { borderColor: errors.medias ? C.error : C.outlineVariant, backgroundColor: C.surfaceContainerLow }]}
      >
        <MaterialIcons name="add-photo-alternate" size={40} color={C.onSurfaceVariant} />
        <Text style={[Typography.bodyMd, { color: C.onSurfaceVariant, marginTop: Spacing.sm }]}>
          Appuyer pour ajouter des photos
        </Text>
        <Text style={[Typography.caption, { color: C.onSurfaceVariant + '99', marginTop: 4 }]}>
          {form.medias.length}/10 photos sélectionnées
        </Text>
      </Pressable>
      {errors.medias && <ErrorText msg={errors.medias} C={C} />}

      {form.medias.length > 0 && (
        <View style={styles.mediaGrid}>
          {form.medias.map((m, i) => (
            <View key={i} style={styles.mediaThumb}>
              <Image source={{ uri: m.uri }} style={styles.mediaImg} />
              {i === 0 && (
                <View style={[styles.mediaBadge, { backgroundColor: C.primary }]}>
                  <Text style={[Typography.caption, { color: C.onPrimary, fontSize: 9 }]}>Principale</Text>
                </View>
              )}
              <Pressable
                onPress={() => onRemove(i)}
                style={[styles.mediaRemove, { backgroundColor: C.error }]}
              >
                <MaterialIcons name="close" size={12} color={C.onError} />
              </Pressable>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

// ─── Shared sub-components ────────────────────────────────────────────────────

function StepHeader({ title, subtitle }: { title: string; subtitle: string }) {
  const scheme = useColorScheme();
  const C = Colors[scheme ?? 'light'];
  return (
    <View style={styles.stepHeaderBlock}>
      <Text style={[Typography.headlineMd, { color: C.onSurface, fontFamily: 'PlusJakartaSans_700Bold' }]}>
        {title}
      </Text>
      <Text style={[Typography.bodyMd, { color: C.onSurfaceVariant, marginTop: Spacing.xs }]}>
        {subtitle}
      </Text>
    </View>
  );
}

function ErrorText({ msg, C }: { msg: string; C: ThemeColors }) {
  return (
    <Text style={[Typography.caption, { color: C.error, marginTop: Spacing.xs, marginLeft: Spacing.xs }]}>
      {msg}
    </Text>
  );
}

function TextAreaInput({
  value,
  onChangeText,
  placeholder,
  placeholderTextColor,
  color,
}: {
  value: string;
  onChangeText: (v: string) => void;
  placeholder: string;
  placeholderTextColor: string;
  color: string;
}) {
  return (
    <TextInput
      value={value}
      onChangeText={onChangeText}
      multiline
      numberOfLines={5}
      placeholder={placeholder}
      placeholderTextColor={placeholderTextColor}
      style={[Typography.bodyMd, { color, minHeight: 100, textAlignVertical: 'top' }]}
    />
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
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressTrack: {
    height: 3,
    width: '100%',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  scroll: {
    paddingBottom: Spacing.xxl,
  },
  stepBody: {
    paddingHorizontal: Spacing.marginMobile,
    paddingTop: Spacing.xl,
  },
  stepHeaderBlock: {
    marginBottom: Spacing.xl,
  },
  groupLabel: {
    textTransform: 'uppercase',
    letterSpacing: 1.1,
    marginBottom: Spacing.md,
  },
  // Type cards
  typeGrid: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  typeCard: {
    flex: 1,
    borderWidth: 1.5,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    alignItems: 'center',
  },
  typeIconBox: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Pills
  pillRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  pill: {
    flex: 1,
    borderWidth: 1.5,
    borderRadius: Radius.full,
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  // Category chips
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  chip: {
    borderWidth: 1.5,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
  },
  // Form
  formGap: {
    gap: Spacing.lg,
  },
  textAreaContainer: {
    borderWidth: 1,
    borderRadius: Radius.md,
    padding: Spacing.md,
  },
  // Amenities
  amenityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  amenityCard: {
    width: '30%',
    borderWidth: 1.5,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    alignItems: 'center',
    position: 'relative',
  },
  amenityCheck: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Location
  locationBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    borderWidth: 1.5,
    borderRadius: Radius.lg,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  // Address suggestions
  suggestionsBox: {
    borderWidth: 1,
    borderTopWidth: 0,
    borderBottomLeftRadius: Radius.md,
    borderBottomRightRadius: Radius.md,
    overflow: 'hidden',
    zIndex: 10,
  },
  suggestionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
  },
  // Photos
  pickerZone: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderRadius: Radius.lg,
    paddingVertical: Spacing.xxl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mediaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginTop: Spacing.lg,
  },
  mediaThumb: {
    width: '30%',
    aspectRatio: 1,
    borderRadius: Radius.md,
    overflow: 'hidden',
    position: 'relative',
  },
  mediaImg: {
    width: '100%',
    height: '100%',
  },
  mediaBadge: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  mediaRemove: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Footer
  footer: {
    paddingHorizontal: Spacing.marginMobile,
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
  },
  cta: {
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
    alignItems: 'center',
    shadowColor: '#633f00',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 14,
    elevation: 4,
  },
});
