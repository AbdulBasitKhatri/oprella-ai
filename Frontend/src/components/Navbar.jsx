import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { FRONTEND_ROUTES, isRecruiterRole } from '../config/appConfig';
import { 
  LayoutDashboard, 
  BookmarkCheck, 
  Shield, 
  User, 
  LogIn, 
  UserPlus, 
  Sparkles,
  Sun,
  Moon,
  LogOut
} from 'lucide-react';
import { Bell, Check } from 'lucide-react';
import { API_ROUTES } from '../config/appConfig';

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { user, isAuthenticated, logout } = useAuth();
  const [notifications, setNotifications] = React.useState([]);
  const [showNotifications, setShowNotifications] = React.useState(false);

  React.useEffect(() => {
    if (!isAuthenticated) return;
    fetch(API_ROUTES.notifications.list, { headers: { Authorization: `Bearer ${localStorage.getItem('token') || sessionStorage.getItem('token')}` } })
      .then((response) => response.ok ? response.json() : [])
      .then((data) => setNotifications(Array.isArray(data) ? data : []))
      .catch(() => setNotifications([]));
  }, [isAuthenticated]);

  const markRead = async (notification) => {
    if (notification.read) return;
    await fetch(API_ROUTES.notifications.read(notification._id), { method: 'PATCH', headers: { Authorization: `Bearer ${localStorage.getItem('token') || sessionStorage.getItem('token')}` } });
    setNotifications((current) => current.map((item) => item._id === notification._id ? { ...item, read: true } : item));
  };

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate(FRONTEND_ROUTES.login);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 w-full bg-white/80 dark:bg-zinc-950/80 border-b border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 z-50 rounded-none shadow-[0_4px_30px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_30px_rgba(255,255,255,0.03)] backdrop-blur-xl transition-colors duration-200">
      
      {/* Subtle Mono Ambient Glow Line */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[1px] bg-gradient-to-r from-transparent via-zinc-400 to-transparent opacity-60 blur-[0.5px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        
        {/* Brand Logo */}
        <Link to={FRONTEND_ROUTES.home} className="flex items-center gap-3 group">
          <div className="w-8 h-8 bg-zinc-950 text-zinc-100 dark:bg-zinc-100 dark:text-zinc-950 flex items-center justify-center font-black text-sm rounded-none shadow-md transition-all duration-200">
            <Sparkles size={16} />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-black tracking-widest text-zinc-900 dark:text-zinc-100 uppercase leading-none">
              Oprella<span className="text-zinc-500 font-light">.AI</span>
            </span>
            <span className="text-[9px] font-mono tracking-widest text-zinc-500 uppercase mt-0.5">
              Opportunity Engine
            </span>
          </div>
        </Link>

        {/* Navigation Tabs (Only visible when authenticated) */}
        {isAuthenticated && (
          <div className="hidden md:flex items-center gap-2">
            {(isRecruiterRole(user?.role)
              ? [
                  { path: FRONTEND_ROUTES.rDashboard, label: 'Dashboard', icon: LayoutDashboard },
                  { path: FRONTEND_ROUTES.postOpportunity, label: 'Post Opportunity', icon: BookmarkCheck },
                  { path: FRONTEND_ROUTES.organizationProfile, label: 'Management', icon: Shield },
                ]
              : [
                  { path: FRONTEND_ROUTES.dashboard, label: 'Feed', icon: LayoutDashboard },
                  { path: FRONTEND_ROUTES.studentProfile, label: 'Profile', icon: User },
                  { path: FRONTEND_ROUTES.tracker, label: 'Tracker', icon: BookmarkCheck },
                  { path: FRONTEND_ROUTES.admin, label: 'Admin Panel', icon: Shield },
                ]
            ).map(({ path, label, icon: Icon }) => {
              const active = isActive(path);
              return (
                <Link
                  key={path}
                  to={path}
                  className={`relative px-4 py-2 text-xs font-bold uppercase tracking-widest flex items-center gap-2 transition-all duration-200 rounded-none border ${
                    active
                      ? 'bg-zinc-100 border-zinc-300 text-zinc-900 dark:bg-zinc-900 dark:border-zinc-600 dark:text-zinc-100'
                      : 'border-transparent text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:border-zinc-300 dark:hover:border-zinc-800'
                  }`}
                >
                  {active && (
                    <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-zinc-900 dark:bg-zinc-100" />
                  )}
                  <Icon size={14} className={active ? 'text-zinc-900 dark:text-zinc-100' : 'text-zinc-400 dark:text-zinc-500'} />
                  {label}
                </Link>
              );
            })}
          </div>
        )}

        {/* Right Section */}
        <div className="flex items-center gap-3">
          
          {/* Global Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle Theme"
            className="h-9 px-3 bg-zinc-100 dark:bg-zinc-900/60 border border-zinc-300 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600 text-zinc-700 dark:text-zinc-300 flex items-center gap-2 text-xs font-mono uppercase tracking-wider rounded-none transition-all duration-200"
          >
            {theme === 'dark' ? (
              <>
                <Sun size={14} className="text-amber-400" />
                <span className="hidden lg:inline text-[10px]">Light</span>
              </>
            ) : (
              <>
                <Moon size={14} className="text-zinc-700" />
                <span className="hidden lg:inline text-[10px]">Dark</span>
              </>
            )}
          </button>

          {/* Conditional Auth Actions */}
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <div className="relative"><button type="button" onClick={() => setShowNotifications((value) => !value)} aria-label="Open notifications" className="relative flex h-9 w-9 items-center justify-center border border-zinc-300 bg-zinc-100 text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300"><Bell size={16} />{notifications.filter((item) => !item.read).length > 0 && <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center bg-amber-500 px-1 text-[9px] font-bold text-zinc-950">{notifications.filter((item) => !item.read).length}</span>}</button>{showNotifications && <div className="absolute right-0 top-11 w-80 border border-zinc-300 bg-white p-3 shadow-xl dark:border-zinc-700 dark:bg-zinc-900"><div className="mb-2 flex items-center justify-between"><span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">Notifications</span><Check size={13} className="text-zinc-400" /></div>{notifications.length === 0 ? <p className="p-3 text-xs text-zinc-500">You are all caught up.</p> : notifications.map((notification) => <button type="button" key={notification._id} onClick={() => markRead(notification)} className={`mb-1 block w-full border-l-2 p-2 text-left ${notification.read ? 'border-zinc-300 opacity-60' : 'border-amber-500'}`}><p className="text-xs font-bold">{notification.title}</p><p className="mt-1 text-[11px] text-zinc-500">{notification.body}</p><p className="mt-1 text-[9px] font-mono text-zinc-400">{new Date(notification.createdAt).toLocaleString()}</p></button>)}</div>}</div>
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 text-xs font-mono text-zinc-700 dark:text-zinc-300">
                <User size={14} className="text-zinc-500" />
                <span>{user?.fullName || user?.full_name || user?.email || 'User'}</span>
              </div>

              <button
                onClick={handleLogout}
                className="h-9 px-4 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 text-xs font-semibold uppercase tracking-wider flex items-center gap-2 hover:bg-zinc-800 dark:hover:bg-white transition-all duration-200 rounded-none shadow-sm"
              >
                <LogOut size={14} /> Logout
              </button>
            </div>
          ) : (
            <>
              <Link
                to={FRONTEND_ROUTES.login}
                className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider flex items-center gap-2 transition-all duration-200 rounded-none border ${
                  isActive(FRONTEND_ROUTES.login)
                    ? 'bg-zinc-900 text-white dark:bg-zinc-200 dark:text-zinc-950 font-bold'
                    : 'border-zinc-300 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 bg-zinc-100/60 dark:bg-zinc-900/60 hover:border-zinc-400 dark:hover:border-zinc-600'
                }`}
              >
                <LogIn size={14} /> Log In
              </Link>

              <Link
                to={FRONTEND_ROUTES.signup}
                className={`px-4 py-2 text-xs font-extrabold uppercase tracking-wider flex items-center gap-2 transition-all duration-200 rounded-none shadow-sm ${
                  isActive(FRONTEND_ROUTES.signup)
                    ? 'bg-zinc-950 text-white dark:bg-white dark:text-zinc-950'
                    : 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-white'
                }`}
              >
                <UserPlus size={14} /> Sign Up
              </Link>
            </>
          )}

        </div>

      </div>
    </nav>
  );
}