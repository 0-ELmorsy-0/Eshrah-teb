import { CheckCircle2, ChevronLeft, ChevronRight, PlayCircle, GraduationCap, Video, FileText, List, Folder, Pin, UserPlus, Eye, CalendarDays, CheckSquare } from 'lucide-react';
import { Page } from '../../App';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../../context/LanguageContext';
import AuthPromptModal from '../ui/AuthPromptModal';
import { supabase } from '../../lib/supabase';
import { useWallet } from '../../hooks/useWallet';


function formatDate(dateStr: string) {
  if (!dateStr) return 'الجمعة ٢٧ مارس ٢٠٢٦ - ١٢:٢١ ص';
  try {
    const d = new Date(dateStr);
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
    const datePart = d.toLocaleDateString('ar-EG', options);
    let hours = d.getHours();
    const ampm = hours >= 12 ? 'م' : 'ص';
    hours = hours % 12;
    hours = hours ? hours : 12; 
    const minutes = d.getMinutes().toString().padStart(2, '0');
    return `${datePart} - ${hours}:${minutes} ${ampm}`;
  } catch(e) {
    return dateStr;
  }
}

interface CoursesProps {
  onNavigate?: (page: Page, course?: any) => void;
  isLoggedIn?: boolean;
  userSemester?: string;
}



