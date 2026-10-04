import { useState, useRef, useEffect } from "react";
import { Send } from "lucide-react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import chatIcon from "@/assets/zubda-chat-icon.png";

interface Message {
  id: number;
  role: "user" | "model";
  content: string;
}

const WELCOME_MESSAGE: Message = {
  id: 1,
  role: "model",
  content:
    "أهلاً بك! أنا **زِبدة**، مساعدك الذكي للبحث العلمي 📚\n\nيمكنني مساعدتك في:\n- الإجابة على أسئلتك الأكاديمية\n- التحقق من المعلومات والمصادر\n\nاطرح عليّ أي سؤال بحثي وسأساعدك!",
};

const ChatPage = () => {
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg: Message = { id: Date.now(), role: "user", content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      // 1. تحضير سجل المحادثة السابق (تجاهل رسالة الترحيب)
      const historyForBackend = messages
        .filter((m) => m.id !== 1)
        .map((m) => ({
          role: m.role,
          parts: [m.content],
        }));

      // 2. إرسال الطلب إلى الباك إند الخاص بنا (Flask) بدلاً من جوجل مباشرة
      const response = await fetch("http://127.0.0.1:5000/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMsg.content,
          history: historyForBackend,
        }),
      });

      if (!response.ok) {
        throw new Error("حدث خطأ أثناء الاتصال بالخادم الداخلي");
      }

      const data = await response.json();
      
      // 3. التحقق من نجاح العملية من طرف الباك إند
      if (!data.success) {
        throw new Error(data.error || "حدث خطأ أثناء معالجة الرد");
      }

      const assistantMsg: Message = {
        id: Date.now() + 1,
        role: "model",
        content: data.reply,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      console.error("Chat API Error:", err);
      toast.error(err.message || "حدث خطأ في الاتصال بالمساعد الذكي");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-navy">
      {/* Header */}
      <div className="bg-navy-mid py-5 text-center border-b border-gold/15">
        <img src={chatIcon} alt="Zubda Chat" className="w-14 h-14 mx-auto mb-2" width={56} height={56} />
        <h1 className="font-amiri text-2xl font-bold text-white">محادثة زِبدة الذكية</h1>
        <p className="text-white/40 text-sm">اطرح أسئلتك البحثية واحصل على إجابات مدعّمة بـ Gemini AI</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto py-6 px-4">
        <div className="max-w-3xl mx-auto space-y-5">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
            >
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 font-amiri text-sm ${
                  msg.role === "model"
                    ? "bg-gold/20 text-gold-light"
                    : "bg-white/10 text-white/70"
                }`}
              >
                {msg.role === "model" ? "ز" : "أ"}
              </div>
              <div
                className={`max-w-[80%] px-4 py-3 text-[14px] leading-[1.7] ${
                  msg.role === "model"
                    ? "bg-navy-light text-white/80 rounded-[12px_4px_12px_12px]"
                    : "bg-gold/15 border border-gold/20 text-white/85 rounded-[4px_12px_12px_12px]"
                }`}
              >
                <div className="prose prose-sm prose-invert max-w-none [&_p]:mb-1 [&_ul]:mt-1 [&_li]:my-0.5">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3">
              <div className="w-9 h-9 rounded-full bg-gold/20 flex items-center justify-center text-gold-light font-amiri text-sm">ز</div>
              <div className="bg-navy-light rounded-[12px_4px_12px_12px] px-4 py-3">
                <div className="flex gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-gold animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-2 h-2 rounded-full bg-gold animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-2 h-2 rounded-full bg-gold animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="border-t border-gold/20 bg-navy-mid p-4">
        <form onSubmit={handleSend} className="max-w-3xl mx-auto">
          <div className="flex bg-white/5 border border-gold/20 rounded-xl overflow-hidden focus-within:border-gold/50">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="اكتب سؤالك البحثي هنا..."
              className="flex-1 bg-transparent border-none outline-none px-5 py-3.5 text-white text-sm placeholder:text-white/30 font-tajawal"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="gradient-gold px-5 py-3.5 text-navy hover:opacity-90 transition-opacity disabled:opacity-40"
            >
              <Send size={18} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChatPage;