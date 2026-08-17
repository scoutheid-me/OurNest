import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, User } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

const provider = new GoogleAuthProvider();

export const initFirebaseAuth = (onAuthChanged: (user: User | null) => void) => {
  return onAuthStateChanged(auth, onAuthChanged);
};

export const signInWithFirebase = async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (error) {
    console.error('Firebase Auth Error:', error);
    throw error;
  }
};

export const signOutFirebase = async () => {
  await auth.signOut();
};

export const saveFirebaseAppData = async (uid: string, data: any) => {
  try {
    await setDoc(doc(db, 'households', uid), {
      ownerId: uid,
      appDataJson: JSON.stringify(data)
    });
  } catch (error) {
    console.error('Error saving to Firebase:', error);
    throw error;
  }
};

export const loadFirebaseAppData = async (uid: string) => {
  try {
    const docSnap = await getDoc(doc(db, 'households', uid));
    if (docSnap.exists()) {
      const { appDataJson } = docSnap.data();
      return JSON.parse(appDataJson);
    }
    return null;
  } catch (error) {
    console.error('Error loading from Firebase:', error);
    throw error;
  }
};