function CourseCard({ course, isFree, onNavigate, isLoggedIn, setShowAuthModal, hasSubscription, t }: any) {
  const isSubscribed = !isFree && hasSubscription(course.id);
  const [stats, setStats] = useState({ videos: 0, exams: 0, assignments: 0, files: 0, hours: 0 });

  useEffect(() => {
    async function fetchStats() {
      if (!course?.id) return;
      try {
        const [
          { count: examsCount },
          { count: assignmentsCount },
          { data: subjects }
        ] = await Promise.all([
          supabase.from('exams').select('*', { count: 'exact', head: true }).eq('course_id', course.id),
          supabase.from('assignments').select('*', { count: 'exact', head: true }).eq('course_id', course.id),
          supabase.from('course_subjects').select('id').eq('course_id', course.id)
        ]);

        let videoCount = 0;
        let fileCount = 0;
        
        if (subjects && subjects.length > 0) {
          const subjectIds = subjects.map(s => s.id);
          const { data: modules } = await supabase.from('course_modules').select('type').in('subject_id', subjectIds);
          if (modules) {
            modules.forEach((m: any) => {
              if (m.type === 'video') videoCount++;
              else if (m.type === 'pdf') fileCount++;
            });
          }
        }
        
        setStats({
          videos: videoCount || 0,
          exams: examsCount || 0,
          assignments: assignmentsCount || 0,
          files: fileCount || 0,
          hours: videoCount ? videoCount * 1.5 : 0
        });
      } catch (err) {
        console.error("Failed to fetch stats", err);
      }
    }
    fetchStats();
  }, [course?.id]);
  const badgeText = isFree ? 'كورس مجاني' : 'كورس جديد';
  const badgeColor = isFree ? 'bg-emerald-500' : 'bg-yellow-500';
  const headerColor = isFree ? 'bg-emerald-500' : 'bg-[#e5b32f]';
  const priceLabel = course.price ? parseInt(course.price) : (isFree ? '0' : '250');

  return (
    <div className="bg-white dark:bg-slate-800 rounded-[2rem] overflow-hidden shadow-lg border border-gray-100 dark:border-slate-700 flex flex-col relative w-full transform hover:-translate-y-2 transition-all duration-300 hover:shadow-2xl">
      {/* Image & Top Ribbon */}
      <div className="relative">
        <div className="w-full aspect-[4/3]">
           <img src={course.image} className="w-full h-full object-cover" alt={course.title} />
        </div>
        <div className={`absolute top-0 right-0 ${badgeColor} text-white font-bold px-8 py-1.5 transform rotate-45 translate-x-8 translate-y-5 shadow-md`} style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)' }}>
          {badgeText}
        </div>
        
        {/* Pill: Subject & Semester - positioned perfectly at the bottom of the image */}
        <div className={`absolute -bottom-4 left-1/2 -translate-x-1/2 ${headerColor} text-slate-900 font-bold px-6 py-1.5 rounded-xl z-10 w-max shadow-md text-sm`}>
          {course.semester}
        </div>
      </div>

      <div className="pt-10 px-4 sm:px-6 pb-6 flex flex-col items-center flex-1">
        <h3 className="text-xl font-bold text-slate-800 dark:text-white text-center mb-2">{course.title}</h3>
        
        <div className={`${badgeColor} text-white text-[11px] font-bold px-3 py-1 rounded flex items-center gap-1 mb-4`}>
           <Pin className="w-3 h-3" /> {badgeText}
        </div>
        
        <p className="text-sm text-slate-500 dark:text-slate-400 text-center mb-6 line-clamp-2 min-h-[40px]">
          {course.description || "أفضل الكورسات المتاحة حاليا على منصة إشرح طب لتعزيز مسيرتك الأكاديمية"}
        </p>

        {/* Features Grid */}
        <div className="grid grid-cols-2 gap-3 w-full mb-6 flex-1">
          <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl py-2.5 px-3 flex items-center justify-between">
            <span className="text-[13px] font-bold text-slate-700 dark:text-slate-300">{stats.videos} محاضرة</span>
            <Video className="w-4 h-4 text-[#1390d4]" />
          </div>
          <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl py-2.5 px-3 flex items-center justify-between">
            <span className="text-[13px] font-bold text-slate-700 dark:text-slate-300">{stats.exams} امتحان</span>
            <FileText className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl py-2.5 px-3 flex items-center justify-between">
            <span className="text-[13px] font-bold text-slate-700 dark:text-slate-300">{stats.assignments} واجب</span>
            <CheckSquare className="w-4 h-4 text-purple-500" />
          </div>
          <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl py-2.5 px-3 flex items-center justify-between">
            <span className="text-[13px] font-bold text-slate-700 dark:text-slate-300">{stats.files} ملف</span>
            <Folder className="w-4 h-4 text-yellow-500" />
          </div>
          <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl py-2.5 px-3 flex items-center justify-center col-span-2 gap-2">
            <span className="text-[13px] font-bold text-slate-700 dark:text-slate-300">{stats.hours > 0 ? stats.hours : 10.5} ساعة</span>
            <CalendarDays className="w-4 h-4 text-red-500" />
          </div>
        </div>

        {/* Price section */}
        <div className="w-full bg-slate-50 dark:bg-slate-700/30 rounded-2xl p-4 flex flex-col items-center relative mb-6 border border-slate-100 dark:border-slate-700 overflow-hidden shrink-0 mt-auto">
          <div className="absolute top-0 right-0 bg-[#1390d4] text-white text-xs font-bold w-16 h-16 flex items-start justify-end p-1.5" style={{clipPath: 'polygon(100% 0, 0 0, 100% 100%)'}}>
             <span className="transform rotate-45 translate-x-1 -translate-y-2">السعر</span>
          </div>

          <div className="flex items-end gap-1 mb-2">
            <span className="text-3xl font-black text-slate-800 dark:text-white">{priceLabel}</span>
            <span className="text-red-500 font-bold mb-1">جنيه</span>
          </div>
          <div className="bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold px-4 py-1.5 rounded w-full text-center">
            السعر النهائي شامل الضرائب
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 w-full shrink-0 mb-5">
          <button 
            onClick={() => {
              if (isLoggedIn) onNavigate('course-details', { ...course, isFree });
              else setShowAuthModal(true);
            }}
            className="flex-1 bg-white dark:bg-slate-800 border-2 border-[#1390d4] text-[#1390d4] hover:bg-blue-50 dark:hover:bg-slate-700 font-bold py-2 rounded-lg flex items-center justify-center gap-1.5 transition-colors text-sm"
          >
            <Eye className="w-4 h-4" /> عرض المحتوى
          </button>
          {!isSubscribed && !isFree ? (
            <button 
              onClick={() => {
                if (isLoggedIn) onNavigate('course-details', course);
                else setShowAuthModal(true);
              }}
              className="flex-1 bg-[#ef4444] hover:bg-red-600 text-white font-bold py-2.5 rounded-lg flex items-center justify-center gap-1.5 transition-colors text-sm"
            >
              <UserPlus className="w-4 h-4" /> اشترك الان
            </button>
          ) : (
            <button 
              className="flex-1 bg-emerald-500 text-white font-bold py-2.5 rounded-lg flex items-center justify-center gap-1.5 text-sm cursor-default"
            >
              <CheckCircle2 className="w-4 h-4" /> مشترك
            </button>
          )}
        </div>

        {/* Date */}
        <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-[10px] font-medium w-full justify-center shrink-0">
          <CalendarDays className="w-3.5 h-3.5 text-yellow-500" /> 
          تاريخ الكورس : {formatDate(course.createdAt || course.end_date)}
        </div>
      </div>
    </div>
  );
}



