import React, { useState, useEffect } from 'react';
import { BarChart2, CheckCircle, XCircle, Clock } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TableSkeleton } from '@/components/ui/skeleton';
import api from '@/lib/api';
import useAuthStore from '@/store/authStore';
import useUIStore from '@/store/uiStore';
import translations from '@/lib/i18n';
import { cn, formatDate, formatTime, getInitials, getAvatarColor } from '@/lib/utils';

export default function Results() {
  const { user } = useAuthStore();
  const { language } = useUIStore();
  const t = translations[language];
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const { data } = await api.get('/results');
        setResults(data.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, []);

  const passedCount = results.filter((r) => r.passed).length;
  const avgScore = results.length > 0
    ? Math.round(results.reduce((s, r) => s + r.percentage, 0) / results.length)
    : 0;

  return (
    <DashboardLayout title={t.results}>
      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <BarChart2 className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Attempts</p>
              <p className="text-2xl font-bold">{results.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Passed</p>
              <p className="text-2xl font-bold text-green-600">{passedCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
              <BarChart2 className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Avg Score</p>
              <p className="text-2xl font-bold text-purple-600">{avgScore}%</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Results table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t.testResults}</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <TableSkeleton rows={6} />
          ) : results.length === 0 ? (
            <div className="text-center py-12">
              <BarChart2 className="h-10 w-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">{t.noData}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="pb-3 font-medium text-gray-500">Student</th>
                    <th className="pb-3 font-medium text-gray-500">Test</th>
                    <th className="pb-3 font-medium text-gray-500">Score</th>
                    <th className="pb-3 font-medium text-gray-500">Status</th>
                    <th className="pb-3 font-medium text-gray-500">Time</th>
                    <th className="pb-3 font-medium text-gray-500">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {results.map((result) => (
                    <tr key={result._id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <div className={cn('w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold', getAvatarColor(result.student?.name))}>
                            {getInitials(result.student?.name)}
                          </div>
                          <span className="font-medium text-gray-900">{result.student?.name || 'Unknown'}</span>
                        </div>
                      </td>
                      <td className="py-3 text-gray-600">{result.test?.title || 'Unknown'}</td>
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-gray-100 rounded-full h-1.5">
                            <div
                              className={cn('h-1.5 rounded-full', result.percentage >= 70 ? 'bg-green-500' : result.percentage >= 50 ? 'bg-yellow-500' : 'bg-red-500')}
                              style={{ width: `${result.percentage}%` }}
                            />
                          </div>
                          <span className="font-semibold">{result.percentage}%</span>
                        </div>
                      </td>
                      <td className="py-3">
                        <Badge variant={result.passed ? 'success' : 'destructive'}>
                          {result.passed ? t.passed : t.failed}
                        </Badge>
                      </td>
                      <td className="py-3 text-gray-500">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatTime(result.timeTaken)}
                        </span>
                      </td>
                      <td className="py-3 text-gray-500">{formatDate(result.completedAt || result.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
