import React, { useState, useEffect } from 'react';
import { 
  PlusCircle, Database, Megaphone, Check, X, ShieldAlert, Coins, Users, Gamepad2, 
  Trash2, MessageSquare, Terminal, RefreshCw, Send, CheckCircle, Smartphone, Flame, ChevronRight, Download, FileCode, CheckSquare, Award, Settings
} from 'lucide-react';
import { AppUser, Match, Game, BannerItem, PushNotification, WalletTransaction, JoinedUserDetail } from '../types';
import { FIREBASE_GUIDE_CONTENT } from '../data/firebaseGuide';

interface AdminPanelProps {
  currentUser: AppUser;
  setCurrentUser: React.Dispatch<React.SetStateAction<AppUser>>;
  matches: Match[];
  setMatches: React.Dispatch<React.SetStateAction<Match[]>>;
  games: Game[];
  setGames: React.Dispatch<React.SetStateAction<Game[]>>;
  banners: BannerItem[];
  setBanners: React.Dispatch<React.SetStateAction<BannerItem[]>>;
  notifications: PushNotification[];
  sendPushNotification: (title: string, body: string, targetMatchId?: string) => void;
  transactions: WalletTransaction[];
  setTransactions: React.Dispatch<React.SetStateAction<WalletTransaction[]>>;
  handleApproveTransaction: (txnId: string) => void;
  handleRejectTransaction: (txnId: string) => void;
  addMatchFromAdmin: (newMatch: Partial<Match>) => void;
  maintenanceMode: boolean;
  setMaintenanceMode: React.Dispatch<React.SetStateAction<boolean>>;
  appUpdateLink: string;
  setAppUpdateLink: React.Dispatch<React.SetStateAction<string>>;
  allUsers: AppUser[];
  setAllUsers: React.Dispatch<React.SetStateAction<AppUser[]>>;
  contactWhatsApp: string;
  setContactWhatsApp: React.Dispatch<React.SetStateAction<string>>;
  contactTelegram: string;
  setContactTelegram: React.Dispatch<React.SetStateAction<string>>;
  contactEmail: string;
  setContactEmail: React.Dispatch<React.SetStateAction<string>>;
  adminSavedPassword?: string;
  setAdminSavedPassword?: React.Dispatch<React.SetStateAction<string>>;
}

