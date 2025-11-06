'use client';

import { useQuery } from '@tanstack/react-query';
import { Users, Loader2, Mail, UserPlus } from 'lucide-react';
import { apiFetch } from '@/lib/api/httpClient';
import { Input } from '@/components/ui/input';
import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { UserForm } from '@/components/admin/UserForm';

// Define the User Summary data expected from the backend
interface UserSummary {
  id: number;
  name: string;
  email: string;
  role: 'user' | 'admin';
  registrationDate: string; 
  totalOrders: number;
}

interface AdminUsersRawResponse {
  users: UserSummary[];
}

type AdminUsersFinalData = UserSummary[];

export default function AdminUsersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Fetch user list from the admin endpoint
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

  const filteredUsers = useMemo(() => {
    if (!searchTerm) return allUsers;
    const term = searchTerm.toLowerCase();
    return allUsers.filter(u =>
      u.name.toLowerCase().includes(term) ||
      u.email.toLowerCase().includes(term) ||
      u.id.toString().includes(term)
    );
  }, [allUsers, searchTerm]);

  const handleAddUser = () => setIsFormOpen(true); // OPEN FORM

  const handleDeleteUser = (userId: number) => {
    if (window.confirm(`Permanently delete user ${userId}?`)) {
      console.log(`Admin: Deleting user ${userId}`);
      // TODO: Call Delete API + invalidate query
    }
  };

  if (isLoading) return <Loader2 className="w-8 h-8 animate-spin text-primary" />;
  if (isError) return <div className="text-red-500">Failed to load user data.</div>;

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold flex items-center">
        <Users className="w-8 h-8 mr-3" /> Customer Accounts ({allUsers.length})
      </h1>

      <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm border">
        <Input
          placeholder="Search by name, email, or ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />
        <Button onClick={handleAddUser}>
          <UserPlus className='w-5 h-5 mr-2'/> Create New User
        </Button>
      </div>

      {/* User Table */}
      <div className="bg-white rounded-xl shadow-md overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {['ID', 'Name', 'Email', 'Role', 'Orders', 'Actions'].map(header => (
                <th key={header} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredUsers.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-6 text-gray-500">No users found matching filters.</td>
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
                <td className="px-6 py-4 text-sm font-medium">
                  <Button variant="ghost" size="sm">View</Button>
                  <Button variant="ghost" size="sm" className="text-red-500" onClick={() => handleDeleteUser(u.id)}>Delete</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/*  USER CREATION FORM MODAL */}
      <UserForm open={isFormOpen} onOpenChange={setIsFormOpen} />
    </div>
  );
}
