import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { GraduationCap, Eye, EyeOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import useAuthStore from '@/store/authStore';
import useUIStore from '@/store/uiStore';
import { useToast } from '@/components/ui/toast';
import translations from '@/lib/i18n';

export default function Login() {
  const navigate = useNavigate();
  const { login, isLoading } = useAuthStore();
  const { language } = useUIStore();
  const t = translations[language];
  const { success, error } = useToast();

  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await login(form.email, form.password);
    if (result.success) {
      success('Welcome back!', 'Login successful');
      navigate('/dashboard');
    } else {
      error(result.message, 'Login failed');
    }
  };

  const fillDemo = (role) => {
    const accounts = {
      admin: { email: 'admin@test.com', password: '123456' },
      teacher: { email: 'teacher@test.com', password: '123456' },
      student: { email: 'student@test.com', password: '123456' },
    };
    setForm(accounts[role]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
            <span className="font-bold text-2xl text-gray-900">Studies</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">{t.signIn}</h1>
          <p className="text-gray-600 mt-1">Welcome back to your learning journey</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Demo accounts */}
          <div className="mb-6">
            <p className="text-xs text-gray-500 mb-2 text-center">Quick login with demo accounts:</p>
            <div className="flex gap-2">
              {['admin', 'teacher', 'student'].map((role) => (
                <button
                  key={role}
                  onClick={() => fillDemo(role)}
                  className="flex-1 text-xs py-1.5 px-2 rounded-lg border border-gray-200 hover:bg-gray-50 capitalize text-gray-600 transition-colors"
                >
                  {role}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">{t.email}</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                autoComplete="email"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">{t.password}</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                t.signIn
              )}
            </Button>
          </form>

          <p className="text-center text-sm text-gray-600 mt-6">
            {t.noAccount}{' '}
            <Link to="/register" className="text-blue-600 hover:underline font-medium">
              {t.signUp}
            </Link>
          </p>
        </div>

        <p className="text-center text-xs text-gray-500 mt-4">
          <Link to="/" className="hover:underline">← Back to home</Link>
        </p>
      </div>
    </div>
  );
}
