import eshrahLogo from '../../assets/images/eshrah_teb_typography_logo_1783527059225.jpg';
import { Page } from '../../App';
import { useLanguage } from '../../context/LanguageContext';
import { motion } from 'motion/react';
import { ArrowLeft, Dna } from 'lucide-react';

interface HeroProps {
  onNavigate: (page: Page) => void;
  isLoggedIn: boolean;
}

export default function Hero({ onNavigate, isLoggedIn }: HeroProps) {
  const { t } = useLanguage();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, type: "spring" as const, bounce: 0.4 } }
  };

  return (
    <section className="relative pt-32 pb-32 overflow-hidden bg-burgundy-500 flex flex-col items-center min-h-[90vh] justify-center rounded-b-[3rem] sm:rounded-b-[5rem] shadow-2xl mb-12">
      {/* Background decorations */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-burgundy-500 rounded-full blur-[120px] -z-10 opacity-50"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-burgundy-700 rounded-full blur-[100px] -z-10 opacity-50"></div>
      
      <div className="absolute top-1/4 left-10 text-white/10 hidden md:block">
         <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
      </div>
      <div className="absolute bottom-1/4 right-20 text-white/10 hidden md:block">
         <svg width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>
      </div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
      >
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-8">
          
          {/* Text Content (Right Side visually in RTL) */}
          <div className="flex-1 flex flex-col items-center lg:items-start text-center lg:text-start lg:pl-10 order-2 lg:order-1">
            <motion.h1 variants={itemVariants} className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black mb-6 text-white tracking-tight leading-tight drop-shadow-md">
              رحلتك في الطب تبدأ من هنا... افهم أعمق، وتفوق أسرع
            </motion.h1>
            
            <motion.p variants={itemVariants} className="text-white/90 mb-10 max-w-xl font-medium text-lg md:text-xl leading-relaxed drop-shadow-sm">
              منصة إشرحــ طب بتوفرلك تجربة تعليمية متكاملة بأسلوب مبسط وممتع، عشان تستوعب أصعب المواد الطبية بكل سهولة وتوصل لقمة التفوق.
            </motion.p>

            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 w-full justify-center lg:justify-start">
              {isLoggedIn ? (
                <motion.button 
                  onClick={() => onNavigate('my-courses')}
                  className="bg-white text-burgundy-600 px-10 py-4 rounded-2xl font-black text-lg md:text-xl shadow-xl hover:shadow-[0_10px_30px_rgba(255,255,255,0.3)] flex items-center justify-center gap-2 group transition-all duration-300 transform hover:-translate-y-1"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {t('myCourses')}
                  <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                </motion.button>
              ) : (
                <motion.button 
                  onClick={() => onNavigate('register')}
                  className="bg-white text-burgundy-600 px-10 py-4 rounded-2xl font-black text-lg md:text-xl shadow-xl hover:shadow-[0_10px_30px_rgba(255,255,255,0.3)] flex items-center justify-center gap-2 group transition-all duration-300 transform hover:-translate-y-1"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  انشئ حسابك الآن
                  <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                </motion.button>
              )}
            </motion.div>
          </div>

          {/* Image/Visual (Left Side visually in RTL) */}
          <motion.div variants={itemVariants} className="flex-1 w-full max-w-[320px] md:max-w-md lg:max-w-lg relative order-1 lg:order-2 flex justify-center" animate={{ y: [0, -15, 0] }} transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}>
            <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-white/5 rounded-full blur-3xl opacity-50"></div>
            <div className="relative z-10 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.4)] hover:shadow-[0_20px_60px_rgba(255,255,255,0.2)] border-4 border-white/30 transform hover:scale-[1.03] transition-all duration-500 overflow-hidden w-full aspect-square max-w-[280px] sm:max-w-[320px] md:max-w-[380px] bg-white group">
              <img src={eshrahLogo} alt="إشرح طب" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
            </div>
          </motion.div>
          
        </div>
      </motion.div>
    </section>
  );
}
