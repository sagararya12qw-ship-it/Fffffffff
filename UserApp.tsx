import React, { useState } from 'react';
import { 
  Gamepad2, Wallet, Trophy, PhoneCall, ChevronRight, Coins, Bell, User, 
  MapPin, ShieldAlert, Award, ChevronLeft, CreditCard, ArrowUpRight, 
  ArrowDownLeft, Send, CheckCircle2, MessageSquare, AlertCircle, Sparkles, Copy, Lock
} from 'lucide-react';
import { AppUser, Match, Game, BannerItem, PushNotification, WalletTransaction } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import Kill2WinLogo from './Kill2WinLogo';

// Helper to parse custom scheduled date-times like "2026-05-28 at 06:00 PM"
function parseMatchDateTime(dateTimeStr: string): Date | null {
  try {
    if (!dateTimeStr) return null;
    const cleanStr = dateTimeStr.trim();
    if (cleanStr.includes(' at ')) {
      const [datePart, timeWithAmpm] = cleanStr.split(' at ');
      const [timePart, ampm] = timeWithAmpm.trim().split(' ');
      let [hours, minutes] = timePart.split(':').map(Number);
      
      const isPM = ampm.toUpperCase() === 'PM';
      if (isPM && hours < 12) hours += 12;
      if (!isPM && hours === 12) hours = 0;
      
      const [year, month, day] = datePart.split('-').map(Number);
      return new Date(year, month - 1, day, hours, minutes || 0, 0, 0);
    }
    const parsed = new Date(dateTimeStr);
    if (!isNaN(parsed.getTime())) {
      return parsed;
    }
  } catch (err) {
    console.error("Error parsing match DateTime:", err);
  }
  return null;
}

// Deterministic taken slots helper so that slots look active and persistent
export function getTakenSlotsForMatch(matchId: string, totalSlotsCount: number = 48): number[] {
  const hash = matchId.split('').reduce((sum, ch) => sum + ch.charCodeAt(0), 0) || 12;
  const takenCount = Math.min(totalSlotsCount - 5, (hash % 15) + 8); // say 8 to 22 slots taken
  const takenList = new Set<number>();
  for (let i = 0; i < takenCount; i++) {
    const slotNum = ((((hash * (i + 13)) % totalSlotsCount) + totalSlotsCount) % totalSlotsCount) + 1;
    if (slotNum >= 1 && slotNum <= totalSlotsCount) {
      takenList.add(slotNum);
    }
  }
  return Array.from(takenList);
}

// Reusable live countdown timer
export function CountdownTimer({ targetDateTime }: { targetDateTime: string }) {
  const [timeLeft, setTimeLeft] = React.useState<string | null>(null);

  React.useEffect(() => {
    const targetDate = parseMatchDateTime(targetDateTime);
    if (!targetDate) {
      setTimeLeft(null);
      return;
    }

    const updateTimer = () => {
      const now = new Date();
      const diffMs = targetDate.getTime() - now.getTime();

      if (diffMs <= 0) {
        setTimeLeft("LIVE");
        return;
      }

      const totalSec = Math.floor(diffMs / 1000);
      const days = Math.floor(totalSec / (3600 * 24));
      const hours = Math.floor((totalSec % (3600 * 24)) / 3600);
      const minutes = Math.floor((totalSec % 3600) / 60);
      const seconds = totalSec % 60;

      let displayStr = "";
      if (days > 0) {
        displayStr += `${days}d `;
      }
      displayStr += `${hours < 10 ? '0' + hours : hours}h ${minutes < 10 ? '0' + minutes : minutes}m ${seconds < 10 ? '0' + seconds : seconds}s`;
      setTimeLeft(displayStr);
    };

    updateTimer();
    const intervalId = setInterval(updateTimer, 1000);

    return () => clearInterval(intervalId);
  }, [targetDateTime]);

  if (!timeLeft) return null;

  if (timeLeft === "LIVE") {
    return (
      <span className="text-[8px] bg-red-600/95 border border-red-500 text-white font-extrabold uppercase px-1.5 py-0.5 rounded shadow animate-pulse tracking-wide font-mono">
        🔴 Live
      </span>
    );
  }

  return (
    <div className="flex items-center gap-1 bg-zinc-950/95 border border-amber-500/30 text-amber-400 text-[9px] font-bold px-1.5 py-0.5 rounded shadow-lg font-mono">
      <span className="w-1 h-1 bg-amber-500 rounded-full animate-ping"></span>
      <span>{timeLeft}</span>
    </div>
  );
}

interface UserAppProps {
  currentUser: AppUser;
  setCurrentUser: React.Dispatch<React.SetStateAction<AppUser>>;
  matches: Match[];
  setMatches: React.Dispatch<React.SetStateAction<Match[]>>;
  games: Game[];
  banners: BannerItem[];
  notifications: PushNotification[];
  transactions: WalletTransaction[];
  addTransaction: (amount: number, type: 'deposit' | 'withdrawal', method: string, utr?: string) => void;
  joinMatchAction: (matchId: string, gameUsername: string, slotNo?: number) => void;
  dismissNotification: (id: string) => void;
  maintenanceMode?: boolean;
  appUpdateLink?: string;
  contactWhatsApp?: string;
  contactTelegram?: string;
  contactEmail?: string;
  isStandalone?: boolean;
}

