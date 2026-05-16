import React, { useState } from 'react';
import { auth } from './firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/'); // Giriş başarılıysa ana sayfaya (dashboard) git
    } catch (err) {
      setError("Hatalı e-posta veya şifre! Lütfen kontrol edin.");
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center p-4">
      <div className="bg-white p-10 rounded-[2.5rem] shadow-xl border border-gray-100 w-full max-w-md animate-in fade-in zoom-in duration-500">
        <div className="flex flex-col items-center mb-10">
          <div className="w-14 h-14 bg-[#FF6B00] rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-orange-100">
            <span className="text-white font-bold text-3xl">E</span>
          </div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Welcome Back!</h1>
          <p className="text-gray-400 font-medium mt-2">Sign in to EtsySync management</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-500 p-4 rounded-2xl text-xs font-bold mb-6 border border-red-100 animate-bounce">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
            <input 
              type="email" required
              className="w-full mt-1.5 p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-4 focus:ring-orange-500/10 font-medium transition-all"
              placeholder="admin@etsysync.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Password</label>
            <input 
              type="password" required
              className="w-full mt-1.5 p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-4 focus:ring-orange-500/10 font-medium transition-all"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button className="w-full bg-[#FF6B00] text-white py-4 rounded-2xl font-bold shadow-xl shadow-orange-200 hover:bg-[#e66000] transition-all transform active:scale-[0.98]">
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}