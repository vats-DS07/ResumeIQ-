import React, { useState, useEffect, useRef } from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { 
  LayoutDashboard, PlusCircle, History, User, Settings, LogOut, 
  Menu, X, Search, ChevronDown, ChevronRight, Home 
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../components/ui/Toast';
import { Avatar } from '../components/ui/Avatar';

export const AppLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchVal, setSearchVal] = useState('');

  const userMenuRef = useRef(null);

  // Close menus on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged Out', 'You have been successfully signed out.');
      navigate('/login');
    } catch (err) {
      toast.error('Logout Failed', err.message || 'Unable to log out.');
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchVal.trim()) {
      navigate(`/history?search=${encodeURIComponent(searchVal.trim())}`);
      setSearchVal('');
    }
  };

  // Sidebar navigation paths
  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { path: '/upload', label: 'New Analysis', icon: <PlusCircle className="w-5 h-5" /> },
    { path: '/history', label: 'History', icon: <History className="w-5 h-5" /> },
    { path: '/profile', label: 'Profile', icon: <User className="w-5 h-5" /> },
    { path: '/settings', label: 'Settings', icon: <Settings className="w-5 h-5" /> }
  ];

  // Helper to determine if a route is active
  const isRouteActive = (path) => {
    if (path === '/dashboard') {
      return location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(path);
  };

  // Dynamic breadcrumbs generation
  const getBreadcrumbs = () => {
    const path = location.pathname;
    const parts = path.split('/').filter(Boolean);
    const crumbs = [{ label: 'Home', path: '/dashboard' }];

    if (parts[0] === 'dashboard') {
      crumbs.push({ label: 'Dashboard', path: '/dashboard' });
    } else if (parts[0] === 'upload') {
      crumbs.push({ label: 'New Analysis', path: '/upload' });
    } else if (parts[0] === 'history') {
      crumbs.push({ label: 'History', path: '/history' });
    } else if (parts[0] === 'profile') {
      crumbs.push({ label: 'Profile', path: '/profile' });
    } else if (parts[0] === 'settings') {
      crumbs.push({ label: 'Settings', path: '/settings' });
    } else if (parts[0] === 'processing') {
      crumbs.push({ label: 'New Analysis', path: '/upload' });
      crumbs.push({ label: 'Processing', path: path });
    } else if (parts[0] === 'analysis') {
      crumbs.push({ label: 'History', path: '/history' });
      crumbs.push({ label: 'Report', path: path });
    }

    // Deduplicate consecutive breadcrumbs with the same label
    const filteredCrumbs = [];
    crumbs.forEach((c) => {
      if (filteredCrumbs.length === 0 || filteredCrumbs[filteredCrumbs.length - 1].label !== c.label) {
        filteredCrumbs.push(c);
      }
    });

    return filteredCrumbs;
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <div className="min-h-screen bg-bg text-text flex selection:bg-primary/20">
      
      {/* 1. Desktop Sidebar Container */}
      <aside 
        className={`hidden md:flex flex-col bg-surface border-r border-border shrink-0 transition-all duration-300 ${
          sidebarCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {/* Brand Logo Header */}
        <div className={`flex items-center gap-3 h-16 border-b border-border px-6 ${sidebarCollapsed ? 'justify-center px-0' : 'justify-between'}`}>
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/dashboard')}>
            <div className="w-8 h-8 rounded bg-gradient-to-tr from-primary to-blue-400 flex items-center justify-center text-white font-extrabold text-lg shrink-0 shadow-md">
              R
            </div>
            {!sidebarCollapsed && (
              <span className="font-extrabold text-lg tracking-tight">
                Resume<span className="text-primary">IQ</span>
              </span>
            )}
          </div>
        </div>

        {/* Sidebar Nav Links */}
        <nav className="flex-1 flex flex-col gap-1 py-6 px-3">
          {navItems.map((item) => {
            const active = isRouteActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3.5 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  active 
                    ? 'border-l-4 border-primary bg-primary/5 text-primary' 
                    : 'text-text-secondary hover:text-text hover:bg-bg'
                } ${sidebarCollapsed ? 'justify-center border-l-0 px-0' : 'text-left'}`}
                title={item.label}
              >
                {item.icon}
                {!sidebarCollapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer Logout */}
        <div className="p-3 border-t border-border/60">
          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-3.5 px-3 py-2.5 rounded-lg text-sm font-semibold text-danger hover:bg-danger/5 transition-colors cursor-pointer ${
              sidebarCollapsed ? 'justify-center px-0' : 'text-left'
            }`}
            title="Log Out"
          >
            <LogOut className="w-5 h-5" />
            {!sidebarCollapsed && <span>Log Out</span>}
          </button>
        </div>
      </aside>

      {/* 2. Mobile Nav Drawer Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Drawer */}
      <aside 
        className={`fixed top-0 left-0 bottom-0 z-50 w-64 bg-surface border-r border-border flex flex-col transition-transform duration-300 ease-in-out md:hidden ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between h-16 border-b border-border px-6">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/dashboard')}>
            <div className="w-8 h-8 rounded bg-gradient-to-tr from-primary to-blue-400 flex items-center justify-center text-white font-extrabold text-lg shadow-md">
              R
            </div>
            <span className="font-extrabold text-lg tracking-tight">
              Resume<span className="text-primary">IQ</span>
            </span>
          </div>
          <button 
            className="p-1 rounded-lg hover:bg-bg text-text-secondary hover:text-text cursor-pointer"
            onClick={() => setMobileMenuOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 flex flex-col gap-1 py-6 px-3">
          {navItems.map((item) => {
            const active = isRouteActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3.5 px-3 py-2.5 rounded-lg text-sm font-semibold text-left transition-all duration-200 ${
                  active 
                    ? 'border-l-4 border-primary bg-primary/5 text-primary' 
                    : 'text-text-secondary hover:text-text hover:bg-bg'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-border/60">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3.5 px-3 py-2.5 rounded-lg text-sm font-semibold text-danger hover:bg-danger/5 transition-colors cursor-pointer text-left"
          >
            <LogOut className="w-5 h-5" />
            <span>Log Out</span>
          </button>
        </div>
      </aside>

      {/* 3. Main Workspace Shell Container */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Header Bar */}
        <header className="h-16 bg-surface border-b border-border flex items-center justify-between px-6 sticky top-0 z-30">
          
          {/* Left: Mobile hamburger menu / Desktop collapse menu & Breadcrumbs */}
          <div className="flex items-center gap-4">
            <button 
              className="p-1.5 rounded-lg hover:bg-bg text-text hover:text-text md:hidden cursor-pointer"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu className="w-5.5 h-5.5" />
            </button>

            <button 
              className="p-1.5 rounded-lg hover:bg-bg text-text-secondary hover:text-text hidden md:inline-flex cursor-pointer"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              title="Toggle Navigation Menu"
            >
              <Menu className="w-5.5 h-5.5" />
            </button>

            {/* Breadcrumbs */}
            <nav className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-text-secondary">
              {breadcrumbs.map((crumb, idx) => (
                <React.Fragment key={idx}>
                  {idx > 0 && <ChevronRight className="w-3.5 h-3.5 text-border" />}
                  {idx === breadcrumbs.length - 1 ? (
                    <span className="text-text select-none">{crumb.label}</span>
                  ) : (
                    <Link to={crumb.path} className="hover:text-primary transition-colors">
                      {crumb.label}
                    </Link>
                  )}
                </React.Fragment>
              ))}
            </nav>
          </div>

          {/* Right: Search & Avatar dropdown */}
          <div className="flex items-center gap-4">
            
            {/* Search past audits form */}
            <form onSubmit={handleSearchSubmit} className="relative hidden sm:block w-48 md:w-60">
              <Search className="w-4 h-4 text-text-secondary absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search resumes..."
                value={searchVal}
                onChange={(e) => setSearchVal(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs border border-border bg-bg text-text rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </form>

            {/* Avatar Profile Dropdown */}
            <div className="relative" ref={userMenuRef}>
              <button
                className="flex items-center gap-1.5 cursor-pointer focus:outline-none group select-none"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
              >
                <Avatar name={user?.name} size="sm" className="border border-border group-hover:border-primary/45 transition-colors" />
                <span className="text-xs font-bold text-text hidden md:inline-block group-hover:text-primary transition-colors">
                  {user?.name?.split(' ')[0] || 'Account'}
                </span>
                <ChevronDown className={`w-3.5 h-3.5 text-text-secondary group-hover:text-primary transition-transform duration-200 ${
                  userMenuOpen ? 'rotate-180' : ''
                }`} />
              </button>

              {/* Menu list */}
              {userMenuOpen && (
                <div className="absolute right-0 mt-2.5 w-48 bg-surface border border-border rounded-lg shadow-elevated py-1 animate-fade-in text-left">
                  <div className="px-4 py-2 border-b border-border/60 select-none">
                    <p className="text-xs font-bold text-text truncate">{user?.name}</p>
                    <p className="text-[10px] text-text-secondary truncate">{user?.email}</p>
                  </div>
                  <Link 
                    to="/profile" 
                    className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-text-secondary hover:text-text hover:bg-bg transition-colors"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    <User className="w-4 h-4" /> Profile Details
                  </Link>
                  <Link 
                    to="/settings" 
                    className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-text-secondary hover:text-text hover:bg-bg transition-colors"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    <Settings className="w-4 h-4" /> Account Settings
                  </Link>
                  <div className="border-t border-border/60 my-1" />
                  <button 
                    onClick={() => {
                      setUserMenuOpen(false);
                      handleLogout();
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-danger hover:bg-danger/5 transition-colors text-left cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" /> Log Out
                  </button>
                </div>
              )}
            </div>

          </div>

        </header>

        {/* Main nested route element workspace content */}
        <div className="flex-1 overflow-y-auto">
          <Outlet />
        </div>

      </div>

    </div>
  );
};

export default AppLayout;
