import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getProjects, createProject, updateProject, deleteProject, getUsers, addMember, removeMember } from '../services/api';
import Modal from '../components/Modal';
import toast from 'react-hot-toast';
import { Plus, FolderKanban, Loader2, Calendar, Users, MoreVertical, Trash2, Edit3, UserPlus, UserMinus } from 'lucide-react';

const PROJECT_COLORS = ['#6366f1','#0ea5e9','#8b5cf6','#ec4899','#f59e0b','#10b981','#ef4444','#06b6d4'];

const Projects = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(null);
  const [showMembers, setShowMembers] = useState(null);
  const [menuOpen, setMenuOpen] = useState(null);
  const [form, setForm] = useState({ title: '', description: '', deadline: '', status: 'active', color: '#6366f1' });

  useEffect(() => { fetchProjects(); if(user?.role==='admin') fetchUsers(); }, []);

  const fetchProjects = async () => {
    try { const { data } = await getProjects(); setProjects(data); }
    catch { toast.error('Failed to load projects'); }
    finally { setLoading(false); }
  };

  const fetchUsers = async () => {
    try { const { data } = await getUsers(); setUsers(data); } catch {}
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await createProject(form);
      toast.success('Project created!');
      setShowCreate(false);
      setForm({ title: '', description: '', deadline: '', status: 'active', color: '#6366f1' });
      fetchProjects();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await updateProject(showEdit._id, form);
      toast.success('Project updated!');
      setShowEdit(null);
      fetchProjects();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this project and all its tasks?')) return;
    try {
      await deleteProject(id);
      toast.success('Project deleted');
      fetchProjects();
    } catch { toast.error('Failed to delete'); }
  };

  const handleAddMember = async (projectId, userId) => {
    try { await addMember(projectId, userId); toast.success('Member added'); fetchProjects(); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleRemoveMember = async (projectId, userId) => {
    try { await removeMember(projectId, userId); toast.success('Member removed'); fetchProjects(); }
    catch { toast.error('Failed to remove'); }
  };

  const openEdit = (p) => {
    setForm({ title: p.title, description: p.description, deadline: p.deadline?.split('T')[0]||'', status: p.status, color: p.color });
    setShowEdit(p);
    setMenuOpen(null);
  };

  if (loading) return <div className="flex items-center justify-center h-[60vh]"><Loader2 size={32} className="animate-spin text-primary-500" /></div>;

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-surface-100">Projects</h1>
          <p className="text-surface-700 mt-1">{projects.length} project{projects.length !== 1 ? 's' : ''}</p>
        </div>
        {user?.role === 'admin' && (
          <button onClick={() => { setForm({ title:'', description:'', deadline:'', status:'active', color:'#6366f1' }); setShowCreate(true); }} className="btn-primary">
            <Plus size={18} /> New Project
          </button>
        )}
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-20">
          <FolderKanban size={48} className="mx-auto mb-4 text-surface-700" />
          <h3 className="text-lg font-medium text-surface-200 mb-2">No projects yet</h3>
          <p className="text-surface-700 text-sm">
            {user?.role === 'admin' ? 'Create your first project to get started.' : 'Wait for an admin to assign you to a project.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.map((p) => (
            <div key={p._id} className="glass-card p-0 overflow-hidden">
              <div className="h-1.5" style={{ background: p.color || '#6366f1' }} />
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-semibold text-surface-100 flex-1">{p.title}</h3>
                  {user?.role === 'admin' && (
                    <div className="relative">
                      <button onClick={() => setMenuOpen(menuOpen === p._id ? null : p._id)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-surface-700 hover:bg-surface-800 hover:text-white transition-colors">
                        <MoreVertical size={16} />
                      </button>
                      {menuOpen === p._id && (
                        <div className="absolute right-0 top-10 w-44 glass-card p-1.5 z-50 rounded-xl">
                          <button onClick={() => openEdit(p)} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-surface-200 hover:bg-surface-800/50 rounded-lg transition-colors">
                            <Edit3 size={14} /> Edit
                          </button>
                          <button onClick={() => { setShowMembers(p); setMenuOpen(null); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-surface-200 hover:bg-surface-800/50 rounded-lg transition-colors">
                            <Users size={14} /> Members
                          </button>
                          <button onClick={() => { handleDelete(p._id); setMenuOpen(null); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                            <Trash2 size={14} /> Delete
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <p className="text-sm text-surface-700 mb-4 line-clamp-2">{p.description}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users size={14} className="text-surface-700" />
                    <span className="text-xs text-surface-700">{p.members?.length || 0} members</span>
                  </div>
                  {p.deadline && (
                    <div className="flex items-center gap-1 text-xs text-surface-700">
                      <Calendar size={12} />
                      {new Date(p.deadline).toLocaleDateString()}
                    </div>
                  )}
                </div>
                <div className="mt-3">
                  <span className={`text-xs px-2.5 py-1 rounded-full ${
                    p.status === 'active' ? 'status-in-progress' : p.status === 'completed' ? 'status-done' : 'status-todo'
                  }`}>{p.status}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Create Project">
        <form onSubmit={handleCreate} className="space-y-4">
          <div><label className="block text-sm font-medium text-surface-200 mb-1.5">Title</label>
            <input className="input-dark" required value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="Project name" /></div>
          <div><label className="block text-sm font-medium text-surface-200 mb-1.5">Description</label>
            <textarea className="input-dark min-h-[80px] resize-none" required value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Brief description" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-surface-200 mb-1.5">Deadline</label>
              <input type="date" className="input-dark" value={form.deadline} onChange={e => setForm({...form, deadline: e.target.value})} /></div>
            <div><label className="block text-sm font-medium text-surface-200 mb-1.5">Color</label>
              <div className="flex gap-2 flex-wrap">
                {PROJECT_COLORS.map(c => (
                  <button key={c} type="button" onClick={() => setForm({...form, color: c})}
                    className={`w-7 h-7 rounded-lg transition-all ${form.color === c ? 'ring-2 ring-white ring-offset-2 ring-offset-surface-900 scale-110' : 'hover:scale-105'}`}
                    style={{ backgroundColor: c }} />
                ))}
              </div></div>
          </div>
          <button type="submit" className="btn-primary w-full">Create Project</button>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={!!showEdit} onClose={() => setShowEdit(null)} title="Edit Project">
        <form onSubmit={handleUpdate} className="space-y-4">
          <div><label className="block text-sm font-medium text-surface-200 mb-1.5">Title</label>
            <input className="input-dark" required value={form.title} onChange={e => setForm({...form, title: e.target.value})} /></div>
          <div><label className="block text-sm font-medium text-surface-200 mb-1.5">Description</label>
            <textarea className="input-dark min-h-[80px] resize-none" required value={form.description} onChange={e => setForm({...form, description: e.target.value})} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-surface-200 mb-1.5">Status</label>
              <select className="input-dark" value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
                <option value="active">Active</option><option value="completed">Completed</option><option value="on-hold">On Hold</option>
              </select></div>
            <div><label className="block text-sm font-medium text-surface-200 mb-1.5">Deadline</label>
              <input type="date" className="input-dark" value={form.deadline} onChange={e => setForm({...form, deadline: e.target.value})} /></div>
          </div>
          <button type="submit" className="btn-primary w-full">Save Changes</button>
        </form>
      </Modal>

      {/* Members Modal */}
      <Modal isOpen={!!showMembers} onClose={() => setShowMembers(null)} title={`Members — ${showMembers?.title}`}>
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium text-surface-200 mb-3">Current Members</h4>
            {showMembers?.members?.length > 0 ? showMembers.members.map(m => (
              <div key={m._id} className="flex items-center justify-between p-3 rounded-xl bg-surface-800/30 mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-600 to-accent-500 flex items-center justify-center text-white text-xs font-semibold">
                    {m.name?.charAt(0).toUpperCase()}</div>
                  <div><p className="text-sm text-surface-100">{m.name}</p><p className="text-xs text-surface-700">{m.email}</p></div>
                </div>
                <button onClick={() => { handleRemoveMember(showMembers._id, m._id); setShowMembers({...showMembers, members: showMembers.members.filter(x => x._id !== m._id)}); }}
                  className="btn-danger text-xs py-1 px-2"><UserMinus size={12} /> Remove</button>
              </div>
            )) : <p className="text-sm text-surface-700">No members yet</p>}
          </div>
          <div>
            <h4 className="text-sm font-medium text-surface-200 mb-3">Add Members</h4>
            {users.filter(u => u._id !== showMembers?.owner?._id && !showMembers?.members?.some(m => m._id === u._id)).map(u => (
              <div key={u._id} className="flex items-center justify-between p-3 rounded-xl bg-surface-800/30 mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-surface-700 flex items-center justify-center text-surface-200 text-xs font-semibold">
                    {u.name?.charAt(0).toUpperCase()}</div>
                  <div><p className="text-sm text-surface-100">{u.name}</p><p className="text-xs text-surface-700">{u.role}</p></div>
                </div>
                <button onClick={() => { handleAddMember(showMembers._id, u._id); setShowMembers({...showMembers, members: [...(showMembers.members||[]), u]}); }}
                  className="btn-ghost text-xs py-1 px-2"><UserPlus size={12} /> Add</button>
              </div>
            ))}
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Projects;
