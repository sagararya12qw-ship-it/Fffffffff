import React, { useState } from 'react';
import { Mail, Lock, User, LogIn, UserPlus, AlertCircle } from 'lucide-react';
import { signUpUser, signInUser } from './authHooks';
import { AppUser } from './types';

interface AuthComponentProps {
  onAuthSuccess: (user: AppUser) => void;
}

export default function AuthComponent({ onAuthSuccess }: AuthComponentProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!email || !password || !username) {
      setError('All fields are required');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    const result = await signUpUser(email, password, username);
    
    if (result.success && result.user) {
      setSuccess(true);
      localStorage.setItem('skillclash_user', JSON.stringify(result.user));
      setTimeout(() => onAuthSuccess(result.user!), 1500);
    } else {
      setError(result.error || 'Failed to sign up');
    }
    
    setLoading(false);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!email || !password) {
      setError('Email and password are required');
      setLoading(false);
      return;
    }

    const result = await signInUser(email, password);
    
    if (result.success && result.user) {
      setSuccess(true);
      localStorage.setItem('skillclash_user', JSON.stringify(result.user));
      setTimeout(() => onAuthSuccess(result.user!), 1500);
    } else {
      setError(result.error || 'Failed to sign in');
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-black to-zinc-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-lg backdrop-blur-sm p-8 shadow-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500 mb-2">
              KILL 2 WIN
            </h1>
            <p className="text-zinc-400 text-sm">
              {isSignUp ? 'Create your gaming account' : 'Sign in to your account'}
            </p>
          </div>

          {/* Success Message */}
          {success && (
            <div className="mb-6 p-3 bg-green-900/30 border border-green-500/50 rounded-lg">
              <p className="text-green-400 text-sm font-medium">
                ✓ {isSignUp ? 'Account created!' : 'Signed in!'} Redirecting...
              </p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-3 bg-red-900/30 border border-red-500/50 rounded-lg flex gap-2">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={isSignUp ? handleSignUp : handleSignIn} className="space-y-4">
            {/* Username (Sign Up only) */}
            {isSignUp && (
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Gaming Username
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Your gaming name"
                    className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg pl-10 pr-4 py-2.5 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition"
                    disabled={loading}
                  />
                </div>
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg pl-10 pr-4 py-2.5 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg pl-10 pr-4 py-2.5 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:from-zinc-700 disabled:to-zinc-700 text-white font-bold py-2.5 rounded-lg transition duration-200 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Processing...
                </>
              ) : isSignUp ? (
                <>
                  <UserPlus className="w-5 h-5" />
                  Create Account
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  Sign In
                </>
              )}
            </button>
          </form>

          {/* Toggle Sign Up / Sign In */}
          <div className="mt-6 pt-6 border-t border-zinc-800 text-center">
            <p className="text-zinc-400 text-sm mb-3">
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}
            </p>
            <button
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError(null);
                setEmail('');
                setPassword('');
                setUsername('');
              }}
              disabled={loading}
              className="text-indigo-400 hover:text-indigo-300 font-medium text-sm disabled:opacity-50"
            >
              {isSignUp ? 'Sign In' : 'Create Account'}
            </button>
          </div>

          {/* Test Credentials */}
          {!isSignUp && (
            <div className="mt-6 p-3 bg-zinc-800/50 border border-zinc-700 rounded-lg">
              <p className="text-zinc-400 text-xs mb-2">Demo Credentials:</p>
              <p className="text-zinc-300 text-xs font-mono">test@kill2win.com / 123456</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
