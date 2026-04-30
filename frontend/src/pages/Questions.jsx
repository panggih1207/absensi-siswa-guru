import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Edit, Trash2, HelpCircle, X } from 'lucide-react';
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
import { cn } from '@/lib/utils';

const difficultyColors = { Easy: 'success', Medium: 'warning', Hard: 'destructive' };

const emptyForm = {
  text: '', type: 'multiple-choice', difficulty: 'Medium', points: 1, explanation: '',
  options: [
    { text: '', isCorrect: false },
    { text: '', isCorrect: false },
    { text: '', isCorrect: false },
    { text: '', isCorrect: false },
  ],
  test: '',
};

export default function Questions() {
  const { user } = useAuthStore();
  const { language } = useUIStore();
  const t = translations[language];
  const { success, error } = useToast();

  const [questions, setQuestions] = useState([]);
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [testFilter, setTestFilter] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const canEdit = user?.role === 'admin' || user?.role === 'teacher';

  useEffect(() => {
    api.get('/tests').then(({ data }) => setTests(data.data)).catch(() => {});
  }, []);

  const fetchQuestions = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (testFilter) params.set('testId', testFilter);
      const { data } = await api.get(`/questions?${params}`);
      setQuestions(data.data);
    } catch (e) {
      error('Failed to load questions');
    } finally {
      setLoading(false);
    }
  }, [testFilter]);

  useEffect(() => { fetchQuestions(); }, [fetchQuestions]);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (q) => {
    setEditingId(q._id);
    setForm({
      text: q.text,
      type: q.type,
      difficulty: q.difficulty,
      points: q.points,
      explanation: q.explanation || '',
      options: q.options?.length > 0 ? q.options : emptyForm.options,
      test: q.test?._id || q.test || '',
    });
    setDialogOpen(true);
  };

  const handleTypeChange = (type) => {
    if (type === 'true-false') {
      setForm((f) => ({ ...f, type, options: [{ text: 'True', isCorrect: false }, { text: 'False', isCorrect: false }] }));
    } else if (type === 'multiple-choice') {
      setForm((f) => ({ ...f, type, options: emptyForm.options }));
    } else {
      setForm((f) => ({ ...f, type, options: [] }));
    }
  };

  const handleSave = async () => {
    if (!form.text) { error('Question text is required'); return; }
    if (form.type !== 'short-answer' && !form.options.some((o) => o.isCorrect)) {
      error('Please mark at least one correct answer');
      return;
    }
    setSaving(true);
    try {
      const payload = { ...form };
      if (editingId) {
        await api.put(`/questions/${editingId}`, payload);
        success('Question updated');
      } else {
        await api.post('/questions', payload);
        success('Question created');
      }
      setDialogOpen(false);
      fetchQuestions();
    } catch (e) {
      error(e.response?.data?.message || 'Failed to save question');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/questions/${id}`);
      success('Question deleted');
      setDeleteConfirm(null);
      fetchQuestions();
    } catch (e) {
      error('Failed to delete question');
    }
  };

  const updateOption = (index, field, value) => {
    setForm((f) => {
      const options = [...f.options];
      if (field === 'isCorrect' && value) {
        // For single correct answer
        options.forEach((o, i) => { options[i] = { ...o, isCorrect: i === index }; });
      } else {
        options[index] = { ...options[index], [field]: value };
      }
      return { ...f, options };
    });
  };

  return (
    <DashboardLayout title={t.questions}>
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-6">
        <Select value={testFilter} onValueChange={setTestFilter}>
          <SelectTrigger className="w-full sm:w-64">
            <SelectValue placeholder="Filter by test..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Tests</SelectItem>
            {tests.map((test) => (
              <SelectItem key={test._id} value={test._id}>{test.title}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {canEdit && (
          <Button onClick={openCreate} className="w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            {t.newQuestion}
          </Button>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : questions.length === 0 ? (
        <div className="text-center py-20">
          <HelpCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">{t.noData}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {questions.map((q, idx) => (
            <Card key={q._id} className="hover:shadow-sm transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-gray-900 mb-2">{q.text}</p>
                    <div className="flex flex-wrap gap-2 mb-2">
                      <Badge variant={difficultyColors[q.difficulty] || 'secondary'} className="text-xs">{q.difficulty}</Badge>
                      <Badge variant="outline" className="text-xs capitalize">{q.type.replace('-', ' ')}</Badge>
                      <Badge variant="secondary" className="text-xs">{q.points} pt</Badge>
                      {q.test && <Badge variant="info" className="text-xs">{q.test.title}</Badge>}
                    </div>
                    {q.options?.length > 0 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 mt-2">
                        {q.options.map((opt, oi) => (
                          <div key={oi} className={cn('text-xs px-2 py-1 rounded flex items-center gap-1', opt.isCorrect ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-600')}>
                            {opt.isCorrect && <span className="text-green-500">✓</span>}
                            {opt.text}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  {canEdit && (
                    <div className="flex gap-1 flex-shrink-0">
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => openEdit(q)}>
                        <Edit className="h-3.5 w-3.5" />
                      </Button>
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => setDeleteConfirm(q._id)}>
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
            <DialogTitle>{editingId ? 'Edit Question' : t.newQuestion}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
            <div className="space-y-2">
              <Label>{t.questionText} *</Label>
              <Textarea value={form.text} onChange={(e) => setForm({ ...form, text: e.target.value })} rows={3} placeholder="Enter your question..." />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t.questionType}</Label>
                <Select value={form.type} onValueChange={handleTypeChange}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="multiple-choice">{t.multipleChoice}</SelectItem>
                    <SelectItem value="true-false">{t.trueFalse}</SelectItem>
                    <SelectItem value="short-answer">{t.shortAnswer}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
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
                <Label>{t.points}</Label>
                <Input type="number" value={form.points} onChange={(e) => setForm({ ...form, points: Number(e.target.value) })} min={1} />
              </div>
              <div className="space-y-2">
                <Label>Assign to Test</Label>
                <Select value={form.test} onValueChange={(v) => setForm({ ...form, test: v })}>
                  <SelectTrigger><SelectValue placeholder="Select test..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    {tests.map((test) => (
                      <SelectItem key={test._id} value={test._id}>{test.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Options */}
            {form.type !== 'short-answer' && (
              <div className="space-y-2">
                <Label>{t.options} <span className="text-xs text-gray-400">(click radio to mark correct)</span></Label>
                {form.options.map((opt, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="correctOption"
                      checked={opt.isCorrect}
                      onChange={() => updateOption(index, 'isCorrect', true)}
                      className="text-blue-600 flex-shrink-0"
                    />
                    <Input
                      value={opt.text}
                      onChange={(e) => updateOption(index, 'text', e.target.value)}
                      placeholder={`Option ${index + 1}`}
                      className={cn(opt.isCorrect ? 'border-green-400 bg-green-50' : '')}
                    />
                  </div>
                ))}
              </div>
            )}

            <div className="space-y-2">
              <Label>{t.explanation} (optional)</Label>
              <Textarea value={form.explanation} onChange={(e) => setForm({ ...form, explanation: e.target.value })} rows={2} placeholder="Explain the correct answer..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>{t.cancel}</Button>
            <Button onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : t.save}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Delete Question</DialogTitle></DialogHeader>
          <p className="text-gray-600 text-sm">Are you sure you want to delete this question?</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>{t.cancel}</Button>
            <Button variant="destructive" onClick={() => handleDelete(deleteConfirm)}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