function MobileFadeCarousel({ items, activeIndex, setActiveIndex, isFree, onNavigate, isLoggedIn, setShowAuthModal, hasSubscription, t }: any) {
  if (!items || items.length === 0) return null;
  const item = items[activeIndex] || items[0];
  
  return (
    <div className="relative w-full max-w-[90%] mx-auto py-4">
      <div className="relative w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={item.id || activeIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="w-full"
          >
            <CourseCard course={item} isFree={isFree} onNavigate={onNavigate} isLoggedIn={isLoggedIn} setShowAuthModal={setShowAuthModal} hasSubscription={hasSubscription} t={t} />
          </motion.div>
        </AnimatePresence>
      </div>

      <button 
        onClick={() => setActiveIndex((activeIndex - 1 + items.length) % items.length)}
        className="absolute -right-4 top-1/2 -translate-y-1/2 z-30 p-2 bg-white dark:bg-slate-800 shadow-xl border border-gray-100 dark:border-slate-700 rounded-full text-slate-400 hover:text-burgundy-500 transition-all"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      <button 
        onClick={() => setActiveIndex((activeIndex + 1) % items.length)}
        className="absolute -left-4 top-1/2 -translate-y-1/2 z-30 p-2 bg-white dark:bg-slate-800 shadow-xl border border-gray-100 dark:border-slate-700 rounded-full text-slate-400 hover:text-burgundy-500 transition-all"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
    </div>
  );
}

