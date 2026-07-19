import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export function useWallet() {
  const [balance, setBalance] = useState(0);
  const [subscriptions, setSubscriptions] = useState<string[]>([]);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchWallet() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUserId(session.user.id);
        const { data: studentData, error: studentError } = await supabase.from('students').select('wallet_balance').eq('id', session.user.id).single();
        if (studentError) {
           console.error('Error fetching wallet balance:', studentError);
        }
        if (studentData) {
           setBalance(studentData.wallet_balance || 0);
        }
        
        const { data: subs } = await supabase.from('student_subscriptions').select('course_id').eq('student_id', session.user.id);
        if (subs) {
           setSubscriptions(subs.map(s => String(s.course_id)));
        }
      } else {
        setUserId(null);
        setBalance(0);
        setSubscriptions([]);
      }
    }
    fetchWallet();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      fetchWallet();
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const chargeWallet = async (code: string) => {
    if (!userId) return { success: false, message: 'You must be logged in' };
    
    // Check code in DB
    const { data: card, error: cardError } = await supabase
       .from('charge_cards')
       .select('*')
       .eq('code', code)
       .single();

    if (cardError || !card) {
       return { success: false, message: 'كود الشحن غير صحيح' };
    }
    
    if (card.is_used) {
       return { success: false, message: 'كود الشحن مستخدم من قبل' };
    }

    const amount = parseFloat(card.amount);

    // Update card
    await supabase.from('charge_cards').update({ 
       is_used: true, 
       used_by: userId, 
       used_at: new Date().toISOString() 
    }).eq('id', card.id);

    // Update wallet
    const newBalance = balance + amount;
    const { error: updateError } = await supabase.from('students').update({ wallet_balance: newBalance }).eq('id', userId);
    
    if (updateError) {
      console.error('Error updating wallet balance:', updateError);
      return { success: false, message: 'حدث خطأ أثناء تحديث الرصيد' };
    }

    setBalance(newBalance);
    
    return { success: true, message: `تم شحن المحفظة بنجاح بـ ${amount} ج.م`, amount };
  };

  const subscribeToCourse = async (courseId: string, price: number) => {
    if (!userId) return { success: false, message: 'You must be logged in' };
    
    if (subscriptions.includes(courseId)) {
      return { success: true, message: 'Already subscribed' };
    }

    if (balance < price) {
      return { success: false, message: 'رصيد المحفظة غير كافٍ. يرجى الشحن أولاً.' };
    }

    const newBalance = balance - price;
    
    // Create subscription record
    const { error: subError } = await supabase.from('student_subscriptions').insert([{ student_id: userId, course_id: courseId }]);
    
    if (subError) {
      console.error('Error creating subscription:', subError);
      return { success: false, message: 'حدث خطأ أثناء الاشتراك (تأكد من إنشاء جدول student_subscriptions)' };
    }

    // Deduct balance
    const { error: deductError } = await supabase.from('students').update({ wallet_balance: newBalance }).eq('id', userId);
    
    if (deductError) {
      console.error('Error deducting wallet balance:', deductError);
      return { success: false, message: 'حدث خطأ أثناء خصم الرصيد' };
    }

    setBalance(newBalance);

    const newSubs = [...subscriptions, courseId];
    setSubscriptions(newSubs);

    return { success: true, message: 'تم الاشتراك بنجاح' };
  };

  const hasSubscription = useCallback((courseId: string) => {
    return subscriptions.includes(courseId);
  }, [subscriptions]);

  return { balance, subscriptions, chargeWallet, subscribeToCourse, hasSubscription };
}
