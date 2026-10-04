import React, { useState } from "react";
import { User, Lock, Mail, ArrowRight, Loader2, LogIn, UserPlus, Eye, EyeOff, KeyRound } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import mascotImg from "@/assets/zubda-mascot.png";

const LoginPage = () => {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [isForgotMode, setIsForgotMode] = useState(false); // حالة نافذة نسيان كلمة المرور
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetEmail, setResetEmail] = useState(""); // إيميل استعادة كلمة المرور
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const navigate = useNavigate();

  // --- دالة تسجيل الدخول وإنشاء الحساب ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (!isLoginMode) {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(email)) {
        setError("يرجى إدخال بريد إلكتروني صحيح باللغة الإنجليزية فقط.");
        setIsLoading(false);
        return;
      }

      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
      if (!passwordRegex.test(password)) {
        setError("كلمة المرور ضعيفة. يجب أن تتكون من 8 خانات على الأقل، وتحتوي على أحرف إنجليزية (كبيرة وصغيرة)، أرقام، ورموز.");
        setIsLoading(false);
        return;
      }

      if (password !== confirmPassword) {
        setError("كلمتا المرور غير متطابقتين، يرجى التأكد منهما.");
        setIsLoading(false);
        return;
      }
    }

    const url = isLoginMode ? "http://127.0.0.1:5000/api/login" : "http://127.0.0.1:5000/api/register";
    const payload = isLoginMode ? { email, password } : { name, email, password };

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("تعذر الاتصال بالخادم");

      const data = await response.json();

      if (data.success) {
        if (isLoginMode) {
          localStorage.setItem("user_session", JSON.stringify(data.user));
          navigate("/");
          window.location.reload(); 
        } else {
          toast.success("تم إنشاء حسابك بنجاح! يمكنك تسجيل الدخول الآن.");
          setIsLoginMode(true);
          setPassword("");
          setConfirmPassword("");
          setError(null);
        }
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError("حدث خطأ أثناء الاتصال بالخادم. تأكد من تشغيل البايثون.");
    } finally {
      setIsLoading(false);
    }
  };

  // --- دالة استعادة كلمة المرور ---
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("http://127.0.0.1:5000/api/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: resetEmail }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(data.message);
        setIsForgotMode(false); // العودة لصفحة الدخول بعد النجاح
        setResetEmail("");
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError("حدث خطأ أثناء الاتصال بالخادم.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-beige-lightest relative overflow-hidden" dir="rtl">
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-gold/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-navy/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-beige-dark p-10 relative z-10">
        <div className="text-center mb-8">
          <img src={mascotImg} alt="زبدة" className="w-20 h-20 mx-auto mb-4 drop-shadow-lg" width={80} height={80} />
          <h2 className="font-amiri text-3xl font-bold text-navy mb-2">منصة الزِبْدة</h2>
          <p className="text-muted-foreground text-sm">
            {isForgotMode 
              ? "استعادة كلمة المرور" 
              : isLoginMode 
                ? "سجل دخولك للوصول إلى أدوات البحث والذكاء الاصطناعي" 
                : "أنشئ حساباً جديداً لتبدأ رحلتك البحثية"}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 p-3 rounded-xl text-sm mb-6 border border-red-200 text-center font-bold leading-relaxed animate-in fade-in zoom-in">
            {error}
          </div>
        )}

        {/* --- واجهة استعادة كلمة المرور --- */}
        {isForgotMode ? (
          <form onSubmit={handleForgotPassword} className="space-y-5 animate-in slide-in-from-right-4">
            <p className="text-sm text-navy/70 text-center mb-4">
              أدخل بريدك الإلكتروني المسجل لدينا، وسنقوم بإرسال كلمة مرور مؤقتة لتتمكن من الدخول.
            </p>
            <div className="relative group">
              <Mail className="absolute right-4 top-1/2 transform -translate-y-1/2 text-navy/40 group-focus-within:text-gold transition-colors" size={20} />
              <input 
                type="email" 
                required 
                value={resetEmail} 
                onChange={(e) => setResetEmail(e.target.value)}
                placeholder="البريد الإلكتروني" 
                className="w-full bg-beige-lightest border border-beige-dark rounded-xl pr-12 pl-4 py-3.5 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-all text-navy text-right"
              />
            </div>
            
            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full gradient-gold text-navy font-bold py-4 rounded-xl shadow-gold hover:opacity-90 transition-all hover:-translate-y-0.5 flex justify-center items-center gap-2 disabled:opacity-50 mt-4"
            >
              {isLoading ? <Loader2 className="animate-spin" size={20} /> : <KeyRound size={20} />}
              إرسال كلمة المرور المؤقتة
            </button>

            <div className="mt-6 text-center">
              <button 
                type="button" 
                onClick={() => { setIsForgotMode(false); setError(null); }}
                className="text-sm text-navy/60 hover:text-gold font-bold transition-colors"
              >
                العودة لتسجيل الدخول
              </button>
            </div>
          </form>
        ) : (
          /* --- واجهة الدخول والإنشاء العادية --- */
          <form onSubmit={handleSubmit} className="space-y-5 animate-in slide-in-from-left-4">
            {!isLoginMode && (
              <div className="relative group">
                <User className="absolute right-4 top-1/2 transform -translate-y-1/2 text-navy/40 group-focus-within:text-gold transition-colors" size={20} />
                <input 
                  type="text" 
                  required 
                  value={name} 
                  onChange={(e) => setName(e.target.value)}
                  placeholder="الاسم الكامل" 
                  className="w-full bg-beige-lightest border border-beige-dark rounded-xl pr-12 pl-4 py-3.5 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-all text-navy text-right"
                />
              </div>
            )}

            <div className="relative group">
              <Mail className="absolute right-4 top-1/2 transform -translate-y-1/2 text-navy/40 group-focus-within:text-gold transition-colors" size={20} />
              <input 
                type="email" 
                required 
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                placeholder="البريد الإلكتروني (إنجليزي فقط)" 
                className="w-full bg-beige-lightest border border-beige-dark rounded-xl pr-12 pl-4 py-3.5 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-all text-navy text-right"
              />
            </div>

            <div className="relative group">
              <Lock className="absolute right-4 top-1/2 transform -translate-y-1/2 text-navy/40 group-focus-within:text-gold transition-colors" size={20} />
              <input 
                type={showPassword ? "text" : "password"} 
                required 
                value={password} 
                onChange={(e) => setPassword(e.target.value)}
                placeholder="كلمة المرور" 
                className="w-full bg-beige-lightest border border-beige-dark rounded-xl pr-12 pl-12 py-3.5 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-all text-navy text-right"
                dir="ltr"
              />
              {password.length > 0 && (
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-navy/40 hover:text-gold transition-colors focus:outline-none animate-in fade-in zoom-in duration-200"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              )}
            </div>

            {/* زر هل نسيت كلمة المرور (يظهر في وضع تسجيل الدخول فقط) */}
            {isLoginMode && (
              <div className="flex justify-start px-2 -mt-2">
                <button 
                  type="button" 
                  onClick={() => { setIsForgotMode(true); setError(null); }}
                  className="text-xs font-bold text-navy/60 hover:text-gold transition-colors"
                >
                  هل نسيت كلمة المرور؟
                </button>
              </div>
            )}

            {!isLoginMode && (
              <div className="flex flex-col gap-2">
                <div className="relative group">
                  <Lock className="absolute right-4 top-1/2 transform -translate-y-1/2 text-navy/40 group-focus-within:text-gold transition-colors" size={20} />
                  <input 
                    type={showConfirmPassword ? "text" : "password"} 
                    required 
                    value={confirmPassword} 
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="تأكيد كلمة المرور" 
                    className="w-full bg-beige-lightest border border-beige-dark rounded-xl pr-12 pl-12 py-3.5 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-all text-navy text-right"
                    dir="ltr"
                  />
                  {confirmPassword.length > 0 && (
                    <button 
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 text-navy/40 hover:text-gold transition-colors focus:outline-none animate-in fade-in zoom-in duration-200"
                    >
                      {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  )}
                </div>
                <p className="text-[11.5px] text-navy/60 text-right pr-2">
                  * يجب أن تحتوي على أحرف كبيرة وصغيرة، أرقام، ورموز (8 خانات على الأقل)
                </p>
              </div>
            )}

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full gradient-gold text-navy font-bold py-4 rounded-xl shadow-gold hover:opacity-90 transition-all hover:-translate-y-0.5 flex justify-center items-center gap-2 disabled:opacity-50 mt-4"
            >
              {isLoading ? <Loader2 className="animate-spin" size={20} /> : (isLoginMode ? <LogIn size={20} /> : <UserPlus size={20} />)}
              {isLoading ? "الرجاء الانتظار..." : (isLoginMode ? "تسجيل الدخول" : "إنشاء حساب")}
            </button>
          </form>
        )}

        {/* --- الفوتر السفلي للتبديل بين الدخول والتسجيل --- */}
        {!isForgotMode && (
          <div className="mt-8 text-center border-t border-beige-dark pt-6 animate-in fade-in">
            <p className="text-sm text-navy/60">
              {isLoginMode ? "ليس لديك حساب؟" : "لديك حساب بالفعل؟"}
              <button 
                type="button" 
                onClick={() => {
                  setIsLoginMode(!isLoginMode);
                  setError(null);
                  setPassword("");
                  setConfirmPassword("");
                  setShowPassword(false);
                  setShowConfirmPassword(false);
                }}
                className="text-gold-dark font-bold mr-2 hover:text-gold transition-colors inline-flex items-center gap-1"
              >
                {isLoginMode ? "سجل الآن" : "تسجيل الدخول"} <ArrowRight size={14} />
              </button>
            </p>
          </div>
        )}
        
      </div>
    </div>
  );
};

export default LoginPage;