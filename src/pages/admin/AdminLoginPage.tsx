import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.js';
import { Input } from '../../components/ui/Input.js';
import { Button } from '../../components/ui/Button.js';
import { useToast } from '../../context/ToastContext.js';
import { Lock } from 'lucide-react';

export const AdminLoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from?.pathname || '/admin';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      error('Please enter both your email address and password.');
      return;
    }

    try {
      setIsLoading(true);
      await login({ email: email.trim(), password });
      success('Clearance granted. Welcome to Aurelia Operations.');
      navigate(from, { replace: true });
    } catch (err: any) {
      error(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090C] flex items-center justify-center p-6 text-left selection:bg-[#C5A880]/30 selection:text-white">
      <div className="w-full max-w-md bg-[#121217] border border-[#C5A880]/30 shadow-2xl p-8 sm:p-10 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-full bg-[#C5A880]/10 border border-[#C5A880]/40 flex items-center justify-center mx-auto text-[#C5A880]">
            <Lock className="w-5 h-5" />
          </div>
          <h1 className="font-serif text-3xl text-white tracking-widest uppercase">
            Aurelia
          </h1>
          <p className="text-xs uppercase tracking-[0.2em] text-[#C5A880] font-sans">
            Staff & Sommelier Authentication
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Administrative Email"
            type="email"
            required
            autoComplete="email"
            placeholder="admin@aurelia.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            label="Security Password"
            type="password"
            required
            autoComplete="current-password"
            placeholder="••••••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <Button type="submit" size="lg" className="w-full mt-2" isLoading={isLoading}>
            Sign In to Portal
          </Button>
        </form>

        <div className="pt-4 border-t border-white/5 text-center">
          <a
            href="/"
            className="text-xs text-stone-400 hover:text-white uppercase tracking-wider transition-colors"
          >
            ← Return to Public Experience
          </a>
        </div>
      </div>
    </div>
  );
};
