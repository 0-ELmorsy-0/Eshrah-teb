import { Dna } from 'lucide-react';
import eshrahLogo from '../../assets/images/eshrah_teb_typography_logo_1783527059225.jpg';

interface SplashScreenProps {
  isFadingOut: boolean;
}

export default function SplashScreen({ isFadingOut }: SplashScreenProps) {
  return (
    <div 
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white dark:bg-[#0b121c] transition-opacity duration-500 ease-in-out ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      <div className="relative flex flex-col items-center animate-in fade-in zoom-in duration-700">
        <div className="relative mb-8 flex flex-row items-center justify-center gap-4">
          <div className="absolute inset-0 bg-burgundy-500/10 rounded-full animate-ping duration-1000 scale-150" />
          <img src={eshrahLogo} alt="إشرح طب" className="w-20 h-20 sm:w-28 sm:h-28 object-cover rounded-2xl relative z-10 group-hover:scale-110 transition-transform duration-700" />
          <span className="font-black text-5xl sm:text-6xl tracking-tight text-burgundy-500 dark:text-burgundy-400 relative z-10">إشرحــ طب</span>
          
        </div>

        <p className="text-slate-500 dark:text-slate-400 font-medium tracking-wide mt-2">
          المنصة الطبية الأسهل
        </p>

        <div className="mt-12 flex gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-burgundy-400 animate-[bounce_1s_infinite_0ms]" />
          <div className="w-2.5 h-2.5 rounded-full bg-burgundy-500 animate-[bounce_1s_infinite_150ms]" />
          <div className="w-2.5 h-2.5 rounded-full bg-burgundy-700 animate-[bounce_1s_infinite_300ms]" />
        </div>
      </div>
    </div>
  );
}
