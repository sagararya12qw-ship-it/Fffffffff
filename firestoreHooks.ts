import { useState, useEffect } from 'react';
import { 
  collection, 
  onSnapshot, 
  query, 
  where 
} from 'firebase/firestore';
import { db } from './firebase';
import { Game, Match, AppUser, BannerItem, WalletTransaction } from './types';

// Hook to fetch games from Firestore in real-time
export function useFirestoreGames(defaultGames: Game[]) {
  const [games, setGames] = useState<Game[]>(defaultGames);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const q = query(collection(db, 'games'));
      
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const gamesData: Game[] = [];
        querySnapshot.forEach((doc) => {
          gamesData.push({
            id: doc.id,
            ...doc.data()
          } as Game);
        });
        setGames(gamesData.length > 0 ? gamesData : defaultGames);
        setLoading(false);
      }, (error) => {
        console.warn('Firestore games query failed, using defaults:', error.message);
        setGames(defaultGames);
        setLoading(false);
      });

      return () => unsubscribe();
    } catch (err) {
      console.warn('Failed to setup games listener:', err);
      setGames(defaultGames);
      setLoading(false);
    }
  }, [defaultGames]);

  return { games, loading, error };
}

// Hook to fetch matches from Firestore in real-time
export function useFirestoreMatches(defaultMatches: Match[] = []) {
  const [matches, setMatches] = useState<Match[]>(defaultMatches);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const q = query(collection(db, 'matches'));
      
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const matchesData: Match[] = [];
        querySnapshot.forEach((doc) => {
          matchesData.push({
            id: doc.id,
            ...doc.data()
          } as Match);
        });
        setMatches(matchesData);
        setLoading(false);
      }, (error) => {
        console.warn('Firestore matches query failed, using defaults:', error.message);
        setMatches(defaultMatches);
        setLoading(false);
      });

      return () => unsubscribe();
    } catch (err) {
      console.warn('Failed to setup matches listener:', err);
      setMatches(defaultMatches);
      setLoading(false);
    }
  }, [defaultMatches]);

  return { matches, loading, error };
}

// Hook to fetch all users from Firestore in real-time
export function useFirestoreUsers(defaultUsers: AppUser[]) {
  const [users, setUsers] = useState<AppUser[]>(defaultUsers);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const q = query(collection(db, 'users'));
      
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const usersData: AppUser[] = [];
        querySnapshot.forEach((doc) => {
          usersData.push({
            uid: doc.id,
            ...doc.data()
          } as AppUser);
        });
        setUsers(usersData.length > 0 ? usersData : defaultUsers);
        setLoading(false);
      }, (error) => {
        console.warn('Firestore users query failed, using defaults:', error.message);
        setUsers(defaultUsers);
        setLoading(false);
      });

      return () => unsubscribe();
    } catch (err) {
      console.warn('Failed to setup users listener:', err);
      setUsers(defaultUsers);
      setLoading(false);
    }
  }, [defaultUsers]);

  return { users, loading, error };
}

// Hook to fetch banners from Firestore in real-time
export function useFirestoreBanners(defaultBanners: BannerItem[]) {
  const [banners, setBanners] = useState<BannerItem[]>(defaultBanners);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const q = query(collection(db, 'banners'), where('active', '==', true));
      
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const bannersData: BannerItem[] = [];
        querySnapshot.forEach((doc) => {
          bannersData.push({
            id: doc.id,
            ...doc.data()
          } as BannerItem);
        });
        setBanners(bannersData.length > 0 ? bannersData : defaultBanners);
        setLoading(false);
      }, (error) => {
        console.warn('Firestore banners query failed, using defaults:', error.message);
        setBanners(defaultBanners);
        setLoading(false);
      });

      return () => unsubscribe();
    } catch (err) {
      console.warn('Failed to setup banners listener:', err);
      setBanners(defaultBanners);
      setLoading(false);
    }
  }, [defaultBanners]);

  return { banners, loading, error };
}

// Hook to fetch transactions from Firestore in real-time
export function useFirestoreTransactions(defaultTransactions: WalletTransaction[] = []) {
  const [transactions, setTransactions] = useState<WalletTransaction[]>(defaultTransactions);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const q = query(collection(db, 'transactions'));
      
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const txnData: WalletTransaction[] = [];
        querySnapshot.forEach((doc) => {
          txnData.push({
            id: doc.id,
            ...doc.data()
          } as WalletTransaction);
        });
        setTransactions(txnData);
        setLoading(false);
      }, (error) => {
        console.warn('Firestore transactions query failed, using defaults:', error.message);
        setTransactions(defaultTransactions);
        setLoading(false);
      });

      return () => unsubscribe();
    } catch (err) {
      console.warn('Failed to setup transactions listener:', err);
      setTransactions(defaultTransactions);
      setLoading(false);
    }
  }, [defaultTransactions]);

  return { transactions, loading, error };
}
