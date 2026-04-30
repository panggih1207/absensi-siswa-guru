import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Edit, Trash2, ClipboardList, Clock, Play, CheckCircle } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { CardSkeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/toast';
import api from '@/lib/api';
import useAuthStore from '@/store/authStore';
import useUIStore from '@/store/uiStore';
import translations from '@/lib/i18n';
import { cn, formatDate } from '@/lib/utils';

const difficultyColors = { Easy: 'success', Medium: 'warning', Hard: 'destructive' };

const emptyForm = { title: '', description: '', difficulty: 'Medium', duration: 30, passingScore: 60, maxAttempts: 3, isPublished: true };

export default function Tests() {
  const { user } = useAuthStore();
  const { language } = useUIStore();
  const t = translations[language];
  const { success, error } = useToast();

  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [diffFilter, setDiffFilter] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [takingTest, setTakingTest] = useState(null);
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  const canEdit = user?.role === 'admin' || user?.role === 'teacher';

  const fetchTests = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (diffFilter) params.set('difficulty', diffFilter);
      const { data } = await api.get(`/tests?${params}`);
      setTests(data.data);
    } catch (e) {
      error('Failed to load tests');
    } finally {
      setLoading(false);
    }
  }, [search, diffFilter]);

  useEffect(() => {
    const timer = setTimeout(fetchTests, 300);
    return () => clearTimeout(timer);
  }, [fetchTests]);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (test) => {
    setEditingId(test._id);
    setForm({
      title: test.title,
      description: test.description,
      difficulty: test.difficulty,
      duration: test.duration,
      passingScore: test.passingScore,
      maxAttempts: test.maxAttempts,
      isPublished: test.isPublished,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.title) { error('Title is required'); return; }
    setSaving(true);
    try {
      if (editingId) {
        await api.put(`/tests/${editingId}`, form);
        success('Test updated');
      } else {
        await api.post('/tests', form);
        success('Test created');
      }
      setDialogOpen(false);
      fetchTests();
    } catch (e) {
      error(e.response?.data?.message || 'Failed to save test');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/tests/${id}`);
      success('Test deleted');
      setDeleteConfirm(null);
      fetchTests();
    } catch (e) {
      error('Failed to delete test');
    }
  };

  const startTest = (test) => {
    setTakingTest(test);
    setAnswers({});
    setTestResult(null);
  };

  const submitTest = async () => {
    if (!takingTest) return;
    setSubmitting(true);
    try {
      const answersArray = takingTest.questions.map((q) => ({
        questionId: q._id,
        selectedOption: answers[q._id] || '',
      }));
      const { data } = await api.post('/results', {
        testId: takingTest._id,
        answers: answersArray,
        timeTaken: 0,
      });
      setTestResult(data.data);
      success(data.data.passed ? 'Test passed! 🎉' : 'Test submitted');
    } catch (e) {
      error(e.response?.data?.message || 'Failed to submit test');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout title={t.tests}>
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-6">
        <div className="flex flex-col sm:flex-row gap-3 flex-1 w-full sm:w-auto">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input placeholder={t.search + '...'} value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
          <Select value={diffFilter} onValueChange={setDiffFilter}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder={t.all + ' ' + t.difficulty} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">{t.all}</SelectItem>
              <SelectItem value="Easy">{t.easy}</SelectItem>
              <SelectItem value="Medium">{t.medium}</SelectItem>
              <SelectItem value="Hard">{t.hard}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {canEdit && (
          <Button onClick={openCreate} className="w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            {t.newTest}
          </Button>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : tests.length === 0 ? (
        <div className="text-center py-20">
          <ClipboardList className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">{t.noData}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {tests.map((test) => (
            <Card key={test._id} className="hover:shadow-md transition-all">
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <h3 className="font-semibold text-gray-900 line-clamp-2">{test.title}</h3>
                  <Badge variant={difficultyColors[test.difficulty] || 'secondary'} className="flex-shrink-0">
                    {test.difficulty}
                  </Badge>
                </div>

                {test.description && (
                  <p className="text-xs text-gray-500 mb-3 line-clamp-2">{test.description}</p>
                )}

                <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 mb-4">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {test.duration}m
                  </span>
                  <span>{test.questions?.length || 0} questions</span>
                  <span>Pass: {test.passingScore}%</span>
                  <span>Max: {test.maxAttempts} attempts</span>
                </div>

                {test.course && (
                  <p className="text-xs text-blue-600 mb-3">{test.course.title}</p>
                )}

                <div className="flex items-center justify-between gap-2">
                  {user?.role === 'student' && test.questions?.length > 0 && (
                    <Button size="sm" className="flex-1 text-xs" onClick={() => startTest(test)}>
                      <Play className="h-3 w-3 mr-1" />
                      {t.startTest}
                    </Button>
                  )}
                  {canEdit && (
                    <div className="flex gap-1 ml-auto">
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => openEdit(test)}>
                        <Edit className="h-3.5 w-3.5" />
                      </Button>
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => setDeleteConfirm(test._id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingId ? t.editTest : t.newTest}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{t.title} *</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>{t.description}</Label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t.difficulty}</Label>
                <Select value={form.difficulty} onValueChange={(v) => setForm({ ...form, difficulty: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Easy">{t.easy}</SelectItem>
                    <SelectItem value="Medium">{t.medium}</SelectItem>
                    <SelectItem value="Hard">{t.hard}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t.duration} ({t.minutes})</Label>
                <Input type="number" value={form.duration} onChange={(e) => setForm({ ...form, duration: Number(e.target.value) })} min={1} />
              </div>
              <div className="space-y-2">
                <Label>{t.passingScore} (%)</Label>
                <Input type="number" value={form.passingScore} onChange={(e) => setForm({ ...form, passingScore: Number(e.target.value) })} min={0} max={100} />
              </div>
              <div className="space-y-2">
                <Label>{t.maxAttempts}</Label>
                <Input type="number" value={form.maxAttempts} onChange={(e) => setForm({ ...form, maxAttempts: Number(e.target.value) })} min={1} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>{t.cancel}</Button>
            <Button onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : t.save}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Take Test Dialog */}
      {takingTest && (
        <Dialog open={!!takingTest} onOpenChange={() => { setTakingTest(null); setTestResult(null); }}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{takingTest.title}</DialogTitle>
            </DialogHeader>

            {testResult ? (
              <div className="text-center py-8">
                <div className={cn('w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4', testResult.passed ? 'bg-green-100' : 'bg-red-100')}>
                  <CheckCircle className={cn('h-10 w-10', testResult.passed ? 'text-green-600' : 'text-red-500')} />
                </div>
                <h3 className="text-2xl font-bold mb-2">{testResult.passed ? 'Passed! 🎉' : 'Not Passed'}</h3>
                <p className="text-4xl font-bold text-blue-600 mb-4">{testResult.percentage}%</p>
                <div className="grid grid-cols-2 gap-4 max-w-xs mx-auto text-sm">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-gray-500">Score</p>
                    <p className="font-bold">{testResult.score}/{testResult.totalPoints}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-gray-500">Status</p>
                    <p className={cn('font-bold', testResult.passed ? 'text-green-600' : 'text-red-600')}>
                      {testResult.passed ? t.passed : t.failed}
                    </p>
                  </div>
                </div>
                <Button className="mt-6" onClick={() => { setTakingTest(null); setTestResult(null); }}>
                  Close
                </Button>
              </div>
            ) : (
              <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-1">
                {takingTest.questions?.map((q, idx) => (
                  <div key={q._id} className="space-y-3">
                    <p className="font-medium text-sm">
                      <span className="text-blue-600 mr-2">Q{idx + 1}.</span>
                      {q.text}
                      <span className="text-xs text-gray-400 ml-2">({q.points} pt)</span>
                    </p>
                    <div className="space-y-2">
                      {q.options?.map((opt, oi) => (
                        <label key={oi} className={cn(
                          'flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors',
                          answers[q._id] === opt.text ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'
                        )}>
                          <input
                            type="radio"
                            name={q._id}
                            value={opt.text}
                            checked={answers[q._id] === opt.text}
                            onChange={() => setAnswers({ ...answers, [q._id]: opt.text })}
                            className="text-blue-600"
                          />
                          <span className="text-sm">{opt.text}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!testResult && (
              <DialogFooter>
                <Button variant="outline" onClick={() => setTakingTest(null)}>{t.cancel}</Button>
                <Button onClick={submitTest} disabled={submitting}>
                  {submitting ? 'Submitting...' : t.submitTest}
                </Button>
              </DialogFooter>
            )}
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirm */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Delete Test</DialogTitle></DialogHeader>
          <p className="text-gray-600 text-sm">Are you sure you want to delete this test?</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>{t.cancel}</Button>
            <Button variant="destructive" onClick={() => handleDelete(deleteConfirm)}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