export default function AdminPanel({
  currentUser,
  setCurrentUser,
  matches,
  setMatches,
  games,
  setGames,
  banners,
  setBanners,
  notifications,
  sendPushNotification,
  transactions,
  setTransactions,
  handleApproveTransaction,
  handleRejectTransaction,
  addMatchFromAdmin,
  maintenanceMode,
  setMaintenanceMode,
  appUpdateLink,
  setAppUpdateLink,
  allUsers,
  setAllUsers,
  contactWhatsApp,
  setContactWhatsApp,
  contactTelegram,
  setContactTelegram,
  contactEmail,
  setContactEmail,
  adminSavedPassword,
  setAdminSavedPassword,
}: AdminPanelProps) {
  // Navigation tabs of web admin panel
  const [activeTab, setActiveTab] = useState<'matches' | 'games' | 'payments' | 'banners' | 'notifications' | 'guide' | 'settings' | 'users'>('matches');

  // Add Match state managers
  const [matchTitle, setMatchTitle] = useState('');
  const [selectedGameId, setSelectedGameId] = useState(games[0]?.id || 'free_fire');
  const [matchDateTime, setMatchDateTime] = useState('2026-05-28 at 06:00 PM');
  const [schedDate, setSchedDate] = useState('2026-05-28');
  const [schedHour, setSchedHour] = useState(18); // default 6:00 PM
  const [schedMinute, setSchedMinute] = useState(0); // default 00

  // Analog Time Picker dialog states
  const [isTimePickerOpen, setIsTimePickerOpen] = useState(false);
  const [pickerHour, setPickerHour] = useState(6);
  const [pickerMinute, setPickerMinute] = useState(0);
  const [pickerAmPm, setPickerAmPm] = useState<'AM' | 'PM'>('PM');
  const [pickerMode, setPickerMode] = useState<'hour' | 'minute'>('hour');

  React.useEffect(() => {
    const ampm = schedHour >= 12 ? 'PM' : 'AM';
    const displayHour = schedHour % 12 === 0 ? 12 : schedHour % 12;
    const displayMin = schedMinute < 10 ? `0${schedMinute}` : schedMinute;
    const formattedHour = displayHour < 10 ? `0${displayHour}` : displayHour;
    setMatchDateTime(`${schedDate} at ${formattedHour}:${displayMin} ${ampm}`);
  }, [schedDate, schedHour, schedMinute]);

  const [prizePool, setPrizePool] = useState('500');
  const [perKill, setPerKill] = useState('5');
  const [entryFee, setEntryFee] = useState('10');
  const [matchType, setMatchType] = useState('Solo');
  const [version, setVersion] = useState('TPP');
  const [map, setMap] = useState('Bermuda');
  const [totalSlots, setTotalSlots] = useState('48');
  const [matchImageUrl, setMatchImageUrl] = useState('');

  // Add Game states
  const [newGameName, setNewGameName] = useState('');
  const [newGameImagePreset, setNewGameImagePreset] = useState('BATTLE ROYALE');
  const [newGameCustomImageUrl, setNewGameCustomImageUrl] = useState('');

  // Room code and Password prompt
  const [activeMatchForRoom, setActiveMatchForRoom] = useState<Match | null>(null);
  const [roomIdInput, setRoomIdInput] = useState('');
  const [roomPasswordInput, setRoomPasswordInput] = useState('');

  // Manual Result declaration active match states
  const [activeMatchForResults, setActiveMatchForResults] = useState<Match | null>(null);
  const [scoringPlayers, setScoringPlayers] = useState<{ [uid: string]: { kills: number; rank: number; winnings: number } }>({});

  // Banners state
  const [bannerTitle, setBannerTitle] = useState('');
  const [bannerPreset, setBannerPreset] = useState('Cyber Campaign');
  const [bannerDeepLink, setBannerDeepLink] = useState('wallet');
  const [bannerCustomImageUrl, setBannerCustomImageUrl] = useState('');

  // Push notification state
  const [pushTitle, setPushTitle] = useState('');
  const [pushBody, setPushBody] = useState('');

  // User management / balance adjustments states
  const [searchUserQuery, setSearchUserQuery] = useState('');
  const [selectedUserForAdjust, setSelectedUserForAdjust] = useState<AppUser | null>(null);
  const [adjustmentType, setAdjustmentType] = useState<'credit' | 'debit'>('credit');
  const [adjustmentAmount, setAdjustmentAmount] = useState('');
  const [adjustmentReason, setAdjustmentReason] = useState('');
  const [adjustmentReasonPreset, setAdjustmentReasonPreset] = useState('Completed Placement Match Reward');

  // Safe Notification Toasts & Safe Dialog Confirmation handlers (immune to iframe restrictions)
  const [toastNotification, setToastNotification] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);

  const triggerSafeAlert = (msg: string, type: 'success' | 'info' | 'error' = 'success') => {
    try {
      alert(msg);
    } catch (e) {
      console.warn("Native alert failed inside iframe sandbox:", e);
    }
    setToastNotification({ message: msg, type });
  };

  useEffect(() => {
    if (toastNotification) {
      const timer = setTimeout(() => {
        setToastNotification(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toastNotification]);

  // Presets dictionaries
  const GAME_PRESETS: { [key: string]: string } = {
    'BATTLE ROYALE': 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=350',
    'FF SURVIVAL': 'https://images.unsplash.com/photo-1560253023-3ec5d502959f?auto=format&fit=crop&q=80&w=350',
    'CS 1V1': 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&q=80&w=350',
    'CS 2V2': 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&q=80&w=350',
  };

  const BANNER_PRESETS: { [key: string]: string } = {
    'Cyber Campaign': 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=500',
    'Rules Banner': 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&q=80&w=500',
    'Summer Fest': 'https://images.unsplash.com/photo-1551103782-8ab07afd45c1?auto=format&fit=crop&q=80&w=500',
  };

  // Submit banner addition
  const handleAddBannerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bannerTitle.trim()) return;

    const finalImageUrl = bannerCustomImageUrl.trim() || BANNER_PRESETS[bannerPreset];

    const newBanner: BannerItem = {
      id: `banner_${Date.now()}`,
      title: bannerTitle,
      imageUrl: finalImageUrl,
      deepLink: bannerDeepLink,
      active: true,
    };

    setBanners([...banners, newBanner]);
    setBannerTitle('');
    setBannerCustomImageUrl('');
    triggerSafeAlert(`Banner "${bannerTitle}" added to current home carousels slide!`);
  };

  // Create new Game category
  const handleAddGameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGameName.trim()) return;

    const gameId = newGameName.toLowerCase().replace(/\s+/g, '_');
    if (games.some(g => g.id === gameId)) {
      triggerSafeAlert("Game theme already exists!", 'error');
      return;
    }

    const finalImageUrl = newGameCustomImageUrl.trim() || GAME_PRESETS[newGameImagePreset];

    const newGame: Game = {
      id: gameId,
      name: newGameName,
      imageUrl: finalImageUrl,
      activeMatchesCount: 0,
    };

    setGames([...games, newGame]);
    setNewGameName('');
    setNewGameCustomImageUrl('');
    triggerSafeAlert(`Game Category "${newGameName}" added successfully.`);
  };

  // Delete Game category
  const handleDeleteGame = (gameId: string, gameName: string) => {
    setConfirmDialog({
      title: "Delete Game Category",
      message: `Are you sure you want to delete the game category "${gameName}"? This will hide its match listings too.`,
      onConfirm: () => {
        setGames(prev => prev.filter(g => g.id !== gameId));
        triggerSafeAlert(`Game Category "${gameName}" has been deleted.`, 'success');
      }
    });
  };

  // Adjust user balance handles (credit / debit with reasons)
  const handleCommitUserAdjustment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserForAdjust) return;

    const amountNum = parseFloat(adjustmentAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      alert("Please enter a valid amount greater than 0!");
      return;
    }

    const finalReason = adjustmentReason.trim() || adjustmentReasonPreset;
    if (!finalReason) {
      alert("Please specify a reason for this credit or debit adjustment!");
      return;
    }

    const currentBalance = selectedUserForAdjust.walletBalance;
    let newBalance = currentBalance;

    if (adjustmentType === 'credit') {
      newBalance = currentBalance + amountNum;
    } else {
      if (currentBalance < amountNum) {
        const proceed = window.confirm(`Note: User's balance is ₹${currentBalance}, which is less than the debit amount ₹${amountNum}. Allow negative balance?`);
        if (!proceed) return;
      }
      newBalance = currentBalance - amountNum;
    }

    // Update in allUsers list
    setAllUsers(prev => prev.map(u => {
      if (u.uid === selectedUserForAdjust.uid) {
        return { ...u, walletBalance: newBalance };
      }
      return u;
    }));

    // Update in currentUser state if same
    if (selectedUserForAdjust.uid === currentUser.uid) {
      setCurrentUser(prev => ({ ...prev, walletBalance: newBalance }));
    }

    // Record adjustment in wallet trace history
    const logTxn: WalletTransaction = {
      id: `txn_adj_${Date.now()}_${Math.floor(Math.random() * 1000000)}`,
      uid: selectedUserForAdjust.uid,
      amount: amountNum,
      type: adjustmentType === 'credit' ? 'deposit' : 'withdrawal',
      status: 'success',
      paymentMethod: `${adjustmentType === 'credit' ? 'Credited' : 'Debited'} by Admin (${finalReason})`,
      createdAt: new Date().toISOString(),
      utrNo: `ADJ_${adjustmentType === 'credit' ? 'CR' : 'DR'}_${Date.now().toString().substring(7)}`
    };
    setTransactions(prev => [logTxn, ...prev]);

    // Send push notification to target user so they receive the credit/debit alert instantly in emulator
    sendPushNotification(
      `Coins ${adjustmentType === 'credit' ? 'Credited 🎉' : 'Debited 💸'}`,
      `₹${amountNum} has been ${adjustmentType === 'credit' ? 'credited to' : 'debited from'} your wallet. Reason: ${finalReason}`
    );

    // Refresh selected user's view inside modal/form to reflect new balance
    setSelectedUserForAdjust(prev => prev ? { ...prev, walletBalance: newBalance } : null);
    
    // Alert success!
    alert(`Successfully ${adjustmentType === 'credit' ? 'credited' : 'debited'} ₹${amountNum} to ${selectedUserForAdjust.username}.\n\nReason logged: "${finalReason}"`);
    
    // Reset inputs
    setAdjustmentAmount('');
    setAdjustmentReason('');
  };

  // Submit Match addition
  const handleAddMatchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!matchTitle.trim()) return;

    const newMatchObj: Partial<Match> = {
      title: matchTitle,
      gameId: selectedGameId,
      matchDateTime: matchDateTime,
      prizePool: parseFloat(prizePool) || 0,
      perKill: parseFloat(perKill) || 0,
      entryFee: parseFloat(entryFee) || 0,
      type: matchType,
      version: version,
      map: map,
      totalSlots: parseInt(totalSlots) || 48,
      imageUrl: matchImageUrl.trim() || undefined,
    };

    addMatchFromAdmin(newMatchObj);
    setMatchTitle('');
    setMatchImageUrl('');
    alert(`Tournament match series "${matchTitle}" added to active catalogue list!`);
  };

  // Switch Upcoming -> Ongoing (Prompt Room credentials)
  const openRoomSetup = (match: Match) => {
    setActiveMatchForRoom(match);
    setRoomIdInput(`Room_FF_${Math.floor(1000 + Math.random() * 9000)}`);
    setRoomPasswordInput(`${Math.floor(100 + Math.random() * 900)}`);
  };

  const handleGoOngoingSave = () => {
    if (!activeMatchForRoom) return;
    if (!roomIdInput.trim() || !roomPasswordInput.trim()) {
      alert("Please enter both Room ID and Password!");
      return;
    }

    // Move to ongoing
    setMatches(prev => prev.map(m => {
      if (m.id === activeMatchForRoom.id) {
        return {
          ...m,
          status: 'ongoing',
          roomId: roomIdInput,
          roomPassword: roomPasswordInput,
        };
      }
      return m;
    }));

    // Trigger Simulated FCM Push Notification to all joined users
    const joinedCount = activeMatchForRoom.joinedUsers.length;
    if (joinedCount > 0) {
      sendPushNotification(
        "🔥 Free Fire Room ID & PW is Ready!",
        `Join Room: ${roomIdInput} | Pass: ${roomPasswordInput} for match "${activeMatchForRoom.title}". Match starting in 15 mins!`,
        activeMatchForRoom.id
      );
    } else {
      // General alert if empty
      sendPushNotification(
        `🏆 Room Ready: ${activeMatchForRoom.title}`,
        `Match starting soon! Room Credentials have been dispatched to registered tickets.`
      );
    }

    alert(`Match status changed to ONGOING. Room credentials set, FCM notification triggered for isJoined users.`);
    setActiveMatchForRoom(null);
  };

  // Switch Ongoing -> Completed (Enable manual scoring board)
  const handleMarkCompleted = (match: Match) => {
    setMatches(prev => prev.map(m => {
      if (m.id === match.id) {
        return { ...m, status: 'completed' };
      }
      return m;
    }));
    alert(`Match status updated to COMPLETED. Ready for Manual Prize declarations.`);
  };

  // Launch manual result board for a completed match
  const startScoringResolution = (match: Match) => {
    setActiveMatchForResults(match);
    
    // Prefill scoring values structure
    const initialScoring: typeof scoringPlayers = {};
    match.joinedUsers.forEach((uid, index) => {
      const username = match.joinedUsernames[index] || "Gamer";
      // Auto suggestion prizes
      initialScoring[uid] = {
        kills: 0,
        rank: index + 1,
        winnings: (index === 0) ? Math.floor(match.prizePool * 0.4) : (index === 1) ? Math.floor(match.prizePool * 0.25) : 0
      };
    });
    setScoringPlayers(initialScoring);
  };

  // Commit manual scores & winnings payouts
  const handleSaveDeclareResult = () => {
    if (!activeMatchForResults) return;

    // Apply Wallet updates and log transaction history
    setTransactions(prev => {
      const newTransactions: WalletTransaction[] = [...prev];
      
      activeMatchForResults.joinedUsers.forEach((uid) => {
        const score = scoringPlayers[uid];
        if (score && score.winnings > 0) {
          // Append winnings record
          newTransactions.unshift({
            id: `txn_win_${activeMatchForResults.id}_${uid}_${Date.now()}`,
            uid: uid,
            amount: score.winnings,
            type: 'winnings',
            status: 'success',
            paymentMethod: 'In-App Wallet Manual',
            createdAt: new Date().toISOString(),
            utrNo: `REF_WIN_${activeMatchForResults.id.substring(0,6)}`
          });
        }
      });

      return newTransactions;
    });

    // Award balances to actively selected User profile if they won
    const activeScore = scoringPlayers[currentUser.uid];
    if (activeScore && activeScore.winnings > 0) {
      setCurrentUser(prev => ({
        ...prev,
        walletBalance: prev.walletBalance + activeScore.winnings
      }));
    }

    // Set resultDeclared to true
    setMatches(prev => prev.map(m => {
      if (m.id === activeMatchForResults.id) {
        const resultsMap: { [uid: string]: { username: string; kills: number; rank: number; winnings: number } } = {};
        m.joinedUsers.forEach((uid, idx) => {
          const score = scoringPlayers[uid];
          const username = m.joinedUsernames[idx] || "Gamer";
          if (score) {
            resultsMap[uid] = {
              username,
              kills: score.kills,
              rank: score.rank,
              winnings: score.winnings
            };
          }
        });
        return { ...m, resultDeclared: true, results: resultsMap };
      }
      return m;
    }));

    // Trigger FCM results announce
    sendPushNotification(
      `🏆 Results Out for ${activeMatchForResults.title}!`,
      "Prize winnings have been manually calculated and credited directly to you wallet. Check balance now!"
    );

    alert("Results declared manually! All gamers balances updated and transaction ledgers recorded instantly.");
    setActiveMatchForResults(null);
  };

  // Send global custom pushed alert (Admin UI)
  const submitCustomGlobalNotification = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pushTitle.trim() || !pushBody.trim()) return;

    sendPushNotification(pushTitle, pushBody);
    setPushTitle('');
    setPushBody('');
    alert("Global FCM Push Notification sent to all users!");
  };

  return (
    <div className="flex-1 bg-zinc-900 rounded-3xl p-6 border border-zinc-800 flex flex-col h-[780px] overflow-hidden justify-between">
      
      {/* Admin Panel Header */}
      <div className="flex justify-between items-center border-b border-zinc-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 px-2.5 bg-yellow-500 font-black text-[9px] text-zinc-950 uppercase rounded hover:scale-105 transition tracking-widest leading-none select-none">ADMIN HUB</span>
            <h1 className="font-display font-black text-xl text-white tracking-wide uppercase">KILL 2 WIN Manager Panel</h1>
          </div>
          <p className="text-xs text-zinc-400 mt-1">Add matches, games, manage payouts, result validation & rules guide securely.</p>
        </div>
        <div className="bg-zinc-800/80 px-4 py-1.5 rounded-xl border border-zinc-700/50 flex items-center gap-1.5 font-mono text-xs">
          <Terminal size={14} className="text-indigo-400 animate-pulse" />
          <span className="text-zinc-300">Sync: <span className="text-green-400 font-bold font-sans">Active</span></span>
        </div>
      </div>

      {/* Admin View Navigation Grid */}
      <div className="grid grid-cols-4 md:grid-cols-8 gap-1.5 mt-4">
        {[
          { id: 'matches', label: 'Match Manager', icon: Gamepad2 },
          { id: 'games', label: 'Game Modes', icon: Award },
          { id: 'payments', label: 'UPI Payouts', icon: Coins },
          { id: 'banners', label: 'UX Sliders', icon: Smartphone },
          { id: 'notifications', label: 'Push FCM', icon: Megaphone },
          { id: 'users', label: 'Users DB', icon: Users },
          { id: 'guide', label: 'Firebase Code', icon: Database },
          { id: 'settings', label: 'App Settings', icon: Settings },
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button 
               key={tab.id}
               onClick={() => setActiveTab(tab.id as any)}
               className={`py-2 px-0.5 flex flex-col items-center gap-1 text-[9.5px] md:text-[10px] font-bold rounded-xl border transition cursor-pointer ${
                 activeTab === tab.id 
                 ? 'bg-indigo-600/10 border-indigo-500 text-indigo-400' 
                 : 'bg-zinc-800/40 border-zinc-800 text-zinc-400 hover:text-zinc-200'
               }`}
            >
              <Icon size={13} />
              <span className="truncate w-full text-center">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Core Admin Screen Area */}
      <div className="flex-1 overflow-y-auto mt-4 pr-1 space-y-4">
        
        {/* MATCH MANAGEMENT TAB */}
        {activeTab === 'matches' && (
          <div className="space-y-4">
            {/* Create Match Panel */}
            <form onSubmit={handleAddMatchSubmit} className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 space-y-3.5">
              <div className="flex justify-between items-center pb-2 border-b border-zinc-800">
                <h3 className="font-display font-bold text-xs uppercase text-indigo-400 tracking-wider flex items-center gap-1.5">
                  <PlusCircle size={15} /> Add New Game Tournament Series
                </h3>
                <span className="text-[10px] text-zinc-500">(Custom Matches)</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="text-[10px] text-zinc-500 block uppercase font-mono">Tournament Match Title</label>
                  <input 
                    type="text" 
                    value={matchTitle} 
                    onChange={(e) => setMatchTitle(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-1.5 px-3 text-xs outline-none focus:border-indigo-500 mt-1" 
                    placeholder="e.g. Free Fire Bermuda Solo League"
                    required
                  />
                </div>

                <div>
                  <label className="text-[10px] text-zinc-500 block uppercase font-mono">Associate Game Category</label>
                  <select 
                    value={selectedGameId} 
                    onChange={(e) => setSelectedGameId(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-1.5 px-2 text-xs outline-none focus:border-indigo-500 mt-1"
                  >
                    {games.map(g => (
                      <option key={g.id} value={g.id}>{g.name}</option>
                    ))}
                  </select>
                </div>

                <div className="col-span-2 bg-zinc-950 p-4 border border-zinc-900 rounded-xl space-y-3.5 mt-2">
                  <div className="flex justify-between items-center pb-2 border-b border-zinc-900">
                    <span className="text-[10px] text-indigo-400 font-extrabold uppercase font-mono tracking-wider">🎯 Match Date & Time Scheduler</span>
                    <span className="bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-[11px] font-bold px-2.5 py-0.5 rounded font-mono">
                      {matchDateTime}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Date Pick */}
                    <div>
                      <label className="text-[9px] text-zinc-500 block uppercase font-mono mb-1">Select Day</label>
                      <input 
                        type="date" 
                        value={schedDate} 
                        onChange={(e) => setSchedDate(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-850 rounded-lg py-1.5 px-3 text-xs outline-none focus:border-indigo-500 font-mono text-zinc-100"
                        required 
                      />
                    </div>

                    {/* Time Trigger (Opens Analog Selector Modal) */}
                    <div>
                      <label className="text-[9px] text-zinc-500 block uppercase font-mono mb-1">Select Time (Analog Clock)</label>
                      <button
                        type="button"
                        onClick={() => {
                          const displayHour = schedHour % 12 === 0 ? 12 : schedHour % 12;
                          setPickerHour(displayHour);
                          setPickerMinute(schedMinute);
                          setPickerAmPm(schedHour >= 12 ? 'PM' : 'AM');
                          setPickerMode('hour');
                          setIsTimePickerOpen(true);
                        }}
                        className="w-full bg-zinc-900 hover:bg-zinc-850 border border-zinc-850 hover:border-zinc-800 text-zinc-100 hover:text-white rounded-lg py-1.5 px-3 text-xs flex items-center justify-between transition font-mono h-[34px]"
                      >
                        <span className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
                          <span>
                            {(() => {
                              const displayHour = schedHour % 12 === 0 ? 12 : schedHour % 12;
                              const displayMin = schedMinute < 10 ? `0${schedMinute}` : schedMinute;
                              const ampm = schedHour >= 12 ? 'PM' : 'AM';
                              const formattedHour = displayHour < 10 ? `0${displayHour}` : displayHour;
                              return `${formattedHour}:${displayMin} ${ampm}`;
                            })()}
                          </span>
                        </span>
                        <span className="text-[9px] font-extrabold text-indigo-400 uppercase tracking-wide">
                          SET TIME ⏰
                        </span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Custom Analog Clock Time Picker Dialog (Based on user screenshot) */}
                {isTimePickerOpen && (
                  <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-[310px] shadow-2xl overflow-hidden text-zinc-900 border border-zinc-200">
                      {/* Title Header matching the screenshot */}
                      <div className="p-4 pb-3 border-b border-zinc-100 flex justify-between items-center bg-zinc-50/50">
                        <h3 className="font-semibold text-zinc-800 text-sm">Select Time</h3>
                        <span className="text-[9px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded uppercase tracking-wider font-mono">
                          {pickerMode === 'hour' ? 'Selecting Hour' : 'Selecting Minute'}
                        </span>
                      </div>

                      <div className="p-4 space-y-4 flex flex-col items-center">
                        {/* Time display indicator widgets */}
                        <div className="flex items-center gap-3.5 select-none justify-center w-full">
                          {/* Hour selector box */}
                          <button
                            type="button"
                            onClick={() => setPickerMode('hour')}
                            className={`w-14 h-11 text-center font-bold text-lg rounded-xl flex items-center justify-center transition border ${
                              pickerMode === 'hour'
                                ? 'bg-indigo-500/10 border-indigo-500 text-indigo-600'
                                : 'bg-zinc-50 border-zinc-200 text-zinc-500 hover:bg-zinc-100'
                            }`}
                          >
                            {pickerHour < 10 ? `0${pickerHour}` : pickerHour}
                          </button>

                          {/* Divider colon */}
                          <span className="text-zinc-400 font-extrabold text-lg select-none">:</span>

                          {/* Minute selector box */}
                          <button
                            type="button"
                            onClick={() => setPickerMode('minute')}
                            className={`w-14 h-11 text-center font-bold text-lg rounded-xl flex items-center justify-center transition border ${
                              pickerMode === 'minute'
                                ? 'bg-indigo-500/10 border-indigo-500 text-indigo-600'
                                : 'bg-zinc-50 border-zinc-200 text-zinc-500 hover:bg-zinc-100'
                            }`}
                          >
                            {pickerMinute < 10 ? `0${pickerMinute}` : pickerMinute}
                          </button>

                          {/* AM / PM selector */}
                          <div className="flex items-center gap-2 ml-1 border-l border-zinc-200 pl-4 h-6">
                            <button
                              type="button"
                              onClick={() => setPickerAmPm('AM')}
                              className={`text-xs font-black uppercase transition-all tracking-wider ${
                                pickerAmPm === 'AM'
                                  ? 'text-indigo-600 scale-110 font-black'
                                  : 'text-zinc-400 hover:text-zinc-600'
                              }`}
                            >
                              AM
                            </button>
                            <span className="text-zinc-350 font-light text-[10px]">/</span>
                            <button
                              type="button"
                              onClick={() => setPickerAmPm('PM')}
                              className={`text-xs font-black uppercase transition-all tracking-wider ${
                                pickerAmPm === 'PM'
                                  ? 'text-indigo-600 scale-110 font-black'
                                  : 'text-zinc-400 hover:text-zinc-600'
                              }`}
                            >
                              PM
                            </button>
                          </div>
                        </div>

                        {/* Interactive Clock Dial face */}
                        <div className="w-[190px] h-[190px] border border-zinc-200 bg-zinc-50/50 rounded-full relative flex items-center justify-center p-2 shadow-inner mt-2">
                          {/* Dial Central core hub pin */}
                          <div className="absolute w-2.5 h-2.5 bg-indigo-500 rounded-full z-10 shadow border border-white"></div>

                          {/* Dial Hour or Minute numbering marks */}
                          {(() => {
                            const dialItems = pickerMode === 'hour'
                              ? [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
                              : [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];

                            return dialItems.map((val) => {
                              const idx = dialItems.indexOf(val);
                              const angleDeg = idx * 30 - 90;
                              const angleRad = (angleDeg * Math.PI) / 180;

                              const radius = 68; // exact positioning margin
                              const xPos = radius * Math.cos(angleRad);
                              const yPos = radius * Math.sin(angleRad);

                              const isUserSelected = pickerMode === 'hour'
                                ? pickerHour === val
                                : pickerMinute === val;

                              const labelText = val < 10 ? `0${val}` : `${val}`;

                              return (
                                <button
                                  key={val}
                                  type="button"
                                  onClick={() => {
                                    if (pickerMode === 'hour') {
                                      setPickerHour(val);
                                      // Delay slightly for visual feedback then switch to minutes
                                      setTimeout(() => setPickerMode('minute'), 250);
                                    } else {
                                      setPickerMinute(val);
                                    }
                                  }}
                                  style={{
                                    transform: `translate(${xPos}px, ${yPos}px)`,
                                  }}
                                  className={`absolute w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold transition-all duration-200 cursor-pointer ${
                                    isUserSelected
                                      ? 'bg-indigo-600 text-white font-extrabold z-20 shadow-md shadow-indigo-600/30 ring-2 ring-indigo-500/20'
                                      : 'text-zinc-500 hover:text-indigo-600 hover:bg-zinc-200/50'
                                  }`}
                                >
                                  {labelText}
                                </button>
                              );
                            });
                          })()}

                          {/* Indicator clock pointer vector hand */}
                          {(() => {
                            const dialItems = pickerMode === 'hour'
                              ? [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
                              : [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];
                            const activeValue = pickerMode === 'hour' ? pickerHour : pickerMinute;

                            // Handle snap value for manual increments in minutes
                            let snapVal = activeValue;
                            if (pickerMode === 'minute') {
                              const nearest = Math.round(activeValue / 5) * 5;
                              snapVal = nearest >= 60 ? 0 : nearest;
                            }

                            const positionIdx = dialItems.indexOf(snapVal);
                            if (positionIdx !== -1) {
                              const angleDeg = positionIdx * 30 - 90;
                              return (
                                <div
                                  style={{
                                    transform: `rotate(${angleDeg}deg)`,
                                    transformOrigin: 'left center',
                                    width: '68px',
                                    left: '50%',
                                    top: '50%',
                                  }}
                                  className="absolute h-[2px] bg-indigo-500 pointer-events-none transition-transform duration-300 flex items-center justify-end"
                                >
                                  <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full mr-[-3px] border border-white"></div>
                                </div>
                              );
                            }
                            return null;
                          })()}
                        </div>

                        {/* Slider for Minute granularity */}
                        {pickerMode === 'minute' && (
                          <div className="w-full px-4 text-center">
                            <div className="flex justify-between items-center text-[9px] text-zinc-400 font-bold tracking-wide mb-1 mb-1.5">
                              <span>FINE-TUNE MINUTES:</span>
                              <span className="text-zinc-700 font-black font-mono">{pickerMinute}m</span>
                            </div>
                            <input
                              type="range"
                              min="0"
                              max="59"
                              value={pickerMinute}
                              onChange={(e) => setPickerMinute(parseInt(e.target.value))}
                              className="w-full h-1.5 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                            />
                          </div>
                        )}
                      </div>

                      {/* Cancel / Apply Dialog Footer Controls matching screenshot */}
                      <div className="p-4 bg-zinc-50 border-t border-zinc-100 flex justify-end gap-2.5">
                        <button
                          type="button"
                          onClick={() => setIsTimePickerOpen(false)}
                          className="px-4 py-2 text-xs font-bold text-zinc-500 hover:text-zinc-800 transition rounded-xl"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            // Convert back to 24-hours representation
                            let finalHour = pickerHour % 12;
                            if (pickerAmPm === 'PM') {
                              finalHour += 12;
                            }
                            setSchedHour(finalHour);
                            setSchedMinute(pickerMinute);
                            setIsTimePickerOpen(false);
                          }}
                          className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl transition shadow-md shadow-indigo-600/10 active:scale-95"
                        >
                          Apply
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-[10px] text-zinc-500 block uppercase font-mono">Gross Prize Pool (₹)</label>
                  <input 
                    type="number" 
                    value={prizePool} 
                    onChange={(e) => setPrizePool(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-1.5 px-3 text-xs outline-none focus:border-indigo-500 mt-1 font-mono" 
                    required 
                  />
                </div>

                <div>
                  <label className="text-[10px] text-zinc-500 block uppercase font-mono">Award Per Kill (₹)</label>
                  <input 
                    type="number" 
                    value={perKill} 
                    onChange={(e) => setPerKill(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-1.5 px-3 text-xs outline-none focus:border-indigo-500 mt-1 font-mono" 
                    required 
                  />
                </div>

                <div>
                  <label className="text-[10px] text-zinc-500 block uppercase font-mono">Entry fee (Coins/₹)</label>
                  <input 
                    type="number" 
                    value={entryFee} 
                    onChange={(e) => setEntryFee(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-1.5 px-3 text-xs outline-none focus:border-indigo-500 mt-1 font-mono" 
                    required 
                  />
                </div>

                <div>
                  <label className="text-[10px] text-zinc-500 block uppercase font-mono">Game Format</label>
                  <select 
                    value={matchType} 
                    onChange={(e) => setMatchType(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-1.5 px-2 text-xs outline-none focus:border-indigo-500 mt-1"
                  >
                    <option value="Solo">Solo Match</option>
                    <option value="Duo">Duo Squad</option>
                    <option value="Squad">Full Squad (4v4)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-zinc-500 block uppercase font-mono">Select Map</label>
                  <select 
                    value={map} 
                    onChange={(e) => setMap(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-1.5 px-2 text-xs outline-none focus:border-indigo-500 mt-1"
                  >
                    <option value="Bermuda">Bermuda</option>
                    <option value="Purgatory">Purgatory</option>
                    <option value="Kalahari">Kalahari</option>
                    <option value="Alpine">Alpine</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-zinc-500 block uppercase font-mono">Total available slots</label>
                  <input 
                    type="number" 
                    value={totalSlots} 
                    onChange={(e) => setTotalSlots(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-1.5 px-3 text-xs outline-none focus:border-indigo-500 mt-1" 
                    required 
                  />
                </div>

                <div className="col-span-2">
                  <label className="text-[10px] text-zinc-500 block uppercase font-mono">Match Banner Image URL (Optional - e.g., Paste imgbb URL here)</label>
                  <input 
                    type="url" 
                    value={matchImageUrl} 
                    onChange={(e) => setMatchImageUrl(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-1.5 px-3 text-xs outline-none focus:border-indigo-500 mt-1" 
                    placeholder="e.g. https://i.ibb.co/..."
                  />
                  <p className="text-[9px] text-zinc-600 mt-0.5">Leaves blank to use the game mode's default theme cover image.</p>
                </div>
              </div>

              <button 
                type="submit" 
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 rounded-lg text-xs uppercase tracking-wider transition cursor-pointer"
              >
                PROVISION MATCH GAME CARD
              </button>
            </form>

            {/* Active tournaments list sorting panel */}
            <div className="space-y-3.5 bg-zinc-950 border border-zinc-800 rounded-2xl p-4">
              <h3 className="font-display font-bold text-xs uppercase text-zinc-400">Manage Matches Workflows ({matches.length})</h3>
              
              <div className="space-y-3">
                {matches.length === 0 ? (
                  <p className="text-zinc-500 text-xs text-center py-4">No match tournaments found. Add a match using the form above to initialize.</p>
                ) : (
                  matches.filter((m, idx, self) => self.findIndex(x => x.id === m.id) === idx).map((item) => {
                    return (
                      <div key={item.id} className="p-3 bg-zinc-900 border border-zinc-800 rounded-lg flex justify-between items-center gap-4">
                        <div className="space-y-1">
                          <p className="text-[11px] bg-zinc-800 text-zinc-300 font-bold px-1.5 py-0.5 rounded self-start uppercase max-w-max">
                            {item.status}
                          </p>
                          <h4 className="font-bold text-xs text-white">{item.title}</h4>
                          <p className="text-[10px] text-zinc-500 font-mono">ID: {item.id} • Map: {item.map} • Fee: ₹{item.entryFee}</p>
                          <p className="text-[10px] text-indigo-400 font-bold">Joined: {item.joinedSlots} / {item.totalSlots} players</p>
                        </div>

                        <div className="shrink-0 flex flex-col gap-1.5 items-end">
                          {item.status === 'upcoming' && (
                            <button 
                              onClick={() => openRoomSetup(item)}
                              className="bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold px-3 py-1.5 rounded uppercase tracking-wider transition cursor-pointer"
                            >
                              Transition to Ongoing
                            </button>
                          )}

                          {item.status === 'ongoing' && (
                            <button 
                              onClick={() => handleMarkCompleted(item)}
                              className="bg-zinc-700 hover:bg-zinc-600 text-white text-[10px] font-bold px-3 py-1.5 rounded uppercase tracking-wider transition cursor-pointer"
                            >
                              Mark Completed
                            </button>
                          )}

                          {item.status === 'completed' && !item.resultDeclared && (
                            <button 
                              onClick={() => startScoringResolution(item)}
                              className="bg-yellow-500 hover:bg-yellow-400 text-zinc-950 text-[10px] font-black px-3 py-1.5 rounded uppercase tracking-wider transition cursor-pointer"
                            >
                              Declare Manual Results
                            </button>
                          )}

                          {item.status === 'completed' && item.resultDeclared && (
                            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-900/25 border border-emerald-500/20 px-3 py-1.5 rounded uppercase tracking-wider">
                              Results Declared
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}

        {/* GAME MODES TAB */}
        {activeTab === 'games' && (
          <div className="space-y-4">
            <form onSubmit={handleAddGameSubmit} className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 space-y-4">
              <h3 className="font-display font-bold text-xs uppercase text-indigo-400 tracking-wider">
                Add New Game Category
              </h3>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="text-[10px] text-zinc-500 block uppercase font-mono">Game Title / Label</label>
                  <input 
                    type="text" 
                    value={newGameName} 
                    onChange={(e) => setNewGameName(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-1.5 px-3 text-xs outline-none focus:border-indigo-500 mt-1" 
                    placeholder="e.g. Free Fire India Survival"
                    required
                  />
                </div>

                <div>
                  <label className="text-[10px] text-zinc-500 block uppercase font-mono">Theme Cover Image</label>
                  <select 
                    value={newGameImagePreset} 
                    onChange={(e) => setNewGameImagePreset(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-1.5 px-2 text-xs outline-none focus:border-indigo-500 mt-1"
                  >
                    {Object.keys(GAME_PRESETS).map(key => (
                      <option key={key} value={key}>{key}</option>
                    ))}
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="text-[10px] text-zinc-500 block uppercase font-mono">Custom Image URL (Optional - e.g., Paste imgbb URL here)</label>
                  <input 
                    type="url" 
                    value={newGameCustomImageUrl} 
                    onChange={(e) => setNewGameCustomImageUrl(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-1.5 px-3 text-xs outline-none focus:border-indigo-500 mt-1" 
                    placeholder="e.g. https://i.ibb.co/..."
                  />
                  <p className="text-[9px] text-zinc-600 mt-0.5">Leaves blank to use the Selected Theme Cover Image preset above.</p>
                </div>
              </div>

              <button 
                type="submit" 
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 rounded-lg text-xs uppercase tracking-wider transition cursor-pointer"
              >
                PROMPT NEW CATEGORY
              </button>
            </form>

            <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4">
              <h3 className="font-display font-bold text-xs uppercase text-zinc-400 mb-2">Configured Categories ({games.length})</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {games.map(g => (
                  <div key={g.id} className="p-3 bg-zinc-900 rounded-xl border border-zinc-800 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img src={g.imageUrl} alt={g.name} className="w-10 h-10 object-cover rounded-lg" />
                      <div>
                        <h4 className="font-bold text-xs text-white uppercase">{g.name}</h4>
                        <p className="text-[9px] text-zinc-500 font-mono">ID: {g.id}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteGame(g.id, g.name)}
                      className="p-1 px-2 rounded-lg text-rose-500 hover:text-white hover:bg-rose-950 border border-transparent hover:border-rose-900 transition cursor-pointer"
                      title="Delete Game Category"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* PAYMENTS GATEWAY VERIFICATIONS */}
        {activeTab === 'payments' && (
          <div className="space-y-4">
            <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 space-y-3">
              <h3 className="font-display font-bold text-xs uppercase text-yellow-500 flex items-center gap-2">
                <Coins size={15} /> Deposit Validation Requests (Pending Gateways Claims)
              </h3>
              <p className="text-[10px] text-zinc-500">Every time a gamer scan pays through UPI and inputs the transaction reference, the ledger displays here for manual confirmation.</p>

              <div className="space-y-2">
                {transactions.filter(t => t.type === 'deposit' && t.status === 'pending').length === 0 ? (
                  <p className="text-zinc-600 text-xs text-center py-4">No pending deposit confirmation claims currently.</p>
                ) : (
                  transactions.filter(t => t.type === 'deposit' && t.status === 'pending').map(txn => (
                    <div key={txn.id} className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl flex justify-between items-center gap-4">
                      <div className="space-y-0.5">
                        <p className="text-xs font-bold text-white">Amt Requested: <span className="text-yellow-400 font-mono">₹{txn.amount}</span></p>
                        <p className="text-[10px] text-zinc-400">Merchant Channel: <span className="font-semibold text-zinc-300">{txn.paymentMethod || 'UPI QR'}</span></p>
                        <p className="text-[10px] text-zinc-500 font-mono">UTR transaction ID: {txn.utrNo || 'N/A'}</p>
                        <p className="text-[9px] text-zinc-600">Issued at: {txn.createdAt.substring(11, 19)}</p>
                      </div>

                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleRejectTransaction(txn.id)}
                          className="p-1.5 px-2 bg-rose-950 hover:bg-rose-900 text-rose-400 rounded-lg border border-rose-800/80 cursor-pointer"
                        >
                          <X size={14} />
                        </button>
                        <button 
                          onClick={() => handleApproveTransaction(txn.id)}
                          className="p-1.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg flex items-center gap-1 cursor-pointer"
                        >
                          <Check size={14} /> Confirm & Approve
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 space-y-3">
              <h3 className="font-display font-bold text-xs uppercase text-zinc-400">Withdrawals Queue (Manual Payouts Ledger)</h3>
              
              <div className="space-y-2">
                {transactions.filter(t => t.type === 'withdrawal' && t.status === 'pending').length === 0 ? (
                  <p className="text-zinc-600 text-xs text-center py-4">No outstanding withdrawal requested logs.</p>
                ) : (
                  transactions.filter(t => t.type === 'withdrawal' && t.status === 'pending').map(txn => (
                    <div key={txn.id} className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl flex justify-between items-center gap-4">
                      <div className="space-y-0.5">
                        <p className="text-xs font-bold text-white">Transfer Amt: <span className="text-rose-400 font-mono">₹{txn.amount}</span></p>
                        <p className="text-[10px] text-zinc-400">Destination Payee UPI ID: <span className="font-bold font-mono text-zinc-300">{txn.utrNo || 'Pending'}</span></p>
                        <p className="text-[9px] text-zinc-600">Created: {txn.createdAt}</p>
                      </div>

                      <div className="flex gap-1.5">
                        <button 
                          onClick={() => handleRejectTransaction(txn.id)}
                          className="p-1 px-2 text-xs font-bold bg-zinc-800 text-zinc-300 rounded hover:bg-zinc-700 cursor-pointer"
                        >
                          Reject
                        </button>
                        <button 
                          onClick={() => handleApproveTransaction(txn.id)}
                          className="p-1 px-3 text-xs font-extrabold bg-emerald-600 text-white rounded hover:bg-emerald-500 cursor-pointer"
                        >
                          Done Payout
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* BANNERS PANEL */}
        {activeTab === 'banners' && (
          <div className="space-y-4">
            <form onSubmit={handleAddBannerSubmit} className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 space-y-4">
              <h3 className="font-display font-bold text-xs uppercase text-indigo-400 tracking-wider">
                Add Home Slider Banner Link
              </h3>

              <div className="grid grid-cols-2 gap-3.5">
                <div className="col-span-2">
                  <label className="text-[10px] text-zinc-500 block uppercase font-mono">Promotional Banner title</label>
                  <input 
                    type="text" 
                    value={bannerTitle} 
                    onChange={(e) => setBannerTitle(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-1.5 px-3 text-xs outline-none focus:border-indigo-500 mt-1" 
                    placeholder="e.g. MEGA OFFERS: Scan & Earn 20% Extra Bonus coins"
                    required
                  />
                </div>

                <div className="col-span-2">
                  <label className="text-[10px] text-zinc-500 block uppercase font-mono">Custom Image URL (Optional - e.g., Paste imgbb URL here)</label>
                  <input 
                    type="url" 
                    value={bannerCustomImageUrl} 
                    onChange={(e) => setBannerCustomImageUrl(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-1.5 px-3 text-xs outline-none focus:border-indigo-500 mt-1" 
                    placeholder="e.g. https://i.ibb.co/..."
                  />
                  <p className="text-[9px] text-zinc-600 mt-0.5">Leaves blank to use the wallpaper preset selected below.</p>
                </div>

                <div>
                  <label className="text-[10px] text-zinc-500 block uppercase font-mono">Select Wallpaper Cover Image</label>
                  <select 
                    value={bannerPreset} 
                    onChange={(e) => setBannerPreset(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-1.5 px-2 text-xs outline-none focus:border-indigo-500 mt-1"
                  >
                    {Object.keys(BANNER_PRESETS).map(b => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>

                <div className="col-span-2 grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  <div>
                    <label className="text-[10px] text-zinc-500 block uppercase font-mono">DeepLink Action Type</label>
                    <select 
                      value={bannerDeepLink === 'wallet' || bannerDeepLink === 'contact' ? bannerDeepLink : 'custom'} 
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val !== 'custom') {
                          setBannerDeepLink(val);
                        } else {
                          setBannerDeepLink('https://');
                        }
                      }}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-1.5 px-2 text-xs outline-none focus:border-indigo-500 mt-1 cursor-pointer"
                    >
                      <option value="wallet">My Wallet Section</option>
                      <option value="contact">Support Help Desk</option>
                      <option value="custom">🔗 Custom Website Destination Link</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] text-zinc-400 block uppercase font-mono font-bold">Destination Link / Path URL</label>
                    <input 
                      type="text"
                      value={bannerDeepLink}
                      onChange={(e) => setBannerDeepLink(e.target.value)}
                      placeholder="e.g. https://kill2win.com/bonus"
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-1.5 px-3 text-xs outline-none focus:border-indigo-500 mt-1 font-mono"
                      required
                    />
                  </div>
                </div>
              </div>

              <button 
                type="submit" 
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 rounded-lg text-xs uppercase tracking-wider transition cursor-pointer"
              >
                DEPLOY UX CAROUSEL SLIDE
              </button>
            </form>

            <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4">
              <h3 className="font-display font-bold text-xs uppercase text-zinc-400 mb-2">Deployed Slider Slates ({banners.length})</h3>
              <div className="space-y-2">
                {banners.map((item) => (
                  <div key={item.id} className="p-2.5 bg-zinc-900 border border-zinc-800 rounded-xl flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img src={item.imageUrl} alt="" className="w-12 h-8 object-cover rounded" />
                      <div>
                        <h4 className="font-bold text-xs text-zinc-200">{item.title}</h4>
                        <p className="text-[9px] text-zinc-500">Deeplink Target: <span className="font-semibold text-indigo-400 capitalize">{item.deepLink}</span></p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setBanners(prev => prev.filter(b => b.id !== item.id))}
                      className="p-1 text-rose-500 hover:text-white rounded hover:bg-rose-950 border border-transparent hover:border-rose-900 transition cursor-pointer"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* NOTIFICATIONS TAB */}
        {activeTab === 'notifications' && (
          <div className="space-y-4">
            <form onSubmit={submitCustomGlobalNotification} className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 space-y-4">
              <h3 className="font-display font-bold text-xs uppercase text-indigo-400 tracking-wider">
                Broadcast Manual Instant FCM Message
              </h3>

              <div className="space-y-3">
                <div>
                  <label className="text-[10px] text-zinc-500 block uppercase font-mono">Notification Title Heading</label>
                  <input 
                    type="text" 
                    value={pushTitle} 
                    onChange={(e) => setPushTitle(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-1.5 px-3 text-xs outline-none focus:border-indigo-500 mt-1" 
                    placeholder="e.g. 🔥 Rs 100 Cash Tournament is Live!"
                    required
                  />
                </div>

                <div>
                  <label className="text-[10px] text-zinc-500 block uppercase font-mono">Notification Text Body</label>
                  <textarea 
                    value={pushBody} 
                    onChange={(e) => setPushBody(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-1.5 px-3 text-xs outline-none focus:border-indigo-500 mt-1 h-20 resize-none" 
                    placeholder="e.g. Matches are filling up fast! Join the Battle Royale Solomon Match instantly. Only 5 slots left!"
                    required
                  />
                </div>
              </div>

              <button 
                type="submit" 
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 rounded-lg text-xs uppercase tracking-wider transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Send size={14} /> BROADCAST TO CURRENT EMULATORS
              </button>
            </form>

            <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 space-y-2">
              <h3 className="font-display font-bold text-xs uppercase text-zinc-400 mb-2">Previous Logs</h3>
              
              {notifications.length === 0 ? (
                <p className="text-zinc-600 text-xs text-center py-4">No broadcast logs created.</p>
              ) : (
                notifications.map(item => (
                  <div key={item.id} className="p-2.5 bg-zinc-900 border border-zinc-800 rounded-lg">
                    <h4 className="font-bold text-xs text-zinc-200">{item.title}</h4>
                    <p className="text-[10.5px] text-zinc-500 mt-0.5 leading-snug">{item.body}</p>
                    <span className="text-[8px] text-zinc-600 block mt-1 font-mono">{item.sentAt}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* FIREBASE CODE GUIDE HUB TAB */}
        {activeTab === 'guide' && (
          <div className="space-y-4">
            <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 space-y-3 text-xs">
              <div className="flex justify-between items-center pb-2 border-b border-zinc-800">
                <div>
                  <h3 className="font-display font-bold text-xs uppercase text-emerald-400 tracking-wider">
                    Firestore Schemas & FCM Functions Code
                  </h3>
                  <p className="text-[10px] text-zinc-500 mt-0.5">Below are files configured for quick clipboard copy to configure in your Firebase workspace.</p>
                </div>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(FIREBASE_GUIDE_CONTENT);
                    alert("Complete Firebase Deployment Markdown document code segment copied to Clipboard!");
                  }}
                  className="bg-zinc-800 hover:bg-zinc-700 p-1.5 px-3 rounded-lg flex items-center gap-1 text-[10px] font-bold border border-zinc-700"
                >
                  <FileCode size={13} className="text-emerald-400" /> Copy Guide md
                </button>
              </div>

              <div className="p-3 bg-neutral-900 rounded-xl border border-zinc-800 text-[11px] text-zinc-400 font-medium">
                <span className="text-yellow-400 uppercase font-black tracking-widest text-[9.5px] block mb-1">🎯 Rules Highlights:</span>
                <p>Ensure that <strong className="text-white">"isAdmin"</strong> toggle or dedicated parameters are added inside your Auth record configurations to securely allow custom Match additions. FCM keys require standard cloud function payloads.</p>
              </div>

              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 h-[310px] overflow-y-auto font-mono text-[9px] text-zinc-300 leading-normal select-all whitespace-pre-wrap">
                {FIREBASE_GUIDE_CONTENT}
              </div>
            </div>
          </div>
        )}

        {/* SYSTEM SETUP & MAINTENANCE MODE SETTINGS TAB */}
        {activeTab === 'settings' && (
          <div className="space-y-4">
            <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 space-y-4 text-xs">
              <div className="flex justify-between items-center pb-2 border-b border-zinc-800">
                <div>
                  <h3 className="font-display font-bold text-xs uppercase text-orange-500 tracking-wider">
                    System Operations & App Configuration
                  </h3>
                  <p className="text-[10px] text-zinc-500 mt-0.5">Control live maintenance states, system thresholds, and latest apk download credentials.</p>
                </div>
              </div>

              {/* Maintenance Toggle Column */}
              <div className="p-4 bg-zinc-900 rounded-xl border border-zinc-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-white font-bold text-sm block">🔧 Maintenance Mode</span>
                    <span className="text-[10px] text-zinc-500 block leading-snug">When active, all standard players are locked out of games or wallet transfers, with an unbypassable notification of the update link.</span>
                  </div>
                  <button
                    onClick={() => {
                      setMaintenanceMode(!maintenanceMode);
                    }}
                    className={`px-4 py-2 rounded-lg font-bold uppercase text-[10px] transition duration-200 tracking-wider cursor-pointer ${
                      maintenanceMode 
                      ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-950' 
                      : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-400'
                    }`}
                  >
                    {maintenanceMode ? '🚨 ACTIVE' : '● INACTIVE'}
                  </button>
                </div>

                <div className={`p-2.5 rounded-lg border text-[10px] leading-relaxed transition ${
                  maintenanceMode 
                  ? 'bg-rose-950/40 border-rose-800/40 text-rose-300' 
                  : 'bg-zinc-950 border-zinc-800 text-zinc-500'
                }`}>
                  {maintenanceMode 
                    ? "🔴 UNDER MAINTENANCE: Mobile client applications are currently seeing the splash block layout and are prevented from logging in or continuing transactions." 
                    : "🟢 LIVE: Core tournament services are running fine. Client users can play matches, deposit funds, or order UPI manual cash-outs seamlessly."
                  }
                </div>
              </div>

              {/* App Update Link Input */}
              <div className="p-4 bg-zinc-900 rounded-xl border border-zinc-800 space-y-3">
                <div className="space-y-1">
                  <label className="text-white font-bold text-xs block">📲 App Update Download Link (APK URL)</label>
                  <p className="text-[10.5px] text-zinc-500 leading-normal">Specify the secure URL where users will be redirected to download the latest android application package (.apk).</p>
                </div>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={appUpdateLink}
                    onChange={(e) => setAppUpdateLink(e.target.value)}
                    className="flex-1 bg-neutral-950 border border-zinc-800 rounded-lg py-2 px-3 text-white font-mono text-xs outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    placeholder="e.g. https://kill2win.com/app-latest.apk"
                  />
                  <button
                    onClick={() => triggerSafeAlert("Update Link configured successfully! Mobile clients will be redirected to: " + appUpdateLink)}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[10px] uppercase tracking-wider px-4 rounded-lg cursor-pointer"
                  >
                    Apply URL
                  </button>
                </div>
              </div>

              {/* Admin Panel Password Input */}
              {adminSavedPassword !== undefined && setAdminSavedPassword !== undefined && (
                <div className="p-4 bg-zinc-900 rounded-xl border border-zinc-800 space-y-3">
                  <div className="space-y-1">
                    <label className="text-white font-bold text-xs block">🔐 Securing Passcode (Admin Portal Password)</label>
                    <p className="text-[10.5px] text-zinc-500 leading-normal">Configure the secure word or pin required to unlock the Admin platform workspace. Keep this safe.</p>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={adminSavedPassword}
                      onChange={(e) => {
                        const val = e.target.value.trim();
                        setAdminSavedPassword(val);
                        localStorage.setItem('kill2win_admin_password', val);
                      }}
                      className="flex-1 bg-neutral-950 border border-zinc-800 rounded-lg py-2 px-3 text-white font-mono text-xs outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                      placeholder="e.g. admin123"
                    />
                    <button
                      onClick={() => triggerSafeAlert("Admin Passcode updated to: " + adminSavedPassword + ". Use this passcode to unlock the panel next time!")}
                      className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[10px] uppercase tracking-wider px-4 rounded-lg cursor-pointer"
                    >
                      Save Passcode
                    </button>
                  </div>
                </div>
              )}

              {/* Customer Support & Desk Configuration */}
              <div className="p-4 bg-zinc-900 rounded-xl border border-zinc-800 space-y-4">
                <div className="space-y-1">
                  <h4 className="text-white font-bold text-xs flex items-center gap-1.5">
                    <span>💬 Customer Support & Help desk (Contact Us Settings)</span>
                  </h4>
                  <p className="text-[10.5px] text-zinc-500 leading-normal">
                    Update the contact numbers, Whatsapp coordinates, and Telegram channel link presented instantly on user clients’ support desk pages.
                  </p>
                </div>

                <div className="space-y-3.5 text-xs text-zinc-300">
                  {/* WhatsApp Support Option */}
                  <div className="space-y-1">
                    <label className="text-zinc-400 font-bold block text-[10px] uppercase font-mono">🟢 WhatsApp support number</label>
                    <input
                      type="text"
                      value={contactWhatsApp}
                      onChange={(e) => setContactWhatsApp(e.target.value)}
                      className="w-full bg-neutral-950 border border-zinc-800 rounded-lg py-2 px-3 text-white font-mono text-xs outline-none focus:border-indigo-500"
                      placeholder="e.g. +91 91234 56789"
                    />
                  </div>

                  {/* Telegram Channel / Group Option */}
                  <div className="space-y-1">
                    <label className="text-zinc-400 font-bold block text-[10px] uppercase font-mono">🌐 Telegram Channel or Username</label>
                    <input
                      type="text"
                      value={contactTelegram}
                      onChange={(e) => setContactTelegram(e.target.value)}
                      className="w-full bg-neutral-950 border border-zinc-800 rounded-lg py-2 px-3 text-white font-mono text-xs outline-none focus:border-indigo-500"
                      placeholder="e.g. https://t.me/yourgroup or @yourusername"
                    />
                  </div>

                  {/* Support Email Option */}
                  <div className="space-y-1">
                    <label className="text-zinc-400 font-bold block text-[10px] uppercase font-mono">✉️ Contact support email</label>
                    <input
                      type="email"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      className="w-full bg-neutral-950 border border-zinc-800 rounded-lg py-2 px-3 text-white font-mono text-xs outline-none focus:border-indigo-500"
                      placeholder="e.g. support@yourdomain.com"
                    />
                  </div>

                  {/* Apply notification button */}
                  <button
                    onClick={() => triggerSafeAlert("Support contact details updated successfully and synced to emulator client! 🚀")}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-2 rounded-lg transition uppercase tracking-widest text-[9.5px] cursor-pointer text-center"
                  >
                    💾 Save & Sync Support Desk Coordinates
                  </button>
                </div>
              </div>

              {/* System Limits Overview Card */}
              <div className="p-4 bg-neutral-905 rounded-xl border border-zinc-800 space-y-2">
                <span className="text-zinc-404 uppercase font-black tracking-widest text-[9px] block">⚙️ Platform Limit Thresholds:</span>
                <div className="grid grid-cols-2 gap-3 text-zinc-500 font-mono text-[10.5px] mt-1">
                  <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800/80">
                    <span className="text-zinc-500 block text-[9px] uppercase font-sans">Min Wallet Deposit</span>
                    <strong className="text-emerald-400 text-sm font-sans mt-0.5 block">₹ 10.00</strong>
                  </div>
                  <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800/80">
                    <span className="text-zinc-500 block text-[9px] uppercase font-sans">Min Wallet Withdrawal</span>
                    <strong className="text-violet-400 text-sm font-sans mt-0.5 block">₹ 20.00</strong>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* USERS DATABASE & TRANSACTION LEDGER MANAGER */}
        {activeTab === 'users' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* User Search & Database Directory (Left Panel) */}
            <div className="lg:col-span-7 bg-zinc-950 border border-zinc-800 rounded-2xl p-4 flex flex-col space-y-3">
              <div className="flex justify-between items-center pb-2 border-b border-zinc-850">
                <div>
                  <h3 className="font-display font-black text-xs uppercase text-indigo-400">Registered Gamers Vault</h3>
                  <p className="text-[10px] text-zinc-500">Live active directory of accounts synced with simulation clients.</p>
                </div>
                <span className="text-[10px] font-mono bg-zinc-900 border border-zinc-800 text-zinc-400 px-2 py-0.5 rounded font-black">
                  Total: {allUsers.length}
                </span>
              </div>

              {/* Search Bar filter */}
              <input 
                type="text"
                value={searchUserQuery}
                onChange={(e) => setSearchUserQuery(e.target.value)}
                placeholder="🔍 Search gamers by username, mobile, ID, etc..."
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-2 px-3 text-xs outline-none focus:border-indigo-500 text-white font-medium"
              />

              {/* Users Deck */}
              <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1 select-none scrollbar-thin">
                {allUsers
                  .filter(u => {
                    const q = searchUserQuery.toLowerCase().trim();
                    if (!q) return true;
                    return (
                      u.username.toLowerCase().includes(q) ||
                      u.email.toLowerCase().includes(q) ||
                      u.phone.includes(q) ||
                      u.uid.toLowerCase().includes(q) ||
                      (u.gameNickname && u.gameNickname.toLowerCase().includes(q))
                    );
                  })
                  .map(user => {
                    const isSelected = selectedUserForAdjust?.uid === user.uid;
                    const isSelf = currentUser.uid === user.uid;

                    return (
                      <div 
                        key={user.uid}
                        onClick={() => {
                          setSelectedUserForAdjust(user);
                          setAdjustmentAmount('');
                          setAdjustmentReason('');
                        }}
                        className={`p-3 rounded-xl border transition cursor-pointer flex flex-col justify-between gap-2 text-xs relative ${
                          isSelected 
                          ? 'bg-indigo-950/20 border-indigo-505 border-indigo-500/80 shadow-md shadow-indigo-950/40' 
                          : 'bg-zinc-900/65 border-zinc-800/85 hover:bg-zinc-900 hover:border-zinc-700/80'
                        }`}
                      >
                        {isSelf && (
                          <span className="absolute top-2 right-2 text-[8px] bg-indigo-500/15 text-indigo-400 font-bold border border-indigo-500/30 px-1.5 py-0.3 rounded tracking-wider uppercase font-mono">
                            YOU (EMULATOR)
                          </span>
                        )}

                        <div className="flex justify-between items-start gap-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 font-display font-black text-xs text-white flex items-center justify-center uppercase select-none">
                              {user.username.substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <h4 className="font-bold text-white tracking-wide">{user.username}</h4>
                              <p className="text-[9.5px] text-zinc-500 font-mono leading-none mt-0.5">{user.email}</p>
                            </div>
                          </div>

                          <div className="text-right">
                            <span className="text-[10px] text-zinc-500 block font-mono">Wallet Vault Balance</span>
                            <span className="text-yellow-400 font-mono font-black text-sm block">₹{user.walletBalance.toFixed(2)}</span>
                          </div>
                        </div>

                        {/* User Metadata badges */}
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-1.5 pt-2 border-t border-zinc-850/60 font-mono text-[9px] text-zinc-400">
                          <div>
                            <span className="text-zinc-600 block text-[7.5px] uppercase">Phone Line:</span>
                            <span className="text-zinc-300 font-bold">{user.phone}</span>
                          </div>
                          <div>
                            <span className="text-zinc-600 block text-[7.5px] uppercase">FF Nickname:</span>
                            <span className={`font-semibold ${user.gameNickname ? 'text-orange-400 font-bold' : 'text-zinc-650'}`}>
                              {user.gameNickname || 'Not Configured'}
                            </span>
                          </div>
                          <div className="col-span-2 md:col-span-1">
                            <span className="text-zinc-600 block text-[7.5px] uppercase">Ref. UID:</span>
                            <span className="text-zinc-300 font-semibold truncate select-all inline-block max-w-[90px]">{user.uid}</span>
                          </div>
                        </div>

                        {/* Joined tourneys tags */}
                        {user.joinedMatches.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1 pt-1.5 border-t border-dashed border-zinc-900">
                            <span className="text-[7.5px] text-zinc-600 font-mono uppercase tracking-wider block mr-1 mt-0.5">Joined matches ({user.joinedMatches.length}):</span>
                            {user.joinedMatches.map((mid) => (
                              <span key={mid} className="bg-indigo-950/40 text-[8px] px-1 py-0.3 rounded text-indigo-400 border border-indigo-950/80">
                                #{mid.substring(6, 11)}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Adjust Funds Controls (Right Panel) */}
            <div className="lg:col-span-5 flex flex-col space-y-4">
              {selectedUserForAdjust ? (
                <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 flex flex-col space-y-4">
                  <div className="pb-2 border-b border-zinc-850">
                    <span className="text-[8px] bg-amber-500/15 text-amber-500 border border-amber-500/35 px-1.5 py-0.5 rounded uppercase font-bold tracking-widest font-mono">Ledger Adjustment Terminal</span>
                    <h3 className="font-display font-black text-xs uppercase text-white mt-1">Adjust Wallet ledger for:</h3>
                    <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 p-2 rounded-xl mt-2 select-none">
                      <div className="w-6 h-6 rounded-full bg-indigo-600/30 border border-indigo-500/30 font-bold text-xs text-indigo-400 flex items-center justify-center uppercase">
                        {selectedUserForAdjust.username.substring(0, 1)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <strong className="text-zinc-200 text-xs truncate block">{selectedUserForAdjust.username}</strong>
                        <span className="text-[9px] text-zinc-500 font-mono leading-none block">Unique ID: {selectedUserForAdjust.uid}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-zinc-400 font-mono font-bold">Current: <span className="text-yellow-400">₹{selectedUserForAdjust.walletBalance}</span></span>
                      </div>
                    </div>
                  </div>

                  <form onSubmit={handleCommitUserAdjustment} className="space-y-3.5 text-xs">
                    
                    {/* Toggle Selector Segmented Button */}
                    <div className="space-y-1">
                      <label className="text-[9px] text-zinc-400 uppercase font-mono tracking-wider font-bold">🔧 Select Operation Mode:</label>
                      <div className="grid grid-cols-2 gap-2 bg-zinc-900/60 p-1 rounded-xl border border-zinc-800">
                        <button
                          type="button"
                          onClick={() => setAdjustmentType('credit')}
                          className={`py-1.5 rounded-lg text-[10.5px] font-bold uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-1 ${
                            adjustmentType === 'credit'
                            ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-950'
                            : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
                          }`}
                        >
                          🟢 Credit Coins (Cr.)
                        </button>
                        <button
                          type="button"
                          onClick={() => setAdjustmentType('debit')}
                          className={`py-1.5 rounded-lg text-[10.5px] font-bold uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-1 ${
                            adjustmentType === 'debit'
                            ? 'bg-rose-600 text-white shadow-sm shadow-rose-950'
                            : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
                          }`}
                        >
                          🔴 Debit Coins (Dr.)
                        </button>
                      </div>
                    </div>

                    {/* Amount Input */}
                    <div className="space-y-1">
                      <label className="text-[9px] text-zinc-400 uppercase font-mono tracking-wider font-bold">💰 Enter Amount to Balance (INR / Coins):</label>
                      <div className="relative">
                        <span className="absolute left-3 top-2.5 font-sans font-bold text-zinc-400 text-sm">₹</span>
                        <input 
                          type="number"
                          step="0.01"
                          min="1"
                          required
                          value={adjustmentAmount}
                          onChange={(e) => setAdjustmentAmount(e.target.value)}
                          placeholder="0.00"
                          className="w-full bg-neutral-950 border border-zinc-800 rounded-lg py-2 pl-7 pr-3 text-sm text-yellow-400 font-mono font-bold outline-none focus:border-indigo-505 focus:border-indigo-500"
                        />
                      </div>
                    </div>

                    {/* Pre-packaged Reason Presets Selector */}
                    <div className="space-y-1">
                      <label className="text-[9px] text-zinc-400 uppercase font-mono tracking-wider font-bold">📝 Voucher Reason tag (Required):</label>
                      <select
                        value={adjustmentReasonPreset}
                        onChange={(e) => {
                          setAdjustmentReasonPreset(e.target.value);
                          if (e.target.value !== 'Other Custom Reason') {
                            setAdjustmentReason(e.target.value);
                          } else {
                            setAdjustmentReason('');
                          }
                        }}
                        className="w-full bg-neutral-950 border border-zinc-800 rounded-lg py-2 px-3 text-xs outline-none focus:border-indigo-500 text-zinc-300 font-sans cursor-pointer"
                      >
                        <option value="Completed Placement Match Reward">🏆 Placement Winner Coins Payout</option>
                        <option value="Tournament Kill Points Bonus">🎯 Tournament Kill Points Bonus (Cr.)</option>
                        <option value="Deposit Discrepancy Rectified">💸 UPI Deposit Verification Manual Fix (Cr.)</option>
                        <option value="Leaderboard Ranking Payout">🌟 Weekly Leaderboard Top Ranking (Cr.)</option>
                        <option value="Registration Cancellation Refund">🛡️ Custom Entry Fee Refund (Cancelled Tourney)</option>
                        <option value="Penalty Deduction">🚫 Terms Abuse / Match Absence Penalty Fee (Dr.)</option>
                        <option value="Other Custom Reason">✍️ Enter Custom Reason below</option>
                      </select>
                    </div>

                    {/* Custom Reason Field */}
                    {(adjustmentReasonPreset === 'Other Custom Reason' || adjustmentReasonPreset === '') && (
                      <div className="space-y-1">
                        <label className="text-[9px] text-zinc-500 uppercase font-mono block">Specify Detail Admin Comment</label>
                        <input 
                          type="text"
                          required
                          value={adjustmentReason}
                          onChange={(e) => setAdjustmentReason(e.target.value)}
                          placeholder="e.g. Corrected balance after manual account audit..."
                          className="w-full bg-neutral-950 border border-zinc-800 rounded-lg py-2 px-3 text-xs outline-none focus:border-indigo-500 text-white font-medium"
                        />
                      </div>
                    )}

                    {/* Core Execute Action button */}
                    <button
                      type="submit"
                      className={`w-full text-white font-black py-2.5 rounded-xl uppercase tracking-widest text-[10.5px] transition duration-200 cursor-pointer shadow-md ${
                        adjustmentType === 'credit'
                        ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-950/45'
                        : 'bg-rose-600 hover:bg-rose-500 shadow-rose-950/45'
                      }`}
                    >
                      {adjustmentType === 'credit' ? '⚡ CREDIT TRANSACTION NOW' : '⚡ DEBIT TRANSACTION NOW'}
                    </button>
                    
                    <p className="text-[9px] text-zinc-500 font-mono text-center leading-normal">
                      Note: Submitting will instantly write to local wallet ledger schema, sync Gamer Client, and generate simulated FCM push alerts.
                    </p>

                  </form>
                </div>
              ) : (
                <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 text-center text-zinc-500 py-12 flex flex-col items-center justify-center space-y-3.5 select-none">
                  <div className="w-12 h-12 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-indigo-400">
                    <Users size={20} className="animate-bounce" />
                  </div>
                  <div>
                    <strong className="text-zinc-404 text-xs block uppercase font-mono tracking-widest">Adjustment Console Dormant</strong>
                    <p className="text-[10px] text-zinc-600 max-w-[200px] mx-auto mt-1 leading-normal">
                      Click highlit and toggle any registered gamer row in the database table ledger on the left to activate coin control tools.
                    </p>
                  </div>
                </div>
              )}

              {/* Quick Transaction Audit Trail filter for Selected User */}
              {selectedUserForAdjust && (
                <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-3 flex flex-col space-y-2">
                  <strong className="text-[8.5px] font-mono text-zinc-500 uppercase tracking-widest block">📝 Recent ledger events (this user):</strong>
                  
                  <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-0.5 scrollbar-thin text-[10px]">
                    {transactions.filter(t => t.uid === selectedUserForAdjust.uid).length === 0 ? (
                      <p className="text-zinc-650 text-center py-4 text-[9px]">No historical wallet adjustments logged for this user.</p>
                    ) : (
                      transactions
                        .filter(t => t.uid === selectedUserForAdjust.uid)
                        .slice(0, 10)
                        .map(txn => (
                          <div key={txn.id} className="p-2 bg-zinc-900 rounded-lg border border-zinc-900/40 flex justify-between items-center gap-2">
                            <div className="space-y-0.5 max-w-[150px] min-w-0">
                              <span className="text-[8px] bg-zinc-800 text-zinc-400 px-1 py-0.2 rounded font-mono block self-start w-fit text-left truncate">{txn.paymentMethod}</span>
                              <span className="text-[8px] text-zinc-500 font-mono leading-none block">{new Date(txn.createdAt).toLocaleDateString()} at {new Date(txn.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                            </div>
                            <div className="text-right">
                              <span className={`font-mono font-black ${
                                txn.type === 'deposit' || txn.type === 'winnings' || txn.type === 'bonus' ? 'text-emerald-400' : 'text-rose-400'
                              }`}>
                                {txn.type === 'deposit' || txn.type === 'winnings' || txn.type === 'bonus' ? '+' : '-'} ₹{txn.amount}
                              </span>
                            </div>
                          </div>
                        ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

      </div>

      {/* TRANSITION TO ONGOING POPUP MODAL (PROMPT ROOM ID & PASSWORD) */}
      {activeMatchForRoom && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-sm overflow-hidden p-4 space-y-3.5 text-xs text-white">
            <div className="pb-2 border-b border-zinc-800">
              <h4 className="font-display font-bold text-xs uppercase text-emerald-400">Initialize Live Match Credentials</h4>
              <p className="text-[10px] text-zinc-500 font-semibold">{activeMatchForRoom.title}</p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[9px] text-zinc-500 block uppercase font-mono">Assign Free Fire Room ID</label>
                <input 
                  type="text" 
                  value={roomIdInput}
                  onChange={(e) => setRoomIdInput(e.target.value)}
                  className="w-full bg-neutral-950 border border-zinc-800 rounded-lg py-2 px-3 tracking-wider font-mono font-bold text-white text-xs mt-1 outline-none"
                  placeholder="e.g. Room_30924"
                />
              </div>

              <div>
                <label className="text-[9px] text-zinc-500 block uppercase font-mono">Assign Password</label>
                <input 
                  type="text" 
                  value={roomPasswordInput}
                  onChange={(e) => setRoomPasswordInput(e.target.value)}
                  className="w-full bg-neutral-950 border border-zinc-800 rounded-lg py-2 px-3 tracking-wider font-mono font-bold text-white text-xs mt-1 outline-none"
                  placeholder="e.g. 78291"
                />
              </div>
            </div>

            <div className="p-2 bg-emerald-650/10 border border-emerald-500/20 rounded-lg leading-relaxed text-[10px] text-emerald-300">
              ⚡ Saving credentials will move status to <strong className="text-white">ONGOING</strong> and automatically notify all {activeMatchForRoom.joinedSlots} joined players with a push notification payload.
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <button 
                onClick={() => setActiveMatchForRoom(null)}
                className="px-4 py-2 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition font-bold"
              >
                Cancel
              </button>
              <button 
                onClick={handleGoOngoingSave}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2 rounded-lg transition uppercase tracking-wider text-[11px]"
              >
                Save & Broadcast Rules
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DYNAMIC SCORING resolution pop-up overlay */}
      {activeMatchForResults && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-lg overflow-hidden p-4 space-y-3.5 text-xs text-white">
            <div className="pb-2 border-b border-zinc-800 flex justify-between items-center">
              <div>
                <h4 className="font-display font-bold text-xs uppercase text-yellow-500">Manual Participant Prizes allocation</h4>
                <p className="text-[10px] text-zinc-500 font-semibold">{activeMatchForResults.title}</p>
              </div>
              <span className="text-[10px] text-yellow-500 font-bold font-mono">Prize Pool: ₹{activeMatchForResults.prizePool}</span>
            </div>

            <div className="max-h-72 overflow-y-auto space-y-2 border-b border-zinc-800 pb-2">
              {activeMatchForResults.joinedUsers.length === 0 ? (
                <p className="text-zinc-600 text-center py-6">No users joined this tournament match yet!</p>
              ) : (
                activeMatchForResults.joinedUsers.map((uid, index) => {
                  const gameUsername = activeMatchForResults.joinedUsernames[index] || "Gamer";
                  const score = scoringPlayers[uid] || { kills: 0, rank: index + 1, winnings: 0 };

                  return (
                    <div key={uid} className="p-3 bg-neutral-950 border border-zinc-800 rounded-xl flex items-center justify-between gap-3 flex-wrap">
                      <div className="space-y-0.5">
                        <span className="text-[9px] bg-indigo-600/30 text-indigo-400 font-semibold px-2 py-0.5 rounded uppercase tracking-wider">
                          Slot: {activeMatchForResults.userSlots?.[uid] ? `#${activeMatchForResults.userSlots[uid]}` : "Auto"}
                        </span>
                        <p className="text-xs font-bold text-white mt-1 select-all">{gameUsername}</p>
                        <p className="text-[9px] text-zinc-500 font-mono">U_UID: {uid.substring(0, 10)}...</p>
                      </div>

                      <div className="flex gap-2 items-center text-[10px]">
                        <div>
                          <label className="text-[8px] text-zinc-500 uppercase block font-mono">Kills</label>
                          <input 
                            type="number" 
                            value={score.kills}
                            onChange={(e) => {
                              const val = parseInt(e.target.value) || 0;
                              setScoringPlayers(prev => ({
                                ...prev,
                                [uid]: { ...prev[uid], kills: val }
                              }));
                            }}
                            className="w-12 bg-zinc-800 border border-zinc-700 py-1 px-1.5 rounded outline-none text-center font-mono text-xs text-white"
                          />
                        </div>

                        <div>
                          <label className="text-[8px] text-zinc-500 uppercase block font-mono">Rank Placement</label>
                          <input 
                            type="number" 
                            value={score.rank}
                            onChange={(e) => {
                              const val = parseInt(e.target.value) || 0;
                              setScoringPlayers(prev => ({
                                ...prev,
                                [uid]: { ...prev[uid], rank: val }
                              }));
                            }}
                            className="w-16 bg-zinc-800 border border-zinc-700 py-1 px-1.5 rounded outline-none text-center font-mono text-xs text-white"
                          />
                        </div>

                        <div>
                          <label className="text-[8px] text-zinc-500 uppercase block font-mono">Win Coin Payout (₹)</label>
                          <input 
                            type="number" 
                            value={score.winnings}
                            onChange={(e) => {
                              const val = parseFloat(e.target.value) || 0;
                              setScoringPlayers(prev => ({
                                ...prev,
                                [uid]: { ...prev[uid], winnings: val }
                              }));
                            }}
                            className="w-20 bg-zinc-850 border border-yellow-500/50 py-1 px-1.5 rounded outline-none text-center font-mono text-xs text-yellow-400 font-bold"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="flex gap-2 justify-end pt-1">
              <button 
                onClick={() => setActiveMatchForResults(null)}
                className="px-4 py-2 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white font-bold"
              >
                Go Back
              </button>
              <button 
                onClick={handleSaveDeclareResult}
                disabled={activeMatchForResults.joinedUsers.length === 0}
                className={`bg-yellow-500 text-zinc-900 font-black px-5 py-2 rounded-lg uppercase tracking-wide transition ${
                  activeMatchForResults.joinedUsers.length === 0 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-yellow-400'
                }`}
              >
                Approve & Credit Balances
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dynamic Iframe-Safe Confirmation Modal Overlay */}
      {confirmDialog && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-zinc-950 border-2 border-zinc-800 rounded-3xl w-full max-w-sm overflow-hidden p-5 space-y-4 text-xs text-white shadow-2xl animate-in fade-in zoom-in-95 duration-200 text-center">
            <div className="pb-2 border-b border-zinc-900">
              <strong className="font-display font-black text-[13px] uppercase tracking-wider text-rose-500 block">⚠️ {confirmDialog.title}</strong>
            </div>
            <p className="text-zinc-300 leading-relaxed text-xs font-semibold px-2 py-1">
              {confirmDialog.message}
            </p>
            <div className="flex gap-2.5 justify-center pt-2">
              <button 
                onClick={() => setConfirmDialog(null)}
                className="flex-1 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white font-bold py-2 rounded-xl transition border border-zinc-800 uppercase tracking-widest text-[10px] cursor-pointer"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  confirmDialog.onConfirm();
                  setConfirmDialog(null);
                }}
                className="flex-1 bg-rose-600 hover:bg-rose-500 text-white font-black py-2 rounded-xl transition uppercase tracking-widest text-[10px] shadow-lg shadow-rose-950/50 cursor-pointer"
              >
                Proceed
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dynamic Non-Blocking Notification Toast Banner */}
      {toastNotification && (
        <div className="fixed bottom-5 right-5 z-[100] max-w-sm animate-in slide-in-from-bottom-6 duration-300">
          <div className={`p-4 rounded-2xl border-2 shadow-2xl flex items-center gap-3 ${
            toastNotification.type === 'error'
            ? 'bg-rose-955 bg-zinc-950 border-rose-500 text-rose-200'
            : toastNotification.type === 'info'
            ? 'bg-sky-950/90 border-sky-500 text-sky-200'
            : 'bg-zinc-950 border-emerald-500 text-emerald-100'
          }`}>
            <span className="text-sm">
              {toastNotification.type === 'error' ? '🚫' : toastNotification.type === 'info' ? 'ℹ️' : '✅'}
            </span>
            <div className="flex-1 text-xs font-bold leading-normal">
              {toastNotification.message}
            </div>
            <button 
              onClick={() => setToastNotification(null)}
              className="text-zinc-400 hover:text-white text-xs font-bold px-1 py-0.5 cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
