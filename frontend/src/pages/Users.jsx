import React, { useState, useEffect, useCallback } from 'react';
import { Search, Users, Edit, Trash2, UserCheck } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TableSkeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/toast';
import api from '@/lib/api';
import useAuthStore from '@/store/authStore';
import useUIStore from '@/store/uiStore';
import translations from '@/lib/i18n';
import { cn, getInitials, getAvatarColor, formatDate } from '@/lib/utils';

const roleColors = { admin: 'destructive', teacher: 'warning', student: 'success' };

export default function UsersPage() {
  const { user: currentUser } = useAuthStore();
  const { language } = useUIStore();
  const t = translations[language];
  const { success, error } = useToast();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [editUser, setEditUser] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (roleFilter) params.set('role', roleFilter);
      const { data } = await api.get(`/users?${params}`);
      setUsers(data.data);
    } catch (e) {
      error('Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [search, roleFilter]);

  useEffect(() => {
    const timer = setTimeout(fetchUsers, 300);
    return () => clearTimeout(timer);
  }, [fetchUsers]);

  const handleUpdate = async () => {
    setSaving(true);
    try {
      await api.put(`/users/${editUser._id}`, {
        name: editUser.name,
        phone: editUser.phone,
        bio: editUser.bio,
        school: editUser.school,
        level: editUser.level,
        role: editUser.role,
      });
      success('User updated successfully');
      setEditUser(null);
      fetchUsers();
    } catch (e) {
      error(e.response?.data?.message || 'Failed to update user');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/users/${id}`);
      success('User deleted');
      setDeleteConfirm(null);
      fetchUsers();
    } catch (e) {
      error('Failed to delete user');
    }
  };

  const studentCount = users.filter((u) => u.role === 'student').length;
  const teacherCount = users.filter((u) => u.role === 'teacher').length;
  const adminCount = users.filter((u) => u.role === 'admin').length;

  return (
    <DashboardLayout title={t.users}>
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: t.student, count: studentCount, color: 'bg-blue-100 text-blue-700' },
          { label: t.teacher, count: teacherCount, color: 'bg-purple-100 text-purple-700' },
          { label: t.admin, count: adminCount, color: 'bg-red-100 text-red-700' },
        ].map((item) => (
          <Card key={item.label}>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold">{item.count}</p>
              <p className={cn('text-xs font-medium mt-1 px-2 py-0.5 rounded-full inline-block', item.color)}>{item.label}s</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input placeholder={t.search + '...'} value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="All Roles" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">{t.all}</SelectItem>
            <SelectItem value="student">{t.student}</SelectItem>
            <SelectItem value="teacher">{t.teacher}</SelectItem>
            <SelectItem value="admin">{t.admin}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6"><TableSkeleton rows={6} /></div>
          ) : users.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-10 w-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">{t.noData}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-gray-500">User</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500">Role</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500 hidden md:table-cell">School</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500 hidden lg:table-cell">Joined</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {users.map((u) => (
                    <tr key={u._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className={cn('w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0', getAvatarColor(u.name))}>
                            {u.avatar ? (
                              <img src={u.avatar} alt={u.name} className="w-full h-full rounded-full object-cover" />
                            ) : (
                              getInitials(u.name)
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{u.name}</p>
                            <p className="text-xs text-gray-500">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={roleColors[u.role] || 'secondary'} className="capitalize">{u.role}</Badge>
                      </td>
                      <td className="px-4 py-3 text-gray-500 hidden md:table-cell">{u.school || '—'}</td>
                      <td className="px-4 py-3 text-gray-500 hidden lg:table-cell">{formatDate(u.createdAt)}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => setEditUser({ ...u })}>
                            <Edit className="h-3.5 w-3.5" />
                          </Button>
                          {currentUser?.role === 'admin' && u._id !== currentUser._id && (
                            <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => setDeleteConfirm(u._id)}>
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      {editUser && (
        <Dialog open={!!editUser} onOpenChange={() => setEditUser(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader><DialogTitle>Edit User</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input value={editUser.name} onChange={(e) => setEditUser({ ...editUser, name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>School</Label>
                <Input value={editUser.school || ''} onChange={(e) => setEditUser({ ...editUser, school: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Level</Label>
                <Input value={editUser.level || ''} onChange={(e) => setEditUser({ ...editUser, level: e.target.value })} />
              </div>
              {currentUser?.role === 'admin' && (
                <div className="space-y-2">
                  <Label>Role</Label>
                  <Select value={editUser.role} onValueChange={(v) => setEditUser({ ...editUser, role: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="student">Student</SelectItem>
                      <SelectItem value="teacher">Teacher</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditUser(null)}>{t.cancel}</Button>
              <Button onClick={handleUpdate} disabled={saving}>{saving ? 'Saving...' : t.save}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirm */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Delete User</DialogTitle></DialogHeader>
          <p className="text-gray-600 text-sm">Are you sure you want to delete this user? This action cannot be undone.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>{t.cancel}</Button>
            <Button variant="destructive" onClick={() => handleDelete(deleteConfirm)}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
