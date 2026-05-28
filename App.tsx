import React, { useState, useEffect } from 'react';
import { AppUser, Match, Game, BannerItem, PushNotification, WalletTransaction } from './types';
import UserApp from './components/UserApp';
import AdminPanel from './components/AdminPanel';
import { 
  Gamepad2, Settings, ShieldCheck, Eye, EyeOff, LayoutGrid, Smartphone, Laptop, 
  Sparkles, Check, Database, Flame, HelpCircle
} from 'lucide-react';

export default function App() {
  // Load states from LocalStorage or use realistic defaults (Starts empty for Matches as requested)
  
  // Default Games Categories
  const defaultGames: Game[] = [
    {
      id: "free_fire_br",
      name: "BATTLE ROYALE",
      imageUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=350",
      activeMatchesCount: 0
    },
    {
      id: "free_fire_survival",
      name: "FF SURVIVAL",
      imageUrl: "https://images.unsplash.com/photo-1560253023-3ec5d502959f?auto=format&fit=crop&q=80&w=350",
      activeMatchesCount: 0
    },
    {
      id: "free_fire_clash_squad",
      name: "CS/LW 1V1",
      imageUrl: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&q=80&w=350",
      activeMatchesCount: 0
    }
  ];

  // Default Promo Banners
  const defaultBanners: BannerItem[] = [
    {
      id: "banner_promo_rules",
      title: "KILL 2 WIN PVT CONTEST RULES | TAP TO READ",
      imageUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=600",
      deepLink: "wallet",
      active: true
    }
  ];

  // User details Default
  const defaultUser: AppUser = {
    uid: "usr_active_rohan",
    username: "Rohan Gamer",
    email: "rohan@gmail.com",
    phone: "9876543210",
    walletBalance: 150.00, // Starts with some money to join tourneys
    bonusAmount: 20.00,
    joinedMatches: [],
    completedMatches: []
  };

  const initialUsersCount: AppUser[] = [
    { uid: "rohan_123", username: "Rohan", email: "rohan@gmail.com", phone: "9876543210", walletBalance: 150.00, bonusAmount: 20.00, joinedMatches: [], completedMatches: [], gameNickname: "★ R O H A N ★" },
    { uid: "sniper_elite", username: "Sniper", email: "sniper@yahoo.com", phone: "9123456780", walletBalance: 50.00, bonusAmount: 10.00, joinedMatches: [], completedMatches: [], gameNickname: "🔥 SNIPER_OP" },
    { uid: "killa_instinct", username: "Killa", email: "killa@gmail.com", phone: "8881234567", walletBalance: 12.00, bonusAmount: 5.00, joinedMatches: [], completedMatches: [], gameNickname: "亗 K I L L A 亗" },
    { uid: "elite_scout", username: "Elite Scout", email: "scout@live.com", phone: "7009876543", walletBalance: 90.00, bonusAmount: 30.00, joinedMatches: [], completedMatches: [], gameNickname: "▄︻デScout══━" }
  ];

  // State Declarations
  const [currentUser, setCurrentUser] = useState<AppUser>(() => {
    const saved = localStorage.getItem('skillclash_user');
    return saved ? JSON.parse(saved) : defaultUser;
  });

  const [allUsers, setAllUsers] = useState<AppUser[]>(() => {
    const saved = localStorage.getItem('skillclash_all_users');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return initialUsersCount;
      }
    }
    return initialUsersCount;
  });

  const [games, setGames] = useState<Game[]>(() => {
    const saved = localStorage.getItem('skillclash_games');
    return saved ? JSON.parse(saved) : defaultGames;
  });

  const [banners, setBanners] = useState<BannerItem[]>(() => {
    const saved = localStorage.getItem('skillclash_banners');
    return saved ? JSON.parse(saved) : defaultBanners;
  });

  // MUST default to completely EMPTY match list requested by user!
  const [matches, setMatches] = useState<Match[]>(() => {
    const saved = localStorage.getItem('skillclash_matches');
    if (!saved) return [];
    try {
      const parsed: Match[] = JSON.parse(saved);
      const unique: Match[] = [];
      const seen = new Set<string>();
      for (const item of parsed) {
        if (item && item.id && !seen.has(item.id)) {
          seen.add(item.id);
          unique.push(item);
        }
      }
      return unique;
    } catch {
      return [];
    }
  });

  const [notifications, setNotifications] = useState<PushNotification[]>(() => {
    const saved = localStorage.getItem('skillclash_notifications');
    return saved ? JSON.parse(saved) : [];
  });

  const [transactions, setTransactions] = useState<WalletTransaction[]>(() => {
    const saved = localStorage.getItem('skillclash_transactions');
    if (!saved) return [];
    try {
      const parsed: WalletTransaction[] = JSON.parse(saved);
      const unique: WalletTransaction[] = [];
      const seen = new Set<string>();
      for (const item of parsed) {
        if (item && item.id && !seen.has(item.id)) {
          seen.add(item.id);
          unique.push(item);
        }
      }
      return unique;
    } catch {
      return [];
    }
  });

  // Platform simulation utilities
  const [isWorkspaceView, setIsWorkspaceView] = useState(() => {
    if (typeof window !== 'undefined') {
      const isUrlAdmin = window.location.search.includes('admin') || 
                        window.location.search.includes('workspace') ||
                        window.location.hash.includes('admin') ||
                        localStorage.getItem('kill2win_admin_active_session') === 'true';
      if (isUrlAdmin) {
        localStorage.setItem('kill2win_admin_active_session', 'true');
        return true;
      }
    }
    return false;
  });

  const [isMobileScreen, setIsMobileScreen] = useState(() => {
    return typeof window !== 'undefined' ? window.innerWidth < 768 : false;
  });

  const [splitScreen, setSplitScreen] = useState(true);
  const [activePane, setActivePane] = useState<'both' | 'user' | 'admin'>(() => {
    if (typeof window !== 'undefined') {
      const isUrlAdmin = window.location.search.includes('admin') || 
                        window.location.search.includes('workspace') ||
                        window.location.hash.includes('admin') ||
                        localStorage.getItem('kill2win_admin_active_session') === 'true';
      const isMobile = window.innerWidth < 768;
      if (isMobile) {
        return 'user'; // Mobile users get native Gamer view by default with no side-by-side crunching
      }
      return isUrlAdmin ? 'both' : 'user';
    }
    return 'user';
  });

  // Handle smart resizing to re-route workspace view modes cleanly
  useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth < 768;
      setIsMobileScreen(isMobile);
      if (isMobile) {
        setActivePane(current => current === 'both' ? 'user' : current);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const [systemAlertMessage, setSystemAlertMessage] = useState<string | null>(null);

  // Admin authentication passcode protection states
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [adminPasswordInput, setAdminPasswordInput] = useState('');
  const [adminSavedPassword, setAdminSavedPassword] = useState(() => {
    return localStorage.getItem('kill2win_admin_password') || 'admin123';
  });
  const [passwordErrorMessage, setPasswordErrorMessage] = useState('');

  // Maintenance & Update State
  const [maintenanceMode, setMaintenanceMode] = useState<boolean>(() => {
    return localStorage.getItem('kill2win_maintenance') === 'true';
  });
  const [appUpdateLink, setAppUpdateLink] = useState<string>(() => {
    return localStorage.getItem('kill2win_update_link') || 'https://kill2win.com/app-latest.apk';
  });

  // Support & Contact States
  const [contactWhatsApp, setContactWhatsApp] = useState<string>(() => {
    return localStorage.getItem('kill2win_contact_whatsapp') || '+91 91234 56789';
  });
  const [contactTelegram, setContactTelegram] = useState<string>(() => {
    return localStorage.getItem('kill2win_contact_telegram') || 'https://t.me/KILL2WINFFOfficial';
  });
  const [contactEmail, setContactEmail] = useState<string>(() => {
    return localStorage.getItem('kill2win_contact_email') || 'support@kill2win.com';
  });

  // Sync back to localstorage whenever state alters
  useEffect(() => {
    localStorage.setItem('kill2win_maintenance', maintenanceMode ? 'true' : 'false');
  }, [maintenanceMode]);

  useEffect(() => {
    localStorage.setItem('kill2win_update_link', appUpdateLink);
  }, [appUpdateLink]);

  useEffect(() => {
    localStorage.setItem('kill2win_contact_whatsapp', contactWhatsApp);
  }, [contactWhatsApp]);

  useEffect(() => {
    localStorage.setItem('kill2win_contact_telegram', contactTelegram);
  }, [contactTelegram]);

  useEffect(() => {
    localStorage.setItem('kill2win_contact_email', contactEmail);
  }, [contactEmail]);
  useEffect(() => {
    localStorage.setItem('skillclash_user', JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('skillclash_games', JSON.stringify(games));
  }, [games]);

  useEffect(() => {
    localStorage.setItem('skillclash_banners', JSON.stringify(banners));
  }, [banners]);

  useEffect(() => {
    // Synchronously check if there are duplicate matches by ID
    const seen = new Set<string>();
    let hasDuplicate = false;
    for (const m of matches) {
      if (m && m.id) {
        if (seen.has(m.id)) {
          hasDuplicate = true;
          break;
        }
        seen.add(m.id);
      }
    }
    if (hasDuplicate) {
      setMatches(prev => {
        const unique: Match[] = [];
        const uniqueSeen = new Set<string>();
        for (const m of prev) {
          if (m && m.id && !uniqueSeen.has(m.id)) {
            uniqueSeen.add(m.id);
            unique.push(m);
          }
        }
        return unique;
      });
    } else {
      localStorage.setItem('skillclash_matches', JSON.stringify(matches));
    }
  }, [matches]);

  useEffect(() => {
    localStorage.setItem('skillclash_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('skillclash_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('skillclash_all_users', JSON.stringify(allUsers));
  }, [allUsers]);

  // Keep our current player user balanced and synced globally in allUsers database
  useEffect(() => {
    setAllUsers(prev => {
      const matchFound = prev.some(u => u.uid === currentUser.uid);
      if (!matchFound) {
        return [...prev, currentUser];
      }
      return prev.map(u => {
        if (u.uid === currentUser.uid) {
          return {
            ...u,
            walletBalance: currentUser.walletBalance,
            bonusAmount: currentUser.bonusAmount,
            joinedMatches: currentUser.joinedMatches,
            completedMatches: currentUser.completedMatches,
            username: currentUser.username,
            phone: currentUser.phone,
            email: currentUser.email
          };
        }
        return u;
      });
    });
  }, [currentUser]);

  // Actions definitions
  const sendPushNotification = (title: string, body: string, targetMatchId?: string) => {
    const newNotify: PushNotification = {
      id: `notify_${Date.now()}`,
      title,
      body,
      sentAt: new Date().toLocaleTimeString(),
      targetMatchId
    };
    setNotifications(prev => [newNotify, ...prev]);

    // Automatically dismiss the push alert after 5 seconds to clear screen
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== newNotify.id));
    }, 6000);
  };

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // User requests a deposit or manual withdrawal
  const addTransaction = (amount: number, type: 'deposit' | 'withdrawal', method: string, utr?: string) => {
    const newTxn: WalletTransaction = {
      id: `txn_${Date.now()}_${Math.floor(Math.random() * 1000000)}`,
      uid: currentUser.uid,
      amount,
      type,
      status: (method === 'ZapUPI Auto-Pay') ? 'success' : 'pending',
      paymentMethod: method,
      createdAt: new Date().toISOString(),
      utrNo: utr || `WDL_UPI_${Date.now().toString().substring(6)}`
    };

    // If method is ZapUPI Auto-Pay, we bypass approval and credit user balance immediately
    if (method === 'ZapUPI Auto-Pay') {
      setCurrentUser(prev => ({
        ...prev,
        walletBalance: prev.walletBalance + amount
      }));
      newTxn.status = 'success';
    }

    setTransactions(prev => [newTxn, ...prev]);
  };

  // Admin approves transaction
  const handleApproveTransaction = (txnId: string) => {
    setTransactions(prev => prev.map(t => {
      if (t.id === txnId) {
        // Find corresponding user to credit if deposit, or mark withdrawal done
        if (t.type === 'deposit') {
          // If transaction belongs to Rohan
          if (t.uid === currentUser.uid) {
            setCurrentUser(p => ({ ...p, walletBalance: p.walletBalance + t.amount }));
          }
        }
        return { ...t, status: 'success' };
      }
      return t;
    }));
    alert("Transaction completed successfully! Balance is credited.");
  };

  // Admin rejects transaction
  const handleRejectTransaction = (txnId: string) => {
    setTransactions(prev => prev.map(t => {
      if (t.id === txnId) {
        return { ...t, status: 'rejected' };
      }
      return t;
    }));
  };

  // User registers for a match
  const joinMatchAction = (matchId: string, gameUsername: string, slotNo?: number) => {
    const targetMatch = matches.find(m => m.id === matchId);
    if (!targetMatch) return;

    // Deduct entry fee
    setCurrentUser(p => ({
      ...p,
      walletBalance: p.walletBalance - targetMatch.entryFee,
      joinedMatches: [...p.joinedMatches, matchId]
    }));

    // Log entry fee transaction ledger with a guaranteed unique key
    const uniqueTxnId = `txn_fee_${matchId}_${Date.now()}_${Math.floor(Math.random() * 1000000)}`;
    setTransactions(t => [
      {
        id: uniqueTxnId,
        uid: currentUser.uid,
        amount: targetMatch.entryFee,
        type: 'entry_fee',
        status: 'success',
        paymentMethod: 'In-App Wallet',
        createdAt: new Date().toISOString(),
        utrNo: `REG_OUT_${matchId.substring(0, 5)}`
      },
      ...t
    ]);

    // Update match slots
    setMatches(prev => prev.map(m => {
      if (m.id === matchId) {
        const virtualPlayers = ['Aman_Solo_Killa', 'CS_Duo_Master', 'Deepak_Boss', 'Waseem_Gamer'];
        const updatedUsers = [currentUser.uid, ...virtualPlayers.map((name, i) => `usr_virt_${i}_${Date.now()}_${Math.floor(Math.random() * 1000)}`)];
        const updatedNames = [gameUsername, ...virtualPlayers];

        const slotsMap = m.userSlots ? { ...m.userSlots } : {};
        if (slotNo) {
          slotsMap[currentUser.uid] = slotNo;
        }

        return {
          ...m,
          joinedSlots: m.joinedSlots + 5,
          joinedUsers: [...m.joinedUsers, ...updatedUsers],
          joinedUsernames: [...m.joinedUsernames, ...updatedNames],
          userSlots: slotsMap
        };
      }
      return m;
    }));
  };

  // Admin adds a match
  const addMatchFromAdmin = (newMatch: Partial<Match>) => {
    const fullMatch: Match = {
      id: `match_${Date.now()}_${Math.floor(Math.random() * 1000000)}`,
      gameId: newMatch.gameId || 'free_fire_br',
      title: newMatch.title || 'Dynamic Tourney',
      matchDateTime: newMatch.matchDateTime || '2026-05-28 at 06:00 PM',
      prizePool: newMatch.prizePool || 500,
      perKill: newMatch.perKill || 5,
      entryFee: newMatch.entryFee || 10,
      type: newMatch.type || 'Solo',
      version: newMatch.version || 'TPP',
      map: newMatch.map || 'Bermuda',
      totalSlots: newMatch.totalSlots || 48,
      joinedSlots: 0,
      joinedUsers: [],
      joinedUsernames: [],
      status: 'upcoming',
      imageUrl: newMatch.imageUrl
    };

    setMatches(prev => [...prev, fullMatch]);
  };

  // Reset demo simulator function to wipe all states back to blank
  const resetSimulatorState = () => {
    if (confirm("Are you sure you want to delete all matches, transactions and reset balances? This simulates a fresh Firestore boot!")) {
      localStorage.clear();
      setCurrentUser(defaultUser);
      setMatches([]);
      setTransactions([]);
      setNotifications([]);
      setBanners(defaultBanners);
      setGames(defaultGames);
      alert("Simulator database wiped clean successfully!");
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 font-sans text-stone-100 flex flex-col selection:bg-indigo-600 selection:text-white">
      
      {/* Simulation Workspace Header Control Bar (Only shown on Desktop md and up) */}
      {isWorkspaceView && (
        <header className="hidden md:flex bg-zinc-900/95 border-b border-zinc-800 p-4 sticky top-0 z-50 backdrop-blur justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-indigo-600 text-white flex items-center justify-center rounded-xl shadow-md border border-indigo-500/20">
              <Flame size={20} className="animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display font-black text-sm tracking-tight text-white uppercase">
                  KILL <span className="text-orange-500 font-bold">2 WIN</span> Developer Hub
                </span>
                <span className="bg-orange-500/10 border border-orange-500/30 text-orange-500 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase font-mono">Workspace Enabled</span>
              </div>
              <p className="text-stone-400 text-[11px]">Test reactive payments, match rosters, and withdraw approvals in real-time</p>
            </div>
          </div>

          {/* Dynamic Controls Switchers */}
          <div className="flex items-center gap-2 flex-wrap">
            {!isMobileScreen && (
              <button 
                onClick={() => setActivePane('both')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition flex items-center gap-1.5 cursor-pointer ${activePane === 'both' ? 'bg-indigo-600 text-white border-indigo-500 shadow-lg shadow-indigo-600/20' : 'bg-zinc-850 text-zinc-400 border-zinc-700 hover:text-white'}`}
              >
                <LayoutGrid size={13} /> Side-by-Side Dual View
              </button>
            )}
            <button 
              onClick={() => setActivePane('user')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition flex items-center gap-1.5 cursor-pointer ${activePane === 'user' ? 'bg-indigo-600 text-white border-indigo-500 shadow-lg shadow-indigo-600/20' : 'bg-zinc-850 text-zinc-400 border-zinc-700 hover:text-white'}`}
            >
              <Smartphone size={13} /> Gamer Client App
            </button>
            <button 
              onClick={() => setActivePane('admin')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition flex items-center gap-1.5 cursor-pointer ${activePane === 'admin' ? 'bg-indigo-600 text-white border-indigo-500 shadow-lg shadow-indigo-600/20' : 'bg-zinc-850 text-zinc-400 border-zinc-700 hover:text-white'}`}
            >
              <Laptop size={13} /> Administrative Hub
            </button>

            <button 
              onClick={() => {
                localStorage.setItem('kill2win_admin_active_session', 'false');
                window.location.search = '';
                setIsWorkspaceView(false);
                setActivePane('user');
              }}
              className="px-3 py-1.5 bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-900/40 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
              title="Exit Dev Workspace to view as a clean, normal user"
            >
              Exit Developer View
            </button>

            <button 
              onClick={resetSimulatorState}
              className="px-3 py-1.5 bg-zinc-950 text-rose-400 hover:bg-rose-950/40 border border-rose-900/30 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
              title="Wipe database local entries to start fresh matches creation"
            >
              Wipe DB
            </button>
          </div>
        </header>
      )}

      {/* Modern, Floating workspace toggler pill for Mobile / Vertical screens only */}
      {isWorkspaceView && isMobileScreen && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[999] bg-zinc-900/95 border border-zinc-800/80 backdrop-blur-lg rounded-full px-2 py-1.5 shadow-2xl shadow-black/90 flex items-center gap-2 min-w-[290px] justify-between">
          <button
            onClick={() => setActivePane('user')}
            className={`flex-1 py-1.5 rounded-full text-[11px] font-bold tracking-wide uppercase px-3 transition flex items-center justify-center gap-1.5 ${
              activePane === 'user'
                ? 'bg-amber-500 text-zinc-950 font-black shadow-lg shadow-amber-500/20'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Smartphone size={12} /> Gamer App
          </button>
          
          <button
            onClick={() => setActivePane('admin')}
            className={`flex-1 py-1.5 rounded-full text-[11px] font-bold tracking-wide uppercase px-3 transition flex items-center justify-center gap-1.5 ${
              activePane === 'admin'
                ? 'bg-indigo-600 text-white font-bold shadow-lg shadow-indigo-600/30'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Laptop size={12} /> Admin Area
          </button>

          <span className="w-[1px] h-4 bg-zinc-800" />

          <button
            onClick={() => {
              localStorage.setItem('kill2win_admin_active_session', 'false');
              window.location.search = '';
              setIsWorkspaceView(false);
              setActivePane('user');
            }}
            className="p-1 px-1.5 text-[10px] bg-rose-950/40 text-rose-400 hover:text-rose-300 rounded border border-rose-900/30"
            title="Exit Workspace"
          >
            Exit
          </button>
        </div>
      )}

      {/* Main Container Layout */}
      {isWorkspaceView ? (
        <main className={`flex-1 w-full mx-auto select-none flex justify-center items-start ${activePane === 'both' ? 'p-4 md:p-6 max-w-7xl gap-6' : 'p-0 md:p-6'}`}>
          
          {/* LEFT COMPONENT - USER ANDROID EMULATOR */}
          {(activePane === 'both' || activePane === 'user') && (
            <div className={`flex flex-col items-center ${activePane === 'both' ? 'shrink-0' : 'w-full min-h-screen md:min-h-0'}`}>
              {activePane === 'both' && (
                <div className="mb-2 text-center">
                  <span className="text-zinc-500 text-[10px] font-black uppercase tracking-widest block font-mono">📱 EMULATOR WORKSPACE</span>
                  <p className="text-[11px] text-zinc-400">Interact below like a standard mobile player</p>
                </div>
              )}
              
              <UserApp 
                currentUser={currentUser}
                setCurrentUser={setCurrentUser}
                matches={matches}
                setMatches={setMatches}
                games={games}
                banners={banners}
                notifications={notifications}
                dismissNotification={dismissNotification}
                transactions={transactions}
                addTransaction={addTransaction}
                joinMatchAction={joinMatchAction}
                maintenanceMode={maintenanceMode}
                appUpdateLink={appUpdateLink}
                contactWhatsApp={contactWhatsApp}
                contactTelegram={contactTelegram}
                contactEmail={contactEmail}
                isStandalone={activePane === 'user'}
              />
            </div>
          )}

          {/* RIGHT COMPONENT - ADMINISTRATIVE WORKSPACE */}
          {(activePane === 'both' || activePane === 'admin') && (
            <div className={`h-full ${activePane === 'both' ? 'flex-1 min-w-[320px]' : 'w-full max-w-4xl mx-auto p-4 md:p-0'}`}>
              {activePane === 'both' && (
                <div className="mb-2 text-left">
                  <span className="text-zinc-500 text-[10px] font-black uppercase tracking-widest block font-mono">💻 ADMIN CONTROL DESK</span>
                  <p className="text-[11px] text-zinc-400 font-mono text-indigo-400">Reactive Firestore Emulator Active</p>
                </div>
              )}

              {isAdminAuthenticated ? (
                <AdminPanel 
                  allUsers={allUsers}
                  setAllUsers={setAllUsers}
                  currentUser={currentUser}
                  setCurrentUser={setCurrentUser}
                  matches={matches}
                  setMatches={setMatches}
                  games={games}
                  setGames={setGames}
                  banners={banners}
                  setBanners={setBanners}
                  notifications={notifications}
                  sendPushNotification={sendPushNotification}
                  transactions={transactions}
                  setTransactions={setTransactions}
                  handleApproveTransaction={handleApproveTransaction}
                  handleRejectTransaction={handleRejectTransaction}
                  addMatchFromAdmin={addMatchFromAdmin}
                  maintenanceMode={maintenanceMode}
                  setMaintenanceMode={setMaintenanceMode}
                  appUpdateLink={appUpdateLink}
                  setAppUpdateLink={setAppUpdateLink}
                  contactWhatsApp={contactWhatsApp}
                  setContactWhatsApp={setContactWhatsApp}
                  contactTelegram={contactTelegram}
                  setContactTelegram={setContactTelegram}
                  contactEmail={contactEmail}
                  setContactEmail={setContactEmail}
                  adminSavedPassword={adminSavedPassword}
                  setAdminSavedPassword={setAdminSavedPassword}
                />
              ) : (
                <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 flex flex-col items-center justify-center min-h-[580px] h-[780px] text-center space-y-6">
                  <div className="w-16 h-16 bg-red-500/10 border border-red-500/30 text-rose-500 flex items-center justify-center rounded-2xl animate-pulse">
                    <ShieldCheck size={32} />
                  </div>
                  <div className="space-y-2 max-w-sm">
                    <h3 className="font-display font-black text-lg uppercase tracking-wide text-white">ADMIN PORTAL IS LOCKED</h3>
                    <p className="text-zinc-400 text-xs text-balance leading-relaxed">
                      Enter passcode to manage tournaments, approve deposits, or trigger system alerts.
                    </p>
                  </div>
                  
                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (adminPasswordInput === adminSavedPassword) {
                        setIsAdminAuthenticated(true);
                        setPasswordErrorMessage('');
                      } else {
                        setPasswordErrorMessage('Incorrect admin passcode!');
                      }
                    }}
                    className="w-full max-w-xs space-y-3"
                  >
                    <div className="relative">
                      <input 
                        type="password" 
                        value={adminPasswordInput}
                        onChange={(e) => setAdminPasswordInput(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-800 focus:border-indigo-500 text-center rounded-xl py-2.5 px-4 text-xs font-mono outline-none tracking-widest text-white placeholder:tracking-normal placeholder:font-sans placeholder:text-zinc-500 h-[40px]"
                        placeholder="ENTER PIN / PASSWORD"
                        required
                      />
                    </div>
                    {passwordErrorMessage && (
                      <p className="text-rose-500 text-[10px] font-bold tracking-wide animate-pulse">{passwordErrorMessage}</p>
                    )}
                    <button 
                      type="submit"
                      className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2.5 rounded-xl text-xs uppercase tracking-wider transition cursor-pointer active:scale-95 shadow-md shadow-indigo-600/10"
                    >
                      UNLOCK DASHBOARD ACCESS
                    </button>
                    <p className="text-[10px] text-zinc-500">
                      Default PIN: <span className="text-indigo-400 font-bold">{adminSavedPassword}</span>
                    </p>
                  </form>
                </div>
              )}
            </div>
          )}

        </main>
      ) : (
        <main className="flex-1 w-full flex justify-center items-center min-h-screen p-0 md:p-6 select-none bg-neutral-950">
          <UserApp 
            currentUser={currentUser}
            setCurrentUser={setCurrentUser}
            matches={matches}
            setMatches={setMatches}
            games={games}
            banners={banners}
            notifications={notifications}
            dismissNotification={dismissNotification}
            transactions={transactions}
            addTransaction={addTransaction}
            joinMatchAction={joinMatchAction}
            maintenanceMode={maintenanceMode}
            appUpdateLink={appUpdateLink}
            contactWhatsApp={contactWhatsApp}
            contactTelegram={contactTelegram}
            contactEmail={contactEmail}
            isStandalone={true}
          />
        </main>
      )}

      {/* Real-time Event simulation status bar footer (Only on desktop and workspace mode) */}
      {isWorkspaceView && !isMobileScreen && (
        <footer className="bg-zinc-900 border-t border-zinc-800 p-3 px-6 text-center text-xs text-zinc-500 font-mono">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2">
            <span>KILL 2 WIN Workspace Engine Core v1.1 • Fully Reactive Simulated Architecture</span>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></span>
              <span className="text-zinc-400">Local Cache: <strong className="text-white">Active Sync Mode</strong></span>
            </div>
          </div>
        </footer>
      )}

    </div>
  );
}
