// `@firebase/auth`'s generic type declarations (resolved by tsc regardless of the
// "react-native" package export condition Metro uses at runtime) omit the RN-only
// persistence helper. It exists and works at runtime — this just restores its type.
// The `export {}` makes this file a module so the block below augments (merges
// into) the real `@firebase/auth` types instead of replacing them.
export {};

declare module '@firebase/auth' {
  export function getReactNativePersistence(storage: unknown): Persistence;
}
