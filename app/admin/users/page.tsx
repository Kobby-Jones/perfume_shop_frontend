// app/admin/users/page.tsx

'use client';

import { useQuery } from '@tanstack/react-query';
import { Users, Loader2, Mail, UserPlus, Trash2 } from 'lucide-react';
import { apiFetch } from '@/lib/api/httpClient';
import { Input } from '@/components/ui/input';
import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { UserForm } from '@/components/admin/UserForm';

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

  const handleAddUser = () => setIsFormOpen(true);

  const handleDeleteUser = (userId: number) => {
    if (window.confirm(`Permanently delete user ${userId}?`)) {
      console.log(`Admin: Deleting user ${userId}`);
      // TODO: Call Delete API + invalidate query
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
          <span>Users <span className="text-base md:text-xl">({allUsers.length})</span></span>
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

      {/* Mobile Card View */}
      <div className="block lg:hidden space-y-3">
        {filteredUsers.length === 0 ? (
          <div className="bg-white rounded-lg p-6 text-center text-gray-500">
            No users found matching filters.
          </div>
        ) : (
          filteredUsers.map((user) => (
            <div key={user.id} className="bg-white rounded-lg shadow-md p-4 space-y-3">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <p className="font-bold text-base">{user.name}</p>
                  <p className="text-sm text-gray-500 flex items-center mt-1">
                    <Mail className="w-3 h-3 mr-1" />
                    {user.email}
                  </p>
                  <div className="flex gap-2 mt-2">
                    <Badge className={user.role === 'admin' ? 'bg-red-500' : 'bg-gray-500'}>
                      {user.role.toUpperCase()}
                    </Badge>
                    <Badge variant="outline">
                      {user.totalOrders} Orders
                    </Badge>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2 pt-2 border-t">
                <Button variant="outline" size="sm" className="flex-1">
                  View
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleDeleteUser(user.id)}
                  className="flex-1 text-red-500 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4 mr-1" /> Delete
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block bg-white rounded-xl shadow-md overflow-x-auto">
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
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-red-500" 
                    onClick={() => handleDeleteUser(u.id)}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <UserForm open={isFormOpen} onOpenChange={setIsFormOpen} />
    </div>
  );
}