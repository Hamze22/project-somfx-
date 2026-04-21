import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { PaymentModal } from '../components/shared/PaymentModal';
import { cn } from '../lib/utils';
import { Course } from '../types/store';

export function CoursesPage() {
  const [level, setLevel] = useState('all');
  const [selectedItem, setSelectedItem] = useState<{ id: string, name: string, price: number, type: string } | null>(null);
  const { currentUser } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const { data: courses = [], isLoading } = useQuery({
    queryKey: ['courses', 'active'],
    queryFn: async () => {
      const q = query(
        collection(db, 'products'), 
        where('type', '==', 'course'),
        where('status', '==', 'active'),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Course[];
    }
  });

  const filtered = useMemo(() => {
    if (level === 'all') return courses;
    if (level === 'free') return courses.filter(c => c.price === 0);
    return courses.filter(c => c.level === level);
  }, [level, courses]);

  const filters = [
    { key: 'all', label: 'All' },
    { key: 'beginner', label: 'Beginner' },
    { key: 'intermediate', label: 'Intermediate' },
    { key: 'advanced', label: 'Advanced' },
    { key: 'free', label: 'Free' }
  ];

  return (
    <div className="pb-20">
      <section className="text-center py-10 px-6 max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-info/10 border border-info/20 text-info font-mono text-[0.6rem] px-3 py-1 rounded-full tracking-widest mb-6">
          📚 TRADING ACADEMY
        </div>
        <h1 className="text-3xl md:text-5xl font-black tracking-tighter mb-4 bg-gradient-to-r from-foreground via-info to-purple bg-clip-text text-transparent italic uppercase">
          {t("nav.courses")}
        </h1>
        <p className="text-xs text-muted-foreground mb-8 max-w-sm mx-auto leading-relaxed">
          Master SMC, ICT, and EA automation with our step-by-step professional training.
        </p>
      </section>

      <div className="max-w-7xl mx-auto px-6">
        <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar mb-6 justify-center">
          {filters.map(f => (
            <button
              key={f.key}
              onClick={() => setLevel(f.key)}
              className={cn(
                "px-5 py-2 rounded-full text-[0.7rem] font-black uppercase tracking-widest whitespace-nowrap border transition-all",
                level === f.key ? "bg-info/10 border-info text-info" : "bg-card border-border text-muted-foreground hover:border-info/40"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
             {[1,2,3].map(i => <div key={i} className="aspect-[4/5] bg-card border border-border rounded-xl animate-pulse" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(course => (
              <div key={course.id} className="bg-card border border-border rounded-xl overflow-hidden hover:border-info/40 transition-all group">
                <div className="aspect-video bg-secondary relative flex items-center justify-center overflow-hidden">
                  {course.thumb ? (
                    <img src={course.thumb} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-all" referrerPolicy="no-referrer" />
                  ) : (
                    <span className="text-5xl">{course.icon}</span>
                  )}
                  <div className="absolute top-3 left-3 px-2 py-0.5 bg-black/60 backdrop-blur-md rounded font-mono text-[0.55rem] font-black text-info border border-info/30 uppercase">
                    {course.level}
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="text-base font-black mb-1.5 uppercase italic tracking-tight leading-snug">{course.title}</h3>
                  <p className="text-[0.65rem] text-muted-foreground line-clamp-2 mb-4 font-medium leading-relaxed">{course.description}</p>
                  
                  <div className="flex gap-4 mb-5 text-[0.65rem] font-bold text-muted-foreground/80">
                     <span className="flex items-center gap-1">🎥 {course.video_count || 0} Lessons</span>
                     <span className="flex items-center gap-1">⏱️ {course.duration}h</span>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-border/30">
                    <div className="text-lg font-black text-foreground">
                      {course.price === 0 ? <span className="text-success uppercase">Free</span> : `$${course.price}`}
                    </div>
                    <button 
                      onClick={() => course.price === 0 ? null : (currentUser ? setSelectedItem({ id: course.id, name: course.title, price: course.price, type: 'course' }) : navigate('/login'))}
                      className="bg-info text-black px-5 py-2 rounded-lg text-[0.65rem] font-black uppercase tracking-widest hover:shadow-[0_4px_16px_rgba(0,170,255,0.3)] transition-all"
                    >
                      {course.price === 0 ? 'Start Free' : 'Enroll Now'}
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
