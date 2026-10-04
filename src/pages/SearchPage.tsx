import { useState, useEffect, useRef } from "react";
import { Search, Calendar, User, ExternalLink, ArrowRight, Loader2, Sparkles, UploadCloud, AlertCircle, DownloadCloud } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import searchIcon from "@/assets/zubda-search-icon.png";

interface Paper {
  id: string; 
  title: string;
  authors: string;
  journal: string;
  year: number | string;
  abstract: string;
  citations: number;
  field: string;
  doi?: string;
  url?: string;
  pdfUrl?: string; 
}

const featuredTopics = [
  { label: "الذكاء الاصطناعي والتعليم", query: "artificial intelligence education" },
  { label: "معالجة اللغة العربية", query: "arabic natural language processing" },
  { label: "الشبكات العصبية", query: "neural networks" },
  { label: "الطب الدقيق", query: "precision medicine" },
  { label: "الطاقة المتجددة", query: "renewable energy" },
];

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  
  const [query, setQuery] = useState(initialQuery);
  const [papers, setPapers] = useState<Paper[]>([]); 
  const [isLoading, setIsLoading] = useState(false); 
  const [error, setError] = useState<string | null>(null); 
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedPaper, setSelectedPaper] = useState<Paper | null>(null);
  
  const [usedQuery, setUsedQuery] = useState<string | null>(null);

  const [aiTranslation, setAiTranslation] = useState<string | null>(null);
  const [originalSummary, setOriginalSummary] = useState<string | null>(null);
  const [fullTranslation, setFullTranslation] = useState<string | null>(null); 
  const [localExtractedText, setLocalExtractedText] = useState<string | null>(null);
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [isFetchingFull, setIsFetchingFull] = useState(false); 
  const [aiError, setAiError] = useState<string | null>(null); 
  const [activeTab, setActiveTab] = useState<"summary" | "full">("summary"); 
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processPaperAbstract = async (text: string) => {
    setIsProcessing(true); setAiTranslation(null); setOriginalSummary(null); setFullTranslation(null); setAiError(null); setActiveTab("summary");
    try {
      const response = await fetch("http://127.0.0.1:5000/api/process", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text }),
      });
      if (!response.ok) throw new Error("فشل الاتصال بالخادم");
      const data = await response.json();
      if (data.success) { 
        setAiTranslation(data.arabic_summary); 
        setOriginalSummary(data.original_summary); 
      } 
      else setAiError(data.error);
    } catch (err) { 
      setAiError("عذراً، لا يمكن الاتصال بخادم الذكاء الاصطناعي المحلي. تأكد من تشغيله."); 
    } 
    finally { setIsProcessing(false); }
  };

  const fetchAndTranslatePdf = async (url: string) => {
    setIsFetchingFull(true); setFullTranslation(null); setAiError(null);
    try {
      const finalUrl = url.replace("http://", "https://");
      
      const response = await fetch("http://127.0.0.1:5000/api/fetch-url", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ url: finalUrl }),
      });
      if (!response.ok) throw new Error("فشل الاتصال بالخادم");
      const data = await response.json();
      if (data.success) { setFullTranslation(data.full_arabic_translation); setActiveTab("full"); } 
      else { setAiError(data.error); }
    } catch (err) { setAiError("عذراً، فشل تحميل البحث من المصدر."); } 
    finally { setIsFetchingFull(false); }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]; if (!file) return;
    setHasSearched(true);
    setSelectedPaper({ id: "upload", title: file.name, authors: "الباحث", journal: "مستند محلي مرفوع", year: new Date().getFullYear(), abstract: "جاري استخراج وقراءة الملف...", citations: 0, field: "مستند محلي" });
    setIsProcessing(true); setAiTranslation(null); setOriginalSummary(null); setFullTranslation(null); setLocalExtractedText(null); setAiError(null); setActiveTab("summary");
    
    const formData = new FormData(); formData.append("file", file);
    try {
      const response = await fetch("http://127.0.0.1:5000/api/upload", { method: "POST", body: formData, });
      if (!response.ok) throw new Error("فشل الاتصال بالخادم");
      const data = await response.json();
      if (data.success) { 
        setAiTranslation(data.arabic_summary); 
        setOriginalSummary(data.original_summary); 
        setLocalExtractedText(data.extracted_full_text); 
        setSelectedPaper(prev => prev ? {...prev, abstract: "تم استخراج وقراءة الملف. يمكنك طلب الترجمة الكاملة الآن."} : null); 
      } 
      else { setAiError(data.error); setSelectedPaper(prev => prev ? {...prev, abstract: "توقفت العملية بسبب مشكلة في الملف."} : null); }
    } catch (err) { setAiError("عذراً، لا يمكن الاتصال بخادم الذكاء الاصطناعي المحلي. تأكد من تشغيله."); setSelectedPaper(prev => prev ? {...prev, abstract: "فشل الاتصال بالخادم."} : null); } 
    finally { setIsProcessing(false); if (fileInputRef.current) fileInputRef.current.value = ''; }
  };

  const translateLocalText = async (text: string) => {
    setIsFetchingFull(true); setFullTranslation(null); setAiError(null);
    try {
      const response = await fetch("http://127.0.0.1:5000/api/translate-full-text", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text }),
      });
      if (!response.ok) throw new Error("فشل الاتصال بالخادم");
      const data = await response.json();
      if (data.success) { setFullTranslation(data.full_arabic_translation); setActiveTab("full"); } 
      else { setAiError(data.error); }
    } catch (err) { setAiError("عذراً، فشل ترجمة البحث."); } 
    finally { setIsFetchingFull(false); }
  };

  const fetchPapersFromAPI = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    setIsLoading(true); setError(null); setHasSearched(true); setSelectedPaper(null); setUsedQuery(null);

    try {
      const response = await fetch("http://127.0.0.1:5000/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: searchQuery }),
      });
      if (!response.ok) throw new Error('الخادم المحلي (البايثون) لا يستجيب. يرجى التأكد من تشغيله.');
      const data = await response.json();
      if (!data.success) throw new Error(data.error || 'حدث خطأ أثناء جلب البيانات.');
      if (data.used_query) setUsedQuery(data.used_query);

      const fetchedPapers: Paper[] = data.data;
      if (!fetchedPapers || fetchedPapers.length === 0) {
        setError("لم يتم العثور على أبحاث مطابقة لبحثك.");
        setPapers([]);
      } else {
        setPapers(fetchedPapers);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "حدث خطأ غير معروف أثناء البحث.");
      setPapers([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { if (initialQuery) fetchPapersFromAPI(initialQuery); }, []);
  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); fetchPapersFromAPI(query); };
  const handleTopicClick = (topicQuery: string) => { setQuery(topicQuery); fetchPapersFromAPI(topicQuery); };
  const handlePaperSelect = (paper: Paper) => { setSelectedPaper(paper); if (paper.abstract && paper.abstract.length > 20 && paper.id !== "upload") { processPaperAbstract(paper.abstract); } };

  return (
    <div className="min-h-screen bg-beige-lightest">
      <section className="bg-navy py-14">
        <div className="container mx-auto px-4 text-center">
          <img src={searchIcon} alt="" className="w-20 h-20 mx-auto mb-4" width={80} height={80} />
          <h1 className="font-amiri text-3xl font-bold text-white mb-2">محرك البحث العلمي (الزِبْدة)</h1>
          <p className="text-white/50 text-sm mb-8">ابحث باللغة العربية أو الإنجليزية في أضخم قواعد البيانات العلمية المفتوحة</p>

          <form onSubmit={handleSearch} className="max-w-3xl mx-auto mb-6">
            <div className="flex bg-white/5 border border-gold/25 rounded-xl overflow-hidden transition-all focus-within:border-gold/60 focus-within:shadow-[0_0_0_3px_hsl(var(--gold)/0.1)]">
              <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="مثال: الذكاء الاصطناعي، أو Machine Learning..." className="flex-1 bg-transparent border-none outline-none px-5 py-4 text-white text-[15px] placeholder:text-white/35 font-tajawal" />
              <button type="submit" disabled={isLoading} className="gradient-gold px-7 py-4 text-navy font-bold text-[15px] flex items-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50">
                {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />} {isLoading ? 'جاري البحث...' : 'ابحث'}
              </button>
            </div>
          </form>

          <div className="flex justify-center mb-6">
            <input type="file" accept=".pdf,.docx" ref={fileInputRef} onChange={handleFileUpload} className="hidden" id="file-upload" />
            <label htmlFor="file-upload" className="cursor-pointer flex items-center gap-2 bg-transparent border border-gold/40 text-gold hover:bg-gold/10 px-6 py-3 rounded-xl transition-all shadow-lg">
              <UploadCloud size={20} /> <span className="font-medium text-sm">أو ارفع بحثك للتلخيص والترجمة (PDF / Word)</span>
            </label>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-10">
        {selectedPaper ? (
          <div className="max-w-4xl mx-auto">
            <button onClick={() => setSelectedPaper(null)} className="flex items-center gap-2 text-gold-dark font-medium mb-6 hover:text-gold transition-colors">
              <ArrowRight size={18} /> العودة إلى النتائج
            </button>
            <article className="bg-white rounded-2xl p-8 border border-beige-dark shadow-lg">
              <div className="mb-6">
                <span className="inline-block bg-navy/5 text-navy px-3 py-1 rounded text-xs font-bold mb-4">{selectedPaper.journal}</span>
                <h2 className="font-amiri text-2xl font-bold text-navy leading-relaxed mb-4">{selectedPaper.title}</h2>
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4">
                  <span className="flex items-center gap-1"><User size={14} />{selectedPaper.authors}</span>
                  <span className="flex items-center gap-1"><Calendar size={14} />{selectedPaper.year}</span>
                </div>
              </div>

              <div className="border-t border-beige pt-8 mb-6">
                <div className="bg-navy-light/5 border border-gold/30 rounded-2xl p-6 relative overflow-hidden">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                      <Sparkles className="text-gold" size={22} />
                      <h3 className="font-amiri font-bold text-navy text-2xl">الزِبْدة (التلخيص والترجمة)</h3>
                    </div>
                    
                    {/* زر سحب الترجمة لأبحاث الإنترنت */}
                    {selectedPaper.pdfUrl && !fullTranslation && selectedPaper.id !== "upload" && (
                      <button 
                        onClick={() => fetchAndTranslatePdf(selectedPaper.pdfUrl!)}
                        disabled={isFetchingFull}
                        className="flex items-center gap-2 bg-gold text-navy px-4 py-2 rounded-lg font-bold text-sm shadow-md hover:bg-gold-light transition-all disabled:opacity-50"
                      >
                        {isFetchingFull ? <Loader2 size={16} className="animate-spin" /> : <DownloadCloud size={16} />}
                        {isFetchingFull ? "جاري سحب وترجمة البحث..." : "استخراج وترجمة البحث كاملاً"}
                      </button>
                    )}

                    {/* زر ترجمة البحث للملفات المرفوعة */}
                    {selectedPaper.id === "upload" && !fullTranslation && (
                      <button 
                        onClick={() => {
                          if (localExtractedText) {
                            translateLocalText(localExtractedText);
                          } else {
                            setAiError("حدث خطأ في قراءة النص الداخلي. يرجى إعادة رفع الملف.");
                          }
                        }}
                        disabled={isFetchingFull}
                        className="flex items-center gap-2 bg-gold text-navy px-4 py-2 rounded-lg font-bold text-sm shadow-md hover:bg-gold-light transition-all disabled:opacity-50"
                      >
                        {isFetchingFull ? <Loader2 size={16} className="animate-spin" /> : <DownloadCloud size={16} />}
                        {isFetchingFull ? "جاري ترجمة البحث كاملاً..." : "استخراج وترجمة البحث كاملاً"}
                      </button>
                    )}
                  </div>
                  
                  {isProcessing ? (
                    <div className="flex flex-col items-center justify-center py-8 space-y-4">
                      <Loader2 size={36} className="animate-spin text-gold" />
                      <div className="text-center">
                        <p className="text-navy font-bold">جاري القراءة والتلخيص...</p>
                      </div>
                    </div>
                  ) : aiError ? (
                    <div className="bg-red-50 text-red-700 p-5 rounded-xl border border-red-200 flex items-start gap-3">
                      <AlertCircle size={20} className="shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-bold mb-1">تنبيه</h4>
                        <p className="text-sm leading-relaxed opacity-90">{aiError}</p>
                      </div>
                    </div>
                  ) : aiTranslation ? (
                    <div className="space-y-6">
                      <div className="flex gap-6 border-b border-gold/20 pb-0">
                        <button onClick={() => setActiveTab("summary")} className={`font-bold pb-3 px-2 transition-all ${activeTab === "summary" ? "text-navy border-b-2 border-gold" : "text-navy/50 hover:text-navy/80"}`}>
                          الملخص الذكي (عربي / إنجليزي)
                        </button>
                        
                        {/* ⬅️ لن يظهر هذا التبويب إلا بعد أن تتم الترجمة الكاملة فعلياً! */}
                        {fullTranslation && (
                          <button onClick={() => setActiveTab("full")} className={`font-bold pb-3 px-2 transition-all ${activeTab === "full" ? "text-navy border-b-2 border-gold" : "text-navy/50 hover:text-navy/80"}`}>
                            ترجمة البحث كاملة
                          </button>
                        )}
                      </div>

                      {activeTab === "summary" ? (
                        <div className="space-y-4">
                          <div className="bg-white rounded-xl p-5 border border-gold/20 shadow-sm">
                            <h4 className="font-bold text-navy mb-3 flex items-center gap-2 border-b border-gold/20 pb-2">الملخص باللغة العربية</h4>
                            <p className="text-navy/80 font-medium leading-[1.8] text-[15px]">{aiTranslation}</p>
                          </div>
                          
                          {originalSummary && (
                            <div className="bg-gray-50 rounded-xl p-5 border border-gray-200" dir="ltr">
                              <h4 className="font-bold text-gray-700 mb-3 border-b border-gray-200 pb-2">English Summary</h4>
                              <p className="text-gray-600 font-medium leading-[1.6] text-[14px]">{originalSummary}</p>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="bg-white rounded-xl p-5 border border-gold/20 shadow-sm">
                          <p className="text-navy/80 font-medium leading-[1.9] text-[15px] whitespace-pre-line">{fullTranslation}</p>
                        </div>
                      )}
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="border-t border-beige pt-6 flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{selectedPaper.id === "upload" ? "مستند محلي مرفوع" : "Open Access Resource"}</span>
                {selectedPaper.url && selectedPaper.id !== "upload" && (
                  <a href={selectedPaper.url} target="_blank" rel="noopener noreferrer" className="gradient-gold text-navy px-6 py-2 rounded-lg font-bold text-sm hover:opacity-90 transition-opacity shadow-gold flex items-center gap-2">
                    <ExternalLink size={16} /> عرض المصدر الأصلي
                  </a>
                )}
              </div>
            </article>
          </div>
        ) : !hasSearched ? (
          <div className="max-w-4xl mx-auto">
            <h2 className="font-amiri text-2xl font-bold text-navy mb-8 text-center">مواضيع بحثية مقترحة</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {featuredTopics.map((topic, i) => (
                <button key={i} onClick={() => handleTopicClick(topic.query)} className="group bg-white rounded-xl p-6 border border-beige-dark text-right hover:border-gold/50 hover:shadow-lg transition-all">
                  <h3 className="font-bold text-navy mb-2 group-hover:text-gold-dark transition-colors">{topic.label}</h3>
                  <p className="text-muted-foreground text-sm">اضغط للبحث عن أحدث الأبحاث</p>
                </button>
              ))}
            </div>
          </div>
        ) : isLoading ? (
           <div className="max-w-4xl mx-auto text-center py-20">
             <Loader2 size={40} className="animate-spin text-gold mx-auto mb-4" />
             <p className="text-navy font-medium">جاري البحث في قاعدة البيانات العلمية...</p>
           </div>
        ) : error ? (
           <div className="max-w-4xl mx-auto text-center py-20 bg-red-50 rounded-xl border border-red-200">
             <p className="text-red-600 font-medium">{error}</p>
           </div>
        ) : papers.length === 0 ? (
           <div className="max-w-4xl mx-auto text-center py-20">
             <p className="text-muted-foreground font-medium">لم يتم العثور على أبحاث مطابقة لبحثك.</p>
           </div>
        ) : (
          <div className="max-w-4xl mx-auto">
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <p className="text-muted-foreground">تم العثور على <span className="font-bold text-gold-dark">{papers.length}</span> نتيجة</p>
              
              {usedQuery && usedQuery !== query && (
                <div className="bg-gold/10 border border-gold/30 text-navy px-4 py-2 rounded-lg text-sm flex items-center gap-2">
                  <Sparkles size={16} className="text-gold-dark" />
                  <span>ترجمة ذكية تلقائية:</span>
                  <span className="font-bold font-sans" dir="ltr">{usedQuery}</span>
                </div>
              )}
            </div>

            <div className="space-y-4">
              {papers.map((paper) => (
                <article key={paper.id} onClick={() => handlePaperSelect(paper)} className="bg-white rounded-xl p-6 border border-beige-dark cursor-pointer hover:border-gold/50 transition-all group">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-navy mb-2 leading-relaxed group-hover:text-gold-dark transition-colors">{paper.title}</h3>
                      <div className="flex gap-4 text-sm text-gray-500 mb-2">
                        <span className="flex items-center gap-1"><User size={14} />{paper.authors}</span>
                        <span className="flex items-center gap-1"><Calendar size={14} />{paper.year}</span>
                      </div>
                      <p className="text-foreground/60 leading-relaxed text-sm line-clamp-2 mb-3">{paper.abstract}</p>
                      {paper.pdfUrl && <span className="bg-green-100 text-green-700 text-xs px-3 py-1 rounded font-medium">متوفر PDF مجاني 📥</span>}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default SearchPage;