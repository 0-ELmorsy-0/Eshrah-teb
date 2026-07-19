import React, { useState } from 'react';
import { ChevronDown, HelpCircle, Phone, BookOpen, ShieldCheck, Mail } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const faqs = [
  {
    category: "الحساب وتسجيل الدخول",
    icon: <ShieldCheck className="w-5 h-5" />,
    questions: [
      {
        q: "كيف يمكنني إنشاء حساب جديد؟",
        a: "يمكنك إنشاء حساب بالضغط على زر 'حساب جديد' في أعلى الشاشة، ثم ملء البيانات المطلوبة (الاسم، رقم الهاتف، كلمة المرور، والسنة الدراسية)."
      },
      {
        q: "نسيت كلمة المرور، ماذا أفعل؟",
        a: "حالياً، يرجى التواصل مع الدعم الفني عبر واتساب وسنقوم بمساعدتك في استعادة حسابك أو إعادة تعيين كلمة المرور."
      },
      {
        q: "تظهر لي رسالة 'مسجل دخول من جهاز آخر'؟",
        a: "المنصة تسمح بتسجيل الدخول من جهاز واحد فقط للحفاظ على خصوصية حسابك. إذا قمت بتغيير هاتفك أو قمت بتهيئة (فورمات) الجهاز، يرجى التواصل مع الدعم الفني لتفريغ الأجهزة المرتبطة بحسابك."
      }
    ]
  },
  {
    category: "شحن المحفظة والدفع",
    icon: <BookOpen className="w-5 h-5" />,
    questions: [
      {
        q: "كيف يمكنني شحن محفظتي؟",
        a: "يمكنك شحن المحفظة بالدخول إلى 'الملف الشخصي' ثم الضغط على زر 'شحن المحفظة'. ستحتاج إلى إدخال رقم المحفظة (فودافون كاش أو غيرها) الذي قمت بالتحويل منه، والمبلغ، ورقم عملية التحويل إذا أمكن."
      },
      {
        q: "كم يستغرق تأكيد الشحن؟",
        a: "عادة ما يتم مراجعة طلبات الشحن خلال فترة تتراوح بين ساعة إلى 24 ساعة كحد أقصى من قبل الإدارة."
      },
      {
        q: "حالة الشحن تظهر 'مرفوض'، لماذا؟",
        a: "قد يتم رفض الشحن إذا لم يتم استلام التحويل المالي أو إذا كان رقم المحفظة المدخل غير صحيح. تأكد من إتمام التحويل وتواصل مع الدعم للمساعدة."
      }
    ]
  },
  {
    category: "الدورات والدروس",
    icon: <HelpCircle className="w-5 h-5" />,
    questions: [
      {
        q: "كيف أشترك في دورة (كورس)؟",
        a: "بعد شحن المحفظة بنجاح، اذهب إلى صفحة الدورة التي تريدها واضغط على زر 'شراء' أو 'تسجيل'. سيتم خصم المبلغ من رصيد محفظتك وستفتح الدورة فوراً."
      },
      {
        q: "هل يمكنني مشاهدة الدروس أوفلاين (بدون إنترنت)؟",
        a: "حالياً الدروس تتطلب اتصالاً بالإنترنت لمشاهدتها. نحن نستخدم مشغل فيديو مخصص لحماية المحتوى وضمان أفضل جودة للمشاهدة."
      },
      {
        q: "الفيديو لا يعمل أو يقطع؟",
        a: "تأكد من جودة اتصالك بالإنترنت. إذا استمرت المشكلة، حاول تحديث الصفحة أو تغيير متصفح الإنترنت أو مسح الذاكرة المؤقتة (Cache) للمتصفح."
      }
    ]
  }
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<string | null>(null);

  const toggleQuestion = (id: string) => {
    setOpenIndex(openIndex === id ? null : id);
  };

  return (
    <div className="w-full bg-slate-50 dark:bg-slate-900 min-h-screen py-12 px-4" dir="rtl">
      <div className="max-w-4xl mx-auto space-y-12">
        
        <div className="text-center space-y-4">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center mx-auto mb-6"
          >
            <HelpCircle className="w-8 h-8" />
          </motion.div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white">
            مركز المساعدة والأسئلة الشائعة
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            ابحث عن إجابات لاستفساراتك حول كيفية استخدام المنصة، شحن المحفظة، وحل المشكلات الشائعة.
          </p>
        </div>

        <div className="space-y-8">
          {faqs.map((category, catIndex) => (
            <motion.div 
              key={catIndex}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: catIndex * 0.1 }}
              className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-[2rem] p-6 md:p-8 shadow-xl border border-slate-200/50 dark:border-slate-700/50 hover:shadow-2xl transition-all duration-500 relative overflow-hidden group"
            >
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-700/50">
                <div className="p-2 bg-slate-100 dark:bg-slate-700/50 rounded-xl text-blue-600 dark:text-blue-400">
                  {category.icon}
                </div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                  {category.category}
                </h2>
              </div>

              <div className="space-y-4">
                {category.questions.map((faq, qIndex) => {
                  const id = `${catIndex}-${qIndex}`;
                  const isOpen = openIndex === id;

                  return (
                    <div 
                      key={qIndex}
                      className={`border rounded-2xl transition-all duration-300 shadow-sm hover:shadow-md ${
                        isOpen 
                          ? 'border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-900/10' 
                          : 'border-slate-200 dark:border-slate-700 hover:border-blue-200 dark:hover:border-slate-600'
                      }`}
                    >
                      <button
                        onClick={() => toggleQuestion(id)}
                        className="w-full flex items-center justify-between p-4 md:p-5 text-right focus:outline-none"
                      >
                        <span className={`font-bold pr-2 ${isOpen ? 'text-blue-700 dark:text-blue-400' : 'text-slate-800 dark:text-slate-200'}`}>
                          {faq.q}
                        </span>
                        <ChevronDown 
                          className={`w-5 h-5 text-slate-400 transition-transform duration-300 flex-shrink-0 ${isOpen ? 'transform rotate-180 text-blue-600' : ''}`}
                        />
                      </button>
                      
                      <AnimatePresence>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: 'easeInOut' }}
                            className="overflow-hidden"
                          >
                            <div className="p-4 md:p-5 pt-0 text-slate-600 dark:text-slate-400 leading-relaxed pr-6 md:pr-7 border-t border-slate-100 dark:border-slate-700/50 mt-2 mx-4 pb-4">
                              {faq.a}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-blue-600 rounded-3xl p-8 text-center text-white relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
          <div className="relative z-10 space-y-6">
            <h3 className="text-2xl md:text-3xl font-bold">لم تجد إجابة لسؤالك؟</h3>
            <p className="text-blue-100 max-w-lg mx-auto">
              فريق الدعم الفني متواجد دائماً لمساعدتك في حل أي مشكلة قد تواجهك أثناء استخدام المنصة.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button 
                onClick={() => {
                  const chatBtn = document.querySelector('button[title="تواصل مع الدعم الفني"]') as HTMLButtonElement;
                  if (chatBtn) chatBtn.click();
                }}
                className="flex items-center gap-2 bg-white text-blue-600 px-6 py-3 rounded-full font-bold hover:scale-105 transition-transform"
              >
                <Phone className="w-5 h-5" />
                <span>تواصل مع الدعم المباشر</span>
              </button>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
