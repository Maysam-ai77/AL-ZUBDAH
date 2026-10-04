import { Link } from "react-router-dom";
import mascotImg from "@/assets/zubda-mascot.png";
import searchIcon from "@/assets/zubda-search-icon.png";
import chatIcon from "@/assets/zubda-chat-icon.png";
import summaryIcon from "@/assets/zubda-summary-icon.png";
import verifyIcon from "@/assets/zubda-verify-icon.png";
// إضافة استيراد صور الخاصيتين الجديدتين (تأكدي من إضافة الصورتين في مجلد assets)
import detectorIcon from "@/assets/zubda-detector-icon1.png"; 
import ideaIcon from "@/assets/zubda-idea-icon.png";
import iconMission from "@/assets/icon-mission.png";
import iconVision from "@/assets/icon-vision.png";
import iconValues from "@/assets/icon-values.png";

const values = [
  {
    icon: iconMission,
    title: "رسالتنا",
    description: "تمكين الباحث العربي من الوصول إلى المعرفة العلمية بلغته الأم، وتقديم أدوات بحثية ذكية تختصر الوقت وتعزز جودة البحث الأكاديمي.",
  },
  {
    icon: iconVision,
    title: "رؤيتنا",
    description: "أن نكون المنصة الأولى للبحث العلمي باللغة العربية، ونسهم في بناء مجتمع معرفي عربي متقدم ومتصل بأحدث الإنجازات العلمية.",
  },
  {
    icon: iconValues,
    title: "قيمنا",
    description: "الدقة العلمية، الشفافية في المصادر، الموثوقية الأكاديمية، وسهولة الوصول للمعرفة للجميع.",
  },
];

const capabilities = [
  { img: searchIcon, name: "البحث الذكي", desc: "محرك بحث متقدم يفهم السياق العربي ويقدم نتائج دقيقة من قواعد بيانات عالمية." },
  { img: chatIcon, name: "المحادثة التفاعلية", desc: "اسأل وتابع الحوار مع مساعد ذكي يفهم أسئلتك البحثية ويجيب بمصادر موثقة." },
  { img: summaryIcon, name: "التلخيص والتحليل", desc: "احصل على ملخصات فورية وتحليلات معمّقة للأوراق البحثية مع استخراج النقاط الجوهرية." },
  { img: verifyIcon, name: "التحقق من المصادر", desc: "تحقق من دقة المعلومات مع عرض المراجع الأصلية وتقييم درجة الموثوقية." },
  // الإضافات الجديدة:
  { img: detectorIcon, name: "فحص الأبحاث", desc: "كشف درجة استخدام الذكاء الاصطناعي في الأوراق البحثية لضمان النزاهة الأكاديمية و الأصالة العلمية." },
  { img: ideaIcon, name: "مُلهم الأبحاث", desc: "اكتشف الأولويات الوطنية و الفجوات البحثية في مجالك لإلهام موضوعات بحثية ذات أثر علمي حقيقي." },
];

const AboutPage = () => (
  <div className="min-h-screen">
    {/* Hero */}
    <section className="bg-navy py-20 text-center relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_500px_at_50%_50%,_hsl(var(--gold)/0.07)_0%,_transparent_70%)]" />
      <div className="relative z-10 container mx-auto px-4">
        <img src={mascotImg} alt="زِبدة" className="w-28 h-28 mx-auto mb-5 animate-float drop-shadow-2xl" width={112} height={112} />
        <h1 className="font-amiri text-4xl font-bold text-white mb-4">عن زِبدة</h1>
        <p className="text-white/60 max-w-2xl mx-auto leading-relaxed text-lg font-light">
          زِبدة هي منصة بحث علمي ذكية مصمّمة خصيصاً للباحثين الناطقين بالعربية.
          نجمع بين قوة الذكاء الاصطناعي وثراء المحتوى الأكاديمي لنقدّم تجربة بحثية فريدة ومتكاملة.
        </p>
      </div>
    </section>

    {/* Mission/Vision/Values */}
    <section className="bg-beige-lightest py-20">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-8 max-w-[1100px] mx-auto">
          {values.map((v, i) => (
            <div key={i} className="bg-white rounded-xl p-8 border border-beige-dark hover:border-gold/30 hover:shadow-lg transition-all text-center">
              <img src={v.icon} alt="" className="w-20 h-20 mx-auto mb-5" loading="lazy" width={80} height={80} />
              <h3 className="font-bold text-xl mb-3 text-navy">{v.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{v.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* Capabilities */}
    <section className="bg-beige-light py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-14">
          <span className="text-gold text-xs font-bold tracking-[3px] uppercase mb-4 block">إمكانيات المنصة</span>
          <h2 className="font-amiri text-navy text-[clamp(28px,4vw,44px)] leading-tight">ماذا تقدم زِبدة للباحثين؟</h2>
        </div>
        {/* تم تعديل الـ Grid هنا ليصبح 3 أعمدة بدلاً من 4 ليتناسب مع 6 خصائص */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-[1100px] mx-auto">
          {capabilities.map((c, i) => (
            <div key={i} className="text-center bg-white rounded-xl p-6 border border-beige-dark hover:border-gold/30 hover:shadow-lg transition-all">
              <img src={c.img} alt="" className="w-20 h-20 mx-auto mb-4" loading="lazy" width={80} height={80} />
              <h3 className="font-bold text-lg mb-2 text-navy">{c.name}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{c.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* CTA */}
    <section className="bg-navy py-20 text-center relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_500px_at_50%_50%,_hsl(var(--gold)/0.07)_0%,_transparent_70%)]" />
      <div className="relative z-10 container mx-auto px-4">
        <h2 className="font-amiri text-white text-3xl font-bold mb-4">جاهز لتجربة زِبدة؟</h2>
        <p className="text-white/50 mb-8 max-w-xl mx-auto">ابدأ رحلتك البحثية واكتشف كيف يمكن لزِبدة مساعدتك في الوصول للمعرفة.</p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link to="/search" className="gradient-gold text-navy px-9 py-3.5 rounded-lg font-bold hover:opacity-90 transition-all hover:-translate-y-0.5 shadow-gold">
            ابدأ البحث
          </Link>
          <Link to="/chat" className="bg-transparent text-white/75 border border-white/20 px-9 py-3.5 rounded-lg font-semibold hover:border-white/50 hover:text-white transition-all">
            جرّب المحادثة الذكية
          </Link>
        </div>
      </div>
    </section>
  </div>
);

export default AboutPage;