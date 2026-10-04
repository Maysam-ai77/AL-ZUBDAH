import { useState } from "react";
import { Lightbulb, Target, AlertTriangle, CheckCircle, MapPin, ChevronRight, BookOpen, Cpu, Droplets, Sparkles, Bot, Loader2, Search, TargetIcon, Factory, Cloud, GraduationCap, Leaf, HeartPulse } from "lucide-react";
import { useNavigate } from "react-router-dom"; 
import ideaIcon from "@/assets/zubda-idea-icon.png"; // ⬅️ إضافة استيراد الصورة هنا

interface Priority {
  id: string;
  title: string;
  icon: React.ReactNode;
  description: string;
  urgency: "حرجة جداً" | "عالية" | "متوسطة";
  researchGaps: string[];
  suggestedTitles: { ar: string, en: string }[];
}

interface GeneratedIdea {
  title: string;
  the_gap: string;
  national_impact: string;
  methodology: string;
}

// تم تحديث البيانات بناءً على وثيقة الأولويات الوطنية (2026-2035)
const jordanPriorities: Priority[] = [
  {
    id: "high_value_industries",
    title: "الصناعات عالية القيمة (الأتمتة)",
    icon: <Factory size={28} />,
    description: "تطوير قطاع الصناعة ليكون مركزاً إقليمياً من خلال تبني التصنيع المتقدم، والأتمتة، واستخدامات الذكاء الاصطناعي لرفع الإنتاجية.",
    urgency: "حرجة جداً",
    researchGaps: [
      "ضعف الإنتاجية الصناعية ومحدودية القدرة التنافسية للقطاع.",
      "نقص توظيف تكنولوجيا الروبوتات والذكاء الاصطناعي في خطوط الإنتاج المحلية."
    ],
    suggestedTitles: [
      { 
        ar: "توظيف الذكاء الاصطناعي في تطوير تقنيات الروبوتات والأتمتة الصناعية.", 
        en: "AI in robotics and industrial automation" 
      },
      { 
        ar: "تطوير حلول الأتمتة منخفضة التكلفة للمؤسسات والشركات الصغيرة.", 
        en: "Low-cost automation solutions for local industries" 
      }
    ]
  },
  {
    id: "future_services",
    title: "الخدمات المستقبلية والتحول الرقمي",
    icon: <Cloud size={28} />,
    description: "توسيع الاقتصاد الخدمي القائم على المعرفة من خلال الحوسبة السحابية، الأمن السيبراني، وعلم البيانات.",
    urgency: "حرجة جداً",
    researchGaps: [
      "قصور منظومات الخدمات وانخفاض مستوى التحول الرقمي والحوكمة.",
      "ضعف البنية التحتية لتكنولوجيا المعلومات والاعتماد على قواعد البيانات المركزية."
    ],
    suggestedTitles: [
      { 
        ar: "دور الذكاء الاصطناعي وتحليل البيانات في دعم اتخاذ القرار في القطاع العام.", 
        en: "AI and big data for public sector decision making" 
      },
      { 
        ar: "الحوسبة السحابية الذكية والبنية التحتية الرقمية الداعمة للخدمات الحكومية.", 
        en: "Smart cloud computing digital infrastructure e-government" 
      }
    ]
  },
  {
    id: "innovation_education",
    title: "الريادة والإبداع (تكنولوجيا التعليم)",
    icon: <GraduationCap size={28} />,
    description: "بناء بيئة داعمة للابتكار وتطوير المهارات المستقبلية لتهيئة المواهب لوظائف المستقبل عبر التقنيات الذكية.",
    urgency: "عالية",
    researchGaps: [
      "تشتت منظومة الدعم التكنولوجي في التعليم وضعف المناهج التكيفية.",
      "عدم مواءمة مخرجات التعليم والتدريب مع الاحتياجات الفعلية لسوق العمل."
    ],
    suggestedTitles: [
      { 
        ar: "تطوير نظام تعليم رقمي تكيفي باللغة العربية مدعوم بالذكاء الاصطناعي.", 
        en: "Adaptive Arabic e-learning system using AI" 
      },
      { 
        ar: "تحليل ديناميكيات سوق العمل بالنمذجة التنبؤية لتوجيه المهارات المستقبلية.", 
        en: "Predictive modeling for labor market dynamics" 
      }
    ]
  },
  {
    id: "sustainable_resources",
    title: "الموارد المستدامة (المياه والطاقة)",
    icon: <Droplets size={28} />,
    description: "إدارة الموارد الحيوية بكفاءة وتعزيز الاعتماد على الشبكات الذكية وأنظمة التنبؤ لمعالجة شح الموارد.",
    urgency: "حرجة جداً",
    researchGaps: [
      "شح المياه وضعف القدرة على التكيف مع التغير المناخي.",
      "فواقد الشبكات الكهربائية وضعف دمج مصادر الطاقة المتجددة ضمن شبكات ذكية."
    ],
    suggestedTitles: [
      { 
        ar: "استخدام الذكاء الاصطناعي للتنبؤ بتلوث وتسربات المياه الجوفية والسطحية.", 
        en: "AI for water pollution prediction and leakage management" 
      },
      { 
        ar: "تحديث الشبكات الكهربائية ودمج مصادر الطاقة المتجددة باستخدام التعلم الآلي.", 
        en: "Smart grid modernization machine learning renewable energy" 
      }
    ]
  },
  {
    id: "sustainable_env",
    title: "البيئة المستدامة وإدارة النفايات",
    icon: <Leaf size={28} />,
    description: "دعم التحول نحو الاقتصاد الأخضر والمدن الذكية المستدامة باستخدام إنترنت الأشياء (IoT) والأنظمة الخبيرة.",
    urgency: "عالية",
    researchGaps: [
      "غياب الأنظمة الرقمية المتقدمة لإدارة النفايات وإعادة التدوير.",
      "الافتقار لمنصات الرصد البيئي المستمر للتلوث وتغير المناخ."
    ],
    suggestedTitles: [
      { 
        ar: "تطوير نماذج ذكاء اصطناعي متقدمة لتحسين كفاءة إدارة النفايات وإعادة التدوير.", 
        en: "Advanced AI models for efficient waste management" 
      },
      { 
        ar: "منصات ذكية لرصد نوعية المياه والهواء باستخدام الذكاء الاصطناعي وإنترنت الأشياء.", 
        en: "IoT AI platforms air water quality monitoring" 
      }
    ]
  },
  {
    id: "quality_of_life",
    title: "جودة الحياة (الصحة والنقل الذكي)",
    icon: <HeartPulse size={28} />,
    description: "تحسين الخدمات الأساسية وتعزيز الرفاه الاجتماعي من خلال رقمنة القطاع الصحي وتطوير أنظمة النقل.",
    urgency: "حرجة جداً",
    researchGaps: [
      "فجوات في توزيع الخدمات الصحية الأولية وضعف الأنظمة التشخيصية المتقدمة.",
      "الازدحام الحضري وضعف توظيف علم البيانات في إدارة النقل وتوزيع الموارد."
    ],
    suggestedTitles: [
      { 
        ar: "التقنيات الصحية الذكية ودورها في تحسين الجودة وتطوير خدمات المستشفيات.", 
        en: "Smart health technologies hospital services improvement" 
      },
      { 
        ar: "دور تحليل البيانات في تحسين توزيع الخدمات وإدارة النقل في المدن الذكية.", 
        en: "Data analytics smart city transport services distribution" 
      }
    ]
  }
];

