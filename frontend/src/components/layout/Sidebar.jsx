import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Calendar, MessageSquare, Bell, TrendingUp, FileText,
  StickyNote, Trophy, BookOpen, GraduationCap, ClipboardList, HelpCircle,
  BarChart2, Users, LogOut, X, ChevronLeft, ChevronRight, Settings,
} from 'lucide-react';
import useAuthStore from '@/store/authStore';
import useUIStore from '@/store/uiStore';
import translations from '@/lib/i18n';
import { cn, getInitials, getAvatarColor } from '@/lib/utils';

const navItems = [
  { key: 'dashboard', icon: LayoutDashboard, path: '/dashboard' },
  { key: 'calendar', icon: Calendar, path: '/calendar' },
  { key: 'chat', icon: MessageSquare, path: '/chat' },
  { key: 'notifications', icon: Bell, path: '/notifications' },
  { key: 'performance', icon: TrendingUp, path: '/performance' },
  { key: 'reports', icon: FileText, path: '/reports' },
  { key: 'notes', icon: StickyNote, path: '/notes' },
  { key: 'leaderboard', icon: Trophy, path: '/leaderboard' },
  { key: 'trainings', icon: BookOpen, path: '/trainings' },
  { key: 'courses', icon: GraduationCap, path: '/courses' },
  { key: 'tests', icon: ClipboardList, path: '/tests' },
  { key: 'questions', icon: HelpCircle, path: '/questions', roles: ['admin', 'teacher'] },
  { key: 'results', icon: BarChart2, path: '/results' },
  { key: 'users', icon: Users, path: '/users', roles: ['admin', 'teacher'] },
];

export default function Sidebar() {
  const { user, logout } = useAuthStore();
  const { sidebarOpen, toggleSidebar, setSidebarOpen, language } = useUIStore();
  const navigate = useNavigate();
  const t = translations[language];

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const filteredNav = navItems.filter(
    (item) => !item.roles || item.roles.includes(user?.role)
  );

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 h-full bg-white border-r border-gray-200 z-30 flex flex-col transition-all duration-300 shadow-lg',
          sidebarOpen ? 'w-64' : 'w-16',
          'lg:relative lg:shadow-none',
          !sidebarOpen && '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 h-16">
          {sidebarOpen && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <GraduationCap className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-xl text-gray-900">Studies</span>
            </div>
          )}
          <button
            onClick={toggleSidebar}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hidden lg:flex"
          >
            {sidebarOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </button>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 lg:hidden"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-2">
          <ul className="space-y-1">
            {filteredNav.map((item) => (
              <li key={item.key}>
                <NavLink
                  to={item.path}
                  onClick={() => window.innerWidth < 1024 && setSidebarOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group',
                      isActive
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    )
                  }
                  title={!sidebarOpen ? t[item.key] : undefined}
                >
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  {sidebarOpen && <span className="truncate">{t[item.key]}</span>}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* User section */}
        <div className="border-t border-gray-100 p-3">
          {sidebarOpen ? (
            <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer" onClick={() => navigate('/profile')}>
              <div className={cn('w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0', getAvatarColor(user?.name))}>
                {user?.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover" />
                ) : (
                  getInitials(user?.name)
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
                <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
              </div>
            </div>
          ) : (
            <div
              className={cn('w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold mx-auto cursor-pointer', getAvatarColor(user?.name))}
              onClick={() => navigate('/profile')}
            >
              {getInitials(user?.name)}
            </div>
          )}
          <button
            onClick={handleLogout}
            className={cn(
              'flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50 w-full mt-1 transition-colors',
              !sidebarOpen && 'justify-center'
            )}
            title={!sidebarOpen ? t.logout : undefined}
          >
            <LogOut className="h-4 w-4 flex-shrink-0" />
            {sidebarOpen && <span>{t.logout}</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
