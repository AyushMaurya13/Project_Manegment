import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getDashboardStats } from '../services/api';
import { Link } from 'react-router-dom';
import {
  FolderKanban, ListTodo, Clock, CheckCircle2, AlertTriangle,
  TrendingUp, ArrowRight, Loader2, BarChart3, Zap,
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchStats(); }, []);

  const fetchStats = async () => {
    try {
      const { data } = await getDashboardStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 size={32} className="animate-spin text-primary-500" />
      </div>
    );
  }

  const statCards = [
    { label: 'Total Projects', value: stats?.totalProjects || 0, icon: FolderKanban, bg: 'bg-primary-500/10', tc: 'text-primary-400' },
    { label: 'Total Tasks', value: stats?.totalTasks || 0, icon: ListTodo, bg: 'bg-accent-500/10', tc: 'text-accent-400' },
    { label: 'In Progress', value: stats?.inProgressTasks || 0, icon: Clock, bg: 'bg-amber-500/10', tc: 'text-amber-400' },
    { label: 'Completed', value: stats?.doneTasks || 0, icon: CheckCircle2, bg: 'bg-emerald-500/10', tc: 'text-emerald-400' },
    { label: 'Overdue', value: stats?.overdueTasks || 0, icon: AlertTriangle, bg: 'bg-red-500/10', tc: 'text-red-400' },
    { label: 'To Do', value: stats?.todoTasks || 0, icon: TrendingUp, bg: 'bg-violet-500/10', tc: 'text-violet-400' },
  ];

  const completionRate = stats?.totalTasks > 0 ? Math.round((stats.doneTasks / stats.totalTasks) * 100) : 0;

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-surface-700 mb-1">
          <Zap size={14} className="text-primary-400" />
          <span>Dashboard</span>
        </div>
        <h1 className="text-3xl font-bold text-surface-100">
          Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 18 ? 'Afternoon' : 'Evening'},{' '}
          <span className="gradient-text">{user?.name?.split(' ')[0]}</span>
        </h1>
        <p className="text-surface-700 mt-1">Here's what's happening with your projects today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {statCards.map((card, i) => (
          <div key={card.label} className="glass-card p-5 flex items-center gap-4" style={{ animationDelay: `${i * 0.05}s` }}>
            <div className={`w-12 h-12 rounded-xl ${card.bg} flex items-center justify-center`}>
              <card.icon size={22} className={card.tc} />
            </div>
            <div>
              <p className="text-2xl font-bold text-surface-100">{card.value}</p>
              <p className="text-sm text-surface-700">{card.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Completion Rate */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-2 mb-5">
            <BarChart3 size={18} className="text-primary-400" />
            <h3 className="text-sm font-semibold text-surface-200 uppercase tracking-wider">Completion Rate</h3>
          </div>
          <div className="flex items-center justify-center mb-5">
            <div className="relative w-32 h-32">
              <svg className="w-32 h-32 -rotate-90" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(99,102,241,0.1)" strokeWidth="10" />
                <circle cx="60" cy="60" r="50" fill="none" stroke="url(#pg)" strokeWidth="10" strokeLinecap="round"
                  strokeDasharray={`${completionRate * 3.14} ${(100 - completionRate) * 3.14}`} className="transition-all duration-1000 ease-out" />
                <defs><linearGradient id="pg" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#6366f1" /><stop offset="100%" stopColor="#0ea5e9" />
                </linearGradient></defs>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-3xl font-bold gradient-text">{completionRate}%</span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            {[['Todo', stats?.todoTasks], ['Active', stats?.inProgressTasks], ['Done', stats?.doneTasks]].map(([l, v]) => (
              <div key={l} className="p-2 rounded-lg bg-surface-800/50">
                <p className="text-lg font-semibold text-surface-100">{v || 0}</p>
                <p className="text-xs text-surface-700">{l}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Priority Breakdown */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-2 mb-5">
            <AlertTriangle size={18} className="text-amber-400" />
            <h3 className="text-sm font-semibold text-surface-200 uppercase tracking-wider">Priority Breakdown</h3>
          </div>
          <div className="space-y-4">
            {[
              { label: 'High', value: stats?.priorityBreakdown?.high || 0, color: 'bg-red-500', bg: 'bg-red-500/10' },
              { label: 'Medium', value: stats?.priorityBreakdown?.medium || 0, color: 'bg-amber-500', bg: 'bg-amber-500/10' },
              { label: 'Low', value: stats?.priorityBreakdown?.low || 0, color: 'bg-emerald-500', bg: 'bg-emerald-500/10' },
            ].map((item) => {
              const total = (stats?.priorityBreakdown?.high||0)+(stats?.priorityBreakdown?.medium||0)+(stats?.priorityBreakdown?.low||0);
              const pct = total > 0 ? Math.round((item.value / total) * 100) : 0;
              return (
                <div key={item.label}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-surface-200">{item.label}</span>
                    <span className="text-sm font-medium text-surface-100">{item.value}</span>
                  </div>
                  <div className={`w-full h-2 rounded-full ${item.bg}`}>
                    <div className={`h-2 rounded-full ${item.color} transition-all duration-1000`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Tasks */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <ListTodo size={18} className="text-accent-400" />
              <h3 className="text-sm font-semibold text-surface-200 uppercase tracking-wider">Recent Tasks</h3>
            </div>
            <Link to="/tasks" className="text-xs text-primary-400 hover:text-primary-300 flex items-center gap-1">
              View All <ArrowRight size={12} />
            </Link>
          </div>
          <div className="space-y-3">
            {stats?.recentTasks?.length > 0 ? stats.recentTasks.map((task) => (
              <div key={task._id} className="flex items-center gap-3 p-3 rounded-xl bg-surface-800/30 hover:bg-surface-800/50 transition-colors">
                <div className="w-2 h-2 rounded-full shrink-0" style={{
                  backgroundColor: task.status === 'done' ? '#22c55e' : task.status === 'in-progress' ? '#3b82f6' : '#94a3b8'
                }} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-surface-100 truncate">{task.title}</p>
                  <p className="text-xs text-surface-700 truncate">{task.project?.title}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  task.priority === 'high' ? 'badge-high' : task.priority === 'medium' ? 'badge-medium' : 'badge-low'
                }`}>{task.priority}</span>
              </div>
            )) : (
              <div className="text-center py-6">
                <ListTodo size={32} className="mx-auto mb-2 text-surface-700" />
                <p className="text-sm text-surface-700">No tasks yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
