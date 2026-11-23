import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface PendingPayment { id: string; userId: string; amount?: number }
interface PaymentState {
  pending: PendingPayment[];
  track: (id: string, userId: string, amount?: number) => void;
  remove: (id: string) => void;
}

export const usePaymentStore = create<PaymentState>()(persist((set) => ({
  pending: [],
  track: (id, userId, amount) => set((state) => ({ pending: [...state.pending.filter((p) => p.id !== id), { id, userId, amount }] })),
  remove: (id) => set((state) => ({ pending: state.pending.filter((p) => p.id !== id) })),
}), { name: 'domilix-pending-payments', storage: createJSONStorage(() => AsyncStorage) }));
