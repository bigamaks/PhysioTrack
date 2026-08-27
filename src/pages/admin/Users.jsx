import { useEffect, useState } from 'react';
import { Search, UserPlus, Users as UsersIcon } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { C } from '../../components/dashboard/colors';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUsers() {
      setLoading(true);

      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          full_name,
          email,
          phone,
          role,
          created_at
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching users:', error);
        setUsers([]);
      } else {
        setUsers(data || []);
      }

      setLoading(false);
    }

    fetchUsers();
  }, []);

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      user.email?.toLowerCase().includes(search.toLowerCase());

    const matchesRole =
      roleFilter === 'all' || user.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  if (loading) {
    return (
      <div className="text-sm" style={{ color: C.muted }}>
        Loading users...
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1
            className="font-display font-semibold text-2xl"
            style={{ color: C.ink }}
          >
            Users
          </h1>

          <p className="text-sm mt-1" style={{ color: C.muted }}>
            Manage patients, therapists, and other clinic users.
          </p>
        </div>

        <button
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-white"
          style={{ background: C.primary }}
        >
          <UserPlus size={16} />
          Add user
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">

        <div
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white border"
          style={{
            width: 320,
            borderColor: C.border,
          }}
        >
          <Search size={16} color={C.muted} />

          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full outline-none text-sm"
            style={{ color: C.ink }}
          />
        </div>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-3 py-2 rounded-lg bg-white border text-sm outline-none"
          style={{
            borderColor: C.border,
            color: C.ink,
          }}
        >
          <option value="all">All users</option>
          <option value="therapist">Therapists</option>
          <option value="patient">Patients</option>
          <option value="admin">Admins</option>
        </select>

      </div>

      {/* Users table */}
      <div
        className="rounded-xl overflow-hidden bg-white"
        style={{ border: `1px solid ${C.border}` }}
      >
        {filteredUsers.length === 0 ? (
          <div className="py-12 text-center">
            <UsersIcon
              size={28}
              className="mx-auto"
              color={C.muted}
            />

            <p className="text-sm mt-3" style={{ color: C.muted }}>
              No users found.
            </p>
          </div>
        ) : (
          <table className="w-full text-sm">

            <thead>
              <tr
                className="border-b"
                style={{ borderColor: C.border }}
              >
                <th className="text-left px-4 py-3 text-xs font-medium text-muted">
                  User
                </th>

                <th className="text-left px-4 py-3 text-xs font-medium text-muted">
                  Email
                </th>

                <th className="text-left px-4 py-3 text-xs font-medium text-muted">
                  Phone
                </th>

                <th className="text-left px-4 py-3 text-xs font-medium text-muted">
                  Role
                </th>

                <th className="text-left px-4 py-3 text-xs font-medium text-muted">
                  Joined
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredUsers.map((user, index) => (
                <tr
                  key={user.id}
                  className={
                    index > 0
                      ? 'border-t'
                      : ''
                  }
                  style={{ borderColor: C.border }}
                >
                  <td className="px-4 py-3">
                    <p
                      className="font-medium"
                      style={{ color: C.ink }}
                    >
                      {user.full_name || 'Unnamed user'}
                    </p>
                  </td>

                  <td
                    className="px-4 py-3"
                    style={{ color: C.muted }}
                  >
                    {user.email || '—'}
                  </td>

                  <td
                    className="px-4 py-3"
                    style={{ color: C.muted }}
                  >
                    {user.phone || '—'}
                  </td>

                  <td className="px-4 py-3">
                    <span
                      className="text-xs px-2.5 py-1 rounded-full"
                      style={{
                        background:
                          user.role === 'therapist'
                            ? '#EAF1F0'
                            : user.role === 'admin'
                              ? '#F3EFE6'
                              : '#E1F0EA',
                        color:
                          user.role === 'therapist'
                            ? C.primaryLight
                            : user.role === 'admin'
                              ? '#9A8158'
                              : C.primary,
                        fontWeight: 500,
                      }}
                    >
                      {user.role}
                    </span>
                  </td>

                  <td
                    className="px-4 py-3 text-xs"
                    style={{ color: C.muted }}
                  >
                    {user.created_at
                      ? new Date(
                          user.created_at
                        ).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })
                      : '—'}
                  </td>
                </tr>
              ))}
            </tbody>

          </table>
        )}
      </div>
    </div>
  );
}