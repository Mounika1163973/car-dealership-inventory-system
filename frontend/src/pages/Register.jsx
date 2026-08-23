import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const inputClasses =
  'w-full rounded border border-asphalt-600 bg-asphalt-900 px-3 py-2.5 text-sm text-mist-100 placeholder:text-mist-500 focus:border-headlight-500';

export default function Register() {
  const { register, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'customer' });
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    try {
      await register(form);
      navigate('/');
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-md flex-col justify-center px-6">
      <p className="mb-2 text-center text-xs uppercase tracking-widest2 text-headlight-500">Join the dealership</p>
      <h1 className="mb-8 text-center font-display text-3xl uppercase tracking-wide text-mist-100">Create an account</h1>

      <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-asphalt-700 bg-asphalt-800 p-6">
        <div>
          <label className="mb-1 block text-xs uppercase tracking-widest2 text-mist-500">Full name</label>
          <input required className={inputClasses} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Jane Doe" />
        </div>
        <div>
          <label className="mb-1 block text-xs uppercase tracking-widest2 text-mist-500">Email</label>
          <input type="email" required className={inputClasses} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" />
        </div>
        <div>
          <label className="mb-1 block text-xs uppercase tracking-widest2 text-mist-500">Password</label>
          <input type="password" required minLength={6} className={inputClasses} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="At least 6 characters" />
        </div>
        <div>
          <label className="mb-1 block text-xs uppercase tracking-widest2 text-mist-500">Account type</label>
          <select
            className={inputClasses}
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
          >
            <option value="customer">Customer</option>
            <option value="admin">Admin (dealership staff)</option>
          </select>
        </div>

        {error && <p className="text-sm text-taillight-400">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded bg-headlight-500 px-4 py-2.5 font-semibold text-asphalt-950 transition hover:bg-headlight-400 disabled:opacity-60"
        >
          {loading ? 'Creating account…' : 'Create account'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-mist-500">
        Already registered?{' '}
        <Link to="/login" className="text-headlight-500 hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
