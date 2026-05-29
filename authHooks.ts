import { useState, useEffect } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { auth, db } from './firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { AppUser } from './types';

// Hook for Firebase Authentication
export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    }, (err) => {
      console.warn('Auth state change error:', err.message);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { user, loading, error };
}

// Hook to get current user profile from Firestore
export function useUserProfile(uid: string | null) {
  const [profile, setProfile] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!uid) {
      setProfile(null);
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        const userDoc = await getDoc(doc(db, 'users', uid));
        if (userDoc.exists()) {
          setProfile({
            uid,
            ...userDoc.data()
          } as AppUser);
        } else {
          setProfile(null);
        }
        setLoading(false);
      } catch (err: any) {
        console.warn('Failed to fetch user profile:', err.message);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchProfile();
  }, [uid]);

  return { profile, loading, error };
}

// Sign up function
export async function signUpUser(email: string, password: string, username: string) {
  try {
    // Create Firebase Auth user
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Create user document in Firestore
    const newUser: AppUser = {
      uid: user.uid,
      email: email,
      username: username,
      phone: '',
      walletBalance: 0,
      bonusAmount: 0,
      joinedMatches: [],
      completedMatches: [],
      gameNickname: username,
      isAdmin: false,
      createdAt: new Date().toISOString()
    };

    await setDoc(doc(db, 'users', user.uid), newUser);
    return { success: true, user: newUser };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// Sign in function
export async function signInUser(email: string, password: string) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Get user profile from Firestore
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    if (userDoc.exists()) {
      return { success: true, user: userDoc.data() as AppUser };
    } else {
      throw new Error('User profile not found');
    }
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// Sign out function
export async function signOutUser() {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// Update user profile in Firestore
export async function updateUserProfile(uid: string, updates: Partial<AppUser>) {
  try {
    await setDoc(doc(db, 'users', uid), updates, { merge: true });
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
