import React, { useState, useEffect } from 'react';
import { Menu, X, Landmark, Users, Heart, BookOpen, Shield, Globe, LogOut } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/src/lib/utils';
import Logo from '../ui/Logo';
import { auth, logout } from '@/src/lib/firebase';

const navLinks = [
  { name: 'Sobre Nós', href: '/sobre', icon: Landmark },
  { name: 'Seja um de Nós', href: '/quero-participar', icon: Shield },
  { name: 'Ações Sociais', href: '/acoes-sociais', icon: Heart },
  { name: 'Past Masters', href: '/galeria-honra', icon: Users },
  { name: 'Família / Paramaçônicas', href: '/#espaco-familia', icon: Users },
  { name: 'Eventos', href: '/eventos', icon: BookOpen },
  { name: 'Galeria', href: '/#galeria-fotos', icon: BookOpen },
];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const location = useLocation();
  const navigate = useNavigate();

  // CRÍTICO: fecha o menu IMEDIATAMENTE quando a rota muda
  useEffect(() => {
    setIsOpen(false);
    document.body.style.overflow = '';
  }, [location.pathname, location.search]);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    return auth.onAuthStateChanged(setUser);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const handleLogout = async () => {
    setIsOpen(false);
    document.body.style.overflow = '';
    try { await logout(); } catch (e) { console.error(e); }
  };

  const goTo = (href: string) => {
    // Fecha menu e zera scroll ANTES de navegar
    setIsOpen(false);
    document.body.style.overflow = '';
    navigate(href);
  };

  return (
    <>
      <nav className={cn(
        "fixed top-0 left-0 right-0 z-[100000] px-4 md:px-6 bg-[#0b1d3a] border-b border-[#c5a059]/20 transition-[padding,box-shadow] duration-300",
        isScrolled ? "py-2 shadow-2xl" : "py-3"
      )}>
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">

          <button onClick={() => goTo('/')} className="flex items-center gap-3 shrink-0 bg-transparent border-0 cursor-pointer">
            <Logo className="w-8 h-8 md:w-10 md:h-10" />
            <div className="hidden sm:block text-left">
              <h1 className="font-serif text-sm md:text-lg font-bold text-[#c5a059] leading-tight uppercase tracking-wider">
                Arca da Aliança Nº 34
              </h1>
              <p className="text-[8px] md:text-[9px] text-[#c5a059]/70 uppercase tracking-[0.4em] mt-0.5">Guará / DF</p>
            </div>
            <div className="sm:hidden text-left">
              <h1 className="font-serif text-[10px] font-bold text-[#c5a059] uppercase tracking-widest leading-none">Arca da Aliança Nº 34</h1>
              <p className="text-[7px] text-[#c5a059]/70 uppercase tracking-[0.2em] mt-1">Guará / DF</p>
            </div>
          </button>

          {/* Desktop */}
          <div className="hidden md:flex items-center gap-1.5 lg:gap-3 xl:gap-5 ml-auto">
            {navLinks.map((link) => (
              <a key={link.name} href={link.href}
                className="text-[8px] lg:text-[10px] xl:text-[11px] font-serif uppercase tracking-wider text-[#c5a059] hover:text-white transition-colors whitespace-nowrap px-1 lg:px-2">
                {link.name}
              </a>
            ))}
            <div className="flex items-center gap-2 ml-2 lg:ml-4">
              <button onClick={() => goTo('/area-restrita')}
                className="px-3 py-2 lg:px-5 lg:py-2.5 bg-[#c5a059] text-[#0b1d3a] rounded-full text-[9px] lg:text-[10px] font-black uppercase tracking-widest hover:bg-[#c5a059]/90 transition-colors shadow-md whitespace-nowrap cursor-pointer border-0">
                Área Restrita
              </button>
              <button onClick={() => goTo('/admin')} className="p-1.5 text-white/20 hover:text-[#c5a059] transition-colors border-0 bg-transparent cursor-pointer">
                <Shield className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Mobile toggle */}
          <div className="flex items-center gap-3 md:hidden">
            {user && (
              <button onClick={handleLogout} className="p-2 text-[#c5a059]/50 hover:text-[#c5a059] border-0 bg-transparent">
                <LogOut className="w-5 h-5" />
              </button>
            )}
            <button
              className="p-2 text-[#c5a059] bg-white/5 rounded-lg border border-white/10"
              onClick={() => setIsOpen(v => !v)}
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Menu mobile — sem Framer Motion, sem transform, sem filter, com remoção imediata para evitar ghosting na GPU */}
      <div
        className="md:hidden"
        style={{
          display: isOpen ? 'flex' : 'none',
          flexDirection: 'column',
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          zIndex: 99999, // Abaixo do 100000 do navbar para que o botão de fechar fique perfeitamente clicável
          backgroundColor: '#0b1d3a',
          paddingTop: '80px', // Mais espaço para descolar do navbar
          paddingLeft: '20px',
          paddingRight: '20px',
          overflowY: 'auto',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', paddingBottom: '40px', paddingTop: '12px' }}>
          {navLinks.map((link) => (
            <button
              key={link.name}
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
                {link.name}
              </span>
            </button>
          ))}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '8px' }}>
            <button onClick={() => goTo('/area-restrita')} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              backgroundColor: '#132a4e', border: '1px solid rgba(197,160,89,0.4)',
              color: '#f4efe2', fontWeight: 900, padding: '16px', borderRadius: '12px',
              fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', cursor: 'pointer',
            }}>
              <Shield style={{ width: '16px', height: '16px' }} />
              Área Restrita
            </button>
            <button onClick={() => goTo('/admin')} style={{
              backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
              color: '#c5a059', fontWeight: 900, padding: '16px', borderRadius: '12px',
              fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', cursor: 'pointer',
            }}>
              Admin
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
