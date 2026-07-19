import React, { useState } from 'react';

interface LoginViewProps {
  onLogin: () => void;
}

export default function LoginView({ onLogin }: LoginViewProps) {
  const [email, setEmail] = useState('cm@lccgroup.com');
  const [password, setPassword] = useState('00000');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email === 'cm@lccgroup.com' && password === '00000') {
      onLogin();
    } else {
      setError('Invalid email or password. Please use cm@lccgroup.com / 00000.');
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-surface-bg p-4 font-sans text-text-main selection:bg-brand-50 selection:text-brand-600">
      <div className="w-full max-w-[400px] bg-white rounded-[10px] border border-border-subtle shadow-subtle p-8">
        <div className="text-center mb-8">
          <h1 className="text-[24px] font-bold text-brand-600 leading-tight">LCC Assortment</h1>
          <p className="text-[16px] font-medium text-text-muted mt-1">Support Tool</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="p-3 bg-error/10 border border-error/20 rounded-[8px] text-[13px] text-error font-medium text-center">
              {error}
            </div>
          )}
          
          <div className="space-y-1.5 text-left">
            <label className="block text-[13px] font-semibold text-text-main">Email Address</label>
            <input 
              type="email" 
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full h-10 px-3 bg-surface-bg border border-border-subtle rounded-[8px] text-[13px] text-text-main focus:outline-none focus:border-brand-600 transition-colors"
              required
            />
          </div>
          
          <div className="space-y-1.5 text-left">
            <label className="block text-[13px] font-semibold text-text-main">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full h-10 px-3 bg-surface-bg border border-border-subtle rounded-[8px] text-[13px] text-text-main focus:outline-none focus:border-brand-600 transition-colors"
              required
            />
          </div>
          
          <button 
            type="submit"
            className="w-full h-10 flex items-center justify-center bg-brand-600 text-white rounded-[8px] text-[13px] font-semibold hover:bg-brand-700 transition-colors cursor-pointer"
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}
