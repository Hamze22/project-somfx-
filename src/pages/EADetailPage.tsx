import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { ChevronLeft, Star, TrendingUp, BarChart, Shield, Download, Lock } from 'lucide-react';
import { PaymentModal } from '../components/shared/PaymentModal';
import { EA } from '../types/store';

export function EADetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { currentUser } = useAuth();
  const [selectedItem, setSelectedItem] = useState<{ id: string, name: string, price: number, type: string } | null>(null);

  const { data: ea, isLoading } = useQuery({
    queryKey: ['ea', id],
    queryFn: async () => {
      if (!id) return null;
      const docRef = doc(db, 'products', id);
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) return null;
      return { id: docSnap.id, ...docSnap.data() } as EA;
    }
  });

  if (isLoading) return <div className="text-center py-20 text-muted-foreground">Loading assets...</div>;
  if (!ea) return <div className="text-center py-20 text-muted-foreground">Asset not found.</div>;

  return (
    <div className="max-w-5xl mx-auto px-6 py-6 pb-24">
      <button 
        onClick={() => navigate("/")}
        className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors text-xs font-bold mb-8 uppercase tracking-widest"
      >
        <ChevronLeft className="w-4 h-4" /> Back to Terminal
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="space-y-6">
           <div className="aspect-video bg-secondary border border-border rounded-xl flex items-center justify-center overflow-hidden shadow-2xl">
              {ea.images?.[0] ? (
                <img src={ea.images[0]} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                <span className="text-8xl">{ea.icon}</span>
              )}
           </div>
           
           <div className="grid grid-cols-4 gap-2">
              {ea.images?.slice(1, 5).map((img, i) => (
                <div key={i} className="aspect-video bg-card border border-border rounded-lg overflow-hidden grayscale hover:grayscale-0 transition-all cursor-pointer">
                   <img src={img} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
              ))}
           </div>
        </div>

        <div>
           <div className="flex items-center gap-2 mb-3">
              <span className="text-[0.6rem] font-black px-2 py-0.5 bg-primary/10 text-primary border border-primary/20 rounded uppercase">
                {ea.category}
              </span>
              {ea.badge && (
                <span className="text-[0.6rem] font-black px-2 py-0.5 bg-destructive border border-destructive text-black rounded uppercase">
                  {ea.badge}
                </span>
              )}
           </div>
           
           <h1 className="text-3xl font-black text-foreground italic uppercase tracking-tighter mb-2 leading-tight">
             {ea.name}
           </h1>
           
           <div className="flex items-center gap-1 text-primary text-xs mb-6">
              <Star className="w-3 h-3 fill-primary" />
              <Star className="w-3 h-3 fill-primary" />
              <Star className="w-3 h-3 fill-primary" />
              <Star className="w-3 h-3 fill-primary" />
              <Star className="w-3 h-3 fill-primary" />
              <span className="ml-2 text-muted-foreground font-mono font-medium">({ea.reviews || 0} reviews)</span>
           </div>

           <p className="text-xs md:text-sm text-muted-foreground leading-relaxed mb-8">
             {ea.description}
           </p>

           <div className="grid grid-cols-3 gap-3 mb-8">
              <div className="bg-success/5 border border-success/15 p-4 rounded-xl text-center">
                 <div className="text-lg font-black text-success">+{ea.profit}%</div>
                 <div className="text-[0.55rem] font-bold text-muted-foreground uppercase opacity-70">Payout</div>
              </div>
              <div className="bg-info/5 border border-info/15 p-4 rounded-xl text-center">
                 <div className="text-lg font-black text-info">{ea.winrate}%</div>
                 <div className="text-[0.55rem] font-bold text-muted-foreground uppercase opacity-70">Win Rate</div>
              </div>
              <div className="bg-destructive/5 border border-destructive/15 p-4 rounded-xl text-center">
                 <div className="text-lg font-black text-destructive">{ea.drawdown}%</div>
                 <div className="text-[0.55rem] font-bold text-muted-foreground uppercase opacity-70">Max DD</div>
              </div>
           </div>

           <div className="bg-card border border-border p-6 rounded-xl flex items-center justify-between shadow-xl">
              <div>
                 <div className="text-[0.6rem] font-black text-muted-foreground uppercase tracking-[0.2em] mb-1">Lifetime Access</div>
                 <div className="text-4xl font-black text-foreground tracking-tighter">${ea.price}</div>
              </div>
              <button 
                onClick={() => currentUser ? setSelectedItem({ id: ea.id, name: ea.name, price: ea.price, type: 'ea' }) : navigate('/login')}
                className="bg-primary text-black px-10 py-3.5 rounded-lg text-xs font-black uppercase tracking-widest hover:scale-105 hover:shadow-xl transition-all"
              >
                DEPLOY NOW
              </button>
           </div>
        </div>
      </div>

      <div className="mt-16 border-t border-border pt-12">
         <h3 className="text-sm font-black uppercase tracking-widest italic mb-8">Algorithm Specification</h3>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-4">
               {[
                 { icon: <TrendingUp className="w-4 h-4" />, label: 'Market Correlation', val: ea.pairs },
                 { icon: <BarChart className="w-4 h-4" />, label: 'Timeframe Optimization', val: 'M15, H1, H4' },
                 { icon: <Shield className="w-4 h-4" />, label: 'Security Model', val: 'Hard SL/TP Integrated' }
               ].map((item, i) => (
                 <div key={i} className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg text-sm">
                    <div className="flex items-center gap-3 text-muted-foreground font-medium">
                       {item.icon} {item.label}
                    </div>
                    <div className="font-bold text-foreground">{item.val}</div>
                 </div>
               ))}
            </div>
            
            <div className="p-8 bg-card border border-border rounded-xl">
               <h4 className="text-[0.65rem] font-black uppercase tracking-widest text-primary mb-4 flex items-center gap-2">
                 <Lock className="w-3.5 h-3.5" /> License Details
               </h4>
               <ul className="space-y-3 text-xs text-muted-foreground leading-relaxed">
                  <li>• Use on unlimited demo accounts</li>
                  <li>• Valid for 1 real MT4/MT5 account pair</li>
                  <li>• Automatic lot sizing & equity protection</li>
                  <li>• Future version updates delivered via Terminal</li>
               </ul>
            </div>
         </div>
      </div>

      {selectedItem && (
        <PaymentModal item={selectedItem} onClose={() => setSelectedItem(null)} />
      )}
    </div>
  );
}
