import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/ui/Button';

export const MarketingLayout = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  // Scroll detection for header style updates
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-bg text-text selection:bg-primary/20 flex flex-col">
      
      {/* Sticky Header Navbar */}
      <header 
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
          scrolled 
            ? 'bg-surface/80 backdrop-blur-md border-b border-border py-4 shadow-sm' 
            : 'bg-transparent py-6'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          
          {/* Logo */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-primary to-blue-400 flex items-center justify-center text-white font-extrabold text-xl shadow-md">
              R
            </div>
            <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-text to-text-secondary bg-clip-text text-transparent">
              Resume<span className="text-primary">IQ</span>
            </span>
          </div>

          {/* Links */}
          <nav className="hidden md:flex items-center gap-8">
            <Link to="/" className="text-sm font-medium text-text-secondary hover:text-text transition-colors">
              Home
            </Link>
            <Link to="/how-it-works" className="text-sm font-medium text-text-secondary hover:text-text transition-colors">
              How It Works
            </Link>
            <Link to="/pricing" className="text-sm font-medium text-text-secondary hover:text-text transition-colors">
              Pricing
            </Link>
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            {user ? (
              <Button size="sm" onClick={() => navigate('/dashboard')}>
                Go to Dashboard
              </Button>
            ) : (
              <>
                <Button variant="outline" size="sm" className="hidden sm:inline-flex" onClick={() => navigate('/login')}>
                  Log In
                </Button>
                <Button size="sm" onClick={() => navigate('/signup')}>
                  Get Started Free
                </Button>
              </>
            )}
          </div>

        </div>
      </header>

      {/* Main Page Content */}
      <div className="flex-1">
        <Outlet />
      </div>

      {/* Footer Section */}
      <footer className="bg-surface border-t border-border py-16 text-left mt-auto">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded bg-primary flex items-center justify-center text-white font-extrabold text-lg">
                R
              </div>
              <span className="font-extrabold tracking-tight text-lg text-text">
                Resume<span className="text-primary">IQ</span>
              </span>
            </div>
            <p className="text-xs text-text-secondary leading-relaxed max-w-[240px]">
              Premium AI-powered resume auditing and ATS checklist evaluation systems.
            </p>
            <span className="text-xs text-text-secondary mt-2">
              © {new Date().getFullYear()} ResumeIQ. All rights reserved.
            </span>
          </div>

          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-text">Product</h4>
            <Link to="/how-it-works" className="text-xs text-text-secondary hover:text-primary transition-colors">Analyzer Demo</Link>
            <Link to="/pricing" className="text-xs text-text-secondary hover:text-primary transition-colors">Pricing Options</Link>
            <Link to="/signup" className="text-xs text-text-secondary hover:text-primary transition-colors">Sign Up</Link>
          </div>

          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-text">Resources</h4>
            <a href="#" className="text-xs text-text-secondary hover:text-primary transition-colors">ATS Guidelines</a>
            <a href="#" className="text-xs text-text-secondary hover:text-primary transition-colors">Resume Tips</a>
            <a href="#" className="text-xs text-text-secondary hover:text-primary transition-colors">FAQ Support</a>
          </div>

          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-text">Legal</h4>
            <a href="#" className="text-xs text-text-secondary hover:text-primary transition-colors">Privacy Policy</a>
            <a href="#" className="text-xs text-text-secondary hover:text-primary transition-colors">Terms of Service</a>
            <a href="#" className="text-xs text-text-secondary hover:text-primary transition-colors">Cookie settings</a>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default MarketingLayout;
