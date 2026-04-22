import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyAkmYibye2Bxlw1henWMqbJWyRSqPX3NnE',
  authDomain: 'assignment5-a8527.firebaseapp.com',
  projectId: 'assignment5-a8527',
  storageBucket: 'assignment5-a8527.firebasestorage.app',
  messagingSenderId: '513700324621',
  appId: '1:513700324621:web:e2388fc1b0b2785636fc44',
};

const firebase_app = initializeApp(firebaseConfig);
export const auth = getAuth(firebase_app);
export const db = getFirestore(firebase_app);
