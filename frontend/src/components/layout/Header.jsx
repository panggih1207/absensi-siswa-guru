import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Bell, Search, Globe, Sun, Moon } from 'lucide-react';
import useAuthStore from '@/store/authStore';
import useUIStore from '@/store/uiStore';
import translations from '@/lib/i18n';
import { cn, getInitials, getAvatarColor } from '@/lib/utils';
import api from '@/lib/api';

export default function Header({ title }) {
  const { user } = useAuthStore();
  const { toggleSidebar, language, setLanguage } = useUIStore();
  const navigate = useNavigate();
  const t = translations[language];
  const [unreadCount, setUnreadCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const { data } = await api.get('/notifications');
        setUnreadCount(data.unreadCount || 0);
      } catch (e) {}
    };
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ar' : 'en');
  };

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-10">
      {/* Left */}
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>
        <h1 className="text-lg font-semibold text-gray-900 hidden sm:block">{title}</h1>
      </div>

      {/* Search - hidden on mobile */}
      <div className="hidden md:flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2 w-64 lg:w-80">
        <Search className="h-4 w-4 text-gray-400 flex-shrink-0" />
        <input
          type="text"
          placeholder={t.search + '...'}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="bg-transparent text-sm outline-none w-full text-gray-700 placeholder-gray-400"
        />
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        {/* Language toggle */}
        <button
          onClick={toggleLanguage}
          className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 flex items-center gap-1 text-sm font-medium"
          title={t.language}
        >
          <Globe className="h-4 w-4" />
          <span className="hidden sm:inline">{language === 'en' ? 'AR' : 'EN'}</span>
        </button>

        {/* Notifications */}
        <button
          onClick={() => navigate('/notifications')}
          className="relative p-2 rounded-lg hover:bg-gray-100 text-gray-500"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {/* User avatar */}
        <button
          onClick={() => navigate('/profile')}
          className={cn(
            'w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0',
            getAvatarColor(user?.name)
          )}
        >
          {user?.avatar ? (
            <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover" />
          ) : (
            getInitials(user?.name)
          )}
        </button>
      </div>
    </header>
  );
}
