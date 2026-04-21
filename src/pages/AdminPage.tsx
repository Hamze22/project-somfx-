import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { collection, query, getDocs, updateDoc, doc, deleteDoc, setDoc, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { 
  Users, 
  DollarSign, 
  Package, 
  Eye, 
  Check, 
  X, 
  Trash2, 
  Plus,
  BarChart3,
  Search,
  ChevronLeft
} from 'lucide-react';
import { cn } from '../lib/utils';

export function AdminPage() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<'stats' | 'users' | 'payments' | 'products'>('stats');
  const [search, setSearch] = useState('');

  const { data: stats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const usersSnap = await getDocs(collection(db, 'users'));
      const ordersSnap = await getDocs(query(collection(db, 'orders'), orderBy('createdAt', 'desc')));
      
      const revenue = ordersSnap.docs
        .filter(d => d.data().status === 'completed')
        .reduce((acc, curr) => acc + (curr.data().amount || 0), 0);
        
      return { 
        userCount: usersSnap.size, 
        revenue, 
        orderCount: ordersSnap.size 
      };
    }
  });

  const { data: users = [] } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    }
  });

  const { data: orders = [] } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: async () => {
      const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    }
  });

  const { data: products = [] } = useQuery({
    queryKey: ['admin-products'],
    queryFn: async () => {
      const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    }
  });

  const handleUpdateOrderStatus = async (id: string, status: string) => {
    await updateDoc(doc(db, 'orders', id), { status });
    queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
    queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    await deleteDoc(doc(db, 'products', id));
    queryClient.invalidateQueries({ queryKey: ['admin-products'] });
  };

  const handleAddSampleProduct = async () => {
    const id = "sample-" + Math.random().toString(36).substr(2, 9);
    await setDoc(doc(db, 'products', id), {
      name: "NeoScalper X10",
      description: "Advanced HFT Scalping Bot for Gold",
      price: 499,
      type: 'ea',
      category: 'scalping',
      status: 'active',
      profit: '15',
      winrate: '88',
      drawdown: '5',
      icon: "⚡",
      createdAt: new Date().toISOString()
    });
    queryClient.invalidateQueries({ queryKey: ['admin-products'] });
  };

  if (!currentUser || currentUser.role !== 'admin') {
    navigate("/");
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 pb-24">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
           <button onClick={() => navigate("/profile")} className="p-2 hover:bg-secondary rounded-lg transition-all">
             <ChevronLeft className="w-5 h-5" />
           </button>
           <h2 className="text-xl font-black uppercase italic tracking-tighter text-primary underline decoration-2 underline-offset-4">
              Mission Control
           </h2>
        </div>
      </div>

      <div className="flex gap-2 p-1 bg-secondary rounded-xl mb-8 w-full md:w-fit border border-border">
          {(['stats', 'users', 'payments', 'products'] as const).map(t => (
            <button
               key={t}
               onClick={() => setTab(t)}
               className={cn(
                 "flex-1 md:flex-none px-6 py-2 rounded-lg text-[0.65rem] font-black uppercase tracking-widest transition-all",
                 tab === t ? "bg-card text-primary shadow-lg border border-border" : "text-muted-foreground hover:text-foreground"
               )}
            >
               {t}
            </button>
          ))}
      </div>

      {tab === 'stats' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <div className="bg-card border border-border p-6 rounded-xl">
              <Users className="w-6 h-6 text-info mb-4" />
              <div className="text-2xl font-black text-foreground">{stats?.userCount || 0}</div>
              <div className="text-[0.6rem] font-bold text-muted-foreground uppercase tracking-widest">Global Traders</div>
           </div>
           <div className="bg-card border border-border p-6 rounded-xl border-b-primary">
              <DollarSign className="w-6 h-6 text-success mb-4" />
              <div className="text-2xl font-black text-foreground">${stats?.revenue || 0}</div>
              <div className="text-[0.6rem] font-bold text-muted-foreground uppercase tracking-widest">Total Revenue</div>
           </div>
           <div className="bg-card border border-border p-6 rounded-xl">
              <Package className="w-6 h-6 text-purple mb-4" />
              <div className="text-2xl font-black text-foreground">{stats?.orderCount || 0}</div>
              <div className="text-[0.6rem] font-bold text-muted-foreground uppercase tracking-widest">Transaction Log</div>
           </div>
        </div>
      )}

      {tab === 'users' && (
        <div className="bg-card border border-border rounded-xl overflow-hidden shadow-xl font-mono">
           <table className="w-full text-left">
              <thead className="bg-secondary/50 text-[0.6rem] uppercase font-bold text-muted-foreground">
                 <tr>
                    <th className="p-4 border-b border-border">User</th>
                    <th className="p-4 border-b border-border">Joined</th>
                    <th className="p-4 border-b border-border text-right">Actions</th>
                 </tr>
              </thead>
              <tbody className="text-xs">
                 {users.map((u: any) => (
                   <tr key={u.id} className="border-b border-border/40 hover:bg-secondary/20 transition-all">
                      <td className="p-4">
                         <div className="font-bold text-foreground">{u.displayName}</div>
                         <div className="text-[0.65rem] text-muted-foreground">{u.email}</div>
                      </td>
                      <td className="p-4 text-muted-foreground">{new Date(u.createdAt).toLocaleDateString()}</td>
                      <td className="p-4 text-right">
                         <button className="text-info hover:underline text-[0.6rem] font-black uppercase">Inspect</button>
                      </td>
                   </tr>
                 ))}
              </tbody>
           </table>
        </div>
      )}

      {tab === 'payments' && (
        <div className="space-y-3">
           {orders.map((p: any) => (
             <div key={p.id} className="bg-card border border-border p-4 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-primary/20 transition-all">
                <div className="flex-1">
                   <div className="flex items-center gap-3 mb-1">
                      <span className="text-xs font-black uppercase tracking-tight text-foreground">{p.productId}</span>
                      <span className="text-[0.6rem] font-bold text-primary font-mono">${p.amount}</span>
                   </div>
                   <div className="text-[0.65rem] text-muted-foreground font-mono">
                      User: {p.userId} • {new Date(p.createdAt).toLocaleString()}
                   </div>
                </div>
                
                <div className="flex items-center gap-2">
                   <span className={cn(
                     "text-[0.65rem] font-black px-2.5 py-1 rounded font-mono uppercase tracking-widest border",
                     p.status === 'completed' ? 'bg-success/5 border-success text-success' : p.status === 'failed' ? 'bg-destructive/5 border-destructive text-destructive' : 'bg-primary/5 border-primary text-primary'
                   )}>
                      {p.status}
                   </span>
                   {p.status === 'pending' && (
                     <>
                        <button onClick={() => handleUpdateOrderStatus(p.id, 'completed')} className="p-1.5 bg-success/10 text-success rounded hover:bg-success/20 transition-all"><Check className="w-4 h-4" /></button>
                        <button onClick={() => handleUpdateOrderStatus(p.id, 'failed')} className="p-1.5 bg-destructive/10 text-destructive rounded hover:bg-destructive/20 transition-all"><X className="w-4 h-4" /></button>
                     </>
                   )}
                   <button className="p-1.5 bg-secondary text-muted-foreground rounded hover:bg-muted transition-all"><Trash2 className="w-4 h-4" /></button>
                </div>
             </div>
           ))}
        </div>
      )}

      {tab === 'products' && (
        <div className="space-y-4">
           <div className="flex justify-between items-center mb-4">
              <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground">Catalog ({products.length})</h3>
              <button 
                onClick={handleAddSampleProduct}
                className="bg-primary text-black px-4 py-1.5 rounded-lg text-[0.6rem] font-black uppercase tracking-widest flex items-center gap-1 shadow-lg shadow-primary/20"
              >
                <Plus className="w-3 h-3" /> Quick Add Sample
              </button>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map((p: any) => (
                <div key={p.id} className="bg-card border border-border p-4 rounded-xl flex justify-between items-center group hover:border-primary/30 transition-all">
                   <div>
                      <div className="text-sm font-black uppercase italic tracking-tight">{p.name}</div>
                      <div className="text-[0.6rem] text-primary font-mono">${p.price} • {p.type}</div>
                   </div>
                   <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-1.5 bg-secondary hover:bg-muted rounded text-muted-foreground transition-all">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteProduct(p.id)}
                        className="p-1.5 bg-destructive/10 hover:bg-destructive/20 rounded text-destructive transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                   </div>
                </div>
              ))}
              
              {products.length === 0 && (
                <div className="col-span-full text-center py-20 bg-card/50 border border-dashed border-border rounded-xl">
                   <Package className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                   <p className="text-muted-foreground text-sm font-medium italic">Empty Vault</p>
                </div>
              )}
           </div>
        </div>
      )}
    </div>
  );
}
