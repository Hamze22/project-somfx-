import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, ArrowRight, CirclePlay, Send, MessageSquare } from 'lucide-react';
import { PaymentModal } from '../components/shared/PaymentModal';
import { cn } from '../lib/utils';
import { EA } from '../types/store';

export function StorePage() {
  const [category, setCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedItem, setSelectedItem] = useState<{ id: string, name: string, price: number, type: string } | null>(null);
  const { currentUser } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const { data: eas = [], isLoading } = useQuery({
    queryKey: ['eas', 'active'],
    queryFn: async () => {
      const q = query(
        collection(db, 'products'), 
        where('type', '==', 'ea'),
        where('status', '==', 'active'),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as EA[];
    }
  });

  const filteredEAs = useMemo(() => {
    let result = eas;
    if (category !== 'all') {
      result = result.filter(ea => ea.category === category);
    }
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(ea => ea.name.toLowerCase().includes(q) || ea.description.toLowerCase().includes(q));
    }
    return result;
  }, [category, search, eas]);

  const categories = [
    { key: 'all', label: t("store.all") },
    { key: 'scalping', label: 'Scalping' },
    { key: 'trend', label: 'Trend' },
    { key: 'grid', label: 'Grid' },
    { key: 'gold', label: 'Gold/XAU' },
    { key: 'news', label: 'News' }
  ];

  const handleBuy = (ea: EA) => {
    if (!currentUser) {
      navigate("/login");
      return;
    }
    setSelectedItem({ id: ea.id, name: ea.name, price: ea.price, type: 'ea' });
  };

  return (
    <div className="pb-20">
      {/* Hero */}
      <section className="text-center py-10 px-6 max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-success/5 border border-success/20 text-success font-mono text-[0.6rem] px-3 py-1 rounded-full tracking-widest mb-6 animate-pulse">
          {t("store.liveBadge")}
        </div>
        <h1 className="text-4xl md:text-6xl font-black tracking-tighter mb-4 bg-gradient-to-r from-foreground via-primary to-gold-dark bg-clip-text text-transparent italic uppercase">
          SomFX Store
        </h1>
        <p className="text-xs md:text-sm text-muted-foreground mb-8 max-w-sm mx-auto leading-relaxed">
          {t("store.heroDesc")}
        </p>
        <div className="flex justify-center gap-3">
          <button 
            onClick={() => document.getElementById('grid')?.scrollIntoView({ behavior: 'smooth' })}
            className="bg-primary text-black px-6 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-105 transition-all"
          >
            {t("store.browseEAs")}
          </button>
          <button 
            onClick={() => navigate("/courses")}
            className="px-6 py-2.5 bg-secondary border border-border rounded-lg text-xs font-black uppercase tracking-widest text-primary hover:bg-primary/5 transition-all"
          >
            {t("store.courses")}
          </button>
        </div>
      </section>

      {/* Social & Stats Section */}
      <section className="py-12 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <span className="text-[0.6rem] font-black tracking-[0.4em] text-muted-foreground uppercase opacity-60 mb-6 block">
            Social Media
          </span>
          <div className="flex justify-center gap-2 mb-16">
            <a href="#" className="flex items-center gap-2 px-5 py-2 bg-card/60 border border-border rounded-xl hover:border-[#2AABEE] transition-all group">
              <svg 
                viewBox="0 0 24 24" 
                className="w-4 h-4 fill-[#2AABEE] group-hover:scale-110 transition-transform"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M11.944 0C5.346 0 0 5.346 0 11.944c0 6.598 5.346 11.944 11.944 11.944 6.598 0 11.944-5.346 11.944-11.944C23.888 5.346 18.542 0 11.944 0zm5.833 8.35c-.17 1.785-1.02 6.8-.1445 7.6a.65.65 0 0 1-.3.12c-.22.1-.47.1-.73-.02l-2.61-1.92-1.28 1.23-.19.18c-.16.15-.3.2-.44.2-.14 0-.25-.05-.34-.14l-.06-.06-.41-1.35-3.04-1c-.55-.18-.55-.56.12-.82l11.75-4.52c.54-.2 1 .15.86.7zm-2.18 5.3l-5.63-2.31c-.13-.05-.2-.14-.2-.24 0-.1.07-.19.2-.24l5.63-2.31c.21-.08.43.08.4.3l-.4 4.5c-.03.22-.25.38-.4.3z" />
              </svg>
              <span className="font-extrabold text-[0.65rem] tracking-widest uppercase">Telegram</span>
            </a>
            <a href="#" className="flex items-center gap-2 px-5 py-2 bg-card/60 border border-border rounded-xl hover:border-[#25D366] transition-all group">
              <svg 
                viewBox="0 0 24 24" 
                className="w-4 h-4 fill-[#25D366] group-hover:scale-110 transition-transform"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              <span className="font-extrabold text-[0.65rem] tracking-widest uppercase">WhatsApp</span>
            </a>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-y-8 md:gap-x-4 max-w-5xl mx-auto">
            <div className="flex-1 min-w-[120px] flex flex-col items-center">
              <div className="text-2xl md:text-3xl font-black text-primary mb-1">0</div>
              <div className="text-[0.55rem] md:text-[0.6rem] font-black text-muted-foreground uppercase tracking-[0.2em] opacity-70">Expert Advisors</div>
            </div>
            <div className="flex-1 min-w-[120px] flex flex-col items-center">
              <div className="text-2xl md:text-3xl font-black text-primary mb-1">0</div>
              <div className="text-[0.55rem] md:text-[0.6rem] font-black text-muted-foreground uppercase tracking-[0.2em] opacity-70">Indicators</div>
            </div>
            <div className="flex-1 min-w-[120px] flex flex-col items-center">
              <div className="text-2xl md:text-3xl font-black text-primary mb-1">0</div>
              <div className="text-[0.55rem] md:text-[0.6rem] font-black text-muted-foreground uppercase tracking-[0.2em] opacity-70">Traders</div>
            </div>
            <div className="flex-1 min-w-[120px] flex flex-col items-center">
              <div className="text-2xl md:text-3xl font-black text-success mb-1">24/7</div>
              <div className="text-[0.55rem] md:text-[0.6rem] font-black text-muted-foreground uppercase tracking-[0.2em] opacity-70">Support</div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Grid */}
      <div id="grid" className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder={t("store.searchEAs")} 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-card border border-border rounded-lg py-3 px-4 pl-10 text-sm outline-none focus:border-primary transition-all font-medium"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar shrink-0">
            {categories.map(cat => (
              <button
                key={cat.key}
                onClick={() => setCategory(cat.key)}
                className={cn(
                  "px-4 py-1.5 rounded-full text-[0.7rem] font-black uppercase tracking-widest whitespace-nowrap border transition-all",
                  category === cat.key ? "bg-primary/10 border-primary text-primary" : "bg-card border-border text-muted-foreground hover:border-primary/40"
                )}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-6 flex items-center gap-2">
          <div className="w-1 h-1 rounded-full bg-primary" />
          <span className="text-xs font-black uppercase tracking-widest text-foreground">
            Active EAs <span className="text-muted-foreground font-mono font-medium ml-1">({filteredEAs.length} found)</span>
          </span>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="aspect-[4/5] bg-card border border-border rounded-xl animate-pulse" />
            ))}
          </div>
        ) : filteredEAs.length === 0 ? (
          <div className="text-center py-20 bg-card rounded-xl border border-dashed border-border">
            <p className="text-muted-foreground text-sm font-medium">{t("store.noResults")}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredEAs.map(ea => (
              <div key={ea.id} className="bg-card border border-border rounded-xl overflow-hidden hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all group">
                <div 
                  className="aspect-[16/10] bg-secondary relative overflow-hidden cursor-pointer flex items-center justify-center"
                  onClick={() => navigate(`/ea/${ea.id}`)}
                >
                  {ea.images?.[0] ? (
                    <img src={ea.images[0]} alt={ea.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" referrerPolicy="no-referrer" />
                  ) : (
                    <span className="text-6xl">{ea.icon}</span>
                  )}
                  {ea.badge && (
                    <div className="absolute top-3 left-3 px-2 py-0.5 bg-primary rounded font-mono text-[0.55rem] font-black text-black">
                      {ea.badge}
                    </div>
                  )}
                </div>

                <div className="p-5">
                  <div className="flex justify-between items-start mb-2">
                    <h3 
                      className="text-base font-black uppercase tracking-tight italic cursor-pointer hover:text-primary transition-colors"
                      onClick={() => navigate(`/ea/${ea.id}`)}
                    >
                      {ea.name}
                    </h3>
                  </div>
                  <p className="text-[0.7rem] text-muted-foreground leading-relaxed mb-5 line-clamp-2 font-medium">
                    {ea.description}
                  </p>

                  <div className="grid grid-cols-3 gap-3 mb-6">
                    <div className="text-center">
                      <div className="text-xs font-black text-success">+{ea.profit}%</div>
                      <div className="text-[0.55rem] text-muted-foreground uppercase tracking-widest">Return</div>
                    </div>
                    <div className="text-center border-x border-border/40">
                      <div className="text-xs font-black text-info">{ea.winrate}%</div>
                      <div className="text-[0.55rem] text-muted-foreground uppercase tracking-widest">Win Rate</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs font-black text-destructive">{ea.drawdown}%</div>
                      <div className="text-[0.55rem] text-muted-foreground uppercase tracking-widest">Drawdown</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-border/30">
                    <div className="text-xl font-black text-foreground">${ea.price}</div>
                    <button 
                      onClick={() => handleBuy(ea)}
                      className="bg-primary text-black px-5 py-2 rounded-lg text-[0.65rem] font-black uppercase tracking-widest hover:shadow-lg hover:shadow-primary/20 transition-all active:scale-95"
                    >
                      {t("store.buy")}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedItem && (
        <PaymentModal item={selectedItem} onClose={() => setSelectedItem(null)} />
      )}
    </div>
  );
}
