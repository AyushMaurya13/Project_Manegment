import { useState, useEffect } from 'react';
import { getUsers } from '../services/api';
import toast from 'react-hot-toast';
import { Users as UsersIcon, Loader2, Shield, Mail } from 'lucide-react';

const Team = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    try { const { data } = await getUsers(); setUsers(data); }
    catch { toast.error('Failed to load users'); }
    finally { setLoading(false); }
  };

  if (loading) return <div className="flex items-center justify-center h-[60vh]"><Loader2 size={32} className="animate-spin text-primary-500" /></div>;

  const admins = users.filter(u => u.role === 'admin');
  const members = users.filter(u => u.role === 'member');

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-surface-100">Team</h1>
        <p className="text-surface-700 mt-1">{users.length} member{users.length !== 1 ? 's' : ''}</p>
      </div>

      {/* Admins */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Shield size={16} className="text-primary-400" />
          <h2 className="text-sm font-semibold text-surface-200 uppercase tracking-wider">Admins</h2>
          <span className="text-xs text-surface-700 ml-1">({admins.length})</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {admins.map(u => (
            <div key={u._id} className="glass-card p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold text-lg">
                {u.name?.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-base font-semibold text-surface-100 truncate">{u.name}</p>
                <div className="flex items-center gap-1.5">
                  <Mail size={12} className="text-surface-700" />
                  <p className="text-xs text-surface-700 truncate">{u.email}</p>
                </div>
                <span className="inline-block mt-1 text-xs px-2 py-0.5 rounded-full bg-primary-500/15 text-primary-400 border border-primary-500/20">Admin</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Members */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <UsersIcon size={16} className="text-accent-400" />
          <h2 className="text-sm font-semibold text-surface-200 uppercase tracking-wider">Members</h2>
          <span className="text-xs text-surface-700 ml-1">({members.length})</span>
        </div>
        {members.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {members.map(u => (
              <div key={u._id} className="glass-card p-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-surface-700 flex items-center justify-center text-surface-200 font-bold text-lg">
                  {u.name?.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-base font-semibold text-surface-100 truncate">{u.name}</p>
                  <div className="flex items-center gap-1.5">
                    <Mail size={12} className="text-surface-700" />
                    <p className="text-xs text-surface-700 truncate">{u.email}</p>
                  </div>
                  <span className="inline-block mt-1 text-xs px-2 py-0.5 rounded-full bg-surface-800 text-surface-200 border border-surface-700">Member</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 glass-card">
            <UsersIcon size={36} className="mx-auto mb-3 text-surface-700" />
            <p className="text-sm text-surface-700">No members yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Team;
