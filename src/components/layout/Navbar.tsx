import React, { useState, useEffect } from 'react';
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
  const [menuVisible, setMenuVisible] = useState(false);
  const location = useLocation();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    return auth.onAuthStateChanged(setUser);
  }, []);

  // Abre/fecha menu com CSS puro — sem Framer Motion no mobile (causa glitch no Android Chrome)
  useEffect(() => {
    if (isMobileMenuOpen) {
      setMenuVisible(true);
      document.body.style.overflow = 'hidden';
    } else {
      // Pequeno delay para a transição de saída
      const t = setTimeout(() => setMenuVisible(false), 200);
      document.body.style.overflow = '';
      return () => clearTimeout(t);
    }
    return () => { document.body.style.overflow = ''; };
  }, [isMobileMenuOpen]);

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

  const closeMenu = () => setIsMobileMenuOpen(false);

  return (
    <>
      {/* NAVBAR FIXA */}
      <nav
        className={cn(
          "fixed top-0 left-0 right-0 z-[150] transition-[padding,box-shadow] duration-300 px-4 md:px-6 bg-[#0b1d3a] border-b border-[#c5a059]/20",
          isScrolled ? "py-2 shadow-2xl" : "py-3"
        )}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-3 group shrink-0" onClick={closeMenu}>
            <Logo className="w-8 h-8 md:w-10 md:h-10" />
            <div className="hidden sm:block">
              <h1 className="font-serif text-sm md:text-lg font-bold text-[#c5a059] leading-tight uppercase tracking-wider">
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
              <Link to="/admin" className="p-1.5 text-white/20 hover:text-[#c5a059] transition-colors" title="Administração">
                <Shield className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Botões Mobile */}
          <div className="flex items-center gap-3 md:hidden" style={{ zIndex: 160, position: 'relative' }}>
            {user && (
              <button onClick={handleLogout} className="p-2 text-[#c5a059]/50 hover:text-[#c5a059] transition-colors">
                <LogOut className="w-5 h-5" />
              </button>
            )}
            <button
              className="p-2 text-[#c5a059] bg-white/5 rounded-lg border border-white/10"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </nav>

      {/* MENU MOBILE — CSS puro, sem Framer Motion, sem transform, sem filter */}
      {menuVisible && (
        <div
          className="md:hidden"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 145,
            backgroundColor: '#0b1d3a',
            overflowY: 'auto',
            paddingTop: '80px',
            paddingLeft: '24px',
            paddingRight: '24px',
            opacity: isMobileMenuOpen ? 1 : 0,
            transition: 'opacity 0.2s ease',
            pointerEvents: isMobileMenuOpen ? 'auto' : 'none',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingBottom: '32px' }}>
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={(e) => {
                  closeMenu();
                  handleNavClick(e, link.href);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  color: '#f4efe2',
                  padding: '16px',
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  borderRadius: '12px',
                  border: '1px solid rgba(255,255,255,0.05)',
                  textDecoration: 'none',
                }}
              >
                <link.icon style={{ width: '20px', height: '20px', color: '#c5a059', flexShrink: 0 }} />
                <span style={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '12px' }}>
                  {link.name}
                </span>
              </a>
            ))}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '16px' }}>
              <Link
                to="/area-restrita"
                onClick={closeMenu}
                style={{
                  backgroundColor: '#0b1d3a',
                  border: '1px solid rgba(197,160,89,0.3)',
                  color: '#f4efe2',
                  fontWeight: 900,
                  padding: '16px',
                  borderRadius: '12px',
                  fontSize: '10px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  textAlign: 'center',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  textDecoration: 'none',
                }}
              >
                <Shield style={{ width: '16px', height: '16px' }} />
                Membros
              </Link>
              <Link
                to="/admin"
                onClick={closeMenu}
                style={{
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: '#c5a059',
                  fontWeight: 900,
                  padding: '16px',
                  borderRadius: '12px',
                  fontSize: '10px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  textAlign: 'center',
                  textDecoration: 'none',
                }}
              >
                Admin
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
