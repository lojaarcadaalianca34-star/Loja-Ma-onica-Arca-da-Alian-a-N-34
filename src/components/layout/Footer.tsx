import React from 'react';
import { Link } from 'react-router-dom';
import { Landmark, Heart, Shield, Landmark as LandmarkIcon } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-masonic-blue pt-20 pb-10 border-t border-[#c5a059]/20 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-[#c5a059]/5 blur-[100px] -z-10" />
      
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full border border-[#c5a059] flex items-center justify-center bg-white/5">
                <Landmark className="text-[#c5a059] w-6 h-6" />
              </div>
              <div>
                <h2 className="font-serif text-lg font-bold text-[#c5a059] uppercase tracking-widest leading-tight">
                  Arca da Aliança
                </h2>
                <p className="text-[10px] text-[#c5a059]/80 uppercase tracking-widest">Nº 34 - Guará/DF</p>
              </div>
            </div>
            <p className="text-white/40 text-sm leading-relaxed mb-6">
              Uma oficina de trabalho dedicada ao aperfeiçoamento da humanidade e à construção de um mundo mais justo e perfeito.
            </p>
          </div>

          <div>
            <h4 className="text-[#c5a059] font-bold uppercase tracking-widest text-xs mb-6">Links Rápidos</h4>
            <ul className="space-y-4">
              <li><Link to="/" className="text-white/40 hover:text-[#c5a059] text-sm transition-colors">Início</Link></li>
              <li><Link to="/quero-participar" className="text-white/40 hover:text-[#c5a059] text-sm transition-colors">Quero Participar</Link></li>
              <li><Link to="/galeria-honra" className="text-white/40 hover:text-[#c5a059] text-sm transition-colors">Galeria de Mestres</Link></li>
              <li><Link to="/eventos" className="text-white/40 hover:text-[#c5a059] text-sm transition-colors">Calendário de Eventos</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-[#c5a059] font-bold uppercase tracking-widest text-xs mb-6">Institucional</h4>
            <ul className="space-y-4">
              <li><a href="https://glmdf.org.br/" target="_blank" rel="noopener noreferrer" className="text-white/40 hover:text-[#c5a059] text-sm transition-colors">Grande Loja Maçônica do DF</a></li>
              <li><Link to="/biblioteca" className="text-white/40 hover:text-[#c5a059] text-sm transition-colors">Biblioteca</Link></li>
              <li><Link to="/admin" className="text-white/40 hover:text-[#c5a059] text-sm transition-colors">Acesso Restrito</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-[#c5a059] font-bold uppercase tracking-widest text-xs mb-6">Contato Direto</h4>
            <p className="text-white/40 text-sm leading-relaxed mb-4 italic">
              "Buscai e achareis; batei e abrir-se-vos-á."
            </p>
            <p className="text-[#c5a059] font-bold text-sm">lojaarcadaalianca34@gmail.com</p>
          </div>

        </div>

        <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-white/30 text-[10px] uppercase tracking-widest text-center md:text-left">
            © {new Date().getFullYear()} A.R.L.S. Arca da Aliança nº 34. Todos os direitos reservados.
          </p>
          <div className="flex items-center gap-6">
             <LandmarkIcon className="w-4 h-4 text-[#c5a059]/20" />
             <Shield className="w-4 h-4 text-[#c5a059]/20" />
             <Heart className="w-4 h-4 text-[#c5a059]/20" />
          </div>
          <p className="text-white/30 text-[10px] uppercase tracking-widest text-center md:text-right">
            S.F.U. • G.A.D.U.
          </p>
        </div>
      </div>
    </footer>
  );
}
