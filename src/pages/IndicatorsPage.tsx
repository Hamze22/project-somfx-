import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { PaymentModal } from '../components/shared/PaymentModal';
import { cn } from '../lib/utils';
import { Indicator } from '../types/store';

export function IndicatorsPage() {
  const [filter, setFilter] = useState('all');
  const [selectedItem, setSelectedItem] = useState<{ id: string, name: string, price: number, type: string } | null>(null);
  const { currentUser } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const { data: indicators = [], isLoading } = useQuery({
    queryKey: ['indicators', 'active'],
    queryFn: async () => {
      const q = query(
        collection(db, 'products'), 
        where('type', '==', 'indicator'),
        where('status', '==', 'active'),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Indicator[];
    }
  });

  const filtered = useMemo(() => {
    if (filter === 'all') return indicators;
    if (filter === 'free') return indicators.filter(i => i.price === 0);
    return indicators.filter(i => i.type === filter);
  }, [filter, indicators]);

  const categories = [
    { key: 'all', label: 'All' },
    { key: 'trend', label: 'Trend' },
    { key: 'momentum', label: 'Momentum' },
    { key: 'volume', label: 'Volume' },
    { key: 'free', label: 'Free' }
  ];

  return (
    <div className="pb-20">
      <section className="text-center py-10 px-6 max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-purple/10 border border-purple/20 text-purple font-mono text-[0.6rem] px-3 py-1 rounded-full tracking-widest mb-6">
          📡 TRADINGVIEW PLUGINS
        </div>
        <h1 className="text-3xl md:text-5xl font-black tracking-tighter mb-4 bg-gradient-to-r from-foreground via-purple to-info bg-clip-text text-transparent italic uppercase">
          {t("nav.indicators")}
        </h1>
        <p className="text-xs text-muted-foreground mb-8 max-w-sm mx-auto leading-relaxed">
          Premium Pine Script indicators for TradingView. 100% repainting-free signals.
        </p>
      </section>

      <div className="max-w-7xl mx-auto px-6">
        <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar mb-6 justify-center">
          {categories.map(cat => (
            <button
              key={cat.key}
              onClick={() => setFilter(cat.key)}
              className={cn(
                "px-5 py-2 rounded-full text-[0.7rem] font-black uppercase tracking-widest whitespace-nowrap border transition-all",
                filter === cat.key ? "bg-purple/10 border-purple text-purple" : "bg-card border-border text-muted-foreground hover:border-purple/40"
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
             {[1,2,3].map(i => <div key={i} className="aspect-[4/5] bg-card border border-border rounded-xl animate-pulse" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(ind => (
              <div key={ind.id} className="bg-card border border-border rounded-xl overflow-hidden hover:border-purple/40 transition-all group">
                <div className="aspect-video bg-secondary relative flex items-center justify-center overflow-hidden">
                  {ind.images?.[0] ? (
                    <img src={ind.images[0]} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-all" referrerPolicy="no-referrer" />
                  ) : (
                    <span className="text-5xl">{ind.icon}</span>
                  )}
                  <div className="absolute top-3 left-3 px-2 py-0.5 bg-black/60 backdrop-blur-md rounded font-mono text-[0.55rem] font-black text-purple border border-purple/30 uppercase">
                    {ind.type}
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="text-base font-black mb-1.5 uppercase italic tracking-tight">{ind.name}</h3>
                  <p className="text-[0.65rem] text-muted-foreground line-clamp-2 mb-4 font-medium leading-relaxed">{ind.description}</p>
                  
                  <div className="flex flex-wrap gap-1.5 mb-6">
                    {ind.features.map((f, idx) => (
                      <span key={idx} className="px-2 py-0.5 bg-secondary border border-border text-[0.6rem] text-muted-foreground rounded font-mono">
                        {f}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-border/30">
                    <div className="text-lg font-black text-foreground">
                      {ind.price === 0 ? <span className="text-success tracking-widest uppercase">Free</span> : `$${ind.price}`}
                    </div>
                    <button 
                      onClick={() => ind.price === 0 ? window.open(ind.file_url) : (currentUser ? setSelectedItem({ id: ind.id, name: ind.name, price: ind.price, type: 'indicator' }) : navigate('/login'))}
                      className="bg-purple text-black px-5 py-2 rounded-lg text-[0.65rem] font-black uppercase tracking-widest hover:shadow-[0_4px_16px_rgba(155,111,255,0.3)] transition-all"
                    >
                      {ind.price === 0 ? 'Get Free' : t("store.buy")}
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
