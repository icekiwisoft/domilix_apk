import AsyncStorage from '@react-native-async-storage/async-storage';
import { getReactNativePersistence, initializeAuth } from '@firebase/auth';
import { initializeApp } from 'firebase/app';

const firebaseConfig = {
  apiKey: 'AIzaSyAK-m_mPZtTIQWgKRSq95XYkPQT4komPY8',
  authDomain: 'domilix.firebaseapp.com',
  projectId: 'domilix',
  storageBucket: 'domilix.firebasestorage.app',
  messagingSenderId: '782365365187',
  appId: '1:782365365187:web:3bc2abc46b92e46791a376',
};

export const firebaseApp = initializeApp(firebaseConfig);

export const firebaseAuth = initializeAuth(firebaseApp, {
  persistence: getReactNativePersistence(AsyncStorage),
});
