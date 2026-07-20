import React, { useState, useRef, useEffect } from 'react';
import { X, Send, User, Headset, LogIn } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-hot-toast';

type Message = {
  id: string;
  text: string;
  sender: 'user' | 'support';
  created_at: string;
  student_id?: string;
  session_id?: string;
  isLocal?: boolean;
};

export default function LiveChat({ isLoggedIn }: { isLoggedIn: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  
  // Chatbot Flow State
  const [chatStep, setChatStep] = useState<'name' | 'phone' | 'issue' | 'chat'>('name');
  const [guestData, setGuestData] = useState({ name: '', phone: '' });
  const [sessionId, setSessionId] = useState<string>('');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  useEffect(() => {
    // Generate a session ID for guests
    let sid = localStorage.getItem('chat_session_id');
    if (!sid) {
      sid = Math.random().toString(36).substring(2, 15);
      localStorage.setItem('chat_session_id', sid);
    }
    setSessionId(sid);

    const fetchSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUserId(session.user.id);
        setChatStep('chat'); // Skip flow if logged in
        fetchMessages(session.user.id, null);
      } else {
        // Guest mode - start flow
        const savedStep = localStorage.getItem('chat_step');
        if (savedStep === 'chat') {
          setChatStep('chat');
          fetchMessages(null, sid);
        } else {
          startBotFlow();
        }
      }
    };

    fetchSession();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        setUserId(session.user.id);
        setChatStep('chat');
        fetchMessages(session.user.id, null);
      } else {
        setUserId(null);
        setMessages([]);
        startBotFlow();
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const startBotFlow = () => {
    setChatStep('name');
    setMessages([
      {
        id: 'bot-1',
        text: 'مرحباً بك في خدمة العملاء! يرجى إدخال اسمك الكريم للبدء:',
        sender: 'support',
        created_at: new Date().toISOString(),
        isLocal: true
      }
    ]);
  };

  const fetchMessages = async (uid: string | null, sid: string | null) => {
    let query = supabase.from('support_messages').select('*').order('created_at', { ascending: true });
    
    if (uid) {
      query = query.eq('student_id', uid);
    } else if (sid) {
      query = query.eq('session_id', sid);
    }

    const { data, error } = await query;
    if (data && data.length > 0) {
      setMessages(data as Message[]);
      setChatStep('chat');
      localStorage.setItem('chat_step', 'chat');
    } else if (!uid && !sid) {
      startBotFlow();
    }
  };

  useEffect(() => {
    const filterId = userId ? `student_id=eq.${userId}` : `session_id=eq.${sessionId}`;
    const channelName = userId ? `support_user_${userId}` : `support_guest_${sessionId}`;

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'support_messages',
          filter: filterId
        },
        (payload) => {
          setMessages((prev) => {
            // Prevent duplicate messages from real-time if we just added them locally
            if (prev.find(m => m.id === payload.new.id)) return prev;
            return [...prev, payload.new as Message];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, sessionId]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    const userText = message.trim();
    setMessage('');

    // Local Message Object
    const localMsg: Message = {
      id: Date.now().toString(),
      text: userText,
      sender: 'user',
      created_at: new Date().toISOString(),
      isLocal: true
    };

    setMessages(prev => [...prev, localMsg]);

    if (chatStep === 'name') {
      setGuestData(prev => ({ ...prev, name: userText }));
      setChatStep('phone');
      setTimeout(() => {
        setMessages(prev => [...prev, {
          id: 'bot-2',
          text: `أهلاً بك يا ${userText}. يرجى إدخال رقم هاتفك للتواصل:`,
          sender: 'support',
          created_at: new Date().toISOString(),
          isLocal: true
        }]);
      }, 500);
      return;
    }

    if (chatStep === 'phone') {
      setGuestData(prev => ({ ...prev, phone: userText }));
      setChatStep('issue');
      setTimeout(() => {
        setMessages(prev => [...prev, {
          id: 'bot-3',
          text: `شكراً لك. ما هو الاستفسار أو المشكلة التي تواجهك؟`,
          sender: 'support',
          created_at: new Date().toISOString(),
          isLocal: true
        }]);
      }, 500);
      return;
    }

    if (chatStep === 'issue') {
      setChatStep('chat');
      localStorage.setItem('chat_step', 'chat');
      
      const combinedMessage = `الاسم: ${guestData.name}\nرقم الهاتف: ${guestData.phone}\nالمشكلة: ${userText}`;
      
      const newMsg = {
        session_id: sessionId,
        guest_name: guestData.name,
        guest_phone: guestData.phone,
        sender: 'user',
        text: combinedMessage,
      };

      const { error: insertError } = await supabase.from('support_messages').insert([newMsg]);
      if (insertError) {
        console.warn('Supabase insert error:', insertError);
      }
      
      // Call Gemini AI
      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: userText })
        });
        const data = await response.json();
        
        if (data.reply) {
          const botMsg = {
            session_id: sessionId,
            sender: 'support',
            text: data.reply
          };
          
          setMessages(prev => [...prev, {
            id: Date.now().toString() + '-bot',
            text: data.reply,
            sender: 'support',
            created_at: new Date().toISOString(),
            isLocal: true
          }]);
          
          await supabase.from('support_messages').insert([botMsg]);
        }
      } catch (err) {
        console.error('Gemini error:', err);
      }
      
      return;
    }

    if (chatStep === 'chat') {
      const newMsg = {
        ...(userId ? { student_id: userId } : { session_id: sessionId }),
        sender: 'user',
        text: userText,
      };

      const { error } = await supabase.from('support_messages').insert([newMsg]);
      if (error) {
        console.warn('Supabase insert error:', error);
      }

      // Call Gemini AI
      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: userText })
        });
        const data = await response.json();
        
        if (data.reply) {
          const botMsg = {
            ...(userId ? { student_id: userId } : { session_id: sessionId }),
            sender: 'support',
            text: data.reply
          };
          
          setMessages(prev => [...prev, {
            id: Date.now().toString() + '-bot',
            text: data.reply,
            sender: 'support',
            created_at: new Date().toISOString(),
            isLocal: true
          }]);
          
          await supabase.from('support_messages').insert([botMsg]);
        }
      } catch (err) {
        console.error('Gemini error:', err);
      }
    }
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 right-6 w-[350px] max-w-[calc(100vw-48px)] h-[500px] max-h-[60vh] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl flex flex-col z-50 border border-slate-200 dark:border-slate-800 overflow-hidden"
            dir="rtl"
          >
            {/* Header */}
            <div className="bg-blue-600 text-white p-4 flex items-center justify-between shadow-md relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <Headset className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold">الدعم الفني</h3>
                  <p className="text-blue-100 text-xs">نحن هنا لمساعدتك</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-slate-900/50">
              {messages.map((msg, index) => (
                <motion.div 
                  initial={msg.isLocal ? { opacity: 0, y: 10 } : false}
                  animate={{ opacity: 1, y: 0 }}
                  key={msg.id || index} 
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex items-end gap-2 max-w-[85%] ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.sender === 'user' ? 'bg-blue-100 text-blue-600' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 shadow-sm'}`}>
                      {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Headset className="w-4 h-4" />}
                    </div>
                    <div 
                      className={`p-3 rounded-2xl shadow-sm ${
                        msg.sender === 'user' 
                          ? 'bg-blue-600 text-white rounded-br-sm' 
                          : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-100 dark:border-slate-700 rounded-bl-sm'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                      <span className={`text-[10px] mt-1 block ${msg.sender === 'user' ? 'text-blue-200' : 'text-slate-400'}`}>
                        {new Date(msg.created_at).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className="p-3 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
              <div className="flex items-center gap-2 relative">
                <input
                  type={chatStep === 'phone' ? 'tel' : 'text'}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={
                    chatStep === 'name' ? 'اكتب اسمك هنا...' :
                    chatStep === 'phone' ? 'اكتب رقم هاتفك هنا...' :
                    'اكتب رسالتك هنا...'
                  }
                  className="flex-1 bg-slate-100 dark:bg-slate-800 border-none rounded-full px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 dark:text-white outline-none pr-12 transition-all"
                />
                <button
                  type="submit"
                  disabled={!message.trim()}
                  className="absolute right-1 w-10 h-10 flex items-center justify-center bg-blue-600 text-white rounded-full disabled:opacity-50 disabled:bg-slate-400 hover:bg-blue-700 transition-colors shadow-sm"
                >
                  <Send className="w-4 h-4 -mr-1 rtl:rotate-180" />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 hover:scale-110 transition-all duration-300"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
        title="تواصل مع الدعم الفني"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Headset className="w-8 h-8" />}
        {!isOpen && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-blue-500 border-2 border-white dark:border-slate-900"></span>
          </span>
        )}
      </motion.button>
    </>
  );
}
