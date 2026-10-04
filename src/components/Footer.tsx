import { Link } from "react-router-dom";

const Footer = () => (
  <footer className="bg-[#070f18] border-t border-gold/10 pt-14 pb-8">
    <div className="container mx-auto px-4">
      <div className="grid md:grid-cols-3 gap-16 pb-10 border-b border-white/[0.06] mb-8">
        <div>
          <span className="font-amiri text-[30px] text-white block mb-4">
            الزِبْ<span className="text-gold-light">دة</span>
          </span>
          <p className="text-white/35 text-sm leading-relaxed max-w-[280px]">
            مساعد البحث العلمي التفاعلي باللغة العربية — يجمع بين قوة الذكاء الاصطناعي ومحركات البحث الأكاديمية المتقدمة.
          </p>
        </div>
        <div>
          <h4 className="text-white/60 text-xs font-bold tracking-widest uppercase mb-5">المنصة</h4>
          <ul className="space-y-2.5">
            <li><Link to="/search" className="text-white/40 text-sm hover:text-gold-light transition-colors">البحث العلمي</Link></li>
            <li><Link to="/chat" className="text-white/40 text-sm hover:text-gold-light transition-colors">المحادثة الذكية</Link></li>
            <li><Link to="/about" className="text-white/40 text-sm hover:text-gold-light transition-colors">عن الزِبْدة</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white/60 text-xs font-bold tracking-widest uppercase mb-5">المشروع</h4>
          <ul className="space-y-2.5">
            <li><Link to="/about" className="text-white/40 text-sm hover:text-gold-light transition-colors">الرسالة والرؤية</Link></li>
            <li><Link to="/about" className="text-white/40 text-sm hover:text-gold-light transition-colors">إمكانيات المنصة</Link></li>
          </ul>
        </div>
      </div>
      <div className="flex justify-between items-center">
        <p className="text-white/25 text-[13px]">© {new Date().getFullYear()} منصة الزِبْدة — جميع الحقوق محفوظة</p>
        <span className="font-amiri text-gold text-base">زِبْدة العلم</span>
      </div>
    </div>
  </footer>
);

export default Footer;