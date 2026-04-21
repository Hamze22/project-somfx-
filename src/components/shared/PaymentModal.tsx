import React, { useState } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { X, CreditCard, Smartphone, ShieldCheck } from 'lucide-react';
import { cn } from '../../lib/utils';

interface PaymentModalProps {
  item: {
    id: string;
    name: string;
    price: number;
    type: string;
  };
  onClose: () => void;
}

export function PaymentModal({ item, onClose }: PaymentModalProps) {
  const [method, setMethod] = useState<'evc' | 'mastercard' | 'crypto'>('evc');
  const [senderInfo, setSenderInfo] = useState('');
  const [loading, setLoading] = useState(false);
  const { currentUser } = useAuth();
  const { t } = useLanguage();

  const evcNumber = "634270434";
  const usdtAddress = "TQkFn7TA7bWBxkJhExaeFo1qCpT4xHBqSp";

  const handleSubmit = async () => {
    if (!currentUser) return;
    if (method === 'evc' && !senderInfo.trim()) return;

    setLoading(true);
    try {
      const orderId = "order-" + Math.random().toString(36).substr(2, 9);
      await setDoc(doc(db, 'orders', orderId), {
        id: orderId,
        userId: currentUser.id,
        userEmail: currentUser.email,
        productId: item.id,
        productName: item.name,
        amount: item.price,
        type: item.type,
        method: method.toUpperCase(),
        phone: method === 'evc' ? senderInfo : '',
        status: 'pending',
        createdAt: new Date().toISOString()
      });
      onClose();
    } catch (error) {
      console.error("Order error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div 
        className="bg-card border border-border rounded-xl w-full max-w-[480px] shadow-2xl relative overflow-hidden" 
        onClick={e => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
          <X className="w-5 h-5" />
        </button>

        <div className="p-6">
          <h2 className="text-lg font-extrabold text-foreground mb-1 tracking-tight uppercase italic underline decoration-primary decoration-2">
            Secure Checkout
          </h2>
          <p className="text-xs text-muted-foreground mb-6">Complete your purchase for <span className="text-primary font-bold">{item.name}</span></p>

          <div className="bg-secondary/50 border border-border p-4 rounded-lg mb-6 flex justify-between items-center">
            <div>
              <div className="text-[0.65rem] text-muted-foreground uppercase tracking-widest font-bold">Total Due</div>
              <div className="text-2xl font-black text-primary">${item.price}</div>
            </div>
            <ShieldCheck className="w-8 h-8 text-success/50" />
          </div>

          <div className="flex gap-2 mb-6">
            {(['evc', 'mastercard', 'crypto'] as const).map(m => (
              <button
                key={m}
                onClick={() => setMethod(m)}
                className={cn(
                  "flex-1 py-3 px-1 rounded-lg border text-[0.65rem] font-black uppercase tracking-tighter transition-all",
                  method === m ? "bg-primary/10 border-primary text-primary shadow-lg shadow-primary/5" : "bg-card border-border text-muted-foreground hover:border-primary/30"
                )}
              >
                {m === 'evc' ? 'EVC Plus' : m === 'mastercard' ? 'Card' : 'USDT'}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            {method === 'evc' && (
              <div className="p-4 bg-secondary rounded-lg border border-border text-center">
                <div className="text-xs text-muted-foreground mb-2">Send payment to:</div>
                <div className="text-lg font-black text-foreground tracking-widest mb-2">*880*634270434*{item.price}#</div>
                <input 
                  type="tel"
                  placeholder="Your Phone Number"
                  value={senderInfo}
                  onChange={e => setSenderInfo(e.target.value)}
                  className="w-full bg-background border border-border px-3 py-2 rounded-md text-sm outline-none focus:border-primary text-center font-mono"
                />
              </div>
            )}

            {method === 'crypto' && (
              <div className="p-4 bg-secondary rounded-lg border border-border text-center">
                <div className="text-xs text-muted-foreground mb-1 uppercase tracking-widest">USDT (TRC20)</div>
                <div className="text-[0.6rem] font-mono text-info mb-2 break-all">{usdtAddress}</div>
                <input 
                  type="text"
                  placeholder="Wallet Address / Transaction ID"
                  className="w-full bg-background border border-border px-3 py-2 rounded-md text-sm outline-none focus:border-primary text-center font-mono"
                />
              </div>
            )}

            {method === 'mastercard' && (
              <div className="space-y-3">
                <input 
                  type="text"
                  placeholder="Card Number"
                  className="w-full bg-background border border-border px-3 py-3 rounded-md text-sm outline-none focus:border-primary font-mono tracking-widest"
                />
                <div className="grid grid-cols-2 gap-3">
                  <input placeholder="MM/YY" className="bg-background border border-border px-3 py-2 rounded-md text-sm outline-none focus:border-primary font-mono text-center" />
                  <input placeholder="CVV" className="bg-background border border-border px-3 py-2 rounded-md text-sm outline-none focus:border-primary font-mono text-center" />
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="p-6 bg-secondary/30 border-t border-border mt-2">
          <button 
            disabled={loading}
            onClick={handleSubmit}
            className="w-full bg-gradient-to-r from-primary to-gold-dark text-black py-3 rounded-lg text-xs font-black uppercase tracking-widest hover:shadow-[0_8px_24px_rgba(245,197,24,0.3)] transition-all disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Confirm Payment'}
          </button>
        </div>
      </div>
    </div>
  );
}
