import { MaterialIcons } from '@expo/vector-icons';
import type { ReactNode } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';

import { Radii, Sizes, Spacing, TextVariants, type ColorToken } from '@/constants/theme';
import { useThemeColors } from '@/hooks/use-theme-color';

import { AppText } from './app-text';
import { Button } from './button';
import { Card } from './card';
import type { IconName } from './icon-button';
import { Skeleton } from './skeleton';

export interface LoadingStateProps {
  /** Read by TalkBack while the skeleton is shown. */
  label?: string;
  /** Number of placeholder cards. */
  count?: number;
  /** Placeholder cards with an image block (listings) or text lines only. */
  media?: boolean;
  /** Custom skeleton matching the screen's layout, instead of the cards. */
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
}

/** Skeleton placeholder (never a bare spinner), announced as busy. */
export function LoadingState({ label = 'Chargement…', count = 3, media = true, children, style }: LoadingStateProps) {
  const line = TextVariants.body.fontSize;
  return (
    <View
      accessible
      accessibilityLabel={label}
      accessibilityState={{ busy: true }}
      style={[{ gap: Spacing.md }, style]}
    >
      {children ??
        Array.from({ length: count }, (_, i) => (
          <Card key={i} padding="sm">
            {media ? <Skeleton height={Sizes.skeletonMedia} radius={Radii.tile} /> : null}
            <Skeleton width="60%" height={line} />
            <Skeleton width="85%" height={line} />
            <Skeleton width="40%" height={line} />
          </Card>
        ))}
    </View>
  );
}

interface StateLayoutProps {
  icon: IconName;
  iconColor: ColorToken;
  iconBackground: ColorToken;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  actionVariant?: 'primary' | 'secondary';
  role?: 'alert';
  style?: StyleProp<ViewStyle>;
}

function StateLayout({
  icon,
  iconColor,
  iconBackground,
  title,
  description,
  actionLabel,
  onAction,
  actionVariant = 'primary',
  role,
  style,
}: StateLayoutProps) {
  const C = useThemeColors();
  return (
    <View
      accessibilityRole={role}
      accessibilityLiveRegion={role ? 'polite' : undefined}
      style={[
        { flexGrow: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.xl, gap: Spacing.sm },
        style,
      ]}
    >
      <View
        importantForAccessibility="no-hide-descendants"
        style={{
          width: Sizes.stateIcon,
          height: Sizes.stateIcon,
          borderRadius: Radii.full,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: C[iconBackground],
          marginBottom: Spacing.sm,
        }}
      >
        <MaterialIcons name={icon} size={Sizes.stateIcon / 2} color={C[iconColor]} />
      </View>
      <AppText variant="headline" accessibilityRole="header" style={{ textAlign: 'center' }}>
        {title}
      </AppText>
      {description ? (
        <AppText color="onSurfaceVariant" style={{ textAlign: 'center' }}>
          {description}
        </AppText>
      ) : null}
      {actionLabel && onAction ? (
        <Button label={actionLabel} onPress={onAction} variant={actionVariant} style={{ marginTop: Spacing.md }} />
      ) : null}
    </View>
  );
}

export interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: IconName;
  actionLabel?: string;
  onAction?: () => void;
  style?: StyleProp<ViewStyle>;
}

/** Nothing to show yet, with the action that fills the screen (same layout as ui/empty-state). */
export function EmptyState({ icon = 'inbox', ...rest }: EmptyStateProps) {
  return <StateLayout icon={icon} iconColor="onPrimaryFixed" iconBackground="primaryFixed" {...rest} />;
}

export interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  retryLabel?: string;
  style?: StyleProp<ViewStyle>;
}

/** Loading failed, with a retry button. */
export function ErrorState({
  title = 'Impossible de charger le contenu',
  description = 'Une erreur est survenue. Réessayez dans un instant.',
  onRetry,
  retryLabel = 'Réessayer',
  style,
}: ErrorStateProps) {
  return (
    <StateLayout
      icon="error-outline"
      iconColor="onErrorContainer"
      iconBackground="errorContainer"
      title={title}
      description={description}
      actionLabel={retryLabel}
      onAction={onRetry}
      role="alert"
      style={style}
    />
  );
}

export interface OfflineStateProps {
  /**
   * `screen`: nothing cached, the whole screen says so (with retry).
   * `banner`: cached data is shown below, the banner says it may be old.
   */
  variant?: 'screen' | 'banner';
  onRetry?: () => void;
  style?: StyleProp<ViewStyle>;
}

/** No network: full-screen state, or a banner above cached data. */
export function OfflineState({ variant = 'screen', onRetry, style }: OfflineStateProps) {
  const C = useThemeColors();
  if (variant === 'banner') {
    return (
      <View
        accessibilityRole="alert"
        accessibilityLiveRegion="polite"
        style={[
          {
            flexDirection: 'row',
            alignItems: 'center',
            gap: Spacing.sm,
            padding: Spacing.ms,
            borderRadius: Radii.control,
            backgroundColor: C.surfaceContainerHigh,
          },
          style,
        ]}
      >
        <MaterialIcons name="cloud-off" size={Sizes.icon} color={C.onSurfaceVariant} />
        <AppText variant="caption" color="onSurface" style={{ flex: 1 }}>
          Hors ligne : dernières données reçues, elles peuvent ne plus être à jour.
        </AppText>
      </View>
    );
  }
  return (
    <StateLayout
      icon="cloud-off"
      iconColor="onSurfaceVariant"
      iconBackground="surfaceContainerHigh"
      title="Vous êtes hors ligne"
      description="Vérifiez votre connexion Internet, puis réessayez."
      actionLabel="Réessayer"
      onAction={onRetry}
      actionVariant="secondary"
      role="alert"
      style={style}
    />
  );
}
