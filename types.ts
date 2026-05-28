/**
 * KILL 2 WIN TypeScript DB Schemas (Firebase Reference Structure)
 * This structure maps directly to Firestore Collections.
 */

export interface AppUser {
  uid: string;
  username: string;
  email: string;
  phone: string;
  walletBalance: number; // in Rupees / Coins (1 Coin = 1 Rupee)
  bonusAmount: number;
  joinedMatches: string[]; // List of Match IDs joined
  completedMatches: string[];
  fcmToken?: string;
  gameNickname?: string; // Persisted game nickname
}

export interface Game {
  id: string; // Document ID: e.g. "free_fire", "bgmi", etc.
  name: string;
  imageUrl: string;
  activeMatchesCount: number;
}

export interface Match {
  id: string; // Document ID
  gameId: string; // e.g. "free_fire"
  title: string; // e.g. "Battle Royale Solo Match"
  matchDateTime: string; // ISO String or Readable (e.g. "2026-05-28 at 06:00 PM")
  prizePool: number; // Total Pool (e.g. 500)
  perKill: number; // Prize per kill (e.g. 5)
  entryFee: number; // in Coins (e.g. 10 or 0 for Free)
  type: string; // Solo, Duo, Squad
  version: string; // TPP, FPP
  map: string; // e.g. Bermuda, Purgatory, Kalahari
  totalSlots: number; // e.g. 48
  joinedSlots: number; // e.g. 12
  joinedUsers: string[]; // List of User UIDs who registered
  joinedUsernames: string[]; // Pre-fetched list of registered game names for manual entry
  userSlots?: { [uid: string]: number }; // Chosen slots for registered users
  status: 'upcoming' | 'ongoing' | 'completed';
  imageUrl?: string; // Optional custom Match banner image URL (e.g. imgbb)
  roomId?: string; // Set when transitioning to ongoing
  roomPassword?: string; // Set when transitioning to ongoing
  announcementSent?: boolean;
  resultDeclared?: boolean;
  results?: {
    [uid: string]: {
      username: string;
      kills: number;
      rank: number;
      winnings: number;
    };
  };
}

export interface JoinedUserDetail {
  uid: string;
  gameUsername: string; // Free Fire User Name provided during joining
  joinedAt: string;
  kills?: number; // Added by Admin on completion
  rank?: number; // Added by Admin on completion
  winnings?: number; // Added by Admin on completion
  paid?: boolean; // Payment status
}

export interface BannerItem {
  id: string;
  title: string;
  imageUrl: string;
  deepLink: string; // where to go inside app
  active: boolean;
}

export interface PushNotification {
  id: string;
  title: string;
  body: string;
  sentAt: string;
  targetTopic?: string; // "all", "match_<matchId>"
  targetMatchId?: string;
}

export interface WalletTransaction {
  id: string;
  uid: string;
  amount: number;
  type: 'deposit' | 'withdrawal' | 'entry_fee' | 'winnings' | 'bonus';
  status: 'pending' | 'approved' | 'rejected' | 'success' | 'failed' | 'Failed';
  paymentMethod?: string; // Paytm, PhonePe, UPI, GPay
  createdAt: string;
  utrNo?: string; // Txn Ref ID
}
