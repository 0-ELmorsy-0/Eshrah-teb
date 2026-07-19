import React, { useState } from 'react';
import { ArrowRight, CreditCard, Send, CheckCircle2, ShieldCheck, AlertCircle, Phone } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface PaymentProps {
  onNavigate: (page: string) => void;
}

export default function Payment({ onNavigate }: PaymentProps) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ text: '', isError: false });
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!phoneNumber || !amount) {
      setMessage({ text: 'يرجى إدخال رقم الهاتف والمبلغ', isError: true });
      return;
    }

    if (phoneNumber.length < 11) {
      setMessage({ text: 'يرجى إدخال رقم هاتف صحيح', isError: true });
      return;
    }

    setIsSubmitting(true);
    setMessage({ text: '', isError: false });

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setMessage({ text: 'يجب تسجيل الدخول أولاً', isError: true });
        setIsSubmitting(false);
        return;
      }

      // Insert into charge_requests table
      const { error } = await supabase.from('charge_requests').insert({
        student_id: session.user.id,
        sender_phone: phoneNumber,
        amount: parseFloat(amount),
        status: 'pending'
      });

      if (error) throw error;

      setIsSuccess(true);
      setMessage({ text: 'تم إرسال طلبك بنجاح، سيتم مراجعته وإضافة الرصيد قريباً', isError: false });
      
    } catch (error: any) {
      console.error('Error submitting charge request:', error);
      setMessage({ text: error.message || 'حدث خطأ أثناء إرسال الطلب، يرجى المحاولة مرة أخرى', isError: true });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pt-8 pb-12 font-sans transition-colors">
      <div className="max-w-3xl mx-auto px-4">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button 
            onClick={() => onNavigate('profile')}
            className="w-10 h-10 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center shadow-sm border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-burgundy-600 transition-colors"
          >
            <ArrowRight className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
            شحن المحفظة (فودافون كاش)
          </h1>
        </div>

        {isSuccess ? (
          <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-md rounded-[2.5rem] p-8 shadow-2xl border border-emerald-200/50 dark:border-emerald-900/50 text-center animate-in fade-in zoom-in duration-500 relative overflow-hidden">
             <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-10 h-10 text-emerald-500" />
             </div>
             <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-4">تم إرسال طلب الشحن بنجاح</h2>
             <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-md mx-auto">
                تم استلام بيانات التحويل الخاصة بك. سيقوم فريق الدعم بمراجعة التحويل وإضافة الرصيد إلى محفظتك في أقرب وقت.
             </p>
             <button 
                onClick={() => onNavigate('profile')}
                className="px-8 py-3 bg-burgundy-600 hover:bg-burgundy-700 text-white font-bold rounded-xl transition-colors shadow-lg shadow-burgundy-600/20"
             >
                العودة للمحفظة
             </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-5 gap-6">
            
            {/* Instructions Side */}
            <div className="md:col-span-2 space-y-4">
              <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-3xl p-6 text-white shadow-lg shadow-red-500/20 relative overflow-hidden">
                <div className="absolute -right-6 -top-6 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                <div className="relative z-10">
                  <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-md">
                    <CreditCard className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-4">تعليمات الدفع</h3>
                  <p className="text-red-50 mb-6 text-sm leading-relaxed">
                    قم بتحويل المبلغ الذي تريده لشحن محفظتك على رقم فودافون كاش التالي:
                  </p>
                  <div className="bg-white/20 rounded-xl p-4 backdrop-blur-sm border border-white/30 text-center mb-4">
                    <span className="block text-red-100 text-xs mb-1">رقم فودافون كاش</span>
                    <span className="font-mono text-2xl font-black tracking-wider">01017967936</span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-200/50 dark:bg-slate-800/50 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                  تأكد من الاحتفاظ برسالة تأكيد التحويل في حال طلبها للمراجعة.
                </p>
              </div>
            </div>

            {/* Form Side */}
            <div className="md:col-span-3 bg-white dark:bg-slate-800 rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200 dark:border-slate-700">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6">تأكيد التحويل</h3>
              
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                    رقم الهاتف المحول منه
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                      <Phone className="w-5 h-5 text-slate-400" />
                    </div>
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="أدخل رقم الموبايل (مثال: 010xxxxxxxx)"
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl py-3 pr-12 pl-4 text-slate-800 dark:text-white focus:border-burgundy-500 focus:outline-none transition-colors dir-ltr font-mono text-right"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                    المبلغ المحول (ج.م)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                      <span className="font-bold text-slate-400">ج.م</span>
                    </div>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="أدخل المبلغ الذي قمت بتحويله"
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl py-3 pr-12 pl-4 text-slate-800 dark:text-white focus:border-burgundy-500 focus:outline-none transition-colors text-right"
                    />
                  </div>
                </div>

                {message.text && (
                  <div className={`p-4 rounded-xl text-sm font-bold ${message.isError ? 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400' : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400'}`}>
                    {message.text}
                  </div>
                )}

                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 bg-burgundy-600 hover:bg-burgundy-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-burgundy-600/20 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <span>إرسال طلب الشحن</span>
                      <Send className="w-5 h-5 rotate-180" />
                    </>
                  )}
                </button>
                
                <div className="flex items-center justify-center gap-2 text-sm text-slate-500 dark:text-slate-400 pt-2">
                   <ShieldCheck className="w-4 h-4 text-burgundy-500" />
                   <span>معلوماتك مشفرة ومحمية بالكامل</span>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
