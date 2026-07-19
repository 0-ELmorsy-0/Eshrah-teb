import { useState, useEffect } from 'react';
import Navbar from './components/layout/Navbar';
import Hero from './components/home/Hero';
import Courses from './components/home/Courses';
import Features from './components/home/Features';
import Grades from './components/home/Grades';
import TopStudents from './components/home/TopStudents';
import Footer from './components/layout/Footer';
import Login from './pages/Login';
import Register from './pages/Register';
import CourseDetails from './pages/CourseDetails';
import MyCourses from './pages/MyCourses';
import Profile from './pages/Profile';
import Payment from './pages/Payment';
import AlertBanner from './components/ui/AlertBanner';
import CountdownTimer from './components/ui/CountdownTimer';
import LiveChat from './components/ui/LiveChat';
import FAQ from './pages/FAQ';

import { Toaster } from 'react-hot-toast';
import SplashScreen from './components/ui/SplashScreen';
import { supabase } from './lib/supabase';
import { motion, AnimatePresence } from 'motion/react';

export type CourseData = {
  id?: string | number;
  title: string;
  image: string;
  price?: string;
  features: string[];
  createdAt?: string;
  endDate?: string;
};

const FadeInView = ({ children, delay = 0 }: { children: React.ReactNode, delay?: number }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.98 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
};

