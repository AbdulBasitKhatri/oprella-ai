import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { FRONTEND_ROUTES, isRecruiterRole } from '../config/appConfig';
import { 
  LayoutDashboard, 
  BookmarkCheck, 
  User, 
  LogIn, 
  UserPlus, 
  Sparkles,
  Sun,
  Moon,
  LogOut,
  Menu,
  X
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
  const [mobileOpen, setMobileOpen] = React.useState(false);

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
    setMobileOpen(false);
    navigate(FRONTEND_ROUTES.login);
  };

  const navigationItems = isRecruiterRole(user?.role)
    ? [
        { path: FRONTEND_ROUTES.rDashboard, label: 'Dashboard', icon: LayoutDashboard },
        { path: FRONTEND_ROUTES.postOpportunity, label: 'Post Opportunity', icon: BookmarkCheck },
        { path: FRONTEND_ROUTES.organizationProfile, label: 'Profile', icon: User },
      ]
    : [
        { path: FRONTEND_ROUTES.dashboard, label: 'For You', icon: LayoutDashboard },
        { path: FRONTEND_ROUTES.feed, label: 'Feed', icon: LayoutDashboard },
        { path: FRONTEND_ROUTES.tracker, label: 'Tracker', icon: BookmarkCheck },
        { path: FRONTEND_ROUTES.savedOpportunities, label: 'Saved', icon: BookmarkCheck },
        { path: FRONTEND_ROUTES.studentProfile, label: 'Profile', icon: User },
      ];

  return (
    <nav className="fixed top-0 left-0 right-0 w-full bg-white/80 dark:bg-zinc-950/80 border-b border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 z-50 rounded-none shadow-[0_4px_30px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_30px_rgba(255,255,255,0.03)] backdrop-blur-xl transition-colors duration-200">
      
      {/* Subtle Mono Ambient Glow Line */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[1px] bg-gradient-to-r from-transparent via-zinc-400 to-transparent opacity-60 blur-[0.5px] pointer-events-none" />

      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">
        
        {/* Brand Logo */}
        <Link to={FRONTEND_ROUTES.home} className="group flex min-w-0 shrink items-center gap-2 sm:gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-none bg-zinc-950 text-sm font-black text-zinc-100 shadow-md transition-all duration-200 dark:bg-zinc-100 dark:text-zinc-950">
            <Sparkles size={16} />
          </div>
          <div className="flex min-w-0 flex-col">
            <span className="truncate text-base font-black uppercase leading-none tracking-widest text-zinc-900 dark:text-zinc-100 sm:text-lg">
              Oprella<span className="text-zinc-500 font-light">.AI</span>
            </span>
            <span className="mt-0.5 hidden text-[9px] font-mono uppercase tracking-widest text-zinc-500 sm:block">
              Opportunity Engine
            </span>
          </div>
        </Link>

        {/* Navigation Tabs (Only visible when authenticated) */}
        {isAuthenticated && (
          <div className="hidden md:flex items-center gap-2">
            {navigationItems.map(({ path, label, icon: Icon }) => {
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
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <button type="button" onClick={() => setMobileOpen((value) => !value)} aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'} className="flex h-9 w-9 items-center justify-center border border-zinc-300 bg-zinc-100 text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 md:hidden">{mobileOpen ? <X size={17} /> : <Menu size={17} />}</button>
          
          {/* Global Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle Theme"
            className="hidden h-9 items-center gap-2 rounded-none border border-zinc-300 bg-zinc-100 px-3 text-xs font-mono uppercase tracking-wider text-zinc-700 transition-all duration-200 hover:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-300 dark:hover:border-zinc-600 md:flex"
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
            <div className="hidden items-center gap-3 md:flex">
              <div className="relative"><button type="button" onClick={() => setShowNotifications((value) => !value)} aria-label="Open notifications" className="relative flex h-9 w-9 items-center justify-center border border-zinc-300 bg-zinc-100 text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300"><Bell size={16} />{notifications.filter((item) => !item.read).length > 0 && <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center bg-amber-500 px-1 text-[9px] font-bold text-zinc-950">{notifications.filter((item) => !item.read).length}</span>}</button>{showNotifications && <div className="absolute right-0 top-11 w-80 border border-zinc-300 bg-white p-3 shadow-xl dark:border-zinc-700 dark:bg-zinc-900"><div className="mb-2 flex items-center justify-between"><span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">Notifications</span><Check size={13} className="text-zinc-400" /></div>{notifications.length === 0 ? <p className="p-3 text-xs text-zinc-500">You are all caught up.</p> : notifications.map((notification) => <Link to={notification.opportunityUrl || FRONTEND_ROUTES.dashboard} key={notification._id} onClick={() => markRead(notification)} className={`mb-1 block w-full border-l-2 p-2 text-left ${notification.read ? 'border-zinc-300 opacity-60' : 'border-amber-500'}`}><p className="text-xs font-bold">{notification.title}</p><p className="mt-1 text-[11px] text-zinc-500">{notification.body}</p><p className="mt-1 text-[9px] font-mono text-zinc-400">{new Date(notification.createdAt).toLocaleString()}</p></Link>)}</div>}</div>
              <Link to={isRecruiterRole(user?.role) ? FRONTEND_ROUTES.organizationProfile : FRONTEND_ROUTES.studentProfile} className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 text-xs font-mono text-zinc-700 dark:text-zinc-300 hover:border-zinc-500">
                <User size={14} className="text-zinc-500" />
                <span>{user?.fullName || user?.full_name || user?.email || 'User'}</span>
              </Link>

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
                className={`hidden px-4 py-2 text-xs font-semibold uppercase tracking-wider sm:flex items-center gap-2 transition-all duration-200 rounded-none border ${
                  isActive(FRONTEND_ROUTES.login)
                    ? 'bg-zinc-900 text-white dark:bg-zinc-200 dark:text-zinc-950 font-bold'
                    : 'border-zinc-300 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 bg-zinc-100/60 dark:bg-zinc-900/60 hover:border-zinc-400 dark:hover:border-zinc-600'
                }`}
              >
                <LogIn size={14} /> Log In
              </Link>

              <Link
                to={FRONTEND_ROUTES.signup}
                className={`hidden px-4 py-2 text-xs font-extrabold uppercase tracking-wider sm:flex items-center gap-2 transition-all duration-200 rounded-none shadow-sm ${
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
      {mobileOpen && <div className="border-t border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950 md:hidden"><div className="space-y-1">
        {isAuthenticated ? navigationItems.map(({ path, label, icon: Icon }) => <Link key={path} to={path} onClick={() => setMobileOpen(false)} className={`flex items-center gap-3 border px-3 py-3 text-xs font-bold uppercase tracking-widest ${isActive(path) ? 'border-zinc-400 bg-zinc-100 dark:border-zinc-600 dark:bg-zinc-900' : 'border-transparent text-zinc-500'}`}><Icon size={15} /> {label}</Link>) : <>
          <Link to={FRONTEND_ROUTES.login} onClick={() => setMobileOpen(false)} className="flex items-center gap-3 border border-transparent px-3 py-3 text-xs font-bold uppercase tracking-widest text-zinc-500"><LogIn size={15} /> Log In</Link>
          <Link to={FRONTEND_ROUTES.signup} onClick={() => setMobileOpen(false)} className="flex items-center gap-3 border border-transparent px-3 py-3 text-xs font-bold uppercase tracking-widest text-zinc-500"><UserPlus size={15} /> Sign Up</Link>
        </>}
        {isAuthenticated && <div className="mt-3 border-t border-zinc-200 pt-3 dark:border-zinc-800"><div className="grid grid-cols-3 gap-2"><button type="button" onClick={() => setShowNotifications((value) => !value)} className="relative flex items-center justify-center gap-2 border border-zinc-300 px-2 py-3 text-xs font-bold uppercase tracking-widest dark:border-zinc-800" aria-label="Open notifications"><Bell size={15} /> Alerts{notifications.filter((item) => !item.read).length > 0 && <span className="absolute right-1 top-1 text-[9px] font-bold text-amber-600">{notifications.filter((item) => !item.read).length}</span>}</button><button type="button" onClick={toggleTheme} className="flex items-center justify-center gap-2 border border-zinc-300 px-2 py-3 text-xs font-bold uppercase tracking-widest dark:border-zinc-800">{theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />} Theme</button><button type="button" onClick={handleLogout} className="flex items-center justify-center gap-2 bg-zinc-900 px-2 py-3 text-xs font-bold uppercase tracking-widest text-white dark:bg-zinc-100 dark:text-zinc-950"><LogOut size={15} /> Exit</button></div>{showNotifications && <div className="mt-2 border border-zinc-300 p-2 dark:border-zinc-700">{notifications.length === 0 ? <p className="p-2 text-xs text-zinc-500">You are all caught up.</p> : notifications.map((notification) => <Link to={notification.opportunityUrl || FRONTEND_ROUTES.dashboard} key={notification._id} onClick={() => markRead(notification)} className={`mb-1 block w-full border-l-2 p-2 text-left ${notification.read ? 'border-zinc-300 opacity-60' : 'border-amber-500'}`}><p className="text-xs font-bold">{notification.title}</p><p className="mt-1 text-[11px] text-zinc-500">{notification.body}</p></Link>)}</div>}</div>}
      </div></div>}
    </nav>
  );
}