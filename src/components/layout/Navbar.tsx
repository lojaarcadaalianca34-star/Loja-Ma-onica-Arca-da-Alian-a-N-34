import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, Landmark, Users, Heart, BookOpen, Shield, Globe, LogOut } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/src/lib/utils';
import Logo from '../ui/Logo';
import { auth, logout } from '@/src/lib/firebase';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', href: isHomePage ? '#home' : '/', icon: Globe, isExternal: false },
    { name: 'Sobre Nós', href: '/sobre', icon: Landmark, isExternal: true },
    { name: 'Ações Sociais', href: isHomePage ? '#social' : '/acoes-sociais', icon: Heart, isExternal: !isHomePage },
    { name: 'Past Masters', href: isHomePage ? '#galeria' : '/galeria-honra', icon: Users, isExternal: !isHomePage },
    { name: 'Eventos', href: '/eventos', icon: BookOpen, isExternal: true },
    { name: 'Galeria', href: isHomePage ? '#galeria-fotos' : '/#galeria-fotos', icon: BookOpen, isExternal: false },
  ];

  const handleLogout = async () => {
    try {
      await logout();
      setIsMobileMenuOpen(false);
    } catch (error) {
      console.error('Erro ao sair:', error);
    }
  };

  const [user, setUser] = useState<any>(null);
  useEffect(() => {
    return auth.onAuthStateChanged(setUser);
  }, []);

  return (
    <nav 
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-4 md:px-6 py-3 bg-masonic-blue/95 border-b border-gold-500/20 backdrop-blur-sm",
        isScrolled || isMobileMenuOpen ? "py-2 shadow-2xl" : "py-3"
      )}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-3 group shrink-0" onClick={() => setIsMobileMenuOpen(false)}>
          <Logo className="w-8 h-8 md:w-10 md:h-10 group-hover:scale-110 transition-transform" />
          <div className="hidden sm:block">
            <h1 className="font-serif text-sm md:text-lg font-bold text-[#c5a059] leading-tight uppercase tracking-wider flex items-center gap-2">
              Arca da Aliança Nº 34
            </h1>
            <p className="text-[8px] md:text-[9px] text-[#c5a059]/70 uppercase tracking-[0.4em] mt-0.5">Guará / DF</p>
          </div>
          <div className="sm:hidden">
            <h1 className="font-serif text-[10px] font-bold text-[#c5a059] uppercase tracking-widest leading-none">Arca da Aliança</h1>
            <p className="text-[7px] text-[#c5a059]/70 uppercase tracking-[0.2em] mt-1">Guará / DF</p>
          </div>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-6 lg:gap-8 ml-auto">
          {navLinks.map((link) => (
            link.isExternal ? (
              <Link 
                key={link.name} 
                to={link.href}
                className="text-sm font-serif uppercase tracking-widest text-[#c5a059] hover:text-white transition-colors"
              >
                {link.name}
              </Link>
            ) : (
              <a 
                key={link.name} 
                href={link.href}
                className="text-sm font-serif uppercase tracking-widest text-[#c5a059] hover:text-white transition-colors"
              >
                {link.name}
              </a>
            )
          ))}
          <div className="flex items-center gap-3 ml-4">
            <Link 
              to="/area-restrita"
              className="px-4 py-2 bg-gold-500/10 border border-gold-500/30 text-gold-500 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-gold-500 hover:text-masonic-dark transition-all"
            >
              Área Restrita
            </Link>
            <Link 
              to="/admin"
              className="p-2 text-white/20 hover:text-gold-500 transition-colors"
              title="Administração"
            >
              <Shield className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Mobile Toggle */}
        <div className="flex items-center gap-3 md:hidden">
          {user && (
            <button 
              onClick={handleLogout}
              className="p-2 text-gold-500/50 hover:text-gold-500 transition-colors"
            >
              <LogOut className="w-5 h-5" />
            </button>
          )}
          <button 
            className="p-2 text-gold-400 bg-white/5 rounded-lg border border-white/10"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden bg-masonic-dark border-b border-gold-500/20 md:hidden"
          >
            <div className="p-6 flex flex-col gap-2">
              {navLinks.map((link) => (
                link.isExternal ? (
                  <Link 
                    key={link.name} 
                    to={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-4 text-gold-100 p-4 bg-white/5 rounded-xl border border-white/5 active:bg-gold-500/10 active:border-gold-500/30 transition-all"
                  >
                    <link.icon className="w-5 h-5 text-gold-500" />
                    <span className="font-sans font-bold uppercase tracking-widest text-xs">{link.name}</span>
                  </Link>
                ) : (
                  <a 
                    key={link.name} 
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-4 text-gold-100 p-4 bg-white/5 rounded-xl border border-white/5 active:bg-gold-500/10 active:border-gold-500/30 transition-all"
                  >
                    <link.icon className="w-5 h-5 text-gold-500" />
                    <span className="font-sans font-bold uppercase tracking-widest text-xs">{link.name}</span>
                  </a>
                )
              ))}
              <div className="grid grid-cols-2 gap-3 mt-4">
                <Link 
                  to="/area-restrita"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="bg-gold-500 text-masonic-dark font-black p-4 rounded-xl text-[10px] uppercase tracking-widest text-center flex items-center justify-center gap-2"
                >
                  <Shield className="w-4 h-4" />
                  Membros
                </Link>
                <Link 
                  to="/admin"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="bg-white/5 border border-white/10 text-gold-400 font-black p-4 rounded-xl text-[10px] uppercase tracking-widest text-center"
                >
                  Admin
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
