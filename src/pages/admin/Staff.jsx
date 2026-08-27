import { useEffect, useState } from 'react';
import { Search, Plus, UserCog, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { C } from '../../components/dashboard/colors';

export default function Staff() {
  const [staff, setStaff] = useState([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStaff() {
      setLoading(true);

      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, phone, role, created_at')
        .in('role', ['therapist', 'admin'])
        .order('full_name', { ascending: true });

      if (error) {
        console.error('Error fetching staff:', error);
        setStaff([]);
      } else {
        setStaff(data || []);
      }

      setLoading(false);
    }

    fetchStaff();
  }, []);

  const filteredStaff = staff.filter((member) => {
    const matchesSearch =
      member.full_name
        ?.toLowerCase()
        .includes(search.toLowerCase()) ||
      member.email
        ?.toLowerCase()
        .includes(search.toLowerCase()) ||
      member.phone
        ?.toLowerCase()
        .includes(search.toLowerCase());

    const matchesRole =
      roleFilter === 'all' || member.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  function formatRole(role) {
    if (role === 'therapist') return 'Therapist';
    if (role === 'admin') return 'Administrator';
    return role;
  }

  function formatDate(date) {
    if (!date) return '';

    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }

  if (loading) {
    return (
      <div className="text-sm" style={{ color: C.muted }}>
        Loading staff...
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1
            className="font-display font-semibold text-2xl"
            style={{ color: C.ink }}
          >
            Staff
          </h1>

          <p
            className="text-sm mt-1"
            style={{ color: C.muted }}
          >
            Manage therapists and administrators in your clinic.
          </p>
        </div>

        <Link
          to="/admin/staff/add"
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm text-white font-medium"
          style={{ background: C.primary }}
        >
          <Plus size={16} />
          Add staff
        </Link>
      </div>

      {/* Stats */}
      <div className="flex gap-4">

        <div
          className="flex-1 rounded-xl p-4 bg-white"
          style={{ border: `1px solid ${C.border}` }}
        >
          <div className="flex items-center gap-2">
            <UserCog size={17} color={C.primary} />
            <span
              className="text-xs"
              style={{ color: C.muted }}
            >
              Therapists
            </span>
          </div>

          <p
            className="text-2xl font-semibold mt-2"
            style={{ color: C.ink }}
          >
            {staff.filter((member) => member.role === 'therapist').length}
          </p>
        </div>

        <div
          className="flex-1 rounded-xl p-4 bg-white"
          style={{ border: `1px solid ${C.border}` }}
        >
          <div className="flex items-center gap-2">
            <ShieldCheck size={17} color={C.primaryLight} />
            <span
              className="text-xs"
              style={{ color: C.muted }}
            >
              Administrators
            </span>
          </div>

          <p
            className="text-2xl font-semibold mt-2"
            style={{ color: C.ink }}
          >
            {staff.filter((member) => member.role === 'admin').length}
          </p>
        </div>

        <div
          className="flex-1 rounded-xl p-4 bg-white"
          style={{ border: `1px solid ${C.border}` }}
        >
          <div className="flex items-center gap-2">
            <UserCog size={17} color={C.accent} />
            <span
              className="text-xs"
              style={{ color: C.muted }}
            >
              Total staff
            </span>
          </div>

          <p
            className="text-2xl font-semibold mt-2"
            style={{ color: C.ink }}
          >
            {staff.length}
          </p>
        </div>

      </div>

      {/* Search + filter */}
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
            placeholder="Search staff..."
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
          <option value="all">All roles</option>
          <option value="therapist">Therapists</option>
          <option value="admin">Administrators</option>
        </select>

      </div>

      {/* Staff table */}
      <div
        className="rounded-xl overflow-hidden bg-white"
        style={{ border: `1px solid ${C.border}` }}
      >
        {filteredStaff.length === 0 ? (
          <div className="py-12 text-center">
            <UserCog
              size={28}
              className="mx-auto"
              color={C.muted}
            />

            <p
              className="text-sm mt-3"
              style={{ color: C.muted }}
            >
              No staff members found.
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
                  Staff member
                </th>

                <th className="text-left px-4 py-3 text-xs font-medium text-muted">
                  Role
                </th>

                <th className="text-left px-4 py-3 text-xs font-medium text-muted">
                  Email
                </th>

                <th className="text-left px-4 py-3 text-xs font-medium text-muted">
                  Phone
                </th>

                <th className="text-left px-4 py-3 text-xs font-medium text-muted">
                  Added
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredStaff.map((member, index) => (
                <tr
                  key={member.id}
                  className={index > 0 ? 'border-t' : ''}
                  style={{ borderColor: C.border }}
                >

                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">

                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium"
                        style={{
                          background:
                            member.role === 'admin'
                              ? '#EAF1F0'
                              : '#E1F0EA',
                          color:
                            member.role === 'admin'
                              ? C.primaryLight
                              : C.primary,
                        }}
                      >
                        {member.full_name
                          ?.charAt(0)
                          .toUpperCase() || '?'}
                      </div>

                      <span
                        className="font-medium"
                        style={{ color: C.ink }}
                      >
                        {member.full_name || 'Unnamed staff'}
                      </span>

                    </div>
                  </td>

                  <td className="px-4 py-3">
                    <span
                      className="text-xs px-2.5 py-1 rounded-full"
                      style={{
                        background:
                          member.role === 'admin'
                            ? '#EAF1F0'
                            : '#E1F0EA',
                        color:
                          member.role === 'admin'
                            ? C.primaryLight
                            : C.primary,
                      }}
                    >
                      {formatRole(member.role)}
                    </span>
                  </td>

                  <td
                    className="px-4 py-3 text-sm"
                    style={{ color: C.muted }}
                  >
                    {member.email || '—'}
                  </td>

                  <td
                    className="px-4 py-3 text-sm"
                    style={{ color: C.muted }}
                  >
                    {member.phone || '—'}
                  </td>

                  <td
                    className="px-4 py-3 text-xs"
                    style={{
                      color: C.muted,
                      fontFamily: "'IBM Plex Mono', monospace",
                    }}
                  >
                    {formatDate(member.created_at)}
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

