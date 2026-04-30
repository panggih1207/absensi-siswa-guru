import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Edit, Trash2, Star, Users, Clock, BookOpen, ChevronDown, Play, X } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { CardSkeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/toast';
import api from '@/lib/api';
import useAuthStore from '@/store/authStore';
import useUIStore from '@/store/uiStore';
import translations from '@/lib/i18n';
import { cn, truncate, formatDate } from '@/lib/utils';

const levelColors = { Beginner: 'success', Intermediate: 'warning', Advanced: 'destructive' };

const emptyForm = {
  title: '', description: '', category: 'General', level: 'Beginner',
  duration: 60, tags: '', isPublished: true,
  steps: [{ title: '', description: '', content: '', order: 1, duration: 30 }],
};

export default function Trainings() {
  const { user } = useAuthStore();
  const { language } = useUIStore();
  const t = translations[language];
  const { success, error } = useToast();

  const [trainings, setTrainings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [levelFilter, setLevelFilter] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [selectedTraining, setSelectedTraining] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [userRating, setUserRating] = useState(0);

  const canEdit = user?.role === 'admin' || user?.role === 'teacher';

  const fetchTrainings = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (levelFilter) params.set('level', levelFilter);
      const { data } = await api.get(`/trainings?${params}`);
      setTrainings(data.data);
    } catch (e) {
      error('Failed to load trainings');
    } finally {
      setLoading(false);
    }
  }, [search, levelFilter]);

  useEffect(() => {
    const timer = setTimeout(fetchTrainings, 300);
    return () => clearTimeout(timer);
  }, [fetchTrainings]);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (training) => {
    setEditingId(training._id);
    setForm({
      title: training.title,
      description: training.description,
      category: training.category,
      level: training.level,
      duration: training.duration,
      tags: training.tags?.join(', ') || '',
      isPublished: training.isPublished,
      steps: training.steps?.length > 0 ? training.steps : emptyForm.steps,
    });
    setDialogOpen(true);
  };

  const openDetail = (training) => {
    setSelectedTraining(training);
    const myRating = training.ratings?.find((r) => r.user === user?._id);
    setUserRating(myRating?.rating || 0);
    setDetailOpen(true);
  };

  const handleSave = async () => {
    if (!form.title || !form.description) {
      error('Title and description are required');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        tags: form.tags ? form.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
      };
      if (editingId) {
        await api.put(`/trainings/${editingId}`, payload);
        success('Training updated successfully');
      } else {
        await api.post('/trainings', payload);
        success('Training created successfully');
      }
      setDialogOpen(false);
      fetchTrainings();
    } catch (e) {
      error(e.response?.data?.message || 'Failed to save training');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/trainings/${id}`);
      success('Training deleted');
      setDeleteConfirm(null);
      fetchTrainings();
    } catch (e) {
      error('Failed to delete training');
    }
  };

  const handleRate = async (rating) => {
    try {
      await api.post(`/trainings/${selectedTraining._id}/rate`, { rating, comment: '' });
      setUserRating(rating);
      success('Rating submitted!');
    } catch (e) {
      error('Failed to submit rating');
    }
  };

  const addStep = () => {
    setForm((f) => ({
      ...f,
      steps: [...f.steps, { title: '', description: '', content: '', order: f.steps.length + 1, duration: 30 }],
    }));
  };

  const updateStep = (index, field, value) => {
    setForm((f) => {
      const steps = [...f.steps];
      steps[index] = { ...steps[index], [field]: value };
      return { ...f, steps };
    });
  };

  const removeStep = (index) => {
    setForm((f) => ({ ...f, steps: f.steps.filter((_, i) => i !== index) }));
  };

  return (
    <DashboardLayout title={t.trainings}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-6">
        <div className="flex flex-col sm:flex-row gap-3 flex-1 w-full sm:w-auto">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder={t.search + '...'}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={levelFilter} onValueChange={setLevelFilter}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder={t.all + ' ' + t.level} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">{t.all}</SelectItem>
              <SelectItem value="Beginner">{t.beginner}</SelectItem>
              <SelectItem value="Intermediate">{t.intermediate}</SelectItem>
              <SelectItem value="Advanced">{t.advanced}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {canEdit && (
          <Button onClick={openCreate} className="w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            {t.newTraining}
          </Button>
        )}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : trainings.length === 0 ? (
        <div className="text-center py-20">
          <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">{t.noData}</p>
          {canEdit && (
            <Button onClick={openCreate} className="mt-4">
              <Plus className="h-4 w-4 mr-2" />
              {t.newTraining}
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {trainings.map((training) => {
            const avgRating = training.ratings?.length > 0
              ? (training.ratings.reduce((s, r) => s + r.rating, 0) / training.ratings.length).toFixed(1)
              : 0;
            const myProgress = training.progress?.find((p) => p.user === user?._id);

            return (
              <Card key={training._id} className="hover:shadow-md transition-all group overflow-hidden">
                {/* Thumbnail */}
                <div
                  className="h-36 bg-gradient-to-br from-blue-500 to-indigo-600 relative cursor-pointer"
                  onClick={() => openDetail(training)}
                >
                  {training.thumbnail ? (
                    <img src={training.thumbnail} alt={training.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <BookOpen className="h-12 w-12 text-white/60" />
                    </div>
                  )}
                  <div className="absolute top-2 left-2">
                    <Badge variant={levelColors[training.level] || 'secondary'}>{training.level}</Badge>
                  </div>
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                    <Play className="h-10 w-10 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>

                <CardContent className="p-4">
                  <h3
                    className="font-semibold text-gray-900 mb-1 cursor-pointer hover:text-blue-600 line-clamp-1"
                    onClick={() => openDetail(training)}
                  >
                    {training.title}
                  </h3>
                  <p className="text-xs text-gray-500 mb-3 line-clamp-2">{training.description}</p>

                  <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {training.duration}m
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {training.enrolledCount}
                    </span>
                    <span className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      {avgRating}
                    </span>
                  </div>

                  {myProgress && (
                    <div className="mb-3">
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>{t.progress}</span>
                        <span>{myProgress.percentage}%</span>
                      </div>
                      <Progress value={myProgress.percentage} className="h-1.5" />
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">{training.steps?.length || 0} steps</span>
                    {canEdit && (
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => openEdit(training)}>
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => setDeleteConfirm(training._id)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingId ? t.editTraining : t.newTraining}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2 space-y-2">
                <Label>{t.title} *</Label>
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Training title" />
              </div>
              <div className="sm:col-span-2 space-y-2">
                <Label>{t.description} *</Label>
                <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} placeholder="Describe this training..." />
              </div>
              <div className="space-y-2">
                <Label>{t.category}</Label>
                <Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="e.g. Technology" />
              </div>
              <div className="space-y-2">
                <Label>{t.level}</Label>
                <Select value={form.level} onValueChange={(v) => setForm({ ...form, level: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Beginner">{t.beginner}</SelectItem>
                    <SelectItem value="Intermediate">{t.intermediate}</SelectItem>
                    <SelectItem value="Advanced">{t.advanced}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t.duration} ({t.minutes})</Label>
                <Input type="number" value={form.duration} onChange={(e) => setForm({ ...form, duration: Number(e.target.value) })} min={1} />
              </div>
              <div className="space-y-2">
                <Label>Tags (comma separated)</Label>
                <Input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="React, JavaScript, Web" />
              </div>
            </div>

            {/* Steps */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <Label className="text-base font-semibold">{t.trainingSteps}</Label>
                <Button size="sm" variant="outline" onClick={addStep}>
                  <Plus className="h-3.5 w-3.5 mr-1" />
                  {t.addStep}
                </Button>
              </div>
              <div className="space-y-3">
                {form.steps.map((step, index) => (
                  <div key={index} className="border rounded-lg p-4 space-y-3 bg-gray-50">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Step {index + 1}</span>
                      {form.steps.length > 1 && (
                        <button onClick={() => removeStep(index)} className="text-red-400 hover:text-red-600">
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                    <Input
                      placeholder={t.stepTitle}
                      value={step.title}
                      onChange={(e) => updateStep(index, 'title', e.target.value)}
                    />
                    <Textarea
                      placeholder={t.stepContent}
                      value={step.content}
                      onChange={(e) => updateStep(index, 'content', e.target.value)}
                      rows={2}
                    />
                    <Input
                      type="number"
                      placeholder="Duration (minutes)"
                      value={step.duration}
                      onChange={(e) => updateStep(index, 'duration', Number(e.target.value))}
                      min={1}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>{t.cancel}</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : t.save}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail Dialog */}
      {selectedTraining && (
        <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{selectedTraining.title}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 max-h-[65vh] overflow-y-auto pr-1">
              <p className="text-gray-600 text-sm">{selectedTraining.description}</p>

              <div className="flex flex-wrap gap-2">
                <Badge variant={levelColors[selectedTraining.level]}>{selectedTraining.level}</Badge>
                <Badge variant="secondary">{selectedTraining.category}</Badge>
                <Badge variant="outline">{selectedTraining.duration}m</Badge>
              </div>

              {/* Rating */}
              <div>
                <p className="text-sm font-medium mb-2">{t.rating}</p>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button key={star} onClick={() => handleRate(star)}>
                      <Star className={cn('h-6 w-6 transition-colors', star <= userRating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300 hover:text-yellow-300')} />
                    </button>
                  ))}
                  <span className="text-sm text-gray-500 ml-2 self-center">
                    ({selectedTraining.ratings?.length || 0} ratings)
                  </span>
                </div>
              </div>

              {/* Steps */}
              <div>
                <p className="text-sm font-semibold mb-3">{t.trainingSteps} ({selectedTraining.steps?.length || 0})</p>
                <div className="space-y-3">
                  {selectedTraining.steps?.map((step, index) => (
                    <div key={index} className="flex gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{step.title}</p>
                        {step.content && <p className="text-xs text-gray-500 mt-1">{step.content}</p>}
                        <p className="text-xs text-gray-400 mt-1">{step.duration}m</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <p className="text-xs text-gray-400">
                Created by {selectedTraining.createdBy?.name} • {formatDate(selectedTraining.createdAt)}
              </p>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirm */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Training</DialogTitle>
          </DialogHeader>
          <p className="text-gray-600 text-sm">Are you sure you want to delete this training? This action cannot be undone.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>{t.cancel}</Button>
            <Button variant="destructive" onClick={() => handleDelete(deleteConfirm)}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
