import React, { useState } from 'react';
import { Wallet, ArrowDownLeft, ArrowUpRight, Plus, Send, AlertCircle } from 'lucide-react';
import { AppUser, WalletTransaction } from './types';
import { initiateUPIPayment, requestWithdrawal } from './paymentHooks';

interface WalletComponentProps {
  user: AppUser;
  onUpdateUser: (user: AppUser) => void;
  transactions: WalletTransaction[];
}

export default function WalletComponent({ user, onUpdateUser, transactions }: WalletComponentProps) {
  const [activeTab, setActiveTab] = useState<'balance' | 'deposit' | 'withdraw'>('balance');
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [bankAccount, setBankAccount] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [accountHolder, setAccountHolder] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const recentTransactions = transactions
    .filter(t => t.uid === user.uid)
    .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
    .slice(0, 5);

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!depositAmount || isNaN(parseFloat(depositAmount))) {
      setError('Enter a valid amount');
      return;
    }

    const amount = parseFloat(depositAmount);
    if (amount < 10) {
      setError('Minimum deposit is ₹10');
      return;
    }

    setLoading(true);
    
    await initiateUPIPayment(
      amount,
      user.uid,
      user.email,
      user.username,
      (data) => {
        setSuccess(`Deposit of ₹${amount} completed! Transaction ID: ${data.transactionId}`);
        setDepositAmount('');
        setLoading(false);
        // Update user balance
        onUpdateUser({
          ...user,
          walletBalance: user.walletBalance + amount,
        });
      },
      (error) => {
        setError(error);
        setLoading(false);
      }
    );
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!withdrawAmount || !bankAccount || !ifscCode || !accountHolder) {
      setError('All fields are required');
      return;
    }

    const amount = parseFloat(withdrawAmount);
    if (amount < 100) {
      setError('Minimum withdrawal is ₹100');
      return;
    }

    if (amount > user.walletBalance) {
      setError('Insufficient balance');
      return;
    }

    setLoading(true);
    
    const result = await requestWithdrawal(
      user.uid,
      amount,
      bankAccount,
      ifscCode,
      accountHolder
    );

    if (result.success) {
      setSuccess(`Withdrawal of ₹${amount} requested! Transaction ID: ${result.transactionId}`);
      setWithdrawAmount('');
      setBankAccount('');
      setIfscCode('');
      setAccountHolder('');
      onUpdateUser({
        ...user,
        walletBalance: user.walletBalance - amount,
      });
    } else {
      setError(result.error);
    }

    setLoading(false);
  };

  return (
    <div className="space-y-4">
      {/* Balance Card */}
      <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg p-6 text-white shadow-lg">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-sm opacity-90">Total Balance</p>
            <h1 className="text-4xl font-black">₹{user.walletBalance.toFixed(2)}</h1>
          </div>
          <Wallet className="w-8 h-8 opacity-80" />
        </div>
        <p className="text-xs opacity-75">Bonus: ₹{user.bonusAmount.toFixed(2)}</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-zinc-700">
        {(['balance', 'deposit', 'withdraw'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 px-4 font-semibold text-sm capitalize transition-colors ${
              activeTab === tab
                ? 'text-indigo-400 border-b-2 border-indigo-400'
                : 'text-zinc-400 hover:text-zinc-300'
            }`}
          >
            {tab === 'balance' && 'History'}
            {tab === 'deposit' && 'Add Money'}
            {tab === 'withdraw' && 'Withdraw'}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="min-h-[300px]">
        {/* Transaction History */}
        {activeTab === 'balance' && (
          <div className="space-y-3">
            {recentTransactions.length === 0 ? (
              <p className="text-zinc-400 text-center py-8">No transactions yet</p>
            ) : (
              recentTransactions.map((txn) => (
                <div
                  key={txn.id}
                  className="flex items-center justify-between p-3 bg-zinc-900 rounded-lg border border-zinc-800"
                >
                  <div className="flex items-center gap-3">
                    {txn.type === 'deposit' || txn.type === 'bonus' ? (
                      <div className="w-10 h-10 rounded-full bg-green-900/30 flex items-center justify-center">
                        <ArrowDownLeft className="w-5 h-5 text-green-400" />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-red-900/30 flex items-center justify-center">
                        <ArrowUpRight className="w-5 h-5 text-red-400" />
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-sm capitalize text-zinc-200">
                        {txn.type === 'deposit' ? 'Deposit' : txn.type === 'withdrawal' ? 'Withdrawal' : txn.type}
                      </p>
                      <p className="text-xs text-zinc-500">
                        {new Date(txn.createdAt || '').toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <p
                    className={`font-bold text-sm ${
                      txn.type === 'deposit' || txn.type === 'bonus'
                        ? 'text-green-400'
                        : 'text-red-400'
                    }`}
                  >
                    {txn.type === 'deposit' || txn.type === 'bonus' ? '+' : '-'}₹{txn.amount}
                  </p>
                </div>
              ))
            )}
          </div>
        )}

        {/* Deposit Form */}
        {activeTab === 'deposit' && (
          <form onSubmit={handleDeposit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Amount (₹)
              </label>
              <input
                type="number"
                min="10"
                step="10"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                placeholder="Enter amount"
                disabled={loading}
                className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-4 py-2.5 text-zinc-100 focus:outline-none focus:border-indigo-500"
              />
              <p className="text-xs text-zinc-500 mt-1">Minimum ₹10</p>
            </div>

            {error && (
              <div className="p-3 bg-red-900/30 border border-red-500/50 rounded-lg flex gap-2">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {success && (
              <div className="p-3 bg-green-900/30 border border-green-500/50 rounded-lg">
                <p className="text-green-400 text-sm">✓ {success}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:from-zinc-700 disabled:to-zinc-700 text-white font-bold py-2.5 rounded-lg transition flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Plus className="w-5 h-5" />
                  Add Money via UPI
                </>
              )}
            </button>

            <p className="text-xs text-zinc-500 text-center">
              We accept UPI, Credit Cards, and Debit Cards via ZapUPI
            </p>
          </form>
        )}

        {/* Withdrawal Form */}
        {activeTab === 'withdraw' && (
          <form onSubmit={handleWithdraw} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Amount (₹)
              </label>
              <input
                type="number"
                min="100"
                step="10"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                placeholder="Enter amount"
                disabled={loading}
                className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-4 py-2.5 text-zinc-100 focus:outline-none focus:border-indigo-500"
              />
              <p className="text-xs text-zinc-500 mt-1">
                Minimum ₹100 | Available: ₹{user.walletBalance.toFixed(2)}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Account Holder Name
              </label>
              <input
                type="text"
                value={accountHolder}
                onChange={(e) => setAccountHolder(e.target.value)}
                placeholder="Your name"
                disabled={loading}
                className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-4 py-2.5 text-zinc-100 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Bank Account Number
              </label>
              <input
                type="text"
                value={bankAccount}
                onChange={(e) => setBankAccount(e.target.value)}
                placeholder="Account number"
                disabled={loading}
                className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-4 py-2.5 text-zinc-100 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                IFSC Code
              </label>
              <input
                type="text"
                value={ifscCode}
                onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
                placeholder="e.g., SBIN0001234"
                disabled={loading}
                className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-4 py-2.5 text-zinc-100 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-900/30 border border-red-500/50 rounded-lg flex gap-2">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {success && (
              <div className="p-3 bg-green-900/30 border border-green-500/50 rounded-lg">
                <p className="text-green-400 text-sm">✓ {success}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:from-zinc-700 disabled:to-zinc-700 text-white font-bold py-2.5 rounded-lg transition flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Request Withdrawal
                </>
              )}
            </button>

            <p className="text-xs text-zinc-500 text-center">
              Withdrawals are processed within 1-2 business days
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
