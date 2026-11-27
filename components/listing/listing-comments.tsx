import { useInfiniteQuery, useMutation } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import { AppText, Button, Card, Field } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { getApiErrorMessage } from '@/lib/api-error';
import { AdActivityService } from '@/services/ad-activity.service';
import { useAuthStore } from '@/stores/auth.store';

export function ListingComments({ id }: { id: string }) {
  const router = useRouter();
  const signedIn = useAuthStore((state) => !!state.accessToken);
  const [draft, setDraft] = useState('');
  const comments = useInfiniteQuery({
    queryKey: ['ad-comments', id],
    initialPageParam: undefined as string | undefined,
    queryFn: ({ pageParam }) => AdActivityService.comments(id, pageParam),
    getNextPageParam: (page) => page.next_cursor ?? undefined,
  });
  const post = useMutation({
    mutationFn: (body: string) => AdActivityService.postComment(id, body),
    onSuccess: () => {
      setDraft('');
      void comments.refetch();
    },
  });
  const entries = comments.data?.pages.flatMap((page) => page.items) ?? [];
  return (
    <View style={{ gap: Spacing.ms }}>
      <AppText variant="bodyStrong" accessibilityRole="header">Commentaires</AppText>
      {comments.isError ? (
        <Button variant="text" label="Réessayer" onPress={() => comments.refetch()} />
      ) : comments.isPending ? (
        <AppText color="onSurfaceVariant">Chargement…</AppText>
      ) : !entries.length ? (
        <AppText color="onSurfaceVariant">Aucun commentaire.</AppText>
      ) : entries.map((comment) => (
        <Card key={comment.id} outlined>
          <AppText variant="label">{comment.author}</AppText>
          <AppText>{comment.body}</AppText>
        </Card>
      ))}
      {comments.hasNextPage ? (
        <Button variant="text" label="Voir plus de commentaires"
          loading={comments.isFetchingNextPage} onPress={() => comments.fetchNextPage()} />
      ) : null}
      {signedIn ? (
        <>
          <Field label="Votre commentaire" value={draft} onChangeText={setDraft} multiline maxLength={1000} />
          {post.isError ? <AppText color="error">{getApiErrorMessage(post.error, 'Impossible de publier le commentaire.')}</AppText> : null}
          <Button label="Commenter" disabled={!draft.trim() || post.isPending} loading={post.isPending}
            onPress={() => post.mutate(draft.trim())} />
        </>
      ) : (
        <Button variant="secondary" label="Se connecter pour commenter"
          onPress={() => router.push({ pathname: '/(auth)/login', params: { redirect: `/announces/${id}` } })} />
      )}
    </View>
  );
}
