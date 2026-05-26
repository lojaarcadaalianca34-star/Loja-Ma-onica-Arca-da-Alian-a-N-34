import React, { useState, useEffect, useRef } from 'react';
import { Menu, X, Landmark, Users, Heart, BookOpen, Shield, LogOut, UserPlus } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/src/lib/utils';
import Logo from '../ui/Logo';
import { auth, logout } from '@/src/lib/firebase';

const navLinks = [
  { lines: ['Sobre', 'Nós'], href: '/sobre', icon: Landmark },
  { lines: ['Seja um', 'de Nós'], href: '/quero-participar', icon: UserPlus },
  { lines: ['Ações', 'Sociais'], href: '/#acoes-sociais', icon: Heart },
  { lines: ['Past', 'Masters'], href: '/#galeria-honra', icon: Users },
  { lines: ['Família'], href: '/#espaco-familia', icon: Users },
  { lines: ['Eventos'], href: '/eventos', icon: BookOpen },
  { lines: ['Galeria'], href: '/#galeria-fotos', icon: BookOpen },
];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const isNavigatingRef = useRef(false);

  // FECHA MENU IMEDIATAMENTE em qualquer mudança de rota
  useEffect(() => {
    isNavigatingRef.current = false;
    setIsOpen(false);
    document.body.style.overflow = '';
  }, [location.pathname, location.search]);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    return auth.onAuthStateChanged(setUser);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  // Navega fechando o menu ANTES
  const goTo = (href: string) => {
    if (isNavigatingRef.current) return;
    isNavigatingRef.current = true;
    setIsOpen(false);
    document.body.style.overflow = '';
    // Usa setTimeout 0 para garantir que o React processe o setIsOpen antes de navegar
    setTimeout(() => navigate(href), 0);
  };

  const handleLogout = async () => {
    setIsOpen(false);
    document.body.style.overflow = '';
    try { await logout(); } catch (e) { console.error(e); }
  };

  return (
    <>
      {/* NAVBAR */}
      <nav className={cn(
        "fixed top-0 left-0 right-0 z-[9999] px-4 md:px-6 bg-[#0b1d3a] border-b border-[#c5a059]/20 transition-[padding,box-shadow] duration-300",
        isScrolled ? "py-2 shadow-2xl" : "py-3"
      )}>
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 lg:gap-4">

          {/* Logo */}
          <button
            onClick={() => goTo('/')}
            className="flex items-center gap-2 lg:gap-3 shrink-0 bg-transparent border-0 cursor-pointer p-0"
          >
            <Logo className="w-8 h-8 md:w-9 md:h-9 lg:w-10 lg:h-10" />
            <div className="hidden sm:block text-left">
              <h1 className="font-serif text-[12px] lg:text-sm xl:text-lg font-bold text-[#c5a059] leading-tight uppercase tracking-wider">
                Arca da Aliança Nº 34
              </h1>
              <p className="text-[7px] lg:text-[8px] text-[#c5a059]/70 uppercase tracking-[0.4em] mt-0.5">Guará / DF</p>
            </div>
            <div className="sm:hidden text-left">
              <h1 className="font-serif text-[10px] font-bold text-[#c5a059] uppercase tracking-widest leading-none">Arca da Aliança Nº 34</h1>
              <p className="text-[7px] text-[#c5a059]/70 uppercase tracking-[0.2em] mt-1">Guará / DF</p>
            </div>
          </button>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center justify-end flex-1 gap-1 lg:gap-1.5 xl:gap-3 ml-auto">
            {navLinks.map((link, idx) => (
              <a
                key={idx}
                href={link.href}
                className="text-[8px] lg:text-[9px] xl:text-[10px] font-serif uppercase tracking-widest text-[#c5a059] hover:text-white transition-colors whitespace-normal text-center flex flex-col items-center justify-center leading-[1.2] min-h-[32px] px-1.5 lg:px-2"
              >
                {link.lines.map((line, lineIdx) => (
                  <span key={lineIdx} className="block">{line}</span>
                ))}
              </a>
            ))}
            <div className="flex items-center gap-2 ml-2 lg:ml-3 pl-2 lg:pl-3 border-l border-[#c5a059]/30 h-8 shrink-0">
              <button
                onClick={() => goTo('/area-restrita')}
                className="px-3 py-2 lg:px-4 lg:py-2 bg-[#c5a059] text-[#0b1d3a] rounded-full text-[8px] lg:text-[9px] font-black uppercase tracking-widest hover:bg-[#c5a059]/90 transition-colors shadow-md whitespace-nowrap border-0 cursor-pointer"
              >
                Área Restrita
              </button>
              <button
                onClick={() => goTo('/admin')}
                className="p-1.5 lg:p-2 bg-[#0b1d3a] border border-[#c5a059]/40 text-[#c5a059] rounded-full hover:bg-[#c5a059] hover:text-[#0b1d3a] transition-all shadow-md cursor-pointer"
                title="Acesso Administrativo"
              >
                <Shield className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
              </button>
            </div>
          </div>

          {/* Mobile toggle */}
          <div className="flex items-center gap-3 md:hidden">
            {user && (
              <button onClick={handleLogout} className="p-2 text-[#c5a059]/50 hover:text-[#c5a059] border-0 bg-transparent cursor-pointer">
                <LogOut className="w-5 h-5" />
              </button>
            )}
            <button
              className="p-2 text-[#c5a059] bg-white/5 rounded-lg border border-white/10 cursor-pointer"
              onClick={() => setIsOpen(v => !v)}
              aria-label={isOpen ? 'Fechar menu' : 'Abrir menu'}
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </nav>

      {/* MENU MOBILE
          IMPORTANTE: renderizado como div simples, SEM Framer Motion,
          SEM transform, SEM opacity animation.
          display:none garante que o browser NÃO renderiza na GPU
          quando fechado, evitando o glitch de stática no Android Chrome.
      */}
      <div
        className="md:hidden"
        aria-hidden={!isOpen}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 9998,
          backgroundColor: '#0b1d3a',
          overflowY: 'auto',
          paddingTop: '72px',
          paddingLeft: '20px',
          paddingRight: '20px',
          // display:none é o único jeito seguro no Android Chrome
          // opacity ou visibility ainda causam layer promotion na GPU
          display: isOpen ? 'flex' : 'none',
          flexDirection: 'column',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', paddingTop: '12px', paddingBottom: '40px' }}>

          {navLinks.map((link, idx) => (
            <button
              key={idx}
              onClick={() => goTo(link.href)}
              style={{
                display: 'flex', alignItems: 'center', gap: '16px',
                color: '#f4efe2', padding: '16px',
                backgroundColor: 'rgba(255,255,255,0.05)',
                borderRadius: '12px',
                border: '1px solid rgba(255,255,255,0.08)',
                textAlign: 'left', width: '100%', cursor: 'pointer',
              }}
            >
              <link.icon style={{ width: '20px', height: '20px', color: '#c5a059', flexShrink: 0 }} />
              <span style={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '12px' }}>
                {link.lines.join(' ')}
              </span>
            </button>
          ))}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '8px' }}>
            <button
              onClick={() => goTo('/area-restrita')}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                backgroundColor: '#c5a059',
                border: '1px solid rgba(197,160,89,0.4)',
                color: '#0b1d3a',
                fontWeight: 900, padding: '16px', borderRadius: '12px',
                fontSize: '10px', textTransform: 'uppercase',
                letterSpacing: '0.1em', cursor: 'pointer',
              }}
            >
              <Shield style={{ width: '16px', height: '16px' }} />
              Membros
            </button>
            <button
              onClick={() => goTo('/admin')}
              style={{
                backgroundColor: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#c5a059', fontWeight: 900,
                padding: '16px', borderRadius: '12px',
                fontSize: '10px', textTransform: 'uppercase',
                letterSpacing: '0.1em', cursor: 'pointer',
              }}
            >
              Admin
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
