import { Link, useLocation, useNavigate } from "react-router-dom";
import { Search, MessageCircle, Home, BookOpen, ShieldCheck, Lightbulb, LogIn, LogOut, User } from "lucide-react";
import logoImg from "@/assets/zubda-mascot.png";

const navItems = [
  { path: "/", label: "الرئيسية", icon: Home },
  { path: "/search", label: "البحث", icon: Search },
  // تمت إضافة صفحة مُلهم الأبحاث هنا ليكون ترتيبها منطقياً بعد البحث
  { path: "/ideas", label: "مُلهم الأبحاث", icon: Lightbulb }, 
  { path: "/chat", label: "المحادثة الذكية", icon: MessageCircle },
  { path: "/detect", label: "فحص الأبحاث", icon: ShieldCheck },
  { path: "/about", label: "عن زِبدة", icon: BookOpen },
];

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // قراءة بيانات المستخدم من المتصفح
  const userString = localStorage.getItem("user_session");
  const user = userString ? JSON.parse(userString) : null;

  const handleLogout = () => {
    localStorage.removeItem("user_session"); // مسح الجلسة
    navigate("/login"); // توجيه لصفحة الدخول
    window.location.reload(); // تحديث الصفحة لضمان مسح البيانات
  };

  return (
    <nav className="sticky top-0 z-50 bg-navy/[0.97] backdrop-blur-xl border-b border-gold/20">
      <div className="container mx-auto px-4 flex items-center justify-between h-[70px]">
        {/* الشعار والاسم بدون كلمة منصة */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-[45px] h-[45px] flex items-center justify-center overflow-hidden rounded-[10px]">
            <img src={logoImg} alt="شعار زبدة" className="w-full h-full object-contain" />
          </div>
          <span className="text-[26px] font-amiri text-white font-bold">
            <span className="text-gold-light">الزِبْدة</span>
          </span>
        </Link>

        {/* روابط التنقل والوظائف */}
        <div className="flex items-center gap-6">
          {/* الروابط الأساسية */}
          <div className="hidden lg:flex items-center gap-6">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`relative flex items-center gap-2 text-[15px] font-medium transition-colors ${
                    isActive ? "text-white" : "text-white/60 hover:text-white"
                  }`}
                >
                  <Icon size={16} />
                  <span>{item.label}</span>
                  {isActive && (
                    <span className="absolute -bottom-[25px] w-full h-[2px] bg-gold-light" />
                  )}
                </Link>
              );
            })}
          </div>
          
          {/* خط فاصل أنيق بين الروابط ومنطقة المستخدم */}
          <div className="hidden lg:block w-[1px] h-8 bg-white/10 mx-2"></div>

          {/* منطقة زر البحث و المستخدم */}
          <div className="flex items-center gap-4">
            {/* زر ابدأ البحث */}
            <Link
              to="/search"
              className="gradient-gold text-navy px-5 py-2 rounded-md font-bold text-sm hover:opacity-90 transition-opacity shadow-gold hidden md:block"
            >
              ابدأ البحث
            </Link>

            {/* حالة تسجيل الدخول */}
            {user ? (
              <div className="flex items-center gap-3">
                {/* تم تحويل هذا الجزء إلى Link ليوجه إلى صفحة الملف الشخصي */}
                <Link 
                  to="/profile"
                  className="hidden md:flex items-center gap-1.5 text-sm font-medium text-white/90 bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-full border border-white/10 transition-colors cursor-pointer"
                  title="الملف الشخصي"
                >
                  <User size={16} className="text-gold-light" />
                  {/* نعرض الاسم الأول فقط لجمالية التصميم */}
                  <span>أهلاً، {user.name.split(' ')[0]}</span>
                </Link>

                <button 
                  onClick={handleLogout}
                  className="flex items-center gap-1 text-red-400 hover:text-red-300 transition-colors text-sm font-bold"
                  title="تسجيل الخروج"
                >
                  <LogOut size={18} />
                  <span className="hidden md:inline">خروج</span>
                </button>
              </div>
            ) : (
              <Link 
                to="/login" 
                className="flex items-center gap-1.5 text-white/90 hover:text-gold-light transition-colors text-sm font-medium"
              >
                <LogIn size={18} />
                <span className="hidden md:inline">دخول</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;