import React, { useState, useEffect } from 'react';
import { Trophy, Medal } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TableSkeleton } from '@/components/ui/skeleton';
import api from '@/lib/api';
import useUIStore from '@/store/uiStore';
import translations from '@/lib/i18n';
import { cn, getInitials, getAvatarColor } from '@/lib/utils';

export default function Leaderboard() {
  const { language } = useUIStore();
  const t = translations[language];
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard/leaderboard')
      .then(({ data }) => setLeaderboard(data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const medals = ['🥇', '🥈', '🥉'];

  return (
    <DashboardLayout title={t.leaderboard}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            {t.leaderboard}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <TableSkeleton rows={8} />
          ) : leaderboard.length === 0 ? (
            <div className="text-center py-12">
              <Trophy className="h-10 w-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">{t.noData}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {leaderboard.map((entry, index) => (
                <div
                  key={entry._id}
                  className={cn(
                    'flex items-center gap-4 p-4 rounded-xl transition-all',
                    index === 0 ? 'bg-yellow-50 border border-yellow-200' :
                    index === 1 ? 'bg-gray-50 border border-gray-200' :
                    index === 2 ? 'bg-orange-50 border border-orange-200' :
                    'bg-white border border-gray-100 hover:bg-gray-50'
                  )}
                >
                  <div className="w-10 text-center text-xl font-bold">
                    {index < 3 ? medals[index] : <span className="text-gray-400 text-sm">#{index + 1}</span>}
                  </div>
                  <div className={cn('w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0', getAvatarColor(entry.name))}>
                    {entry.avatar ? (
                      <img src={entry.avatar} alt={entry.name} className="w-full h-full rounded-full object-cover" />
                    ) : (
                      getInitials(entry.name)
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900">{entry.name}</p>
                    <p className="text-xs text-gray-500">{entry.totalTests} tests • {entry.passed} passed</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-blue-600">{entry.avgScore}%</p>
                    <p className="text-xs text-gray-400">avg score</p>
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