export type Page = 'home' | 'login' | 'register' | 'course-details' | 'my-courses' | 'profile' | 'payment' | 'faq';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>(() => {
    return (localStorage.getItem('app_current_page') as Page) || 'home';
  });
  const [selectedCourse, setSelectedCourse] = useState<CourseData | null>(() => {
    try {
      const saved = localStorage.getItem('app_selected_course');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [isDark, setIsDark] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userSemester, setUserSemester] = useState<string>(() => {
    return localStorage.getItem('app_user_semester') || 'Semester 1';
  });
  const [showSplash, setShowSplash] = useState(() => {
    const today = new Date().toDateString();
    const lastShown = localStorage.getItem('splash_shown_date');
    if (lastShown === today) {
      return false;
    }
    return true;
  });
  const [fadeSplash, setFadeSplash] = useState(false);
  const [isAppLoading, setIsAppLoading] = useState(true);

  useEffect(() => {
    localStorage.setItem('app_current_page', currentPage);
  }, [currentPage]);

  useEffect(() => {
    if (selectedCourse) {
      localStorage.setItem('app_selected_course', JSON.stringify(selectedCourse));
    } else {
      localStorage.removeItem('app_selected_course');
    }
  }, [selectedCourse]);

  useEffect(() => {
    localStorage.setItem('app_user_semester', userSemester);
  }, [userSemester]);

  useEffect(() => {
    // Check initial session
    supabase.auth.getSession().then(async ({ data: { session }, error }) => {
      if (session) {
        setIsLoggedIn(true);
        // Fetch user academic year
        try {
          const { data } = await supabase.from('students').select('academic_year').eq('id', session.user.id).single();
          if (data?.academic_year) {
            setUserSemester(data.academic_year);
          }
        } finally {
          setIsAppLoading(false);
        }
      } else {
        setIsAppLoading(false);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        setIsLoggedIn(true);
        const { data } = await supabase.from('students').select('academic_year').eq('id', session.user.id).single();
        if (data?.academic_year) {
          setUserSemester(data.academic_year);
        }
      } else {
        setIsLoggedIn(false);
        setCurrentPage('home');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!showSplash) return;
    const splashTimer = setTimeout(() => {
      setFadeSplash(true);
      setTimeout(() => {
        setShowSplash(false);
        localStorage.setItem('splash_shown_date', new Date().toDateString());
      }, 500); // Wait for fade out animation
    }, 2000); // 2 seconds display
    
    return () => clearTimeout(splashTimer);
  }, [showSplash]);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentPage]);

  const handleNavigate = (page: Page, course?: CourseData) => {
    if (course) {
      setSelectedCourse(course);
    }
    setCurrentPage(page);
  };

  const handleAuth = (semester: string = "Semester 1") => {
    setIsLoggedIn(true);
    setUserSemester(semester);
    setCurrentPage('home');
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.error('Logout error:', e);
    }
    
    setIsLoggedIn(false);
      setUserSemester('Semester 1');
      localStorage.removeItem('app_user_semester');
      setCurrentPage('home');
  };

  if (isAppLoading) {
    return <SplashScreen isFadingOut={false} />;
  }

    return (
    <div className={`min-h-screen flex flex-col font-sans overflow-x-hidden transition-colors duration-500`}>
      <AnimatePresence>
        {showSplash && <SplashScreen isFadingOut={fadeSplash} />}
      </AnimatePresence>
      <Toaster position="top-center" />
      <CountdownTimer />
      <AlertBanner userSemester={userSemester} isLoggedIn={isLoggedIn} />
      <Navbar 
        currentPage={currentPage} 
        onNavigate={handleNavigate} 
        isDark={isDark} 
        setIsDark={setIsDark} 
        isLoggedIn={isLoggedIn} 
        onLogout={handleLogout}
      />
      
      <AnimatePresence mode="wait">
        <motion.div
          key={currentPage}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.4 }}
          className="flex-1 flex flex-col"
        >
          {currentPage === 'home' && (
            <div className="flex-1 flex flex-col ">
              
              <Hero onNavigate={handleNavigate} isLoggedIn={isLoggedIn} />
              <FadeInView delay={0.1}>
                <Courses onNavigate={handleNavigate} isLoggedIn={isLoggedIn} userSemester={userSemester} />
              </FadeInView>
              {!isLoggedIn && (
                <>
                  <FadeInView delay={0.2}>
                    <Features />
                  </FadeInView>
                  <FadeInView delay={0.3}>
                    <Grades />
                  </FadeInView>
                </>
              )}
              <FadeInView delay={0.4}>
                <TopStudents />
              </FadeInView>
            </div>
          )}

          {currentPage === 'course-details' && (
            <div className="flex-1 flex flex-col ">
              <CourseDetails course={selectedCourse} isLoggedIn={isLoggedIn} onNavigate={handleNavigate} />
            </div>
          )}

          {currentPage === 'my-courses' && (
            <div className="flex-1 flex flex-col ">
              <MyCourses onNavigate={handleNavigate} userSemester={userSemester} />
            </div>
          )}

          {currentPage === 'profile' && (
            <div className="flex-1 flex flex-col ">
              <Profile onNavigate={handleNavigate} />
            </div>
          )}

          {currentPage === 'payment' && (
            <div className="flex-1 flex flex-col">
              <Payment onNavigate={handleNavigate} />
            </div>
          )}

          {currentPage === 'login' && (
            <div className="flex-1 flex flex-col pt-24 pb-12 px-4 max-w-[1400px] w-full mx-auto justify-center">
              <Login onNavigate={handleNavigate} onAuth={handleAuth} />
            </div>
          )}
          
          {currentPage === 'register' && (
            <div className="flex-1 flex flex-col pt-24 pb-12 px-4 max-w-[1400px] w-full mx-auto justify-center">
              <Register onNavigate={handleNavigate} onAuth={handleAuth} />
            </div>
          )}

          {currentPage === 'faq' && (
            <div className="flex-1 flex flex-col ">
              <FAQ />
            </div>
          )}

          {/* 404 Fallback */}
          {!['home', 'login', 'register', 'course-details', 'my-courses', 'profile', 'payment', 'faq'].includes(currentPage) && (
            <div className="flex-1 flex flex-col items-center justify-center pt-32 pb-12 px-4 text-center">
              <motion.h1 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-6xl font-black text-slate-800 dark:text-white mb-4"
              >
                404
              </motion.h1>
              <p className="text-xl text-slate-600 dark:text-slate-400 mb-8">الصفحة التي تبحث عنها غير موجودة.</p>
              <button 
                onClick={() => handleNavigate('home')}
                className="bg-burgundy-500 hover:bg-burgundy-600 text-white font-bold py-3 px-8 rounded-xl transition-colors"
              >
                العودة للرئيسية
              </button>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <FadeInView>
        <Footer onNavigate={handleNavigate} />
      </FadeInView>
      <LiveChat isLoggedIn={isLoggedIn} />
    </div>
  );
}
