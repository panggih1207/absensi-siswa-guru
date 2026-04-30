import React, { useState, useEffect } from 'react';
import { Users, GraduationCap, BookOpen, ClipboardList, TrendingUp, Trophy, BarChart2 } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CardSkeleton } from '@/components/ui/skeleton';
import api from '@/lib/api';
import useUIStore from '@/store/uiStore';
import useAuthStore from '@/store/authStore';
import translations from '@/lib/i18n';
import { cn } from '@/lib/utils';

const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4'];

const StatCard = ({ title, value, icon: Icon, color, change }) => (
  <Card className="hover:shadow-md transition-shadow">
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground font-medium">{title}</p>
          <p className="text-3xl font-bold mt-1">{value ?? '—'}</p>
          {change !== undefined && (
            <p className={cn('text-xs mt-1', change >= 0 ? 'text-green-600' : 'text-red-600')}>
              {change >= 0 ? '+' : ''}{change}% from last month
            </p>
          )}
        </div>
        <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center', color)}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </CardContent>
  </Card>
);

export default function Dashboard() {
  const { language } = useUIStore();
  const { user } = useAuthStore();
  const t = translations[language];
  const [stats, setStats] = useState(null);
  const [charts, setCharts] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dashRes, leaderRes] = await Promise.all([
          api.get('/dashboard/stats'),
          api.get('/dashboard/leaderboard'),
        ]);
        setStats(dashRes.data.data.stats);
        setCharts(dashRes.data.data.charts);
        setLeaderboard(leaderRes.data.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const statCards = [
    { key: 'students', title: t.totalStudents, icon: Users, color: 'bg-blue-500' },
    { key: 'teachers', title: t.totalTeachers, icon: GraduationCap, color: 'bg-purple-500' },
    { key: 'courses', title: t.totalCourses, icon: BookOpen, color: 'bg-green-500' },
    { key: 'tests', title: t.totalTests, icon: ClipboardList, color: 'bg-yellow-500' },
    { key: 'trainings', title: t.totalTrainings, icon: TrendingUp, color: 'bg-pink-500' },
    { key: 'passRate', title: t.passRate, icon: Trophy, color: 'bg-indigo-500', suffix: '%' },
  ];

  return (
    <DashboardLayout title={t.dashboard}>
      {/* Welcome banner */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 mb-6 text-white">
        <h2 className="text-xl font-bold">
          {t.welcome}, {user?.name}! 👋
        </h2>
        <p className="text-blue-100 mt-1 text-sm capitalize">
          {user?.role} • {user?.school || 'Studies Academy'}
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)
          : statCards.map((card) => (
              <StatCard
                key={card.key}
                title={card.title}
                value={stats ? (card.suffix ? `${stats[card.key]}${card.suffix}` : stats[card.key]) : '—'}
                icon={card.icon}
                color={card.color}
              />
            ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Pass Rate Donut */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t.passRate}</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-48 skeleton rounded-lg" />
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={charts?.passRateChart || [{ name: 'Passed', value: 0 }, { name: 'Failed', value: 1 }]}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {(charts?.passRateChart || []).map((entry, index) => (
                      <Cell key={index} fill={index === 0 ? '#10b981' : '#ef4444'} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Tests by Difficulty */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t.testsByDifficulty}</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-48 skeleton rounded-lg" />
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={charts?.testsByDifficulty || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Students by Level */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t.studentsByLevel}</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-48 skeleton rounded-lg" />
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={charts?.studentsByLevel || []}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {(charts?.studentsByLevel || []).map((entry, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Leaderboard */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            {t.leaderboard}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex gap-3 items-center">
                  <div className="skeleton h-8 w-8 rounded-full" />
                  <div className="flex-1 space-y-1">
                    <div className="skeleton h-3 w-1/3" />
                    <div className="skeleton h-2 w-1/4" />
                  </div>
                  <div className="skeleton h-6 w-12 rounded" />
                </div>
              ))}
            </div>
          ) : leaderboard.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">{t.noData}</p>
          ) : (
            <div className="space-y-3">
              {leaderboard.map((entry, index) => (
                <div key={entry._id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold',
                    index === 0 ? 'bg-yellow-100 text-yellow-700' :
                    index === 1 ? 'bg-gray-100 text-gray-700' :
                    index === 2 ? 'bg-orange-100 text-orange-700' :
                    'bg-blue-50 text-blue-700'
                  )}>
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{entry.name}</p>
                    <p className="text-xs text-muted-foreground">{entry.totalTests} tests • {entry.passed} passed</p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-blue-600">{entry.avgScore}%</span>
                    <p className="text-xs text-muted-foreground">avg score</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
