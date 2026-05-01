import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { loginUser } from '../services/api';
import toast from 'react-hot-toast';
import { Hexagon, Mail, Lock, ArrowRight, Sparkles } from 'lucide-react';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await loginUser(formData);
      login(data);
      toast.success(`Welcome back, ${data.name}!`);
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel — Branding */}
      <div className="hidden lg:flex flex-1 items-center justify-center relative overflow-hidden bg-gradient-to-br from-surface-950 via-primary-900/20 to-surface-950">
        {/* Decorative circles */}
        <div className="absolute top-20 left-20 w-72 h-72 bg-primary-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary-600/5 rounded-full blur-2xl" />

        <div className="relative z-10 text-center px-12">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center mx-auto mb-8 animate-pulse-glow">
            <Hexagon size={40} className="text-white" />
          </div>
          <h1 className="text-5xl font-bold gradient-text mb-4">Ethira</h1>
          <p className="text-surface-200 text-lg max-w-md mx-auto leading-relaxed">
            Elevate your project management with role-based access, real-time
            tracking, and seamless team collaboration.
          </p>
          <div className="mt-10 flex items-center justify-center gap-6 text-sm text-surface-700">
            <div className="flex items-center gap-2">
              <Sparkles size={14} className="text-primary-400" />
              <span>Task Tracking</span>
            </div>
            <div className="w-1 h-1 rounded-full bg-surface-700" />
            <div className="flex items-center gap-2">
              <Sparkles size={14} className="text-accent-400" />
              <span>Team Management</span>
            </div>
            <div className="w-1 h-1 rounded-full bg-surface-700" />
            <div className="flex items-center gap-2">
              <Sparkles size={14} className="text-primary-400" />
              <span>Role Access</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel — Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-surface-950">
        <div className="w-full max-w-md animate-fade-in">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-3 mb-10">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
              <Hexagon size={22} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold gradient-text">Ethira</h1>
          </div>

          <h2 className="text-3xl font-bold text-surface-100 mb-2">
            Welcome back
          </h2>
          <p className="text-surface-700 mb-8">
            Sign in to continue managing your projects
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-surface-200 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail
                  size={18}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-700"
                />
                <input
                  id="login-email"
                  type="email"
                  required
                  className="input-dark pl-11"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-surface-200 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock
                  size={18}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-700"
                />
                <input
                  id="login-password"
                  type="password"
                  required
                  className="input-dark pl-11"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                />
              </div>
            </div>

            <button
              id="login-submit"
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3.5 text-base"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  Sign In
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-surface-700">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="text-primary-400 hover:text-primary-300 font-medium transition-colors"
            >
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
