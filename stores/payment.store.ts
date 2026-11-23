import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface PendingPayment { id: string; userId: string }
interface PaymentState {
  pending: PendingPayment[];
  track: (id: string, userId: string) => void;
  remove: (id: string) => void;
}

export const usePaymentStore = create<PaymentState>()(persist((set) => ({
  pending: [],
  track: (id, userId) => set((state) => ({ pending: [...state.pending.filter((p) => p.id !== id), { id, userId }] })),
  remove: (id) => set((state) => ({ pending: state.pending.filter((p) => p.id !== id) })),
}), { name: 'domilix-pending-payments', storage: createJSONStorage(() => AsyncStorage) }));