// قائمة محركات النمو الوطنية بناءً على الوثيقة (2026-2035)
const growthEngines = [
  "الصناعات عالية القيمة",
  "الخدمات المستقبلية",
  "الأردن وجهة عالمية",
  "الريادة والإبداع",
  "الموارد المستدامة",
  "الاستثمار",
  "البيئة المستدامة",
  "جودة الحياة",
  "السياسة والأمن الوطني"
];

const IdeasPage = () => {
  const [selectedPriority, setSelectedPriority] = useState<Priority | null>(jordanPriorities[0]);
  const navigate = useNavigate();

  const [userInterest, setUserInterest] = useState("");
  const [selectedEngine, setSelectedEngine] = useState(""); 
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedIdea, setGeneratedIdea] = useState<GeneratedIdea | null>(null);

  const handleGenerateIdea = async () => {
    if (!userInterest.trim()) {
      alert("يرجى إدخال مجال اهتمامك أولاً.");
      return;
    }
    if (!selectedEngine) {
      alert("يرجى اختيار محرك النمو الوطني من القائمة.");
      return;
    }

    setIsGenerating(true); 
    setGeneratedIdea(null);

    try {
      const response = await fetch("http://127.0.0.1:5000/api/generate-idea", {
        method: "POST", 
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          interest: userInterest,
          growth_engine: selectedEngine
        }),
      });

      if (!response.ok) throw new Error("فشل الاتصال");
      const data = await response.json();
      
      if (data.success) {
        setGeneratedIdea(data.idea); 
      } else {
        alert(data.error);
      }
    } catch (err) {
      alert("فشل الاتصال بالخادم. تأكدي من تشغيل البايثون.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSearchIdea = (searchQuery: string) => {
    navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
  };

  return (
    <div className="min-h-screen bg-beige-lightest py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        
        <div className="text-center mb-12">
          {/* ⬅️ التعديل هنا: استخدام الصورة بدلاً من المصباح */}
          <div className="inline-flex items-center justify-center mb-6">
            <img 
              src={ideaIcon} 
              alt="مُلهم الأبحاث" 
              className="w-20 h-20 object-contain drop-shadow-lg hover:scale-105 transition-transform duration-300" 
            />
          </div>
          <h1 className="font-amiri text-4xl font-bold text-navy mb-4">مُلهم الأبحاث الوطنية (2026-2035)</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed">
            استكشف الفجوات البحثية الحقيقية بناءً على رؤية التحديث الاقتصادي، أو دع الذكاء الاصطناعي يبتكر لك فكرة حصرية تلبي الأولويات الوطنية.
          </p>
        </div>

        <div className="bg-navy rounded-3xl p-8 mb-12 relative overflow-hidden shadow-2xl border border-gold/20">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gold/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
          
          <div className="relative z-10">
            <h2 className="font-bold text-white text-2xl mb-2 flex items-center gap-2">
              <Sparkles size={24} className="text-gold" /> مساعد الذكاء الاصطناعي (تحليل الفجوات)
            </h2>
            <p className="text-white/70 mb-6 text-sm">أدخل مجالك واختر محرك نمو وطني. سيقوم النظام بتوليد فكرة بحثية متوافقة مع أولويات الدولة الأردنية.</p>
            
            <div className="flex flex-col md:flex-row gap-4">
              <input
                type="text"
                value={userInterest}
                onChange={(e) => setUserInterest(e.target.value)}
                placeholder="مجال اهتمامك (مثال: AI in Healthcare, Data Mining...)"
                className="flex-1 bg-white/10 border border-gold/30 rounded-xl px-5 py-4 text-white placeholder:text-white/40 focus:outline-none focus:border-gold text-left dir-ltr"
                dir="ltr"
              />
              
              <select 
                value={selectedEngine} 
                onChange={(e) => setSelectedEngine(e.target.value)}
                className="flex-1 bg-white/10 border border-gold/30 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-gold cursor-pointer [&>option]:text-navy"
              >
                <option value="" disabled>اختر محرك النمو الوطني...</option>
                {growthEngines.map((engine, index) => (
                  <option key={index} value={engine}>{engine}</option>
                ))}
              </select>

              <button
                onClick={handleGenerateIdea}
                disabled={isGenerating}
                className="gradient-gold text-navy font-bold px-8 py-4 rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50 min-w-[200px]"
              >
                {isGenerating ? <Loader2 size={20} className="animate-spin" /> : <Bot size={20} />}
                {isGenerating ? "جاري الابتكار..." : "ولّد فكرة ذكية"}
              </button>
            </div>

            {generatedIdea && !isGenerating && (
              <div className="mt-8 bg-white rounded-xl p-6 border border-gold/40 shadow-lg animate-in fade-in slide-in-from-bottom-4 text-right">
                <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6 border-b border-gray-100 pb-4">
                  <div>
                    <span className="inline-block bg-gold/20 text-gold-dark px-3 py-1 rounded-full text-xs font-bold mb-3 border border-gold/30">
                      يخدم: {selectedEngine}
                    </span>
                    <h3 className="font-amiri text-2xl text-navy font-bold leading-relaxed">
                      {generatedIdea.title}
                    </h3>
                  </div>
                  <button 
                    onClick={() => handleSearchIdea(userInterest)}
                    className="shrink-0 bg-navy/5 text-navy border border-navy/20 px-5 py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2 hover:bg-navy hover:text-white transition-colors w-full md:w-auto"
                  >
                    <Search size={16} />
                    ابحث في OpenAlex
                  </button>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                  <div className="bg-red-50/50 p-4 rounded-xl border border-red-100">
                    <h4 className="font-bold text-red-800 mb-2 flex items-center gap-2 text-sm">
                      <AlertTriangle size={16} /> الفجوة العالمية والمحلية
                    </h4>
                    <p className="text-red-900/80 text-sm leading-relaxed">{generatedIdea.the_gap}</p>
                  </div>

                  <div className="bg-green-50/50 p-4 rounded-xl border border-green-100">
                    <h4 className="font-bold text-green-800 mb-2 flex items-center gap-2 text-sm">
                      <TargetIcon size={16} /> الأثر الوطني (الأردن)
                    </h4>
                    <p className="text-green-900/80 text-sm leading-relaxed">{generatedIdea.national_impact}</p>
                  </div>

                  <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                    <h4 className="font-bold text-blue-800 mb-2 flex items-center gap-2 text-sm">
                      <Cpu size={16} /> المنهجية المقترحة
                    </h4>
                    <p className="text-blue-900/80 text-sm leading-relaxed">{generatedIdea.methodology}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-1/3 flex flex-col gap-4">
            <h2 className="font-bold text-navy text-xl mb-2 flex items-center gap-2">
              <MapPin size={20} className="text-gold" /> أولويات رؤية التحديث
            </h2>
            {jordanPriorities.map((priority) => (
              <button
                key={priority.id}
                onClick={() => setSelectedPriority(priority)}
                className={`flex items-center p-5 rounded-2xl border transition-all text-right ${
                  selectedPriority?.id === priority.id ? "bg-navy text-white border-navy shadow-lg scale-[1.02]" : "bg-white text-navy border-beige-dark hover:border-gold hover:shadow-md"
                }`}
              >
                <div className={`p-3 rounded-xl ml-4 ${selectedPriority?.id === priority.id ? "bg-white/10" : "bg-navy/5 text-navy"}`}>{priority.icon}</div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg">{priority.title}</h3>
                </div>
                <ChevronRight size={20} className={`transform ${selectedPriority?.id === priority.id ? "rotate-180 opacity-100" : "opacity-0"}`} />
              </button>
            ))}
          </div>

          {selectedPriority && (
            <div className="lg:w-2/3">
              <div className="bg-white rounded-3xl p-8 border border-beige-dark shadow-xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-gold to-navy"></div>
                <div className="mb-8">
                  <div className="flex items-center gap-3 mb-4">
                    <Target className="text-gold-dark" size={28} />
                    <h2 className="font-amiri text-3xl font-bold text-navy">{selectedPriority.title}</h2>
                  </div>
                  <p className="text-navy/70 leading-relaxed text-lg">{selectedPriority.description}</p>
                </div>

                <div className="bg-red-50/50 rounded-2xl p-6 border border-red-100 mb-8">
                  <h3 className="font-bold text-red-800 mb-4 flex items-center gap-2 text-lg">
                    <AlertTriangle size={20} /> الفجوات البحثية المعتمدة
                  </h3>
                  <ul className="space-y-3">
                    {selectedPriority.researchGaps.map((gap, index) => (
                      <li key={index} className="flex items-start gap-3 text-red-900/80">
                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-red-400 shrink-0"></span>
                        <span className="leading-relaxed">{gap}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="font-bold text-navy mb-5 flex items-center gap-2 text-lg">
                    <Lightbulb size={20} className="text-gold-dark" /> عناوين أبحاث مقترحة لدراستك
                  </h3>
                  <div className="grid gap-4">
                    {selectedPriority.suggestedTitles.map((idea, index) => (
                      <div key={index} className="group bg-beige-lightest p-5 rounded-xl border border-beige hover:border-gold/50 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <CheckCircle size={24} className="text-gold shrink-0 mt-1" />
                          <p className="font-bold text-navy leading-relaxed text-[15px] group-hover:text-gold-dark transition-colors">{idea.ar}</p>
                        </div>
                        <button 
                          onClick={() => handleSearchIdea(idea.en)}
                          className="shrink-0 bg-white border border-gold/40 text-navy hover:bg-gold/10 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors"
                        >
                          <BookOpen size={16} className="text-gold-dark" />
                          ابحث عن مصادر
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default IdeasPage;