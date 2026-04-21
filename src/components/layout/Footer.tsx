import { Zap, Send, Instagram, Youtube, MessageSquare } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export function Footer() {
  const { t } = useLanguage();
  
  return (
    <footer className="bg-background/99 border-t border-border mt-10 py-8 text-center px-6">
      <span className="text-sm font-extrabold bg-gradient-to-r from-primary to-gold-dark bg-clip-text text-transparent italic inline-block mb-3 uppercase tracking-tighter">
        ⚡ SomFX Store
      </span>
      
      <div className="flex justify-center gap-4 mb-6">
        {[Send, Instagram, Youtube, MessageSquare].map((Icon, i) => (
          <a key={i} href="#" className="p-2.5 bg-secondary border border-border rounded-lg hover:border-primary/40 text-muted-foreground hover:text-primary transition-all">
            <Icon className="w-4 h-4" />
          </a>
        ))}
      </div>

      <p className="text-[0.65rem] text-muted-foreground max-w-lg mx-auto leading-relaxed uppercase tracking-widest font-medium">
        {t("store.tradingRisk")}
      </p>
      
      <div className="mt-6 text-[0.6rem] text-muted-foreground/60 font-mono">
        © {new Date().getFullYear()} SOMFX GLOBAL TECHNOLOGY. ALL RIGHTS RESERVED.
      </div>
    </footer>
  );
}
