// app/admin/users/page.tsx

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Users, Loader2, Mail, UserPlus, Trash2 } from 'lucide-react';
import { apiFetch } from '@/lib/api/httpClient';
import { Input } from '@/components/ui/input';
import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { UserForm } from '@/components/admin/UserForm';
import { useAlert } from '@/components/shared/ModalAlert';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';

// Define the precise structure expected from the backend
interface UserSummary {
  id: number;
  name: string;
  email: string;
  role: 'user' | 'admin';
  createdAt: string;
  totalOrders: number; 
}

interface AdminUsersRawResponse {
  users: UserSummary[];
}

type AdminUsersFinalData = UserSummary[];

export default function AdminUsersPage() {
  const queryClient = useQueryClient();
  const { alert } = useAlert();
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<UserSummary | null>(null);

  // Fetch Users (GET /api/admin/users)
  const { data: allUsers = [], isLoading, isError } = useQuery<
    AdminUsersRawResponse,
    Error,
    AdminUsersFinalData
  >({
    queryKey: ['adminUsers'],
    queryFn: () => apiFetch('/admin/users'),
    select: (data) => data.users,
    staleTime: 1000 * 60 * 5,
  });

  // Delete Mutation (DELETE /api/admin/users/:id)
  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiFetch(`/admin/users/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      alert({ title: "User Deleted", message: "User account has been permanently removed.", variant: 'success' });
      setDeleteConfirmOpen(false);
      setUserToDelete(null);
    },
    onError: (error: any) => {
      alert({ title: "Delete Failed", message: error.message || "Could not delete user.", variant: 'error' });
      setDeleteConfirmOpen(false);
    },
  });


  const filteredUsers = useMemo(() => {
    if (!searchTerm) return allUsers;
    const term = searchTerm.toLowerCase();
    return allUsers.filter(u =>
      u.name.toLowerCase().includes(term) ||
      u.email.toLowerCase().includes(term) ||
      u.id.toString().includes(term)
    );
  }, [allUsers, searchTerm]);

  const handleAddUser = () => setIsFormOpen(true);

  const handleDeleteUser = (user: UserSummary) => {
    setUserToDelete(user);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (userToDelete) {
      deleteMutation.mutate(userToDelete.id);
    }
  };

  if (isLoading) return (
    <div className="flex justify-center py-12">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );
  
  if (isError) return <div className="text-red-500 p-4">Failed to load user data.</div>;

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="text-2xl md:text-3xl font-bold flex items-center">
          <Users className="w-6 h-6 md:w-8 md:h-8 mr-2 md:mr-3" /> 
          <span>Customers <span className="text-base md:text-xl">({allUsers.length})</span></span>
        </h1>
        <Button onClick={handleAddUser} size="sm" className="self-start sm:self-auto">
          <UserPlus className="w-4 h-4 md:w-5 md:h-5 mr-2" /> Add User
        </Button>
      </div>

      <Input
        placeholder="Search by name, email, or ID..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full"
      />

      {/* Desktop Table View */}
      <div className="bg-white rounded-xl shadow-md overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {['ID', 'Name', 'Email', 'Role', 'Orders', 'Joined', 'Actions'].map(header => (
                <th key={header} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredUsers.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center py-6 text-gray-500">No users found matching filters.</td>
              </tr>
            )}

            {filteredUsers.map((u) => (
              <tr key={u.id}>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{u.id}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{u.name}</td>
                <td className="px-6 py-4 text-sm text-blue-600 flex items-center">
                  <Mail className="w-4 h-4 mr-1" />{u.email}
                </td>
                <td className="px-6 py-4 text-sm">
                  <Badge className={u.role === 'admin' ? 'bg-red-500' : 'bg-gray-500'}>
                    {u.role.toUpperCase()}
                  </Badge>
                </td>
                <td className="px-6 py-4 text-sm font-bold text-gray-700">{u.totalOrders}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                <td className="px-6 py-4 text-sm font-medium">
                  <Button variant="ghost" size="sm">View</Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-red-500" 
                    onClick={() => handleDeleteUser(u)}
                    disabled={deleteMutation.isPending}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* User Form Dialog */}
      <UserForm open={isFormOpen} onOpenChange={setIsFormOpen} />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>"{userToDelete?.name}"</strong> ({userToDelete?.email})? 
              This action cannot be undone and will permanently remove their account and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              disabled={deleteMutation.isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete User'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}