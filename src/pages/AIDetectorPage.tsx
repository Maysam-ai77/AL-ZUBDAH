import { useState } from "react";
import { FileText, UploadCloud, ScanSearch, Loader2, ShieldCheck, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import mascotImg from "@/assets/zubda-mascot.png";

const AIDetectorPage = () => {
  const [text, setText] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<number | null>(null);

  // الدالة المحدثة للاتصال بخادم البايثون المحلي (Local Model)
  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || text.split(" ").length < 10) {
      toast.error("الرجاء إدخال نص أطول قليلاً (10 كلمات على الأقل) للحصول على نتيجة دقيقة.");
      return;
    }

    setIsAnalyzing(true);
    setResult(null);

    try {
      // الاتصال بخادم البايثون المحلي الخاص بمنصة الزبدة
      const response = await fetch("http://127.0.0.1:5000/api/detect-ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: text,
        }),
      });

      if (!response.ok) {
        throw new Error("حدث خطأ في الاتصال بالخادم المحلي.");
      }

      const data = await response.json();
      
      if (data.success) {
        // البايثون يرجع النسبة المئوية جاهزة (مثال: 85.5)
        const aiPercentage = Math.round(data.ai_percentage);
        setResult(aiPercentage);
        toast.success("تم الانتهاء من الفحص المحلي بنجاح!");
      } else {
        throw new Error(data.error || "حدث خطأ أثناء تحليل النص.");
      }

    } catch (err: any) {
      console.error("AI Detection Error:", err);
      toast.error(err.message || "فشل الاتصال بمحرك الفحص المحلي. تأكدي من تشغيل البايثون.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type === "text/plain") {
      const reader = new FileReader();
      reader.onload = (event) => {
        const fileContent = event.target?.result;
        if (typeof fileContent === "string") {
          setText(fileContent);
          toast.success("تم استخراج النص من الملف بنجاح");
        }
      };
      reader.readAsText(file);
    } else {
      toast.info(`تم اختيار الملف: ${file.name}. الرجاء نسخ النص ولصقه حالياً للسرعة.`);
    }
  };

  return (
    <div className="min-h-screen bg-beige-lightest">
      <section className="bg-navy py-14">
        <div className="container mx-auto px-4 text-center">
          <img src={mascotImg} alt="زبدة" className="w-20 h-20 mx-auto mb-4 drop-shadow-lg" width={80} height={80} />
          <h1 className="font-amiri text-3xl font-bold text-white mb-2">كاشف الذكاء الاصطناعي</h1>
          <p className="text-white/50 text-sm mb-8">تحقق من أصالة الأبحاث والنصوص وتأكد من خلوها من التوليد الآلي بأمان تام وبدون إنترنت</p>
        </div>
      </section>

      <section className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
          
          <div className="bg-white rounded-2xl p-6 border border-beige-dark shadow-lg flex flex-col">
            <h2 className="font-bold text-navy mb-4 flex items-center gap-2">
              <FileText size={18} className="text-gold" />
              أدخل النص المُراد فحصه (يفضل باللغة الإنجليزية)
            </h2>
            
            <form onSubmit={handleAnalyze} className="flex flex-col flex-1">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="انسخ والصق نص البحث هنا (يجب أن يكون 10 كلمات على الأقل لنتيجة دقيقة)..."
                className="w-full flex-1 min-h-[250px] bg-background border border-input rounded-xl p-4 text-sm focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold resize-none mb-4 text-left dir-ltr"
                dir="auto"
              />
              
              <div className="flex items-center justify-between gap-4 mt-auto">
                <div className="relative flex-1">
                  <input
                    type="file"
                    id="file-upload"
                    className="hidden"
                    accept=".txt"
                    onChange={handleFileUpload}
                  />
                  <label
                    htmlFor="file-upload"
                    className="flex items-center justify-center gap-2 w-full py-3 border-2 border-dashed border-beige-dark text-muted-foreground rounded-xl cursor-pointer hover:bg-beige-light hover:border-gold/50 transition-all text-sm font-medium"
                  >
                    <UploadCloud size={18} />
                    رفع ملف (TXT)
                  </label>
                </div>
                
                <button
                  type="submit"
                  disabled={!text.trim() || isAnalyzing}
                  className="flex-1 gradient-gold text-navy py-3.5 rounded-xl font-bold text-[15px] flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50 shadow-gold"
                >
                  {isAnalyzing ? <Loader2 size={18} className="animate-spin" /> : <ScanSearch size={18} />}
                  {isAnalyzing ? 'جاري التحليل محلياً...' : 'افحص النص'}
                </button>
              </div>
            </form>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-beige-dark shadow-lg flex flex-col items-center justify-center min-h-[400px]">
            {!isAnalyzing && result === null ? (
              <div className="text-center text-muted-foreground">
                <ScanSearch size={48} className="mx-auto mb-4 opacity-20" />
                <p>قم بإدخال النص لبدء الفحص المدعوم بنموذج RoBERTa المحلي</p>
              </div>
            ) : isAnalyzing ? (
              <div className="text-center">
                <Loader2 size={48} className="animate-spin text-gold mx-auto mb-4" />
                <p className="text-navy font-medium">جاري فحص الأنماط اللغوية وتراكيب الجمل محلياً...</p>
              </div>
            ) : (
              <div className="text-center w-full animate-in zoom-in duration-300">
                <h3 className="font-bold text-xl text-navy mb-6">احتمالية التوليد بالذكاء الاصطناعي</h3>
                
                <div className="relative w-40 h-40 mx-auto mb-6">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="10" fill="transparent" className="text-beige" />
                    <circle
                      cx="80" cy="80" r="70"
                      stroke="currentColor"
                      strokeWidth="10"
                      fill="transparent"
                      strokeDasharray="440"
                      strokeDashoffset={440 - (440 * result!) / 100}
                      className={result! > 50 ? "text-red-500 transition-all duration-1000" : "text-green-500 transition-all duration-1000"}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-4xl font-bold text-navy">{result}%</span>
                  </div>
                </div>

                {result! > 50 ? (
                  <div className="bg-red-50 border border-red-100 text-red-700 p-4 rounded-xl flex items-start gap-3 text-right">
                    <AlertTriangle className="shrink-0 mt-0.5 text-red-500" />
                    <div>
                      <h4 className="font-bold mb-1">مُولد آلياً بنسبة كبيرة</h4>
                      <p className="text-sm opacity-90">يبدو أن أجزاء كبيرة من هذا النص تمت كتابتها بواسطة نماذج لغوية (مثل ChatGPT).</p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-green-50 border border-green-100 text-green-700 p-4 rounded-xl flex items-start gap-3 text-right">
                    <ShieldCheck className="shrink-0 mt-0.5 text-green-500" />
                    <div>
                      <h4 className="font-bold mb-1">نص بشري أصلي</h4>
                      <p className="text-sm opacity-90">يُظهر النص أنماطاً تتوافق مع الكتابة البشرية الطبيعية ولم يتم اكتشاف تدخل آلي واضح.</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

        </div>
      </section>
    </div>
  );
};

export default AIDetectorPage;