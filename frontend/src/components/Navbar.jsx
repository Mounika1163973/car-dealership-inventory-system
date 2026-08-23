import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <header className="sticky top-0 z-20 border-b border-asphalt-700 bg-asphalt-900/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link to="/" className="group flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded border border-headlight-500/60 bg-asphalt-800 font-display text-lg text-headlight-500">
            IM
          </span>
          <span className="font-display text-xl uppercase tracking-widest2 text-mist-100">
            Ironclad <span className="text-headlight-500">Motors</span>
          </span>
        </Link>

        <nav className="flex items-center gap-6 text-sm">
          {isAuthenticated ? (
            <>
              <Link to="/" className="text-mist-300 transition hover:text-headlight-500">
                Inventory
              </Link>
              {isAdmin && (
                <span className="rounded-full border border-taillight-500/50 bg-taillight-500/10 px-3 py-1 font-mono text-xs uppercase tracking-wide text-taillight-400">
                  Admin
                </span>
              )}
              <span className="hidden text-mist-500 sm:inline">
                Signed in as <span className="text-mist-100">{user?.name}</span>
              </span>
              <button
                onClick={handleLogout}
                className="rounded border border-asphalt-600 px-3 py-1.5 text-mist-300 transition hover:border-headlight-500 hover:text-headlight-500"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-mist-300 transition hover:text-headlight-500">
                Log in
              </Link>
              <Link
                to="/register"
                className="rounded bg-headlight-500 px-4 py-1.5 font-medium text-asphalt-950 transition hover:bg-headlight-400"
              >
                Register
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
