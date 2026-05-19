import React, { useState } from 'react';
import { auth } from './firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoginMode, setIsLoginMode] = useState(true); // Giriş mi Kayıt mı kontrolü
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLoginMode) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
      navigate('/'); 
    } catch (err) {
      console.error(err);
      if (err.code === 'auth/email-already-in-use') setError('This email is already in use!');
      else if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
        setError("Invalid email or password! Please check again.");
      } else if (err.code === 'auth/weak-password') {
        setError('Password should be at least 6 characters.');
      } else {
        setError(`Authentication Error: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] flex items-center justify-center p-4 font-sans text-slate-900 select-none">
      
      {/* Sabit Genişlikte, Yayılmayan, Yuvarlatılmış Modern Kutu */}
      <div className="bg-white p-10 rounded-[2.5rem] shadow-[0_10px_40px_-12px_rgba(0,0,0,0.03)] border border-gray-100 w-full max-w-md animate-in fade-in zoom-in duration-500">
        
        {/* Başlık Bölümü */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">
            {isLoginMode ? 'Welcome Back' : 'Get Started'}
          </h1>
          <p className="text-gray-400 font-semibold mt-2 text-sm">
            {isLoginMode ? 'Sign in to monitor your EtsySync store' : 'Create a new administrative account'}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-500 p-4 rounded-2xl text-xs font-bold mb-6 border border-red-100 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email Alanı */}
          <div>
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 block">Email Address</label>
            <div className="flex items-center bg-gray-50 border border-gray-100 rounded-2xl p-4 mt-1.5 focus-within:bg-white focus-within:border-orange-500 focus-within:ring-4 focus-within:ring-orange-500/10 transition-all">
              <Mail size={18} className="text-gray-400 mr-3 shrink-0" />
              <input 
                type="email" required
                className="bg-transparent w-full outline-none font-bold text-sm text-gray-700 placeholder:text-gray-300"
                placeholder="admin@etsysync.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          {/* Şifre Alanı */}
          <div>
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 block">Password</label>
            <div className="flex items-center bg-gray-50 border border-gray-100 rounded-2xl p-4 mt-1.5 focus-within:bg-white focus-within:border-orange-500 focus-within:ring-4 focus-within:ring-orange-500/10 transition-all">
              <Lock size={18} className="text-gray-400 mr-3 shrink-0" />
              <input 
                type={showPassword ? "text" : "password"} required minLength="6"
                className="bg-transparent w-full outline-none font-bold text-sm text-gray-700 placeholder:text-gray-300"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-gray-400 hover:text-gray-600 ml-2 focus:outline-none"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-[#FF6B00] text-white py-4 rounded-2xl font-bold shadow-lg shadow-orange-100 hover:bg-[#e66000] hover:shadow-xl transition-all transform active:scale-[0.98] disabled:opacity-70 mt-2"
          >
            {loading ? 'Connecting...' : (isLoginMode ? 'Sign In' : 'Register Account')}
          </button>
        </form>

        {/* Akıcı Kayıt/Giriş Değiştirme Kısmı */}
        <div className="mt-8 text-center text-sm font-bold text-gray-400 pt-6 border-t border-gray-50">
          {isLoginMode ? "Don't have an account? " : "Already have an account? "}
          <button 
            type="button" 
            onClick={() => { setIsLoginMode(!isLoginMode); setError(''); }}
            className="text-[#FF6B00] hover:text-orange-700 transition-colors"
          >
            {isLoginMode ? 'Sign up here' : 'Login here'}
          </button>
        </div>

      </div>
    </div>
  );
}