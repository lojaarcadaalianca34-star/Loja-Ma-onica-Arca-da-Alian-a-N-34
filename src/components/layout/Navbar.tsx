import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, Landmark, Users, Heart, BookOpen, Shield, Globe, LogOut } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/src/lib/utils';
import Logo from '../ui/Logo';
import { auth, logout } from '@/src/lib/firebase';

const navLinks = [
  { name: 'Home', href: '/#hero', icon: Globe },
  { name: 'Sobre Nós', href: '/sobre', icon: Landmark },
  { name: 'Ações Sociais', href: '/#acoes-sociais', icon: Heart },
  { name: 'Past Masters', href: '/#galeria-honra', icon: Users },
  { name: 'Família / Paramaçônicas', href: '/#espaco-familia', icon: Users },
  { name: 'Eventos', href: '/eventos', icon: BookOpen },
  { name: 'Galeria', href: '/#galeria-fotos', icon: BookOpen },
];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith('/#') || href.startsWith('#')) {
      const targetId = href.substring(href.indexOf('#') + 1);
      if (location.pathname === '/') {
        e.preventDefault();
        const element = document.getElementById(targetId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    }
  };

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
    <>
      {/* 1. BARRA DO TOPO FIXA - LIMPA E LEVE */}
      <nav 
        className={cn(
          "fixed top-0 left-0 right-0 z-[100] transition-[padding,box-shadow,background-color] duration-300 px-4 md:px-6 bg-[#0b1d3a] md:bg-[#0b1d3a]/95 border-b border-[#c5a059]/20 md:backdrop-blur-sm",
          isScrolled ? "py-2 shadow-2xl" : "py-3"
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
              <h1 className="font-serif text-[10px] font-bold text-[#c5a059] uppercase tracking-widest leading-none">Arca da Aliança Nº 34</h1>
              <p className="text-[7px] text-[#c5a059]/70 uppercase tracking-[0.2em] mt-1">Guará / DF</p>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1.5 lg:gap-3 xl:gap-5 ml-auto">
            {navLinks.map((link) => (
              <a 
                key={link.name} 
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className="text-[8px] lg:text-[10px] xl:text-[11px] font-serif uppercase tracking-wider xl:tracking-widest text-[#c5a059] hover:text-white transition-colors whitespace-nowrap px-1 lg:px-2"
              >
                {link.name}
              </a>
            ))}
            <div className="flex items-center gap-2 ml-2 lg:ml-4">
              <Link 
                to="/area-restrita"
                className="px-3 py-2 lg:px-5 lg:py-2.5 bg-[#c5a059] text-[#0b1d3a] rounded-full text-[9px] lg:text-[10px] font-black uppercase tracking-widest hover:bg-[#c5a059]/90 transition-colors shadow-md whitespace-nowrap"
              >
                Área Restrita
              </Link>
              <Link 
                to="/admin"
                className="p-1.5 text-white/20 hover:text-[#c5a059] transition-colors"
                title="Administração"
              >
                <Shield className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Mobile Toggle Button */}
          <div className="flex items-center gap-3 md:hidden z-[110]">
            {user && (
              <button 
                onClick={handleLogout}
                className="p-2 text-[#c5a059]/50 hover:text-[#c5a059] transition-colors"
              >
                <LogOut className="w-5 h-5" />
              </button>
            )}
            <button 
              className="p-2 text-[#c5a059] bg-white/5 rounded-lg border border-white/10"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </nav>

      {/* 2. MENU MOBILE EXTRAÍDO - INDEPENDENTE E FLUTUANTE */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#0b1d3a] z-[90] md:hidden flex flex-col pt-24 px-6 overflow-y-auto"
          >
            <div className="flex flex-col gap-3 pb-8">
              {navLinks.map((link) => (
                <a 
                  key={link.name} 
                  href={link.href}
                  onClick={(e) => {
                    setIsMobileMenuOpen(false);
                    handleNavClick(e, link.href);
                  }}
                  className="flex items-center gap-4 text-[#f4efe2] p-4 bg-white/5 rounded-xl border border-white/5 active:bg-[#c5a059]/10 active:border-[#c5a059]/30 transition-colors"
                >
                  <link.icon className="w-5 h-5 text-[#c5a059]" />
                  <span className="font-sans font-bold uppercase tracking-widest text-xs">{link.name}</span>
                </a>
              ))}
              
              <div className="grid grid-cols-2 gap-3 mt-4">
                <Link 
                  to="/area-restrita"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="bg-[#0b1d3a] border border-[#c5a059]/30 text-[#f4efe2] font-black p-4 rounded-xl text-[10px] uppercase tracking-widest text-center flex items-center justify-center gap-2 transition-colors hover:bg-[#c5a059]/10"
                >
                  <Shield className="w-4 h-4" />
                  Membros
                </Link>
                <Link 
                  to="/admin"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="bg-white/5 border border-white/10 text-[#c5a059] font-black p-4 rounded-xl text-[10px] uppercase tracking-widest text-center transition-colors hover:bg-white/10"
                >
                  Admin
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}