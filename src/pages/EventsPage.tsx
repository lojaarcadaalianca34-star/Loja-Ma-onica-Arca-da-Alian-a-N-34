import React from 'react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { motion } from 'motion/react';
import { Calendar, MapPin, Clock, Info } from 'lucide-react';
import { useContent } from '../context/ContentContext';

function parseEventDateTime(dateStr: string, timeStr: string): { start: Date; end: Date } {
  const now = new Date();
  let day = now.getDate();
  let month = now.getMonth();
  let year = now.getFullYear();
  let hours = 20;
  let minutes = 0;

  try {
    if (timeStr && timeStr.includes(':')) {
      const parts = timeStr.split(':');
      hours = parseInt(parts[0], 10) || 20;
      minutes = parseInt(parts[1], 10) || 0;
    }

    if (dateStr) {
      const cleanedDate = dateStr.replace(/,/g, '').toLowerCase();
      const parts = cleanedDate.split(/\s+de\s+|\s+/);
      const filteredParts = parts.filter(p => p !== '' && p !== 'de');
      
      if (filteredParts.length >= 1) {
        day = parseInt(filteredParts[0], 10) || day;
      }
      
      if (filteredParts.length >= 2) {
        const monthName = filteredParts[1];
        const monthsPt = [
          'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
          'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
        ];
        const monthIndex = monthsPt.findIndex(m => monthName.includes(m) || m.includes(monthName));
        if (monthIndex !== -1) {
          month = monthIndex;
        }
      }
      
      if (filteredParts.length >= 3) {
        year = parseInt(filteredParts[2], 10) || year;
      }
    }
  } catch (e) {
    console.error("Erro ao analisar data/hora do evento:", e);
  }

  const startDate = new Date(year, month, day, hours, minutes);
  const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000); // 2 hours duration

  return { start: startDate, end: endDate };
}

function formatGoogleCalendarDate(date: Date): string {
  const pad = (num: number) => String(num).padStart(2, '0');
  const yyyy = date.getFullYear();
  const mm = pad(date.getMonth() + 1);
  const dd = pad(date.getDate());
  const hh = pad(date.getHours());
  const min = pad(date.getMinutes());
  const ss = pad(date.getSeconds());
  return `${yyyy}${mm}${dd}T${hh}${min}${ss}`;
}

function escapeIcsText(text: string): string {
  if (!text) return '';
  return text
    .replace(/\\/g, '\\\\')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '');
}

export default function EventsPage() {
  const { content } = useContent();
  const events = content.events || [];

  const downloadAllEventsICS = () => {
    if (events.length === 0) return;

    let icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//ARLS Arca da Aliança nº 34//Eventos//PT',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH'
    ].join('\r\n') + '\r\n';

    events.forEach((event, index) => {
      const { start, end } = parseEventDateTime(event.date, event.time);
      const startStr = formatGoogleCalendarDate(start);
      const endStr = formatGoogleCalendarDate(end);
      
      const now = new Date();
      const stampStr = formatGoogleCalendarDate(now);

      icsContent += [
        'BEGIN:VEVENT',
        `UID:event_${index}_${startStr}@arcadaalianca.org.br`,
        `DTSTAMP:${stampStr}`,
        `DTSTART:${startStr}`,
        `DTEND:${endStr}`,
        `SUMMARY:${escapeIcsText(event.title)}`,
        `DESCRIPTION:${escapeIcsText(event.description)}`,
        `LOCATION:${escapeIcsText(event.location)}`,
        'END:VEVENT'
      ].join('\r\n') + '\r\n';
    });

    icsContent += 'END:VCALENDAR';

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'events_cal.ics');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-masonic-dark">
      <Navbar />
      <main className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-20"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-masonic-gold/10 border border-masonic-gold/30 mb-6">
              <Calendar className="text-masonic-gold w-8 h-8" />
            </div>
            <h1 className="font-serif text-4xl md:text-5xl font-bold text-white mb-4 uppercase tracking-[0.2em]">
              Pautas e <span className="gold-text">Eventos</span>
            </h1>
            <p className="text-gold-100 max-w-2xl mx-auto font-sans">
              Acompanhe o calendário de atividades, sessões e eventos sociais de nossa oficina.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {events.map((event, index) => {
              const { start, end } = parseEventDateTime(event.date, event.time);
              const startStr = formatGoogleCalendarDate(start);
              const endStr = formatGoogleCalendarDate(end);
              const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${startStr}/${endStr}&details=${encodeURIComponent(event.description)}&location=${encodeURIComponent(event.location)}`;

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-masonic-blue/80 border border-masonic-gold/10 rounded-[2rem] p-8 hover:border-masonic-gold/40 transition-all group"
                >
                  <div className="flex justify-between items-start mb-6">
                    <span className="px-4 py-1 rounded-full bg-masonic-gold/10 border border-masonic-gold/30 text-masonic-gold text-[10px] uppercase font-bold tracking-widest">
                      {event.type}
                    </span>
                    <div className="text-masonic-gold">
                      <Calendar className="w-5 h-5" />
                    </div>
                  </div>
                  <h3 className="font-serif text-2xl font-bold text-white mb-4 group-hover:gold-text transition-colors">{event.title}</h3>
                  <p className="text-white/60 text-sm mb-8 leading-relaxed font-sans">{event.description}</p>
                  
                  <div className="space-y-3 pt-6 border-t border-white/5">
                    <div className="flex items-center gap-3 text-gold-200/70 text-xs">
                      <Clock className="w-4 h-4 text-masonic-gold" />
                      <span>{event.date} às {event.time}</span>
                    </div>
                    <div className="flex items-center gap-3 text-gold-200/70 text-xs">
                      <MapPin className="w-4 h-4 text-masonic-gold" />
                      <span>{event.location}</span>
                    </div>
                  </div>

                  <button className="w-full mt-8 py-3 rounded-xl border border-masonic-gold/20 text-masonic-gold text-[10px] uppercase font-bold tracking-widest hover:bg-masonic-gold hover:text-masonic-dark transition-all">
                    Mais Informações
                  </button>

                  <a 
                    href={googleCalendarUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full mt-3 flex items-center justify-center gap-2 py-3 rounded-xl bg-masonic-gold text-masonic-dark text-[10px] uppercase font-bold tracking-widest hover:bg-masonic-gold/80 transition-all text-center font-sans font-bold cursor-pointer"
                  >
                    Sincronizar no Google Agenda
                  </a>
                </motion.div>
              );
            })}
          </div>

          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="mt-20 p-8 rounded-[2rem] bg-masonic-gold/5 border border-masonic-gold/20 flex flex-col md:flex-row items-center gap-6 justify-between"
          >
            <div className="flex items-center gap-4">
               <Info className="text-masonic-gold w-8 h-8 flex-shrink-0" />
               <div className="space-y-1">
                 <p className="text-white font-sans text-sm md:text-base">Sessões restritas a membros da ordem devidamente identificados.</p>
                 <p className="text-gold-200/60 font-sans text-xs">Dica: Baixe o arquivo .ics para importar todos os eventos de uma vez diretamente em sua agenda favorita (Google Agenda, Outlook, Apple Calendar).</p>
               </div>
            </div>
            <button 
              onClick={downloadAllEventsICS}
              className="px-8 py-3 bg-masonic-gold text-masonic-dark rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-masonic-gold/80 transition-all flex-shrink-0"
            >
               Sincronizar Calendário
            </button>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
