import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Edit, Trash2, Users, Clock, BookOpen, GraduationCap } from 'lucide-react';
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

const levelColors = { Beginner: 'success', Intermediate: 'warning', Advanced: 'destructive' };
const gradients = [
  'from-blue-500 to-indigo-600',
  'from-purple-500 to-pink-600',
  'from-green-500 to-teal-600',
  'from-orange-500 to-red-600',
  'from-cyan-500 to-blue-600',
  'from-rose-500 to-pink-600',
];

const emptyForm = { title: '', description: '', subject: '', level: 'Beginner', duration: 60, tags: '', isPublished: true };

export default function Courses() {
  const { user } = useAuthStore();
  const { language } = useUIStore();
  const t = translations[language];
  const { success, error } = useToast();

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [levelFilter, setLevelFilter] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const canEdit = user?.role === 'admin' || user?.role === 'teacher';

  const fetchCourses = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (levelFilter) params.set('level', levelFilter);
      const { data } = await api.get(`/courses?${params}`);
      setCourses(data.data);
    } catch (e) {
      error('Failed to load courses');
    } finally {
      setLoading(false);
    }
  }, [search, levelFilter]);

  useEffect(() => {
    const timer = setTimeout(fetchCourses, 300);
    return () => clearTimeout(timer);
  }, [fetchCourses]);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (course) => {
    setEditingId(course._id);
    setForm({
      title: course.title,
      description: course.description,
      subject: course.subject,
      level: course.level,
      duration: course.duration,
      tags: course.tags?.join(', ') || '',
      isPublished: course.isPublished,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.title || !form.description) {
      error('Title and description are required');
      return;
    }
    setSaving(true);
    try {
      const payload = { ...form, tags: form.tags ? form.tags.split(',').map((t) => t.trim()).filter(Boolean) : [] };
      if (editingId) {
        await api.put(`/courses/${editingId}`, payload);
        success('Course updated successfully');
      } else {
        await api.post('/courses', payload);
        success('Course created successfully');
      }
      setDialogOpen(false);
      fetchCourses();
    } catch (e) {
      error(e.response?.data?.message || 'Failed to save course');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/courses/${id}`);
      success('Course deleted');
      setDeleteConfirm(null);
      fetchCourses();
    } catch (e) {
      error('Failed to delete course');
    }
  };

  const handleEnroll = async (courseId) => {
    try {
      await api.post(`/courses/${courseId}/enroll`);
      success('Enrolled successfully!');
      fetchCourses();
    } catch (e) {
      error(e.response?.data?.message || 'Failed to enroll');
    }
  };

  return (
    <DashboardLayout title={t.courses}>
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-6">
        <div className="flex flex-col sm:flex-row gap-3 flex-1 w-full sm:w-auto">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input placeholder={t.search + '...'} value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
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
            {t.newCourse}
          </Button>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : courses.length === 0 ? (
        <div className="text-center py-20">
          <GraduationCap className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">{t.noData}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map((course, idx) => {
            const isEnrolled = course.students?.some((s) => s._id === user?._id || s === user?._id);
            return (
              <Card key={course._id} className="hover:shadow-md transition-all overflow-hidden">
                <div className={cn('h-32 bg-gradient-to-br flex items-center justify-center', gradients[idx % gradients.length])}>
                  {course.thumbnail ? (
                    <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                  ) : (
                    <GraduationCap className="h-12 w-12 text-white/60" />
                  )}
                </div>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-semibold text-gray-900 line-clamp-1">{course.title}</h3>
                    <Badge variant={levelColors[course.level] || 'secondary'} className="flex-shrink-0 text-xs">
                      {course.level}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-500 mb-3 line-clamp-2">{course.description}</p>

                  {course.subject && (
                    <p className="text-xs text-blue-600 font-medium mb-2">{course.subject}</p>
                  )}

                  <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {course.duration}m
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {course.students?.length || 0} students
                    </span>
                    <span className="flex items-center gap-1">
                      <BookOpen className="h-3 w-3" />
                      {course.tests?.length || 0} tests
                    </span>
                  </div>

                  {course.teacher && (
                    <p className="text-xs text-gray-400 mb-3">By {course.teacher.name}</p>
                  )}

                  <div className="flex items-center justify-between gap-2">
                    {user?.role === 'student' && (
                      <Button
                        size="sm"
                        variant={isEnrolled ? 'secondary' : 'default'}
                        className="flex-1 text-xs"
                        onClick={() => !isEnrolled && handleEnroll(course._id)}
                        disabled={isEnrolled}
                      >
                        {isEnrolled ? 'Enrolled ✓' : t.enrollNow}
                      </Button>
                    )}
                    {canEdit && (
                      <div className="flex gap-1 ml-auto">
                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => openEdit(course)}>
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => setDeleteConfirm(course._id)}>
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
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingId ? t.editCourse : t.newCourse}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{t.title} *</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Course title" />
            </div>
            <div className="space-y-2">
              <Label>{t.description} *</Label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t.subject}</Label>
                <Input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="e.g. Mathematics" />
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
                <Label>Tags</Label>
                <Input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="React, JS" />
              </div>
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
          <DialogHeader><DialogTitle>Delete Course</DialogTitle></DialogHeader>
          <p className="text-gray-600 text-sm">Are you sure you want to delete this course?</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>{t.cancel}</Button>
            <Button variant="destructive" onClick={() => handleDelete(deleteConfirm)}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
