import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getTasks, createTask, updateTask, deleteTask, getProjects, getUsers } from '../services/api';
import Modal from '../components/Modal';
import toast from 'react-hot-toast';
import { Plus, ListTodo, Loader2, Calendar, Trash2, Edit3, Filter, ChevronDown } from 'lucide-react';

const Tasks = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(null);
  const [filters, setFilters] = useState({ status: '', priority: '', project: '' });
  const [showFilters, setShowFilters] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', project: '', assignedTo: '', priority: 'medium', status: 'todo', dueDate: '' });

  useEffect(() => { fetchTasks(); fetchProjects(); if(user?.role==='admin') fetchUsers(); }, []);

  const fetchTasks = async () => {
    try { const { data } = await getTasks(filters); setTasks(data); }
    catch { toast.error('Failed to load tasks'); }
    finally { setLoading(false); }
  };

  const fetchProjects = async () => { try { const { data } = await getProjects(); setProjects(data); } catch {} };
  const fetchUsers = async () => { try { const { data } = await getUsers(); setUsers(data); } catch {} };

  useEffect(() => { fetchTasks(); }, [filters]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form };
      if (!payload.assignedTo) delete payload.assignedTo;
      if (!payload.dueDate) delete payload.dueDate;
      await createTask(payload);
      toast.success('Task created!');
      setShowCreate(false);
      setForm({ title: '', description: '', project: '', assignedTo: '', priority: 'medium', status: 'todo', dueDate: '' });
      fetchTasks();
    } catch (err) { toast.error(err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || 'Failed'); }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form };
      if (!payload.assignedTo) delete payload.assignedTo;
      if (!payload.dueDate) delete payload.dueDate;
      await updateTask(showEdit._id, payload);
      toast.success('Task updated!');
      setShowEdit(null);
      fetchTasks();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await updateTask(taskId, { status: newStatus });
      fetchTasks();
    } catch (err) { toast.error(err.response?.data?.message || 'Cannot update'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this task?')) return;
    try { await deleteTask(id); toast.success('Task deleted'); fetchTasks(); }
    catch { toast.error('Failed to delete'); }
  };

  const openEdit = (t) => {
    setForm({
      title: t.title, description: t.description || '', project: t.project?._id || '',
      assignedTo: t.assignedTo?._id || '', priority: t.priority, status: t.status,
      dueDate: t.dueDate?.split('T')[0] || ''
    });
    setShowEdit(t);
  };

  const isOverdue = (task) => task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'done';

  if (loading) return <div className="flex items-center justify-center h-[60vh]"><Loader2 size={32} className="animate-spin text-primary-500" /></div>;

  const grouped = { todo: tasks.filter(t => t.status === 'todo'), 'in-progress': tasks.filter(t => t.status === 'in-progress'), done: tasks.filter(t => t.status === 'done') };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-surface-100">Tasks</h1>
          <p className="text-surface-700 mt-1">{tasks.length} task{tasks.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setShowFilters(!showFilters)} className="btn-ghost">
            <Filter size={16} /> Filters <ChevronDown size={14} className={`transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>
          {user?.role === 'admin' && (
            <button onClick={() => { setForm({ title:'', description:'', project:'', assignedTo:'', priority:'medium', status:'todo', dueDate:'' }); setShowCreate(true); }} className="btn-primary">
              <Plus size={18} /> New Task
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="glass-card p-4 mb-6 flex flex-wrap gap-4 animate-fade-in">
          <select className="input-dark w-auto min-w-[140px]" value={filters.status} onChange={e => setFilters({...filters, status: e.target.value})}>
            <option value="">All Status</option><option value="todo">Todo</option><option value="in-progress">In Progress</option><option value="done">Done</option>
          </select>
          <select className="input-dark w-auto min-w-[140px]" value={filters.priority} onChange={e => setFilters({...filters, priority: e.target.value})}>
            <option value="">All Priority</option><option value="high">High</option><option value="medium">Medium</option><option value="low">Low</option>
          </select>
          <select className="input-dark w-auto min-w-[160px]" value={filters.project} onChange={e => setFilters({...filters, project: e.target.value})}>
            <option value="">All Projects</option>
            {projects.map(p => <option key={p._id} value={p._id}>{p.title}</option>)}
          </select>
          <button onClick={() => setFilters({ status:'', priority:'', project:'' })} className="btn-ghost text-xs">Clear</button>
        </div>
      )}

      {/* Kanban Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {[
          { key: 'todo', label: 'To Do', color: '#94a3b8', dotClass: 'bg-slate-400' },
          { key: 'in-progress', label: 'In Progress', color: '#3b82f6', dotClass: 'bg-blue-500' },
          { key: 'done', label: 'Done', color: '#22c55e', dotClass: 'bg-emerald-500' },
        ].map(col => (
          <div key={col.key}>
            <div className="flex items-center gap-2 mb-4">
              <div className={`w-2.5 h-2.5 rounded-full ${col.dotClass}`} />
              <h3 className="text-sm font-semibold text-surface-200 uppercase tracking-wider">{col.label}</h3>
              <span className="text-xs text-surface-700 ml-auto">{grouped[col.key]?.length || 0}</span>
            </div>
            <div className="space-y-3 min-h-[200px]">
              {grouped[col.key]?.map(task => (
                <div key={task._id} className={`glass-card p-4 ${isOverdue(task) ? 'border-red-500/30' : ''}`}>
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="text-sm font-medium text-surface-100 flex-1">{task.title}</h4>
                    {user?.role === 'admin' && (
                      <div className="flex items-center gap-1 ml-2">
                        <button onClick={() => openEdit(task)} className="w-6 h-6 rounded flex items-center justify-center text-surface-700 hover:text-primary-400 transition-colors">
                          <Edit3 size={13} />
                        </button>
                        <button onClick={() => handleDelete(task._id)} className="w-6 h-6 rounded flex items-center justify-center text-surface-700 hover:text-red-400 transition-colors">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    )}
                  </div>
                  {task.description && <p className="text-xs text-surface-700 mb-3 line-clamp-2">{task.description}</p>}
                  <div className="flex items-center gap-2 flex-wrap mb-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      task.priority === 'high' ? 'badge-high' : task.priority === 'medium' ? 'badge-medium' : 'badge-low'
                    }`}>{task.priority}</span>
                    {task.project && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-surface-800 text-surface-200">{task.project.title}</span>
                    )}
                    {isOverdue(task) && <span className="text-xs px-2 py-0.5 rounded-full badge-high">Overdue</span>}
                  </div>
                  <div className="flex items-center justify-between">
                    {task.assignedTo && (
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary-600 to-accent-500 flex items-center justify-center text-white text-[10px] font-semibold">
                          {task.assignedTo.name?.charAt(0).toUpperCase()}</div>
                        <span className="text-xs text-surface-700">{task.assignedTo.name}</span>
                      </div>
                    )}
                    {task.dueDate && (
                      <div className={`flex items-center gap-1 text-xs ${isOverdue(task) ? 'text-red-400' : 'text-surface-700'}`}>
                        <Calendar size={11} /> {new Date(task.dueDate).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                  {/* Quick status change */}
                  <div className="mt-3 pt-3 border-t border-primary-500/5">
                    <select className="input-dark text-xs py-1.5 px-2" value={task.status}
                      onChange={e => handleStatusChange(task._id, e.target.value)}>
                      <option value="todo">Todo</option><option value="in-progress">In Progress</option><option value="done">Done</option>
                    </select>
                  </div>
                </div>
              ))}
              {grouped[col.key]?.length === 0 && (
                <div className="text-center py-8 rounded-xl border border-dashed border-surface-800">
                  <p className="text-xs text-surface-700">No tasks</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Create Modal */}
      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Create Task">
        <form onSubmit={handleCreate} className="space-y-4">
          <div><label className="block text-sm font-medium text-surface-200 mb-1.5">Title</label>
            <input className="input-dark" required value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="Task title" /></div>
          <div><label className="block text-sm font-medium text-surface-200 mb-1.5">Description</label>
            <textarea className="input-dark min-h-[60px] resize-none" value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Optional description" /></div>
          <div><label className="block text-sm font-medium text-surface-200 mb-1.5">Project</label>
            <select className="input-dark" required value={form.project} onChange={e => setForm({...form, project: e.target.value})}>
              <option value="">Select project</option>
              {projects.map(p => <option key={p._id} value={p._id}>{p.title}</option>)}
            </select></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-surface-200 mb-1.5">Assign To</label>
              <select className="input-dark" value={form.assignedTo} onChange={e => setForm({...form, assignedTo: e.target.value})}>
                <option value="">Unassigned</option>
                {users.map(u => <option key={u._id} value={u._id}>{u.name}</option>)}
              </select></div>
            <div><label className="block text-sm font-medium text-surface-200 mb-1.5">Priority</label>
              <select className="input-dark" value={form.priority} onChange={e => setForm({...form, priority: e.target.value})}>
                <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option>
              </select></div>
          </div>
          <div><label className="block text-sm font-medium text-surface-200 mb-1.5">Due Date</label>
            <input type="date" className="input-dark" value={form.dueDate} onChange={e => setForm({...form, dueDate: e.target.value})} /></div>
          <button type="submit" className="btn-primary w-full">Create Task</button>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={!!showEdit} onClose={() => setShowEdit(null)} title="Edit Task">
        <form onSubmit={handleUpdate} className="space-y-4">
          <div><label className="block text-sm font-medium text-surface-200 mb-1.5">Title</label>
            <input className="input-dark" required value={form.title} onChange={e => setForm({...form, title: e.target.value})} /></div>
          <div><label className="block text-sm font-medium text-surface-200 mb-1.5">Description</label>
            <textarea className="input-dark min-h-[60px] resize-none" value={form.description} onChange={e => setForm({...form, description: e.target.value})} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-surface-200 mb-1.5">Status</label>
              <select className="input-dark" value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
                <option value="todo">Todo</option><option value="in-progress">In Progress</option><option value="done">Done</option>
              </select></div>
            <div><label className="block text-sm font-medium text-surface-200 mb-1.5">Priority</label>
              <select className="input-dark" value={form.priority} onChange={e => setForm({...form, priority: e.target.value})}>
                <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option>
              </select></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-surface-200 mb-1.5">Assign To</label>
              <select className="input-dark" value={form.assignedTo} onChange={e => setForm({...form, assignedTo: e.target.value})}>
                <option value="">Unassigned</option>
                {users.map(u => <option key={u._id} value={u._id}>{u.name}</option>)}
              </select></div>
            <div><label className="block text-sm font-medium text-surface-200 mb-1.5">Due Date</label>
              <input type="date" className="input-dark" value={form.dueDate} onChange={e => setForm({...form, dueDate: e.target.value})} /></div>
          </div>
          <button type="submit" className="btn-primary w-full">Save Changes</button>
        </form>
      </Modal>
    </div>
  );
};

export default Tasks;