export default function UserApp({
  currentUser,
  setCurrentUser,
  matches,
  setMatches,
  games,
  banners,
  notifications,
  transactions,
  addTransaction,
  joinMatchAction,
  maintenanceMode = false,
  appUpdateLink = 'https://kill2win.com/app-latest.apk',
  contactWhatsApp = '+91 91234 56789',
  contactTelegram = 'https://t.me/KILL2WINFFOfficial',
  contactEmail = 'support@kill2win.com',
  isStandalone = false,
}: UserAppProps) {
  // Navigation tabs
  // "play" -> Matches, "more" -> rules/extra, "account" -> profile/transactions
  const [activeTab, setActiveTab] = useState<'more' | 'play' | 'account'>('play');
  
  // Custom inside-view navigation
  // 'lobby' (main game selection) | 'tournament_list' (matches of specific game) | 'wallet' | 'my_matches' | 'top_players' | 'contact'
  const [subView, setSubView] = useState<'lobby' | 'tournament_list' | 'wallet' | 'my_matches' | 'top_players' | 'contact'>('lobby');
  const [selectedGameId, setSelectedGameId] = useState<string | null>(null);
  
  // Registration and UI states
  const [selectedMatchForJoin, setSelectedMatchForJoin] = useState<Match | null>(null);
  const [gameUsernameInput, setGameUsernameInput] = useState('');
  const [gameUsernameError, setGameUsernameError] = useState('');
  const [selectedSlotNum, setSelectedSlotNum] = useState<number | null>(null);

  // Sync saved nickname on match selection or load
  React.useEffect(() => {
    if (selectedMatchForJoin) {
      setGameUsernameInput(currentUser.gameNickname || '');
      setSelectedSlotNum(null);
    }
  }, [selectedMatchForJoin, currentUser.gameNickname]);
  
  // Deposit and Withdrawal states
  const [depositAmount, setDepositAmount] = useState('50');
  const [depositUtr, setDepositUtr] = useState('');
  const [depositMethod, setDepositMethod] = useState('ZapUPI Auto-Pay');
  
  // ZapUPI Automated Gateway states
  const [isZapModalOpen, setIsZapModalOpen] = useState(false);
  const [zapTxnState, setZapTxnState] = useState<'initiated' | 'processing' | 'verifying' | 'success' | 'failed'>('initiated');
  const [zapTimer, setZapTimer] = useState(299);
  const [zapSelectedApp, setZapSelectedApp] = useState<'gpay' | 'phonepe' | 'paytm' | 'bhim' | null>(null);
  const [zapGeneratedUtr, setZapGeneratedUtr] = useState('');
  const [zapUtrManual, setZapUtrManual] = useState('');
  const [zapPaymentUrl, setZapPaymentUrl] = useState('');
  const [zapOrderId, setZapOrderId] = useState('');
  const [zapLoading, setZapLoading] = useState(false);

  const [withdrawalAmount, setWithdrawalAmount] = useState('100');
  const [withdrawalUpi, setWithdrawalUpi] = useState('');
  const [walletTab, setWalletTab] = useState<'deposit' | 'withdraw' | 'history'>('deposit');
  const [copiedText, setCopiedText] = useState(false);
  const [depositSubmitted, setDepositSubmitted] = useState(false);
  const [withdrawSubmitted, setWithdrawSubmitted] = useState(false);
  const [expandedLeaderboardMatchId, setExpandedLeaderboardMatchId] = useState<string | null>(null);

  // Toast notifications internally on the device screen
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // ZapUPI dynamic ticker effect
  React.useEffect(() => {
    if (!isZapModalOpen) return;
    
    const interval = setInterval(() => {
      setZapTimer(t => {
        if (t <= 1) {
          clearInterval(interval);
          setZapTxnState('failed');
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    
    return () => clearInterval(interval);
  }, [isZapModalOpen]);

  // Real-time status polling for paid invoices
  const checkPaymentStatus = async () => {
    if (!zapOrderId) return;
    try {
      const response = await fetch('/api/zapupi/order-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          order_id: zapOrderId,
        }),
      });

      const data = await response.json();
      if (data && data.status === 'success' && data.data) {
        const detail = data.data;
        const currentDetailStatus = detail.status; // Pending | Success | Failed
        console.log("[Client] ZapUPI Status Update:", currentDetailStatus);

        if (currentDetailStatus && currentDetailStatus.toLowerCase() === 'success') {
          // Complete and credit balance
          setZapGeneratedUtr(detail.utr || detail.txn_id || zapOrderId);
          setZapTxnState('success');
          showToast("Payment captured successfully!");
        } else if (currentDetailStatus && currentDetailStatus.toLowerCase() === 'failed') {
          setZapTxnState('failed');
          showToast("Payment rejected by gateway solver.");
        }
      }
    } catch (err) {
      console.error("[Client] Failed polling invoice status:", err);
    }
  };

  // Poll ZapUPI status while active
  React.useEffect(() => {
    if (!isZapModalOpen || !zapOrderId) return;
    if (zapTxnState === 'success' || zapTxnState === 'failed') return;

    const interval = setInterval(() => {
      checkPaymentStatus();
    }, 3500);

    return () => clearInterval(interval);
  }, [isZapModalOpen, zapOrderId, zapTxnState]);

  const handleCopyUPI = () => {
    navigator.clipboard.writeText("kill2winpay@ybl");
    setCopiedText(true);
    showToast("UPI ID Copied to Clipboard!");
    setTimeout(() => setCopiedText(false), 2000);
  };

  // Filter matches for selected game, ensuring zero duplicate IDs
  const activeGame = games.find(g => g.id === selectedGameId);
  const gameTournaments = matches
    .filter(m => m.gameId === selectedGameId)
    .filter((m, idx, self) => self.findIndex(x => x.id === m.id) === idx);

  // Handle joining a tournament
  const submitJoinRequest = () => {
    if (!selectedMatchForJoin) return;
    if (!gameUsernameInput.trim()) {
      setGameUsernameError("Free Fire character name cannot be empty!");
      return;
    }
    if (selectedSlotNum === null) {
      setGameUsernameError("Please choose an available slot from the grid below!");
      return;
    }
    if (currentUser.walletBalance < selectedMatchForJoin.entryFee) {
      setGameUsernameError("Insufficient Balance! Please deposit/add coins first.");
      showToast("Insufficient Balance in main wallet!");
      return;
    }

    // Save the Free Fire nickname to the user account
    setCurrentUser(prev => ({
      ...prev,
      gameNickname: gameUsernameInput.trim()
    }));

    joinMatchAction(selectedMatchForJoin.id, gameUsernameInput.trim(), selectedSlotNum);
    setSelectedMatchForJoin(null);
    setGameUsernameInput('');
    setGameUsernameError('');
    setSelectedSlotNum(null);
    showToast(`Successfully registered in ${selectedMatchForJoin.title}!`);
  };

  // Submit deposit
  const handleDepositSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(depositAmount);
    if (isNaN(amt) || amt <= 0) {
      showToast("Please enter a valid amount!");
      return;
    }
    if (amt < 10) {
      showToast("Minimum deposit amount is ₹10!");
      return;
    }

    if (depositMethod === 'ZapUPI Auto-Pay') {
      try {
        setZapLoading(true);
        // Generate distinct invoice key
        const uniqueOrderId = 'K2W_Z_ORD_' + Date.now().toString().substring(5) + Math.floor(Math.random() * 100);
        showToast("Opening secure connection solver to ZapUPI...");

        const response = await fetch('/api/zapupi/create-order', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            order_id: uniqueOrderId,
            amount: amt,
            customer_mobile: currentUser?.phone || '9652562562'
          })
        });

        const data = await response.json();
        if (data && (data.status === 'success' || data.payment_url)) {
          setZapOrderId(uniqueOrderId);
          setZapPaymentUrl(data.payment_url);
          setZapTxnState('initiated');
          setZapTimer(299);
          setZapSelectedApp(null);
          setZapGeneratedUtr(uniqueOrderId);
          setZapUtrManual('');
          setIsZapModalOpen(true);
          showToast("Payment Gateway Session Created Securely!");
        } else {
          showToast("Gateway error: " + (data.message || "Could not instantiate session"));
        }
      } catch (err: any) {
        console.error("ZapUPI Init error:", err);
        showToast("Unable to reach ZapUPI gateway. Review your configuration.");
      } finally {
        setZapLoading(false);
      }
      return;
    }

    if (depositMethod === 'UPI QR Scanner' && !depositUtr.trim()) {
      showToast("Please enter UTR (Transaction ID) for verification!");
      return;
    }
    
    addTransaction(amt, 'deposit', depositMethod, depositUtr);
    setDepositSubmitted(true);
    setTimeout(() => {
      setDepositSubmitted(false);
      setDepositUtr('');
    }, 4000);
    showToast("Deposit request sent to Admin for verification!");
  };

  // Submit withdrawal
  const handleWithdrawalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(withdrawalAmount);
    if (isNaN(amt) || amt <= 0) {
      showToast("Please enter a valid amount!");
      return;
    }
    if (amt < 20) {
      showToast("Minimum withdrawal amount is ₹20!");
      return;
    }
    if (amt > currentUser.walletBalance) {
      showToast("Withdrawal amount exceeds your current wallet balance!");
      return;
    }
    if (!withdrawalUpi.trim()) {
      showToast("Please enter your UPI Address!");
      return;
    }

    addTransaction(amt, 'withdrawal', 'UPI (Manual)', withdrawalUpi);
    setWithdrawSubmitted(true);
    setTimeout(() => {
      setWithdrawSubmitted(false);
      setWithdrawalUpi('');
    }, 4000);
    showToast("Withdrawal request submitted! Pending Admin Manual payout.");
  };

  return (
    <div className={isStandalone ? "w-full max-w-md h-screen md:h-[780px] md:border-[8px] md:border-neutral-800 md:rounded-[36px] bg-neutral-900 shadow-2xl overflow-hidden flex flex-col relative font-sans select-none text-sm leading-normal" : "w-[375px] h-[780px] bg-neutral-900 border-[8px] border-neutral-800 rounded-[36px] shadow-2xl overflow-hidden flex flex-col relative font-sans select-none text-sm leading-normal"}>
      {/* Phone Notch Bar */}
      {!isStandalone ? (
        <div className="bg-black w-full h-7 px-6 flex justify-between items-center text-xs text-neutral-400 z-50">
          <span className="font-semibold text-[10px] text-green-500 font-mono">● LIVE SYNC</span>
          <div className="w-24 h-4 bg-neutral-900 absolute left-1/2 -translate-x-1/2 top-0 rounded-b-xl border border-neutral-800 border-t-0 flex justify-center items-center">
            <div className="w-12 h-1 bg-black rounded-full"></div>
          </div>
          <div className="flex items-center gap-1.5 font-mono text-[9px]">
            <span>5G LTE</span>
            <span>16%</span>
            <div className="w-4 h-2 bg-yellow-500 rounded-sm"></div>
          </div>
        </div>
      ) : (
        <div className="h-2 bg-black md:hidden w-full"></div>
      )}

       {/* Screen Area */}
      <div className="flex-1 flex flex-col overflow-y-auto overflow-x-hidden bg-neutral-950 text-white pb-14 relative font-sans">
        
        {maintenanceMode ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-6 h-full min-h-[600px] bg-neutral-950">
            <div className="scale-125 animate-pulse filter drop-shadow-[0_0_15px_rgba(249,115,22,0.45)]">
              <Kill2WinLogo size={64} showText={false} />
            </div>
            
            <div className="space-y-2 max-w-xs">
              <span className="text-[10px] bg-amber-500 font-extrabold px-3 py-1 rounded text-neutral-950 uppercase tracking-widest font-mono">
                🔧 SERVER MAINTENANCE
              </span>
              <h2 className="font-display font-black text-base text-white tracking-wide uppercase mt-2">
                SYSTEM UNDER MAINTENANCE
              </h2>
              <div className="w-12 h-1 bg-gradient-to-r from-orange-500 to-amber-500 mx-auto rounded-full mt-1.5 animate-pulse"></div>
            </div>

            <p className="text-[10.5px] text-zinc-400 leading-relaxed font-semibold bg-zinc-900/60 border border-zinc-800/80 p-4 rounded-xl max-w-[280px]">
              Our gaming servers are currently undergoing scheduled maintenance to upgrade match coordination portals & payout corridors. 
              Standard registrations, stats checks, and manual cash-outs will be fully synchronized once we are back online.
            </p>

            <div className="w-full max-w-[280px] space-y-2">
              <a 
                href={appUpdateLink}
                target="_blank"
                rel="noreferrer"
                className="w-full bg-orange-500 hover:bg-orange-400 text-zinc-950 font-black py-3 px-4 rounded-lg text-center text-xs tracking-widest uppercase transition-all duration-300 transform hover:scale-[1.02] shadow-lg shadow-orange-950 flex items-center justify-center gap-2 cursor-pointer"
              >
                📲 DOWNLOAD APK UPDATE
              </a>
              <span className="text-[8.5px] text-zinc-500 font-bold block uppercase tracking-wider font-mono">
                Supports all Android devices • Ver 1.45_SEC
              </span>
            </div>

            <div className="pt-2 flex items-center gap-1.5 font-mono text-[9px] text-zinc-500">
              <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-ping"></span>
              <span>ESTIMATED DOWNTIME: ~30 MINS</span>
            </div>
          </div>
        ) : (
          <>
            {/* App Action Toast Notification Drawer Overlay */}
            <AnimatePresence>
              {toastMessage && (
                <motion.div 
                  initial={{ y: -50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -50, opacity: 0 }}
                  className="absolute top-2 left-3 right-3 bg-indigo-600/95 border border-indigo-400 text-white text-xs py-2.5 px-3 rounded-xl shadow-lg z-50 flex items-center gap-2"
                >
                  <Sparkles size={14} className="text-yellow-300 animate-pulse" />
                  <p className="flex-1 font-medium">{toastMessage}</p>
                </motion.div>
              )}
            </AnimatePresence>

        {/* Real-Time Push Notification Alerts Simulator Inside App view */}
        {notifications.length > 0 && (
          <div className="absolute top-2 left-3 right-3 pointer-events-none z-40 space-y-2">
            {notifications.slice(0, 1).map((notify) => (
              <motion.div 
                key={notify.id}
                initial={{ scale: 0.9, y: -20, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                className="pointer-events-auto bg-neutral-900/98 border-2 border-amber-500 rounded-xl p-3 shadow-xl flex items-start gap-2.5 backdrop-blur"
              >
                <div className="bg-amber-500/10 p-1.5 rounded-lg text-amber-500 mt-0.5">
                  <Bell size={18} className="animate-bounce" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-xs text-amber-400 uppercase tracking-wider">Fcm Push Notification</h4>
                  <p className="font-bold text-xs mt-0.5 text-white">{notify.title}</p>
                  <p className="text-[11px] text-neutral-300 mt-0.5">{notify.body}</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Core Screen Body Switching */}
        {activeTab === 'play' && (
          <>
            {/* LOBBY SUBVIEW HOME */}
            {subView === 'lobby' && (
              <div className="flex flex-col">
                {/* Header (KILL 2 WIN brand + Balance) */}
                <header className="p-3 flex justify-between items-center bg-zinc-900/80 border-b border-zinc-800/80 sticky top-0 backdrop-blur z-20">
                  <div className="flex items-center gap-2">
                    <Kill2WinLogo size={34} showText={true} />
                    <span className="text-[8px] bg-red-600 font-extrabold px-1.5 py-0.5 rounded text-white uppercase tracking-wider animate-pulse">LIVE FF</span>
                  </div>
                  <div 
                    onClick={() => setSubView('wallet')}
                    className="flex items-center gap-1.5 bg-zinc-800 hover:bg-zinc-700 transition px-3 py-1.5 rounded-full cursor-pointer border border-zinc-700/60"
                  >
                    <Coins size={14} className="text-yellow-500 animate-pulse" />
                    <span className="text-yellow-400 font-mono font-bold text-xs">₹ {currentUser.walletBalance.toFixed(1)}</span>
                  </div>
                </header>

                {/* Announcement Bar */}
                <div className="bg-indigo-600/95 text-white/95 px-3 py-2 flex items-center gap-2 sticky top-[53px] z-10 border-b border-indigo-700 select-none overflow-hidden">
                  <ShieldAlert size={14} className="text-yellow-300 shrink-0 select-none" />
                  <div className="relative w-full overflow-hidden whitespace-nowrap text-[10px] font-medium">
                    <div className="inline-block animate-marquee uppercase tracking-wide">
                      Announcement: Follow The Rules → Enjoy Fair Gameplay ♦ KILL 2 WIN = Safe, Secure & Trusted ♦ Support available inside wallet ♦
                    </div>
                  </div>
                </div>

                {/* Hero Banner sliders (Admin controlled) */}
                <div className="p-3">
                  {banners.filter(b => b.active).length > 0 ? (
                    <div className="relative rounded-2xl overflow-hidden aspect-[16/8] bg-neutral-900 border border-neutral-800 shadow-lg group">
                      {banners.filter(b => b.active).map((banner, i) => (
                        <div key={banner.id} className="absolute inset-0 w-full h-full">
                          <img 
                            src={banner.imageUrl} 
                            alt={banner.title} 
                            className="w-full h-full object-cover brightness-95 opacity-80"
                            onError={(e) => {
                              // fallback inside iframe
                              e.currentTarget.src = "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=600";
                            }}
                          />
                          <div 
                            onClick={() => {
                              const isExt = banner.deepLink && (banner.deepLink.startsWith('http://') || banner.deepLink.startsWith('https://'));
                              if (isExt) {
                                window.open(banner.deepLink, '_blank');
                              } else if (banner.deepLink === 'wallet') {
                                setSubView('wallet');
                              } else if (banner.deepLink === 'contact') {
                                setSubView('contact');
                              }
                            }}
                            className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent flex flex-col justify-end p-3.5 cursor-pointer hover:from-black/90 transition-all duration-300"
                          >
                            <span className="text-[9px] font-extrabold bg-indigo-600 text-white uppercase tracking-wider px-2 py-0.5 rounded self-start mb-1">PROMO BANNER</span>
                            <h3 className="font-display font-black text-sm tracking-wide text-white drop-shadow-md">{banner.title}</h3>
                            <button 
                              type="button"
                              className="text-[9px] font-bold text-yellow-400 flex items-center gap-0.5 mt-0.5 hover:underline text-left pointer-events-auto cursor-pointer"
                            >
                              {banner.deepLink && (banner.deepLink.startsWith('http://') || banner.deepLink.startsWith('https://')) ? 'Tap to open link' : 'Tap to inspect'} <ChevronRight size={10} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/30 py-6 px-4 text-center">
                      <p className="text-xs text-zinc-500">No active promotional banners added yet.</p>
                      <p className="text-[10px] text-zinc-600 mt-1">Add banners from the Admin Panel to display here!</p>
                    </div>
                  )}
                </div>

                {/* Account / Menu Grid Icon Circles */}
                <div className="px-3 py-1 grid grid-cols-4 gap-2 text-center text-[10px]">
                  <button 
                    onClick={() => setSubView('my_matches')}
                    className="flex flex-col items-center gap-1.5 p-2 bg-zinc-900/80 hover:bg-zinc-800 rounded-xl transition cursor-pointer border border-zinc-800/60"
                  >
                    <div className="w-10 h-10 rounded-full bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                      <Gamepad2 size={18} />
                    </div>
                    <span className="font-bold text-zinc-200">My Matches</span>
                  </button>

                  <button 
                    onClick={() => setSubView('wallet')}
                    className="flex flex-col items-center gap-1.5 p-2 bg-zinc-900/80 hover:bg-zinc-800 rounded-xl transition cursor-pointer border border-zinc-800/60"
                  >
                    <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                      <Wallet size={18} />
                    </div>
                    <span className="font-bold text-zinc-200">My Wallet</span>
                  </button>

                  <button 
                    onClick={() => setSubView('top_players')}
                    className="flex flex-col items-center gap-1.5 p-2 bg-zinc-900/80 hover:bg-zinc-800 rounded-xl transition cursor-pointer border border-zinc-800/60"
                  >
                    <div className="w-10 h-10 rounded-full bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center text-yellow-400">
                      <Trophy size={18} />
                    </div>
                    <span className="font-bold text-zinc-200">Top Players</span>
                  </button>

                  <button 
                    onClick={() => setSubView('contact')}
                    className="flex flex-col items-center gap-1.5 p-2 bg-zinc-900/80 hover:bg-zinc-800 rounded-xl transition cursor-pointer border border-zinc-800/60"
                  >
                    <div className="w-10 h-10 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                      <PhoneCall size={18} />
                    </div>
                    <span className="font-bold text-zinc-200">Contact Us</span>
                  </button>
                </div>

                {/* Games Cards Header */}
                <div className="px-4 pt-4 pb-1 flex justify-between items-center">
                  <span className="font-display font-extrabold text-sm tracking-wide uppercase text-zinc-300">Games Catalogue</span>
                  <span className="text-[10px] text-zinc-500 font-mono">Available {games.length} Modes</span>
                </div>

                {/* Games list in visual grids (matching user screenshot) */}
                <div className="p-3 grid grid-cols-3 gap-2">
                  {games.map((g) => {
                    const count = matches.filter(m => m.gameId === g.id && m.status === 'upcoming').length;
                    return (
                      <div 
                        key={g.id} 
                        onClick={() => {
                          setSelectedGameId(g.id);
                          setSubView('tournament_list');
                        }}
                        className="bg-zinc-900/90 border border-zinc-800/90 rounded-xl overflow-hidden cursor-pointer hover:border-indigo-500/50 hover:bg-neutral-900 transition flex flex-col h-32 relative group"
                      >
                        {/* Background Character image */}
                        <div className="flex-1 w-full bg-zinc-950 overflow-hidden relative">
                          <img 
                            src={g.imageUrl} 
                            alt={g.name} 
                            className="w-full h-full object-cover brightness-90 group-hover:scale-110 transition duration-300 pointer-events-none"
                            onError={(e) => {
                              e.currentTarget.src = "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=150";
                            }}
                          />
                          {count > 0 && (
                            <span className="absolute top-1 right-1 bg-rose-600 text-white font-black text-[8px] px-1.5 py-0.5 rounded-full uppercase scale-90 border border-rose-500 animate-pulse">
                              {count} LIVE
                            </span>
                          )}
                          <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-black to-transparent"></div>
                        </div>
                        {/* Game title footer text */}
                        <div className="p-1 px-1.5 bg-zinc-900 border-t border-zinc-800/60 text-center flex flex-col justify-center shrink-0">
                          <span className="font-display font-black text-[9px] text-white tracking-widest uppercase truncate leading-tight select-none">
                            {g.name}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Empty manual matches notifier disclaimer if no games/matches */}
                {games.length === 0 && (
                  <div className="px-5 py-6 text-center select-none text-zinc-500 flex flex-col items-center gap-3">
                    <span className="p-3 rounded-full bg-zinc-900 inline-block text-zinc-600 border border-zinc-800">
                      <Gamepad2 size={24} />
                    </span>
                    <p className="font-medium text-xs">No active games configured on Admin panel.</p>
                    <p className="text-[10px] text-zinc-600">Please switch to the Admin panel on the right side and click "Add Game" & "Add Match" to populate the list!</p>
                  </div>
                )}
              </div>
            )}

            {/* TOURNAMENT LIST SUBVIEW FOR A SELECTED GAME */}
            {subView === 'tournament_list' && (
              <div className="flex flex-col">
                <header className="p-3.5 flex items-center justify-between bg-zinc-900 sticky top-0 z-20 border-b border-zinc-800">
                  <div className="flex items-center gap-1">
                    <button 
                      onClick={() => setSubView('lobby')} 
                      className="p-1 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition mr-1"
                    >
                      <ChevronLeft size={18} />
                    </button>
                    <span className="font-display font-extrabold text-sm uppercase tracking-wide truncate max-w-44 text-white">
                      {activeGame?.name || "Tournaments"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 bg-zinc-800 px-2.5 py-1 rounded-full border border-zinc-700/50">
                    <Coins size={12} className="text-yellow-500" />
                    <span className="text-yellow-400 font-mono font-bold text-[11px]">₹ {currentUser.walletBalance.toFixed(1)}</span>
                  </div>
                </header>

                <div className="p-3 space-y-3.5">
                  <div className="bg-indigo-600/10 border border-indigo-500/20 rounded-xl p-3 text-[11px] text-indigo-300/90 leading-relaxed flex gap-2">
                    <ShieldAlert size={14} className="shrink-0 text-indigo-400" />
                    <p>Register using your exact character profile name. Results are updated manually by our moderators within 1 hour of match completion.</p>
                  </div>

                  {gameTournaments.length > 0 ? (
                    gameTournaments.map((match) => {
                      const isJoinedByMe = match.joinedUsers.includes(currentUser.uid);
                      const isUpcoming = match.status === 'upcoming';
                      const isOngoing = match.status === 'ongoing';
                      const isCompleted = match.status === 'completed';

                      const matchGame = games.find(g => g.id === match.gameId);
                      const matchCoverImage = match.imageUrl || matchGame?.imageUrl || "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=350";

                      return (
                        <div key={match.id} className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden flex flex-col shadow-md">
                          {/* Rich Cover Banner Image */}
                          <div className="h-40 w-full relative overflow-hidden bg-zinc-950">
                            <img 
                              src={matchCoverImage} 
                              alt={match.title}
                              className="w-full h-full object-cover opacity-85 hover:scale-105 transition-transform duration-500"
                              referrerPolicy="no-referrer"
                              onError={(e) => {
                                e.currentTarget.src = "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=350";
                              }}
                            />
                            {/* Overlay transparent gradient for typography contrast */}
                            <div className="absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-zinc-950/90 to-transparent"></div>
                            
                            {/* Overlay Badge pills */}
                            <div className="absolute top-2 left-2 flex gap-1.5 items-center">
                              <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-sm uppercase tracking-wide select-none ${
                                isUpcoming ? 'bg-indigo-600 text-indigo-100 shadow' :
                                isOngoing ? 'bg-emerald-600 text-emerald-100 shadow animate-pulse' :
                                'bg-zinc-700 text-zinc-300'
                              }`}>
                                {match.status}
                              </span>
                              <span className="text-[9px] text-zinc-100 bg-zinc-900/80 backdrop-blur-xs font-semibold px-2 py-0.5 rounded border border-zinc-800/60 uppercase">
                                {match.map} • {match.type}
                              </span>
                            </div>

                            {/* Live Countdown Target Helper */}
                            {isUpcoming && (
                              <div className="absolute bottom-2 right-2 z-10">
                                <CountdownTimer targetDateTime={match.matchDateTime} />
                              </div>
                            )}
                          </div>

                          {/* Card top banner with match detail info */}
                          <div className="p-3 bg-zinc-900/40 border-b border-zinc-800 flex justify-between items-start gap-3">
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="text-[10px] text-zinc-400 font-bold tracking-wide uppercase font-mono">{match.version} MODE</span>
                              </div>
                              <h4 className="font-display font-black text-xs mt-1 text-zinc-100">{match.title}</h4>
                              <p className="text-[10px] text-indigo-400 mt-0.5 font-bold font-mono">{match.matchDateTime}</p>
                            </div>
                            <div className="text-right">
                              <span className="text-[9px] text-zinc-500 block uppercase font-mono">Entry Fee</span>
                              <span className="font-display font-extrabold text-sm text-yellow-400 font-mono">₹ {match.entryFee}</span>
                            </div>
                          </div>

                          {/* Card stats info values GRID */}
                          <div className="p-3 grid grid-cols-3 gap-2 bg-zinc-900/60 text-center text-xs border-b border-zinc-800/50">
                            <div>
                              <span className="text-[9px] text-zinc-500 block">PRIZE POOL</span>
                              <span className="font-display font-extrabold text-xs text-indigo-400 font-mono">₹{match.prizePool}</span>
                            </div>
                            <div>
                              <span className="text-[9px] text-zinc-500 block">PER KILL PRIZE</span>
                              <span className="font-display font-extrabold text-xs text-yellow-500 font-mono">₹{match.perKill}</span>
                            </div>
                            <div>
                              <span className="text-[9px] text-zinc-500 block">FORMAT</span>
                              <span className="font-display font-extrabold text-xs text-zinc-300 uppercase">{match.type}</span>
                            </div>
                          </div>

                          {/* Room ID & PW display if match ongoing (Trigger notifications) */}
                          {isOngoing && (
                            <div className="m-3 p-2.5 bg-neutral-950 border border-emerald-500/30 rounded-lg">
                              <div className="flex justify-between items-center pb-1.5 border-b border-zinc-800 mb-1.5">
                                <span className="text-[9px] font-bold text-emerald-400 flex items-center gap-1">
                                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span>
                                  LIVE MATCH ROOM ACTIVE
                                </span>
                                <span className="text-[9px] text-zinc-500 font-mono">Joined {match.joinedSlots}/{match.totalSlots}</span>
                              </div>
                              {isJoinedByMe ? (
                                <div className="grid grid-cols-2 gap-3 text-xs">
                                  <div>
                                    <span className="text-[9px] text-neutral-400 block uppercase">Room IP / ID</span>
                                    <span className="font-mono font-bold text-yellow-400 select-all">{match.roomId || "NOT_SET"}</span>
                                  </div>
                                  <div>
                                    <span className="text-[9px] text-neutral-400 block uppercase">Password</span>
                                    <span className="font-mono font-bold text-yellow-400 select-all">{match.roomPassword || "NOT_SET"}</span>
                                  </div>
                                </div>
                              ) : (
                                <p className="text-[10px] text-rose-400 text-center font-semibold">Join match to unlock credentials.</p>
                              )}
                            </div>
                          )}

                          {/* Card slots filling slider and button bar */}
                          <div className="p-3 flex justify-between items-center gap-3">
                            <div className="flex-1">
                              <div className="flex justify-between text-[10px] text-zinc-500 font-semibold mb-1">
                                <span>Slots filled:</span>
                                <span className="text-zinc-300">{match.joinedSlots} / {match.totalSlots}</span>
                              </div>
                              <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-indigo-600 rounded-full transition-all"
                                  style={{ width: `${Math.min((match.joinedSlots / match.totalSlots) * 100, 100)}%` }}
                                ></div>
                              </div>
                            </div>
                            <div className="shrink-0">
                              {isCompleted ? (
                                <button className="bg-zinc-800 hover:bg-zinc-700 text-zinc-400 px-4 py-1.5 rounded-lg text-xs font-semibold cursor-not-allowed uppercase" disabled>
                                  Result Done
                                </button>
                              ) : isJoinedByMe ? (
                                <div className="flex flex-col items-center">
                                  <span className="bg-indigo-600/30 text-indigo-300 font-bold border border-indigo-500/20 px-3 py-1.5 rounded-lg text-xs flex items-center gap-1">
                                    <CheckCircle2 size={12} className="text-indigo-400" /> Joined
                                  </span>
                                </div>
                              ) : (
                                <button 
                                  onClick={() => setSelectedMatchForJoin(match)}
                                  disabled={match.joinedSlots >= match.totalSlots || isOngoing}
                                  className={`bg-indigo-600 text-white hover:bg-indigo-500 px-5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                                    (match.joinedSlots >= match.totalSlots || isOngoing) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                                  }`}
                                >
                                  {match.joinedSlots >= match.totalSlots ? 'FULL' : 'JOIN NOW'}
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-10 px-4 select-none">
                      <p className="text-xs text-zinc-500">No tournaments added for this game mode.</p>
                      <p className="text-[10px] text-zinc-600 mt-1">Visit the Admin panel on the right and click "Add Match" to configure tournaments for this category!</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* MY MATCHES VIEW */}
            {subView === 'my_matches' && (
              <div className="flex flex-col">
                <header className="p-3.5 flex items-center gap-2 bg-zinc-900 border-b border-zinc-800">
                  <button onClick={() => setSubView('lobby')} className="p-1 text-zinc-400 hover:text-white rounded-lg">
                    <ChevronLeft size={18} />
                  </button>
                  <span className="font-display font-extrabold text-sm uppercase tracking-wide">My Tournaments</span>
                </header>

                <div className="p-3 space-y-3">
                  {matches.filter(m => m.joinedUsers.includes(currentUser.uid)).filter((m, idx, self) => self.findIndex(x => x.id === m.id) === idx).length > 0 ? (
                    matches.filter(m => m.joinedUsers.includes(currentUser.uid)).filter((m, idx, self) => self.findIndex(x => x.id === m.id) === idx).map((match) => (
                      <div key={match.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 flex flex-col">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded uppercase ${
                                match.status === 'upcoming' ? 'bg-indigo-600' :
                                match.status === 'ongoing' ? 'bg-emerald-600' :
                                'bg-zinc-700'
                              }`}>
                                {match.status}
                              </span>
                              {match.userSlots?.[currentUser.uid] && (
                                <span className="text-[8px] font-extrabold bg-amber-500/15 text-amber-500 border border-amber-500/20 px-1.5 py-0.5 rounded font-mono uppercase">
                                  🎰 Slot: #{match.userSlots[currentUser.uid]}
                                </span>
                              )}
                            </div>
                            <h4 className="font-bold text-xs mt-1">{match.title}</h4>
                            <p className="text-[10px] text-zinc-500 font-mono mt-0.5">{match.matchDateTime}</p>
                            {match.status === 'upcoming' && (
                              <div className="mt-2 text-left">
                                <CountdownTimer targetDateTime={match.matchDateTime} />
                              </div>
                            )}
                          </div>
                          <div className="text-right">
                            <span className="text-[9px] text-zinc-500 block uppercase">Fee Paid</span>
                            <span className="text-yellow-400 font-bold font-mono">₹{match.entryFee}</span>
                          </div>
                        </div>

                        {match.status === 'ongoing' && (
                          <div className="mt-2.5 p-2 bg-black border border-emerald-500/20 rounded-lg">
                            <p className="text-[9px] text-emerald-400 font-bold mb-1 uppercase tracking-wide">🏆 Room ID & Pass Ready</p>
                            <div className="grid grid-cols-2 text-xs">
                              <p><span className="text-zinc-500 text-[10px]">Room:</span> <strong className="font-mono text-white select-all">{match.roomId}</strong></p>
                              <p><span className="text-zinc-500 text-[10px]">Pass:</span> <strong className="font-mono text-white select-all">{match.roomPassword}</strong></p>
                            </div>
                          </div>
                        )}

                        {match.status === 'completed' && (
                          <div className="mt-2 text-xs space-y-2">
                            <div className="pt-2 border-t border-zinc-800 flex justify-between items-center">
                              <span className="text-zinc-400 block font-semibold">Admin Manual Result:</span>
                              {match.resultDeclared ? (
                                <span className="text-emerald-400 font-bold uppercase tracking-wider text-[10px]">Results Declared</span>
                              ) : (
                                <span className="text-yellow-500 font-medium text-[10px]">Processing Results...</span>
                              )}
                            </div>

                            {match.resultDeclared && (
                              <>
                                {/* Display logged-in user result block */}
                                {(() => {
                                  const myResult = match.results?.[currentUser.uid] || { kills: 0, rank: 1, winnings: 0 };
                                  return (
                                    <div className="bg-zinc-950 p-2.5 rounded-xl border border-zinc-800 space-y-2">
                                      <div className="flex justify-between items-center text-[10px] text-zinc-500 font-bold uppercase tracking-wider border-b border-zinc-800/60 pb-1">
                                        <span>Your Performance</span>
                                        <span className="text-emerald-400 flex items-center gap-1 font-mono">₹{myResult.winnings} Won</span>
                                      </div>
                                      <div className="grid grid-cols-3 gap-1.5 text-center text-[11px]">
                                        <div className="bg-zinc-900 border border-zinc-800/60 p-1.5 rounded-lg">
                                          <p className="text-[8px] text-zinc-500 font-bold uppercase">RANK</p>
                                          <p className="font-bold text-xs text-yellow-500">#{myResult.rank}</p>
                                        </div>
                                        <div className="bg-zinc-900 border border-zinc-800/60 p-1.5 rounded-lg">
                                          <p className="text-[8px] text-zinc-500 font-bold uppercase">KILLS</p>
                                          <p className="font-bold text-xs text-white">{myResult.kills}</p>
                                        </div>
                                        <div className="bg-zinc-900 border border-zinc-800/60 p-1.5 rounded-lg">
                                          <p className="text-[8px] text-zinc-500 font-bold uppercase">WINNINGS</p>
                                          <p className="font-bold text-xs text-green-400 font-mono">₹{myResult.winnings}</p>
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })()}

                                {/* Expand/Collapse scoreboard trigger button */}
                                {match.results && (
                                  <div className="mt-1">
                                    {expandedLeaderboardMatchId === match.id ? (
                                      <div className="bg-zinc-950 p-2.5 rounded-xl border border-zinc-800 space-y-2 mt-2">
                                        <div className="flex justify-between items-center border-b border-zinc-800/60 pb-1.5 mb-1">
                                          <span className="text-[9px] text-zinc-400 uppercase font-black font-mono tracking-widest flex items-center gap-1">
                                            <Trophy size={11} className="text-yellow-500" /> Match Leaderboard
                                          </span>
                                          <button 
                                            onClick={() => setExpandedLeaderboardMatchId(null)} 
                                            className="text-[9px] font-bold text-indigo-400 hover:text-white uppercase transition"
                                          >
                                            Hide
                                          </button>
                                        </div>
                                        <div className="space-y-1 max-h-[140px] overflow-y-auto pr-1">
                                          {Object.entries(match.results).map(([uid, score]) => {
                                            const isMe = uid === currentUser.uid;
                                            return (
                                              <div key={uid} className={`flex justify-between items-center p-1 py-1.5 px-2 rounded-lg text-[11px] border ${isMe ? 'bg-indigo-600/10 border-indigo-500/30' : 'bg-zinc-900/40 border-zinc-800/40'}`}>
                                                <div className="flex items-center gap-1.5">
                                                  <span className={`w-4 h-4 rounded-md flex items-center justify-center font-bold font-mono text-[9px] ${
                                                    score.rank === 1 ? 'bg-yellow-500 text-zinc-950 shadow' : 
                                                    score.rank === 2 ? 'bg-slate-300 text-zinc-950' : 
                                                    score.rank === 3 ? 'bg-amber-600 text-zinc-950' : 
                                                    'bg-zinc-800 text-zinc-400'
                                                  }`}>
                                                    #{score.rank}
                                                  </span>
                                                  <span className={`font-semibold truncate max-w-[100px] ${isMe ? 'text-indigo-400 font-extrabold' : 'text-zinc-300'}`}>
                                                    {score.username} {isMe && "(You)"}
                                                  </span>
                                                </div>
                                                <div className="flex items-center gap-2 font-mono text-[10px]">
                                                  <span className="text-zinc-500 font-bold"><span className="text-zinc-300">{score.kills}</span> Kills</span>
                                                  <span className="text-emerald-400 font-extrabold">₹{score.winnings}</span>
                                                </div>
                                              </div>
                                            );
                                          })}
                                        </div>
                                      </div>
                                    ) : (
                                      <button 
                                        type="button"
                                        onClick={() => setExpandedLeaderboardMatchId(match.id)}
                                        className="w-full mt-1.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 hover:border-zinc-600 text-[10px] font-bold uppercase rounded-lg flex items-center justify-center gap-1 transition"
                                      >
                                        <Trophy size={11} /> Show Full Match Scoreboard
                                      </button>
                                    )}
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12 px-6">
                      <p className="text-xs text-zinc-500">You haven't joined any match yet!</p>
                      <button 
                        onClick={() => setSubView('lobby')}
                        className="mt-3 bg-indigo-600 hover:bg-indigo-500 px-4 py-1.5 rounded-lg text-xs font-bold text-white transition cursor-pointer"
                      >
                        Explore Tournaments
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* WALLET SUBVIEW */}
            {subView === 'wallet' && (
              <div className="flex flex-col">
                <header className="p-3.5 flex items-center gap-2 bg-zinc-900 border-b border-zinc-800">
                  <button onClick={() => setSubView('lobby')} className="p-1 text-zinc-400 hover:text-white rounded-lg">
                    <ChevronLeft size={18} />
                  </button>
                  <span className="font-display font-bold text-sm uppercase tracking-wide">My Financial Wallet</span>
                </header>

                {/* Balance Segment */}
                <div className="p-4 m-3 bg-gradient-to-r from-indigo-700 to-indigo-900 rounded-2xl shadow-md border border-indigo-500/30 flex justify-between items-center">
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-indigo-200 uppercase tracking-widest font-bold">In-App Vault Balance</span>
                    <h3 className="font-display font-extrabold text-2xl text-white font-mono">₹ {currentUser.walletBalance.toFixed(2)}</h3>
                    <p className="text-[9px] text-emerald-200 font-medium">✨ Promo Bonus: ₹ {currentUser.bonusAmount}</p>
                  </div>
                  <div className="bg-white/10 p-2.5 rounded-xl text-yellow-300">
                    <Wallet size={28} className="animate-pulse" />
                  </div>
                </div>

                {/* Sub tabs deposit / withdraw / history */}
                <div className="px-3">
                  <div className="bg-zinc-900 p-1 rounded-xl flex border border-zinc-800">
                    <button 
                      onClick={() => setWalletTab('deposit')}
                      className={`flex-1 text-center py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer ${walletTab === 'deposit' ? 'bg-indigo-600 text-white' : 'text-zinc-500 hover:text-white'}`}
                    >
                      <ArrowDownLeft size={14} /> Add Cash
                    </button>
                    <button 
                      onClick={() => setWalletTab('withdraw')}
                      className={`flex-1 text-center py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer ${walletTab === 'withdraw' ? 'bg-indigo-600 text-white' : 'text-zinc-500 hover:text-white'}`}
                    >
                      <ArrowUpRight size={14} /> Withdraw
                    </button>
                    <button 
                      onClick={() => setWalletTab('history')}
                      className={`flex-1 text-center py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer ${walletTab === 'history' ? 'bg-indigo-600 text-white' : 'text-zinc-500 hover:text-white'}`}
                    >
                      <Coins size={14} /> Ledger
                    </button>
                  </div>
                </div>

                <div className="p-3">
                  {walletTab === 'deposit' && (
                    <form onSubmit={handleDepositSubmit} className="space-y-4 bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                      <h4 className="font-bold text-xs uppercase text-indigo-400">Add Cash to Wallet</h4>
                      <p className="text-[10px] text-zinc-500 leading-relaxed font-semibold">Minimum deposit limit: ₹10. Select automated ZapUPI instant credit or manual UPI slip scanning channel below.</p>
                      
                      {/* Gateway presetting option */}
                      <div className="space-y-1">
                        <label className="text-[9px] text-zinc-500 block uppercase font-bold">Select Deposit Channel</label>
                        <div className="grid grid-cols-2 gap-2">
                          {['ZapUPI Auto-Pay', 'UPI QR Scanner'].map(method => (
                            <button 
                              key={method}
                              type="button" 
                              onClick={() => setDepositMethod(method)}
                              className={`py-2.5 px-2 text-[10px] rounded-lg border font-bold transition flex flex-col items-center justify-center relative cursor-pointer ${
                                depositMethod === method 
                                ? 'bg-indigo-600/15 border-indigo-500 text-indigo-400 shadow-md shadow-indigo-950' 
                                : 'bg-neutral-950 border-zinc-800/80 text-zinc-400 hover:text-white'
                              }`}
                            >
                              <span className="font-sans font-bold leading-none">{method}</span>
                              {method === 'ZapUPI Auto-Pay' && (
                                <span className="text-[7.5px] text-emerald-400 font-extrabold uppercase mt-1 tracking-wider animate-pulse">⚡ AUTO-INSTANT</span>
                              )}
                              {method === 'UPI QR Scanner' && (
                                <span className="text-[7.5px] text-amber-500 font-extrabold uppercase mt-1 tracking-wider">⏳ MANUAL APPROVAL</span>
                              )}
                            </button>
                          ))}
                        </div>
                      </div>

                      {depositMethod === 'ZapUPI Auto-Pay' && (
                        <div className="p-3 bg-neutral-950 border border-zinc-800 rounded-xl space-y-2">
                          <label className="text-[9px] text-zinc-500 block uppercase font-mono font-bold text-left">Quick Deposit Amount (₹ / Coins)</label>
                          <div className="grid grid-cols-3 gap-2">
                            {['10', '20', '50', '60', '100', '200'].map(amt => (
                              <button
                                key={amt}
                                type="button"
                                onClick={() => setDepositAmount(amt)}
                                className={`py-2 rounded-lg text-xs font-mono font-bold transition border cursor-pointer text-center ${
                                  depositAmount === amt
                                  ? 'bg-indigo-600/20 border-indigo-500 text-indigo-400 font-extrabold'
                                  : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-900'
                                }`}
                              >
                                ₹{amt}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {depositMethod === 'UPI QR Scanner' && (
                        <div className="p-3 bg-neutral-950 rounded-xl border border-zinc-800 text-center flex flex-col items-center gap-1.5">
                          <div className="relative mx-auto w-32 h-32 bg-white p-2 rounded-xl shadow-md flex items-center justify-center">
                            <img 
                              src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&color=111827&data=${encodeURIComponent(
                                `upi://pay?pa=kill2winpay@ybl&pn=KILL2WIN&am=${depositAmount}&cu=INR&tn=K2W_MAN_${Date.now().toString().substring(8)}`
                              )}`}
                              alt="Scan Manual UPI"
                              className="w-full h-full object-contain"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                          <p className="text-[10px] text-zinc-400">Scan QR Code through any UPI App (GPay, PhonePe, Paytm, BHIM) to pay</p>
                          
                          <div className="flex flex-col items-center gap-1.5 mt-1 w-full">
                            <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 px-2 py-1 rounded max-w-full">
                              <span className="text-[10px] font-mono text-indigo-400 tracking-wider">kill2winpay@ybl</span>
                              <button type="button" onClick={handleCopyUPI} className="p-1 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded">
                                <Copy size={12} />
                              </button>
                            </div>
                            
                            <a 
                              href={`upi://pay?pa=kill2winpay@ybl&pn=KILL2WIN&am=${depositAmount}&cu=INR&tn=K2W_MAN_${Date.now().toString().substring(8)}`}
                              className="text-[9px] bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 px-3 py-1 rounded-lg font-bold uppercase tracking-wider hover:bg-indigo-600/30 transition hover:scale-102 mt-0.5"
                            >
                              📲 PAY VIA UPI APP
                            </a>
                          </div>
                        </div>
                      )}

                      <div>
                        <label className="text-[9px] text-zinc-500 block uppercase font-mono">Amount (Rupees / Coins)</label>
                        <input 
                          type="number" 
                          value={depositAmount} 
                          onChange={(e) => setDepositAmount(e.target.value)}
                          className="w-full bg-neutral-950 border border-zinc-800 rounded-lg py-2 px-3 text-white font-mono font-bold text-xs mt-1 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" 
                          placeholder="e.g. 50"
                          required 
                        />
                      </div>

                      {depositMethod === 'UPI QR Scanner' && (
                        <div>
                          <label className="text-[9px] text-zinc-500 block uppercase font-mono">Payment UTR / Ref No.</label>
                          <input 
                            type="text" 
                            value={depositUtr} 
                            onChange={(e) => setDepositUtr(e.target.value)}
                            className="w-full bg-neutral-950 border border-zinc-800 rounded-lg py-2 px-3 text-white font-mono font-bold text-xs mt-1 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" 
                            placeholder="Digit 12 character Trans Ref"
                            required={depositMethod === 'UPI QR Scanner'}
                          />
                        </div>
                      )}

                      <button 
                        type="submit" 
                        disabled={depositSubmitted || zapLoading}
                        className={`w-full text-white py-2 rounded-lg text-xs font-bold tracking-widest uppercase transition cursor-pointer flex items-center justify-center gap-1.5 ${
                          depositMethod === 'ZapUPI Auto-Pay' 
                          ? 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-lg shadow-indigo-950/50 disabled:opacity-70' 
                          : 'bg-indigo-600 hover:bg-indigo-500'
                        }`}
                      >
                        {zapLoading ? (
                          <>
                            <span className="w-3.5 h-3.5 rounded-full border-2 border-white/20 border-t-white animate-spin"></span>
                            <span>GENERATING SECURE LINK...</span>
                          </>
                        ) : depositMethod === 'ZapUPI Auto-Pay' ? (
                          '⚡ PROCEED TO INSTANT ZAPUPI' 
                        ) : depositSubmitted 
                          ? "SENT FOR APPROVAL..." 
                          : "SUBMIT DEPOSIT ATTEST"
                        }
                      </button>

                      {depositSubmitted && (
                        <div className="p-2.5 bg-indigo-900/40 border border-indigo-500/20 rounded-lg flex gap-1.5 items-start">
                          <CheckCircle2 size={14} className="text-indigo-400 shrink-0 mt-0.5" />
                          <p className="text-[9.5px] text-indigo-200">Request submitted! Switch to the **Admin Panel** on the right side under **Deposit Verification Requests** to instantly approve and credit this balance.</p>
                        </div>
                      )}
                    </form>
                  )}

                  {walletTab === 'withdraw' && (
                    <form onSubmit={handleWithdrawalSubmit} className="space-y-4 bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                      <h4 className="font-bold text-xs uppercase text-indigo-400">Withdraw Winnings (UPI Only)</h4>
                      <p className="text-[10px] text-zinc-500 leading-relaxed font-semibold">Minimum withdrawal limit: ₹20. Winnings will be processed in 1-4 hours manually by your moderators.</p>

                      <div>
                        <label className="text-[9px] text-zinc-500 block uppercase font-mono">My UPI ID (VPA Handle)</label>
                        <input 
                          type="text" 
                          value={withdrawalUpi} 
                          onChange={(e) => setWithdrawalUpi(e.target.value)}
                          className="w-full bg-neutral-950 border border-zinc-800 rounded-lg py-2 px-3 text-white font-mono font-bold text-xs mt-1 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" 
                          placeholder="e.g. mobile@ybl, kill2win@paytm"
                          required 
                        />
                      </div>

                      <div>
                        <label className="text-[9px] text-zinc-500 block uppercase font-mono">Withdrawal Amount (Rupees)</label>
                        <input 
                          type="number" 
                          value={withdrawalAmount} 
                          onChange={(e) => setWithdrawalAmount(e.target.value)}
                          className="w-full bg-neutral-950 border border-zinc-800 rounded-lg py-2 px-3 text-white font-mono font-bold text-xs mt-1 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" 
                          placeholder="Must be less than Balance"
                          required 
                        />
                      </div>

                      <button 
                        type="submit" 
                        disabled={withdrawSubmitted}
                        className="w-full bg-indigo-600 text-white hover:bg-indigo-500 py-2 rounded-lg text-xs font-bold tracking-wider uppercase transition cursor-pointer"
                      >
                        {withdrawSubmitted ? "WDL REQUEST SENT..." : "REQUEST MANUAL WITHDRAW"}
                      </button>

                      {withdrawSubmitted && (
                        <div className="p-2.5 bg-yellow-900/30 border border-yellow-500/20 rounded-lg flex gap-1.5 items-start">
                          <AlertCircle size={14} className="text-yellow-500 shrink-0 mt-0.5" />
                          <p className="text-[9.5px] text-yellow-300">Approval pending. Open the **Admin Panel** on the right under **Withdrawal Requests Queue** to inspect, process, or confirm payment.</p>
                        </div>
                      )}
                    </form>
                  )}

                  {walletTab === 'history' && (
                    <div className="space-y-2 bg-zinc-900 border border-zinc-800 rounded-xl p-3 max-h-72 overflow-y-auto">
                      <h4 className="font-bold text-xs uppercase text-zinc-400 mb-2">Transaction History Logs</h4>
                      {transactions.filter(t => t.uid === currentUser.uid).length > 0 ? (
                        transactions.filter(t => t.uid === currentUser.uid).map((txn) => (
                          <div key={txn.id} className="p-2 bg-neutral-950 rounded-lg flex justify-between items-center border border-zinc-800/60">
                            <div>
                              <div className="flex items-center gap-1 text-[11px] font-semibold text-zinc-200 uppercase">
                                {txn.type === 'deposit' ? <span className="text-emerald-500">Deposit</span> :
                                 txn.type === 'withdrawal' ? <span className="text-rose-500">Withdraw</span> :
                                 txn.type === 'entry_fee' ? <span className="text-indigo-400">Entry Fee Paid</span> :
                                 <span className="text-yellow-400">Winnings Reward</span>}
                                <span className={`text-[8px] font-bold px-1 rounded-sm ${
                                  txn.status === 'success' || txn.status === 'approved' ? 'bg-emerald-900/40 text-emerald-400' :
                                  txn.status === 'pending' ? 'bg-amber-900/30 text-amber-500' :
                                  txn.status === 'failed' || txn.status === 'Failed' || txn.status === 'rejected' ? 'bg-rose-950 text-rose-400 border border-rose-800/20' :
                                  'bg-zinc-800 text-zinc-500'
                                }`}>
                                  {txn.status}
                                </span>
                              </div>
                              <p className="text-[8px] text-zinc-500 mt-0.5 font-mono">{txn.createdAt.substring(11, 16)} • {txn.utrNo || 'System'}</p>
                            </div>
                            <span className={`font-mono text-xs font-bold ${txn.type === 'deposit' || txn.type === 'winnings' ? 'text-emerald-400' : 'text-rose-400'}`}>
                              {txn.type === 'deposit' || txn.type === 'winnings' ? '+' : '-'} ₹{txn.amount}
                            </span>
                          </div>
                        ))
                      ) : (
                        <p className="text-[11px] text-zinc-600 text-center py-4">No transactions recorded yet.</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TOP PLAYERS LEADERBOARD */}
            {subView === 'top_players' && (
              <div className="flex flex-col">
                <header className="p-3.5 flex items-center gap-2 bg-zinc-900 border-b border-zinc-800">
                  <button onClick={() => setSubView('lobby')} className="p-1 text-zinc-400 hover:text-white rounded-lg">
                    <ChevronLeft size={18} />
                  </button>
                  <span className="font-display font-extrabold text-sm uppercase tracking-wide">Hall Of Fame</span>
                </header>

                <div className="p-4 space-y-4">
                  <div className="flex justify-around items-end pt-5 pb-3 bg-zinc-900/40 border border-zinc-800/80 rounded-2xl relative select-none">
                    {/* Rank 2 */}
                    <div className="flex flex-col items-center">
                      <div className="w-11 h-11 rounded-full border border-zinc-500/30 bg-zinc-800 flex items-center justify-center relative shadow-md">
                        <span className="font-extrabold text-indigo-400 text-sm">2</span>
                      </div>
                      <span className="font-extrabold text-[10px] mt-1 text-zinc-300">Sniper_Raj</span>
                      <span className="font-mono text-[9px] text-indigo-400 font-bold">₹10,540 Earnings</span>
                    </div>

                    {/* Rank 1 */}
                    <div className="flex flex-col items-center">
                      <div className="w-14 h-14 rounded-full border-2 border-yellow-500 bg-zinc-800 flex items-center justify-center relative shadow-lg">
                        <Award size={20} className="text-yellow-500 absolute -top-3.5 animate-bounce" />
                        <span className="font-black text-yellow-500 text-lg">1</span>
                      </div>
                      <span className="font-black text-[11px] mt-1 text-white">Killer_FF_99</span>
                      <span className="font-mono text-[9px] text-yellow-400 font-bold">₹24,850 Earnings</span>
                    </div>

                    {/* Rank 3 */}
                    <div className="flex flex-col items-center">
                      <div className="w-11 h-11 rounded-full border border-zinc-500/30 bg-zinc-800 flex items-center justify-center relative shadow-md">
                        <span className="font-extrabold text-amber-600 text-sm">3</span>
                      </div>
                      <span className="font-extrabold text-[10px] mt-1 text-zinc-400">Rohan_Gamer</span>
                      <span className="font-mono text-[9px] text-amber-500 font-bold">₹8,120 Earnings</span>
                    </div>
                  </div>

                  {/* Leaderboard Table */}
                  <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-sm">
                    <div className="p-2.5 px-3 bg-zinc-800 border-b border-zinc-700/60 flex justify-between text-[9px] text-zinc-500 font-bold uppercase tracking-wider">
                      <span>Top Rank Players</span>
                      <span>Total Prize Money</span>
                    </div>

                    <div className="divide-y divide-zinc-800/50">
                      {[
                        { r: '4', name: 'Aman_Solo_Killa', earnings: '₹6,400' },
                        { r: '5', name: 'CS_Duo_Master', earnings: '₹5,180' },
                        { r: '6', name: 'Deepak_Boss', earnings: '₹4,950' },
                        { r: '7', name: 'Waseem_Gamer', earnings: '₹4,300' },
                      ].map(player => (
                        <div key={player.r} className="p-2.5 px-3 flex justify-between items-center text-xs">
                          <div className="flex items-center gap-3">
                            <span className="font-mono font-extrabold text-zinc-500 w-4">{player.r}</span>
                            <span className="font-bold text-zinc-200">{player.name}</span>
                          </div>
                          <span className="font-mono font-bold text-emerald-400">{player.earnings}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* CONTACT VIEW */}
            {subView === 'contact' && (
              <div className="flex flex-col">
                <header className="p-3.5 flex items-center gap-2 bg-zinc-900 border-b border-zinc-800">
                  <button onClick={() => setSubView('lobby')} className="p-1 text-zinc-400 hover:text-white rounded-lg">
                    <ChevronLeft size={18} />
                  </button>
                  <span className="font-display font-extrabold text-sm uppercase tracking-wide">Developer Support desk</span>
                </header>

                <div className="p-4 space-y-4">
                  <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-center space-y-3">
                    <div className="w-12 h-12 bg-cyan-500/10 border border-cyan-500/30 rounded-2xl flex items-center justify-center text-cyan-400 mx-auto">
                      <MessageSquare size={22} className="animate-pulse" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm tracking-wide text-zinc-100">Need Immediate Assistance?</h4>
                      <p className="text-[10px] text-zinc-500 mt-1 leading-relaxed">Having problems with QR payments, game room registrations, or prize payouts? Contact the KILL 2 WIN Tournament Manager on WhatsApp.</p>
                    </div>

                    <div className="space-y-3 pt-2 text-xs">
                      {/* WhatsApp Desk */}
                      <a 
                        href={`https://wa.me/${contactWhatsApp.replace(/\D/g, '')}`}
                        target="_blank" 
                        rel="noreferrer"
                        className="p-3 bg-zinc-950 hover:bg-zinc-900 rounded-xl justify-between flex items-center border border-zinc-800 transition cursor-pointer group"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-emerald-500 font-bold">🟢</span>
                          <span className="text-zinc-300 font-semibold group-hover:text-white transition">WhatsApp Support Chat</span>
                        </div>
                        <span className="font-mono font-bold text-indigo-400 flex items-center gap-1 group-hover:text-indigo-300 transition">
                          {contactWhatsApp} <ArrowUpRight size={13} />
                        </span>
                      </a>

                      {/* Telegram Desk */}
                      <a 
                        href={contactTelegram.startsWith('http') ? contactTelegram : `https://t.me/${contactTelegram.replace('@', '')}`}
                        target="_blank" 
                        rel="noreferrer"
                        className="p-3 bg-zinc-950 hover:bg-zinc-900 rounded-xl justify-between flex items-center border border-zinc-800 transition cursor-pointer group"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-sky-400 font-bold">🌐</span>
                          <span className="text-zinc-300 font-semibold group-hover:text-white transition">Telegram Support Desk</span>
                        </div>
                        <span className="font-mono font-bold text-indigo-400 flex items-center gap-1 group-hover:text-indigo-300 transition truncate max-w-[150px]">
                          {contactTelegram.substring(contactTelegram.lastIndexOf('/') + 1) || contactTelegram} <ArrowUpRight size={13} />
                        </span>
                      </a>

                      {/* Email Desk */}
                      <a 
                        href={`mailto:${contactEmail}`}
                        className="p-3 bg-zinc-950 hover:bg-zinc-900 rounded-xl justify-between flex items-center border border-zinc-800 transition cursor-pointer group"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-zinc-500 font-bold">✉️</span>
                          <span className="text-zinc-300 font-semibold group-hover:text-white transition">Email Desk</span>
                        </div>
                        <span className="font-mono font-bold text-zinc-400 flex items-center gap-1 group-hover:text-zinc-300 transition">
                          {contactEmail} <ArrowUpRight size={13} />
                        </span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* MORE RULES VIEW */}
        {activeTab === 'more' && (
          <div className="flex flex-col">
            <header className="p-4 bg-zinc-900 flex justify-between items-center border-b border-zinc-800">
              <span className="font-display font-black text-sm uppercase tracking-wide">Tournament Regulation Rules</span>
              <Coins size={16} className="text-yellow-500" />
            </header>

            <div className="p-4 space-y-4">
              <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-3 flex gap-2 text-[11px] text-rose-300">
                <ShieldAlert size={14} className="shrink-0 text-rose-400" />
                <p><strong>Anti-Cheat Notice:</strong> Emulator gameplay, hack tools, teamers, and bugs exploitation will cause permanent instant account suspension without refunds.</p>
              </div>

              <div className="space-y-3 text-[11px]">
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3">
                  <h3 className="font-bold text-zinc-200">1. Joining Standards</h3>
                  <p className="text-zinc-500 mt-1">Users MUST enter their accurate Free Fire game identifier username inside the register popup. Wrong game handles results in manual slot cancellation by managers.</p>
                </div>

                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3">
                  <h3 className="font-bold text-zinc-200">2. Room Credentials</h3>
                  <p className="text-zinc-500 mt-1">Room ID and Password will be posted in the active tournament card inside the app 15 minutes before the match start time. We'll send an automatic FCM notification with credentials.</p>
                </div>

                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3">
                  <h3 className="font-bold text-zinc-200">3. Prize Distribution Rules</h3>
                  <p className="text-zinc-500 mt-1">Manual results are approved and distributed by the app admin. No auto-score scraping is done, so players must wait for results declaration inside the completed matches ledger.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ACCOUNT TAB */}
        {activeTab === 'account' && (
          <div className="flex flex-col">
            <header className="p-4 bg-zinc-900 border-b border-zinc-850 flex justify-between items-center">
              <span className="font-display font-black text-sm uppercase tracking-wide">In-App Gamer Account</span>
              <button 
                onClick={() => setSubView('wallet')}
                className="bg-zinc-800 hover:bg-zinc-700 p-1.5 px-2.5 rounded-full border border-zinc-700/50 flex items-center gap-1"
              >
                <Coins size={12} className="text-yellow-500 animate-pulse" />
                <span className="text-yellow-400 font-mono text-[10px] font-bold">₹{currentUser.walletBalance}</span>
              </button>
            </header>

            <div className="p-4 space-y-4">
              {/* User Avatar Info */}
              <div className="flex items-center gap-3 bg-zinc-900 p-3.5 rounded-xl border border-zinc-800">
                <div className="w-12 h-12 rounded-full bg-indigo-600 border-2 border-indigo-400 flex items-center justify-center text-white text-lg font-black select-none shrink-0">
                  {currentUser.username.substring(0, 1).toUpperCase()}
                </div>
                <div className="space-y-0.5 flex-1 min-w-0">
                  <h3 className="font-bold text-sm tracking-wide text-zinc-100 truncate">{currentUser.username}</h3>
                  <p className="text-[10px] text-zinc-500 font-mono">{currentUser.email}</p>
                  <p className="text-[10px] text-zinc-500 font-mono">Mob: {currentUser.phone}</p>
                  
                  {/* SAVED NICKNAME ATTRIBUTE FOR QUICK MATCH JOINS */}
                  <div className="pt-2 mt-2 border-t border-zinc-800/80 space-y-1">
                    <span className="text-[8px] text-orange-400 uppercase font-bold tracking-widest block font-mono">🎮 Saved FF Nickname:</span>
                    <input 
                      type="text"
                      value={currentUser.gameNickname || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        setCurrentUser(prev => ({ ...prev, gameNickname: val }));
                      }}
                      placeholder="Not set (will save on join)"
                      className="w-full bg-neutral-950 border border-zinc-800 rounded-md py-1 px-2 text-[10.5px] font-bold text-white font-mono outline-none focus:border-indigo-500 placeholder:text-zinc-650"
                    />
                  </div>
                </div>
              </div>

              {/* Stats segments card */}
              <div className="grid grid-cols-2 gap-2 text-center text-xs">
                <div className="bg-zinc-900 p-3 rounded-xl border border-zinc-800">
                  <span className="text-[9px] text-zinc-500 block uppercase font-semibold">Matches Registered</span>
                  <span className="font-display font-extrabold text-lg text-indigo-400 font-mono">
                    {currentUser.joinedMatches.length}
                  </span>
                </div>
                <div className="bg-zinc-900 p-3 rounded-xl border border-zinc-800">
                  <span className="text-[9px] text-zinc-500 block uppercase font-semibold">Total Net Earnings</span>
                  <span className="font-display font-extrabold text-lg text-emerald-400 font-mono">
                    ₹ 180.0
                  </span>
                </div>
              </div>

              {/* Developer Configuration profile simulator options */}
              <div className="bg-zinc-900/40 border border-zinc-800 rounded-xl p-3.5 space-y-3">
                <h4 className="font-bold text-[10px] uppercase text-zinc-500 tracking-wider">Simulated Account Switcher</h4>
                <p className="text-[10.5px] text-zinc-500 leading-relaxed">This dropdown alters the mobile client profile simulating multiple users joining, wallet deposits, and results declarations from the Admin dashboard.</p>
                
                <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                  <button 
                    onClick={() => {
                      setCurrentUser({
                        uid: "usr_active_rohan",
                        username: "Rohan Gamer",
                        email: "rohan@gmail.com",
                        phone: "9876543210",
                        walletBalance: 150,
                        bonusAmount: 20,
                        joinedMatches: currentUser.joinedMatches,
                        completedMatches: []
                      });
                      showToast("Logged in as Rohan Gamer!");
                    }}
                    className={`p-2 font-bold rounded-lg border transition cursor-pointer ${currentUser.uid === 'usr_active_rohan' ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-neutral-950 text-zinc-400 border-zinc-800 hover:text-white'}`}
                  >
                    Rohan Gamer (Me)
                  </button>
                  <button 
                    onClick={() => {
                      setCurrentUser({
                        uid: "usr_active_isha",
                        username: "Queen_Aisha_FF",
                        email: "aisha_ff@gmail.com",
                        phone: "9122334455",
                        walletBalance: 25,
                        bonusAmount: 10,
                        joinedMatches: currentUser.joinedMatches,
                        completedMatches: []
                      });
                      showToast("Logged in as Queen Aisha!");
                    }}
                    className={`p-2 font-bold rounded-lg border transition cursor-pointer ${currentUser.uid === 'usr_active_isha' ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-neutral-950 text-zinc-400 border-zinc-800 hover:text-white'}`}
                  >
                    Queen Aisha (User 2)
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        </>
        )}
      </div>

      {/* JOIN MATCH FORM MODAL POPUP (Simulating character name prompt query) */}
      <AnimatePresence>
        {selectedMatchForJoin && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md overflow-hidden text-sm max-h-[90vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 border-b border-zinc-850 flex items-center justify-between shrink-0">
                <div>
                  <h4 className="font-display font-extrabold text-xs uppercase text-indigo-400">Match Slots Registration</h4>
                  <p className="text-[10px] text-zinc-500 font-bold tracking-wide mt-0.5">{selectedMatchForJoin.title}</p>
                </div>
                <span className="text-yellow-400 font-mono font-black text-xs">Fee: ₹{selectedMatchForJoin.entryFee}</span>
              </div>

              <div className="p-4 space-y-3.5 overflow-y-auto flex-1 scrollbar-thin">
                <div className="space-y-1">
                  <label className="text-[9px] text-zinc-400 block uppercase font-bold tracking-wider font-mono">
                    👤 Enter Free Fire Nickname:
                  </label>
                  <input 
                    type="text" 
                    value={gameUsernameInput} 
                    onChange={(e) => {
                      setGameUsernameInput(e.target.value);
                      setGameUsernameError('');
                    }}
                    className="w-full bg-neutral-950 border border-zinc-810 text-white rounded-lg py-2 px-3 font-semibold text-xs mt-0.5 outline-none focus:border-indigo-500 font-mono"
                    placeholder="e.g. SNIPER_BOSS, KILLA_FF"
                  />
                </div>

                {/* THE POWERFUL INTERACTIVE SLOT SELECTOR */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-[9px] uppercase font-bold tracking-wider font-mono">
                    <span className="text-zinc-400">
                      🎮 Choose Slot: {selectedSlotNum ? (
                        <span className="text-orange-400 font-black animate-pulse">#Slot {selectedSlotNum} Selected</span>
                      ) : (
                        <span className="text-rose-500 font-bold">Required *</span>
                      )}
                    </span>
                    <span className="text-zinc-500">Cap: {selectedMatchForJoin.totalSlots || 48} Players</span>
                  </div>
                  
                  <div className="bg-neutral-950 p-2 rounded-xl border border-zinc-800/80">
                    <div className="flex gap-4 justify-center text-[7.5px] text-zinc-500 uppercase font-black tracking-wider pb-1.5 border-b border-zinc-900 mb-2 font-mono">
                      <div className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-zinc-800"></span> 
                        <span>Available</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-900/40"></span> 
                        <span>Taken</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-505 bg-indigo-500"></span> 
                        <span>Yours</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-8 gap-1.5 max-h-[140px] overflow-y-auto pr-0.5 scrollbar-thin">
                      {Array.from({ length: selectedMatchForJoin.totalSlots || 48 }, (_, idx) => {
                        const slotNo = idx + 1;
                        const takenList = getTakenSlotsForMatch(selectedMatchForJoin.id, selectedMatchForJoin.totalSlots || 48);
                        const takenByUserSlots = selectedMatchForJoin.userSlots ? Object.values(selectedMatchForJoin.userSlots) : [];
                        const isBooked = takenList.includes(slotNo) || takenByUserSlots.includes(slotNo);
                        const isCurrent = selectedSlotNum === slotNo;

                        return (
                          <button
                            key={slotNo}
                            type="button"
                            disabled={isBooked}
                            onClick={() => {
                              setSelectedSlotNum(slotNo);
                              setGameUsernameError('');
                            }}
                            className={`h-7 rounded-lg font-mono text-[9px] font-black tracking-tight flex items-center justify-center transition-all cursor-pointer ${
                              isBooked 
                              ? 'bg-rose-950/20 border border-rose-950/30 text-rose-500/30 cursor-not-allowed opacity-50' 
                              : isCurrent 
                              ? 'bg-indigo-600 border border-indigo-400 text-white font-extrabold ring-1 ring-indigo-500/40 scale-102 shadow-md shadow-indigo-950/60' 
                              : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:bg-zinc-800/90 hover:text-white hover:border-zinc-700'
                            }`}
                          >
                            {slotNo}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {gameUsernameError && (
                  <p className="text-[10px] font-bold text-rose-500 mt-1 flex items-center gap-1 bg-rose-500/10 p-2 rounded-lg border border-rose-500/20">
                    <AlertCircle size={11} className="shrink-0" /> 
                    <span>{gameUsernameError}</span>
                  </p>
                )}

                <div className="p-3 bg-neutral-950 rounded-xl border border-zinc-800/80 leading-relaxed text-[9.5px] text-zinc-400 space-y-1.5 font-sans">
                  <p className="font-bold text-indigo-400 uppercase tracking-wider text-[10px] font-mono">Join match details:</p>
                  <ul className="list-disc pl-4 space-y-1 font-semibold">
                    <li>Entry fee <strong className="text-white">₹{selectedMatchForJoin.entryFee}</strong> will be immediately debited from wallet.</li>
                    <li>Incorrect nickname cancels placement score & manual payouts.</li>
                    <li>Room codes will appear inside ticket 15 mins prior.</li>
                  </ul>
                </div>
              </div>

              <div className="p-3 bg-zinc-900/60 border-t border-zinc-850 flex gap-2 justify-end shrink-0">
                <button 
                  onClick={() => {
                    setSelectedMatchForJoin(null);
                    setGameUsernameError('');
                    setGameUsernameInput('');
                    setSelectedSlotNum(null);
                  }}
                  className="px-4 py-2 text-zinc-400 hover:bg-zinc-800 transition rounded-lg text-xs font-semibold cursor-pointer font-bold"
                >
                  Cancel
                </button>
                <button 
                  onClick={submitJoinRequest}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                >
                  Confirm Slot Ticket
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {isZapModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-neutral-950/95 backdrop-blur-md z-50 flex items-center justify-center p-4 font-sans"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-[310px] overflow-hidden text-neutral-200 shadow-2xl flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Top Branded Panel */}
              <div className="bg-gradient-to-r from-indigo-900 via-indigo-950 to-violet-950 p-4 shrink-0 text-center relative border-b border-zinc-800">
                <div className="flex justify-between items-center mb-1">
                  <div className="flex items-center gap-1.5">
                    <span className="p-1 bg-white/10 rounded-lg text-emerald-400">
                      <ShieldAlert size={14} />
                    </span>
                    <span className="text-[10px] font-black tracking-widest text-indigo-300 uppercase">ZAP-UPI GATEWAY</span>
                  </div>
                  <div className="bg-amber-500/20 text-amber-400 text-[9px] font-mono font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-ping"></span>
                    <span>
                      {Math.floor(zapTimer / 60)}:{(zapTimer % 60 < 10 ? '0' : '') + (zapTimer % 60)}
                    </span>
                  </div>
                </div>
                <div className="my-2">
                  <span className="text-[10px] text-indigo-200 block uppercase font-bold tracking-wider">Secure Payment Request</span>
                  <h3 className="text-2xl font-extrabold text-white font-mono mt-0.5">₹ {parseFloat(depositAmount).toFixed(2)}</h3>
                </div>
                <p className="text-[9px] text-zinc-400 font-mono">Key: <code className="text-yellow-400">zapb6bb0f...ea4</code></p>
              </div>

              {/* Core interactive area */}
              <div className="p-4 flex-1 flex flex-col items-center justify-center min-h-[300px] select-none">
                {zapTxnState === 'initiated' && (
                  <div className="w-full space-y-3 text-center">
                    <p className="text-[10px] text-zinc-400 leading-snug">
                       Open the secure payment page or scan the QR Code using any UPI scanner app to complete the transaction.
                    </p>
                    
                    <div className="relative mx-auto w-36 h-36 bg-white p-2 rounded-2xl shadow-xl flex items-center justify-center border border-zinc-200">
                      <img 
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&color=111827&data=${encodeURIComponent(zapPaymentUrl || 'https://pay.zapupi.com')}`}
                        alt="ZapUPI Scan QR"
                        className="w-full h-full object-contain"
                        referrerPolicy="no-referrer"
                      />
                    </div>

                    <div className="space-y-1.5 pt-1 w-full">
                      <a 
                        href={zapPaymentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black text-[11.5px] py-2.5 px-3 rounded-xl uppercase tracking-wider text-center transition hover:scale-102 flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-950/40 cursor-pointer"
                      >
                        📲 OPEN LIVE PAYMENT PAGE
                      </a>

                      <button
                        type="button"
                        onClick={() => {
                          showToast("Re-checking secure invoice status...");
                          checkPaymentStatus();
                        }}
                        className="w-full bg-zinc-800 hover:bg-zinc-700 text-neutral-200 border border-zinc-750 font-bold text-[9px] py-1.5 px-3 rounded-xl uppercase tracking-wider transition cursor-pointer"
                      >
                        🔄 RE-CHECK PAYMENT STATUS
                      </button>
                    </div>

                    <div className="pt-2 border-t border-zinc-850 w-full">
                      <p className="text-[9px] text-zinc-500 uppercase font-black tracking-widest mb-1 shadow-sm font-mono text-center">📲 TAP TO AUTO-PAY ON MOBILE</p>
                      
                      <div className="grid grid-cols-2 gap-2 mt-1.5">
                        <a 
                          href={zapPaymentUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => {
                            setZapSelectedApp('gpay');
                            setZapTxnState('verifying');
                          }}
                          className="bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-[10px] py-2 px-2.5 rounded-xl uppercase tracking-wider text-center transition hover:scale-102 flex items-center justify-center gap-1"
                        >
                          💸 GPAY
                        </a>
                        <a 
                          href={zapPaymentUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => {
                            setZapSelectedApp('phonepe');
                            setZapTxnState('verifying');
                          }}
                          className="bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-[10px] py-2 px-2.5 rounded-xl uppercase tracking-wider text-center transition hover:scale-102 flex items-center justify-center gap-1"
                        >
                          👾 PhonePe
                        </a>
                      </div>

                      <div className="grid grid-cols-2 gap-2 mt-1.5">
                        <a 
                          href={zapPaymentUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => {
                            setZapSelectedApp('paytm');
                            setZapTxnState('verifying');
                          }}
                          className="bg-sky-600 hover:bg-sky-500 text-white font-extrabold text-[10px] py-1.5 px-2.5 rounded-xl uppercase tracking-wider text-center transition hover:scale-102 flex items-center justify-center gap-1"
                        >
                          🏦 Paytm
                        </a>
                        <a 
                          href={zapPaymentUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => {
                            setZapSelectedApp('bhim');
                            setZapTxnState('verifying');
                          }}
                          className="bg-orange-600 hover:bg-orange-500 text-white font-extrabold text-[10px] py-1.5 px-2.5 rounded-xl uppercase tracking-wider text-center transition hover:scale-102 flex items-center justify-center gap-1"
                        >
                          ✨ BHIM UPI
                        </a>
                      </div>
                    </div>
                  </div>
                )}

                {zapTxnState === 'processing' && (
                  <div className="text-center space-y-4">
                    <div className="relative mx-auto w-12 h-12 flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin"></div>
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-bold text-xs text-white uppercase tracking-wider">Opening Payment App...</h4>
                      <p className="text-[10px] text-zinc-400 leading-normal">Redirecting you to the ZapUPI checkout terminal. Once done, balance will instantly credit.</p>
                    </div>
                  </div>
                )}

                {zapTxnState === 'verifying' && (
                  <div className="w-full text-center space-y-4">
                    <div className="relative mx-auto w-10 h-10 flex items-center justify-center">
                      <span className="w-6 h-6 rounded-full bg-indigo-500 animate-ping absolute opacity-70"></span>
                      <span className="w-3 h-3 rounded-full bg-indigo-500 relative"></span>
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-bold text-xs text-indigo-400 uppercase tracking-widest font-mono">Verifying Transaction</h4>
                      <p className="text-[9.5px] text-zinc-400 leading-relaxed">Auto-checking standard UPI status hook. This will update instantly once your app registers payment completion.</p>
                    </div>

                    <div className="border-t border-zinc-850 pt-3 text-left">
                      <label className="text-[9px] text-zinc-500 block uppercase font-mono mt-1">Manual verification fallback</label>
                      <div className="flex gap-1.5 mt-1">
                        <button
                          type="button"
                          onClick={async () => {
                            showToast("Checking manual transaction status...");
                            await checkPaymentStatus();
                          }}
                          className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[10px] py-2 rounded-lg uppercase tracking-wide cursor-pointer"
                        >
                          Force Check Status
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {zapTxnState === 'success' && (
                  <div className="text-center space-y-4 py-2 w-full">
                    <div className="w-14 h-14 bg-emerald-500/10 border border-emerald-500 rounded-full flex items-center justify-center mx-auto text-emerald-400 shadow-lg animate-bounce">
                      <CheckCircle2 size={32} className="scale-105" />
                    </div>
                    
                    <div className="space-y-1">
                      <span className="text-[9px] bg-emerald-500 text-zinc-950 font-black px-2 py-0.5 rounded-full uppercase tracking-wider">PAYMENT RECEIVED</span>
                      <h4 className="font-extrabold text-white text-sm mt-1.5">₹ {parseFloat(depositAmount).toFixed(2)} Credited</h4>
                      <p className="text-[10px] text-zinc-400 tracking-wide">Settlement resolved securely instantly.</p>
                    </div>

                    <div className="bg-neutral-950 p-2 text-left space-y-0.5 max-w-full font-mono text-[9px] rounded-lg border border-zinc-850">
                      <div className="flex justify-between gap-4"><span className="text-zinc-500">REF TRANSACTION:</span><span className="text-indigo-400 font-bold">{zapGeneratedUtr}</span></div>
                      <div className="flex justify-between gap-4"><span className="text-zinc-500">ZAP GATEWAY CODE:</span><span className="text-emerald-400 font-bold">SETTLED_AUTO</span></div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        // Settle cash instantly!
                        addTransaction(parseFloat(depositAmount), 'deposit', 'ZapUPI Auto-Pay', zapGeneratedUtr);
                        setIsZapModalOpen(false);
                        showToast(`₹${depositAmount} deposited instantly via ZapUPI!`);
                      }}
                      className="w-full bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black text-xs py-2.5 rounded-xl uppercase tracking-wider shadow-lg transition cursor-pointer"
                    >
                      CLAIM INSTANT BALANCE
                    </button>
                  </div>
                )}

                {zapTxnState === 'failed' && (
                  <div className="text-center space-y-4">
                    <div className="w-12 h-12 bg-rose-500/10 border border-rose-500 rounded-full flex items-center justify-center mx-auto text-rose-500">
                      <AlertCircle size={28} />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-bold text-xs text-rose-500 uppercase">Gateway Timeout</h4>
                      <p className="text-[10px] text-zinc-400 text-center leading-normal">No response was received within the allocated session. Please try again.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsZapModalOpen(false)}
                      className="w-full bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs py-2 rounded-xl uppercase transition cursor-pointer"
                    >
                      Close Gateway
                    </button>
                  </div>
                )}
              </div>

              {/* Secure Footer Info */}
              <div className="bg-zinc-950/80 p-3 text-center border-t border-zinc-850 flex items-center justify-center gap-1.5 text-zinc-500 text-[8px] tracking-wider uppercase font-sans shrink-0">
                <Lock size={9} className="text-indigo-500" />
                <span>PCI-DSS Secured • automated payment pipeline</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Styled Android Soft Buttons Bottom Navigation Bar (matching screenshot) */}
      {!maintenanceMode && (
      <nav className="absolute bottom-0 inset-x-0 h-14 bg-zinc-950 border-t border-zinc-800/80 flex justify-around items-center select-none text-[10px] z-30">
        <button 
          onClick={() => {
            setActiveTab('more');
            setSubView('lobby');
          }}
          className={`flex flex-col items-center gap-0.5 px-3 py-1 text-center transition cursor-pointer ${activeTab === 'more' ? 'text-yellow-500' : 'text-zinc-500 hover:text-white'}`}
        >
          <div className="w-5 h-5 flex items-center justify-center rounded-lg">
            <ShieldAlert size={16} />
          </div>
          <span className="font-bold tracking-wide">More</span>
        </button>

        <button 
          onClick={() => {
            setActiveTab('play');
            setSubView('lobby');
          }}
          className={`flex flex-col items-center gap-0.5 px-3 py-1 text-center transition cursor-pointer ${activeTab === 'play' && subView === 'lobby' ? 'text-yellow-500' : 'text-zinc-500 hover:text-white'}`}
        >
          <div className="w-5 h-5 flex items-center justify-center rounded-lg">
            <Gamepad2 size={16} />
          </div>
          <span className="font-bold tracking-wide">Play</span>
        </button>

        <button 
          onClick={() => {
            setActiveTab('account');
            setSubView('lobby');
          }}
          className={`flex flex-col items-center gap-0.5 px-3 py-1 text-center transition cursor-pointer ${activeTab === 'account' ? 'text-yellow-500' : 'text-zinc-500 hover:text-white'}`}
        >
          <div className="w-5 h-5 flex items-center justify-center rounded-lg">
            <User size={16} />
          </div>
          <span className="font-bold tracking-wide">Account</span>
        </button>
      </nav>
      )}
    </div>
  );
}