export default function Courses({ onNavigate, isLoggedIn, userSemester }: CoursesProps) {
  const { t } = useLanguage();
  const { hasSubscription } = useWallet();
  const [semestersList, setSemestersList] = useState<string[]>([]);
  const [selectedSemester, setSelectedSemester] = useState(userSemester || "");
  const [activeIndex, setActiveIndex] = useState(0);
  const [activeFreeIndex, setActiveFreeIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [dbCourses, setDbCourses] = useState<any[]>([]);
  const [dbFreeCourses, setDbFreeCourses] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function fetchData() {
      if (import.meta.env.VITE_SUPABASE_URL && !import.meta.env.VITE_SUPABASE_URL.includes('placeholder')) {
        let allSemesters = new Set<string>();

        try {
          const { data, error } = await supabase.from('paycourses').select('*');
          if (error) {
            console.error("Error fetching from supabase:", error);
          } else if (data && data.length > 0) {
            const mappedCourses = data.map((d: any) => {
              if (d.semester) allSemesters.add(d.semester.trim());
              return {
                image: d.image_url || "https://images.unsplash.com/photo-1532094349884-543bc11b234d?q=80&w=800&auto=format&fit=crop",
                title: d.title,
                description: d.description,
                features: Array.isArray(d.features) ? d.features : [d.description || ""],
                price: d.price ? `${d.price} ج.م` : "250 ج.م",
                semester: d.semester ? d.semester.trim() : "",
                id: d.id,
                createdAt: d.created_at,
                endDate: d.end_date
              };
            });
            setDbCourses(mappedCourses);
          }
        } catch (err) {
          console.error("Failed to fetch paycourses", err);
        }

        try {
          const { data: freeData, error: freeError } = await supabase.from('freecourses').select('*');
          if (freeError) {
            console.error("Error fetching free courses from supabase:", freeError);
          } else if (freeData && freeData.length > 0) {
            const mappedFreeCourses = freeData.map((d: any) => {
              if (d.semester) allSemesters.add(d.semester.trim());
              return {
                image: d.image_url || "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=800&auto=format&fit=crop",
                title: d.title,
                features: Array.isArray(d.features) ? d.features : [d.description || ""],
                semester: d.semester ? d.semester.trim() : "",
                id: d.id,
                createdAt: d.created_at,
                endDate: d.end_date
              };
            });
            setDbFreeCourses(mappedFreeCourses);
          }
        } catch (err) {
          console.error("Failed to fetch freecourses", err);
        }

        const uniqueSemesters = Array.from(allSemesters);
        if (uniqueSemesters.length > 0) {
          setSemestersList(uniqueSemesters);
          if (!userSemester) {
             setSelectedSemester(uniqueSemesters[0]);
          }
        }
      }
    }
    fetchData();
  }, []);

  useEffect(() => {
    if (isLoggedIn && userSemester && semestersList.includes(userSemester)) {
      setSelectedSemester(userSemester);
    }
  }, [isLoggedIn, userSemester]);

  const courses = dbCourses.filter(c => c.semester === selectedSemester && c.title.toLowerCase().includes(searchQuery.toLowerCase()));
  const freeCourses = dbFreeCourses.filter(c => c.semester === selectedSemester && c.title.toLowerCase().includes(searchQuery.toLowerCase()));

  useEffect(() => {
    setActiveIndex(0);
    setActiveFreeIndex(0);
  }, [selectedSemester, searchQuery]);

  useEffect(() => {
    if (courses.length === 0) return;
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % courses.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [courses.length]);

  const validActiveIndex = activeIndex < courses.length ? activeIndex : 0;
  const course = courses[validActiveIndex];

  const validActiveFreeIndex = activeFreeIndex < freeCourses.length ? activeFreeIndex : 0;
  const freeCourse = freeCourses[validActiveFreeIndex];

  return (
    <section className="px-4 py-20 bg-slate-50 dark:bg-[#0b121c] relative flex flex-col gap-16">
      
      {/* Search Bar */}
      <div className="max-w-xl mx-auto w-full px-4 mb-4">
        <input 
          type="text"
          placeholder="ابحث عن كورس معين..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-2xl py-3 px-6 text-slate-800 dark:text-white placeholder-slate-400 focus:border-burgundy-500 dark:focus:border-burgundy-500 focus:outline-none shadow-sm transition-colors text-center font-bold"
        />
      </div>

      {/* Semester Selector */}
      {!isLoggedIn && (
        <div className="max-w-4xl mx-auto w-full mb-8">
          <div className="flex flex-col items-center mb-8">
             <div className="bg-burgundy-50 dark:bg-burgundy-900/40 p-3 rounded-2xl flex items-center justify-center gap-3 mb-4 shadow-sm border border-burgundy-200 dark:border-burgundy-800">
               <GraduationCap className="w-7 h-7 text-burgundy-600 dark:text-burgundy-400" />
               <h2 className="text-2xl font-black text-burgundy-900 dark:text-burgundy-300 tracking-tight">{t('chooseAcademicYear')}</h2>
             </div>
             <p className="text-slate-500 dark:text-slate-400 text-center max-w-md font-medium">{t('coursesCustomized')}</p>
          </div>
          
          <div className="flex flex-wrap items-center justify-center gap-4">
            {semestersList.map((sem) => (
              <button
                key={sem}
                onClick={() => setSelectedSemester(sem)}
                className={`px-8 py-4 rounded-2xl font-bold transition-all duration-300 text-lg ${
                  selectedSemester === sem 
                    ? 'bg-gradient-to-r from-burgundy-500 to-burgundy-600 text-white shadow-xl shadow-burgundy-500/30 scale-105 border-transparent' 
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-burgundy-50 dark:hover:bg-slate-700 shadow-sm hover:shadow-md'
                }`}
              >
                {sem}
              </button>
            ))}
          </div>
        </div>
      )}

      
      <div className="flex flex-col gap-16 px-4">
        {/* Premium Courses */}
        <div>
          <div className="w-full max-w-5xl mx-auto flex flex-col sm:flex-row items-center sm:items-end justify-between mb-12 gap-4 px-4">
            <div className="text-center sm:text-start flex-1">
               <h3 className="text-4xl md:text-5xl font-black text-[#0b121c] dark:text-white tracking-tight mb-2">
                 الكورسات <span className="text-burgundy-500">المقترحة</span>
               </h3>
               <p className="text-slate-500 dark:text-slate-400 font-medium text-lg mt-3">
                 ريحنا دماغك وجمعنا لك كورسات على مزاجك، مختارة بحب وعناية كأننا بنعمل شوبينج لأحسن شوية كورسات تساعدك وتنميك! ✨
               </p>
            </div>
          </div>

          {courses.length === 0 && (
            <div className="text-center p-8 bg-white dark:bg-slate-800/30 rounded-3xl max-w-md mx-auto shadow-sm border border-slate-100 dark:border-slate-700">
              <p className="text-slate-500 dark:text-slate-400 font-medium pb-2 text-lg">{t('noCoursesAvailable')}</p>
            </div>
          )}

          {courses.length > 0 && isMobile && (
            <>
              <MobileFadeCarousel items={courses} activeIndex={activeIndex} setActiveIndex={setActiveIndex} isFree={false} onNavigate={onNavigate} isLoggedIn={isLoggedIn} setShowAuthModal={setShowAuthModal} hasSubscription={hasSubscription} t={t} />
              <div className="flex justify-center gap-2 mt-6">
                {courses.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveIndex(idx)}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      activeIndex === idx 
                        ? 'w-8 bg-burgundy-500' 
                        : 'w-2 bg-gray-300 dark:bg-slate-700 hover:bg-gray-400 dark:hover:bg-slate-600'
                    }`}
                  />
                ))}
              </div>
            </>
          )}

          {courses.length > 0 && !isMobile && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-7xl mx-auto px-4">
              {courses.map((course, idx) => (
                <CourseCard key={idx} course={course} isFree={false} onNavigate={onNavigate} isLoggedIn={isLoggedIn} setShowAuthModal={setShowAuthModal} hasSubscription={hasSubscription} t={t} />
              ))}
            </div>
          )}
        </div>

        {/* Free Courses */}
        <div>
          <div className="w-full max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-center mb-12 gap-4 px-4">
            <div className="text-center">
               <h3 className="text-4xl md:text-5xl font-black text-[#0b121c] dark:text-white tracking-tight mb-2">
                 الكورسات <span className="text-emerald-500">المجانية</span>
               </h3>
            </div>
          </div>

          {freeCourses.length === 0 && (
            <div className="text-center p-8 bg-white dark:bg-slate-800/30 rounded-3xl max-w-md mx-auto shadow-sm border border-slate-100 dark:border-slate-700">
              <p className="text-slate-500 dark:text-slate-400 font-medium pb-2 text-lg">{t('noCoursesAvailable')}</p>
            </div>
          )}

          {freeCourses.length > 0 && isMobile && (
            <>
              <MobileFadeCarousel items={freeCourses} activeIndex={activeFreeIndex} setActiveIndex={setActiveFreeIndex} isFree={true} onNavigate={onNavigate} isLoggedIn={isLoggedIn} setShowAuthModal={setShowAuthModal} hasSubscription={hasSubscription} t={t} />
              <div className="flex justify-center gap-2 mt-6">
                {freeCourses.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveFreeIndex(idx)}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      activeFreeIndex === idx 
                        ? 'w-8 bg-emerald-500' 
                        : 'w-2 bg-gray-300 dark:bg-slate-700 hover:bg-gray-400 dark:hover:bg-slate-600'
                    }`}
                  />
                ))}
              </div>
            </>
          )}

          {freeCourses.length > 0 && !isMobile && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-7xl mx-auto px-4 mt-8">
              {freeCourses.map((course, idx) => (
                <CourseCard key={idx} course={course} isFree={true} onNavigate={onNavigate} isLoggedIn={isLoggedIn} setShowAuthModal={setShowAuthModal} hasSubscription={hasSubscription} t={t} />
              ))}
            </div>
          )}
        </div>
      </div>

      <AuthPromptModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)}
        onNavigate={onNavigate}
      />
    </section>
  );
}