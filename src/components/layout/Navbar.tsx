import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import eshrahLogo from '../../assets/images/eshrah_teb_typography_logo_1783527059225.jpg';
import { Menu, LogIn, UserPlus, Sun, Moon, X, Home, LogOut, User, BookOpen, Atom, Dna, ShieldCheck, Bell } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Page } from '../../App';
import { useLanguage } from '../../context/LanguageContext';

type Props = {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  isDark: boolean;
  setIsDark: (val: boolean) => void;
  isLoggedIn?: boolean;
  onLogout?: () => void;
};

export default function Navbar({ currentPage, onNavigate, isDark, setIsDark, isLoggedIn, onLogout }: Props) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { language, setLanguage, t } = useLanguage();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    if (isLoggedIn && import.meta.env.VITE_SUPABASE_URL && !import.meta.env.VITE_SUPABASE_URL.includes('placeholder')) {
      const fetchNotifs = async () => {
         const { data: { session } } = await supabase.auth.getSession();
         if (!session?.user?.id) return;
         const { data: msgs } = await supabase.from('support_messages').select('*').eq('student_id', session.user.id).eq('is_agent', true).order('created_at', { ascending: false }).limit(3);
         let notifs = [];
         if (msgs && msgs.length > 0) {
           notifs = msgs.map((m: any) => ({ id: m.id, title: 'رد من الدعم الفني', content: m.content.substring(0, 40) + '...', date: new Date(m.created_at).toLocaleDateString('ar-EG'), read: false, type: 'support' }));
         }
         
         const { data: subs } = await supabase.from('subscriptions').select('course_id').eq('student_id', session.user.id).eq('status', 'active');
         if (subs && subs.length > 0) {
           const courseIds = subs.map((s: any) => s.course_id);
           
           // Fetch recent exams for these courses
           const { data: recentExams } = await supabase.from('exams').select('id, title, created_at, course_id, courses(title)').in('course_id', courseIds).order('created_at', { ascending: false }).limit(3);
           
           if (recentExams) {
             recentExams.forEach((e: any) => {
               notifs.push({ id: e.id, title: 'امتحان جديد متاح', content: `تمت إضافة امتحان جديد: ${e.title} في ${e.courses?.title || 'الكورس'}`, date: new Date(e.created_at).toLocaleDateString('ar-EG'), read: false, type: 'exam' });
             });
           }
         }
         setNotifications(notifs);
      };
      fetchNotifs();
    }
  }, [isLoggedIn]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
        className={`sticky top-0 w-full z-50 px-3 sm:px-4 py-2 sm:py-3 min-h-[60px] sm:min-h-[70px] md:min-h-[85px] flex items-center justify-between transition-all duration-300 shadow-sm ${isDark ? 'bg-[#0b121c] border-b border-slate-800 text-white' : 'bg-white border-b border-gray-100 text-slate-900'}`}>
        <div className="flex items-center gap-3 sm:gap-5">
          <button 
            className={`p-1.5 sm:p-2 rounded-xl transition-colors md:hidden shrink-0 ${isDark ? 'text-white hover:bg-slate-800' : 'text-burgundy-500 hover:bg-burgundy-50'}`}
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <Menu className="w-6 h-6 sm:w-7 sm:h-7" />
          </button>

          <div className="flex flex-row items-center justify-center shrink-0 cursor-pointer transition-transform duration-300 hover:scale-105 gap-2" onClick={() => onNavigate('home')}>
            <img src={eshrahLogo} alt="إشرح طب" className="w-10 h-10 sm:w-12 sm:h-12 object-cover rounded-2xl" />
            <span className="font-black text-2xl sm:text-3xl tracking-tight text-burgundy-500 dark:text-burgundy-400">إشرحــ طب</span>
            
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3 shrink-0">
          {!isLoggedIn ? (
            <>
              {currentPage !== 'login' && (
                <button 
                  onClick={() => onNavigate('login')}
                  className={`hidden md:flex items-center gap-2 text-sm font-bold transition-all px-4 py-2 rounded-xl ${isDark ? 'text-white border border-slate-700 hover:bg-slate-800' : 'text-burgundy-500 border border-burgundy-500 hover:bg-burgundy-500/5'}`}
                >
                  <LogIn className="w-4 h-4" />
                  <span>{t('login')}</span>
                </button>
              )}
              {currentPage !== 'register' && (
                 <button 
                   onClick={() => onNavigate('register')}
                   className={`hidden md:flex bg-burgundy-500 hover:bg-burgundy-600 text-white px-4 py-2 rounded-xl items-center gap-2 text-sm font-bold transition-all shadow-md hover:shadow-lg`}
                 >
                   <UserPlus className="w-4 h-4" />
                   <span>{t('register')}</span>
                 </button>
              )}
            </>
          ) : (
            <>
              <button 
                onClick={() => onNavigate('profile')}
                className={`hidden md:flex bg-gradient-to-r from-burgundy-100 to-burgundy-100 hover:from-burgundy-200 hover:to-burgundy-200 text-burgundy-500 dark:from-burgundy-900/40 dark:to-burgundy-900/40 dark:text-burgundy-300 dark:hover:from-burgundy-900/60 dark:hover:to-burgundy-900/60 px-4 py-2 rounded-xl items-center gap-2 text-sm font-bold transition-all shadow-sm`}
              >
                <User className="w-4 h-4" />
                <span>{t('profile')}</span>
              </button>
              
              <button 
                onClick={() => onLogout && onLogout()}
                className={`hidden md:flex items-center gap-2 text-sm font-bold transition-all px-4 py-2 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20`}
              >
                <LogOut className="w-4 h-4" />
              </button>
            </>
          )}

          {isLoggedIn && (
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className={`p-1.5 sm:p-2 rounded-xl transition-colors relative ${isDark ? 'text-slate-300 hover:bg-slate-800' : 'text-slate-600 hover:bg-slate-100'}`}
              >
                <Bell className="w-5 h-5 sm:w-6 sm:h-6" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-red-500 rounded-full border-2 border-white dark:border-[#0b121c]"></span>
                )}
              </button>
              
              {showNotifications && (
                <div className={`absolute top-full -left-4 sm:left-0 mt-2 w-72 sm:w-80 rounded-2xl shadow-xl border overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 ${isDark ? 'bg-[#151b23] border-slate-800' : 'bg-white border-slate-100'}`}>
                  <div className={`p-4 border-b ${isDark ? 'border-slate-800' : 'border-slate-100'} flex items-center justify-between`}>
                    <h3 className="font-bold">الإشعارات</h3>
                    {unreadCount > 0 && (
                      <span className="text-xs font-bold px-2 py-1 bg-burgundy-50 text-burgundy-600 dark:bg-burgundy-900/30 dark:text-burgundy-400 rounded-full">
                        {unreadCount} جديد
                      </span>
                    )}
                  </div>
                  <div className="max-h-[400px] overflow-y-auto">
                    {notifications.length > 0 ? (
                      notifications.map(n => (
                        <div key={n.id} className={`p-4 border-b last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer ${!n.read ? (isDark ? 'bg-slate-800/30' : 'bg-slate-50') : ''}`} onClick={() => {
                           setNotifications(prev => prev.map(p => p.id === n.id ? { ...p, read: true } : p));
                        }}>
                           <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">{n.title}</h4>
                           <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{n.content}</p>
                           <span className="text-xs text-slate-400 dark:text-slate-500 mt-2 block">{n.date}</span>
                        </div>
                      ))
                    ) : (
                      <div className="p-8 text-center text-slate-500">
                        لا توجد إشعارات جديدة
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
          <button 
            onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
            className="flex items-center shrink-0 justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200/50 dark:border-slate-700/50 text-burgundy-500 dark:text-burgundy-400 font-bold text-[10px] sm:text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors shadow-sm"
          >
            {language === 'ar' ? 'EN' : 'AR'}
          </button>

          <div className="flex items-center shrink-0 bg-slate-100/80 dark:bg-slate-800/80 rounded-full p-0.5 sm:p-1 cursor-pointer border border-slate-200/50 dark:border-slate-700/50 shadow-inner" onClick={() => setIsDark(!isDark)}>
            <div className={`p-1 sm:p-1.5 rounded-full transition-all duration-300 ${!isDark ? 'bg-white shadow-sm text-yellow-500 scale-110' : 'text-slate-400 scale-90'}`}><Sun className="w-3.5 h-3.5 sm:w-4 sm:h-4" /></div>
            <div className={`p-1 sm:p-1.5 rounded-full transition-all duration-300 ${isDark ? 'bg-slate-600 shadow-sm text-burgundy-300 scale-110' : 'text-slate-400 scale-90'}`}><Moon className="w-3.5 h-3.5 sm:w-4 sm:h-4" /></div>
          </div>
        </div>
      </motion.nav>

      <AnimatePresence>
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[60] md:hidden font-sans dir-rtl">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: "spring", bounce: 0, duration: 0.4 }}
            className={`absolute top-0 right-0 w-72 h-full shadow-2xl flex flex-col ${isDark ? 'bg-[#0b121c] border-l border-slate-800' : 'bg-white border-l border-slate-100'}`}>
            <div className="p-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
              <div className="flex flex-row items-center gap-2 cursor-pointer" onClick={() => { onNavigate('home'); setIsMobileMenuOpen(false); }}>
                <img src={eshrahLogo} alt="إشرح طب" className="w-8 h-8 object-cover rounded-2xl" />
                <span className="font-black text-2xl tracking-tight text-burgundy-500 dark:text-burgundy-400">إشرحــ طب</span>
                
              </div>
              <button 
                onClick={() => setIsMobileMenuOpen(false)}
                className={`p-2 rounded-xl transition-colors ${isDark ? 'text-slate-400 hover:bg-slate-800 hover:text-white' : 'text-slate-500 hover:bg-slate-100'}`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 flex-1 flex flex-col gap-4 overflow-y-auto">
               <div className="flex flex-col gap-2 mt-2">
                 <button 
                    onClick={() => { onNavigate('home'); setIsMobileMenuOpen(false); }}
                    className={`flex items-center gap-3 w-full p-3 rounded-xl transition-colors ${isDark ? 'text-slate-300 hover:bg-slate-800 hover:text-white' : 'text-slate-700 hover:bg-slate-100'} ${currentPage === 'home' ? (isDark ? 'bg-slate-800/50 text-burgundy-400' : 'bg-burgundy-50 text-burgundy-600') : ''}`}
                 >
                   <Home className="w-5 h-5" />
                   <span className="font-bold">{t('home')}</span>
                 </button>
                 <button 
                    onClick={() => { onNavigate('faq'); setIsMobileMenuOpen(false); }}
                    className={`flex items-center gap-3 w-full p-3 rounded-xl transition-colors ${isDark ? 'text-slate-300 hover:bg-slate-800 hover:text-white' : 'text-slate-700 hover:bg-slate-100'} ${currentPage === 'faq' ? (isDark ? 'bg-slate-800/50 text-burgundy-400' : 'bg-burgundy-50 text-burgundy-600') : ''}`}
                 >
                   <ShieldCheck className="w-5 h-5 text-burgundy-500" />
                   <span className="font-bold">المساعدة (FAQ)</span>
                 </button>
                 {isLoggedIn && (
                   <>
                    <button 
                       onClick={() => { onNavigate('profile'); setIsMobileMenuOpen(false); }}
                       className={`flex items-center gap-3 w-full p-3 rounded-xl transition-colors ${isDark ? 'text-slate-300 hover:bg-slate-800 hover:text-white' : 'text-slate-700 hover:bg-slate-100'} ${currentPage === 'profile' ? (isDark ? 'bg-slate-800/50 text-burgundy-400' : 'bg-burgundy-50 text-burgundy-600') : ''}`}
                    >
                      <User className="w-5 h-5 text-burgundy-500" />
                      <span className="font-bold">{t('profile')}</span>
                    </button>
                    <button 
                       onClick={() => { onNavigate('my-courses'); setIsMobileMenuOpen(false); }}
                       className={`flex items-center gap-3 w-full p-3 rounded-xl transition-colors ${isDark ? 'text-slate-300 hover:bg-slate-800 hover:text-white' : 'text-slate-700 hover:bg-slate-100'} ${currentPage === 'my-courses' ? (isDark ? 'bg-slate-800/50 text-burgundy-400' : 'bg-burgundy-50 text-burgundy-600') : ''}`}
                    >
                      <BookOpen className="w-5 h-5 text-burgundy-500" />
                      <span className="font-bold">{t('myCourses')}</span>
                    </button>
                   </>
                 )}
               </div>
            </div>

            <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-3">
              {!isLoggedIn ? (
                <>
                  {currentPage !== 'login' && (
                    <button 
                      onClick={() => { onNavigate('login'); setIsMobileMenuOpen(false); }}
                        className={`flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl font-bold transition-all ${isDark ? 'text-slate-200 bg-slate-800 hover:bg-slate-700' : 'text-slate-700 bg-slate-100 hover:bg-slate-200'}`}
                      >
                        <LogIn className="w-5 h-5" />
                        <span>{t('login')}</span>
                      </button>
                    )}
                    {currentPage !== 'register' && (
                       <button 
                         onClick={() => { onNavigate('register'); setIsMobileMenuOpen(false); }}
                         className={`flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl font-bold transition-all bg-gradient-to-r from-burgundy-500 to-burgundy-600 hover:from-burgundy-600 hover:to-burgundy-700 text-white shadow-lg shadow-burgundy-500/30`}
                       >
                         <UserPlus className="w-5 h-5" />
                         <span>{t('register')}</span>
                       </button>
                    )}
                  </>
                ) : (
                   <button 
                     onClick={() => { onLogout && onLogout(); setIsMobileMenuOpen(false); }}
                     className={`flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl font-bold transition-all text-red-500 bg-red-50 hover:bg-red-100 dark:bg-red-500/10 dark:hover:bg-red-500/20`}
                   >
                     <LogOut className="w-5 h-5" />
                     <span>{t('logout')}</span>
                   </button>
                )}
              </div>
          </motion.div>
        </div>
      )}
      </AnimatePresence>
    </>
  );
}
