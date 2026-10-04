import React, { useState, useEffect } from "react";
import { User, Mail, GraduationCap, BookOpen, Settings, Bell, Shield, Save, Edit2, Loader2, Key, Eye, EyeOff, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import mascotImg from "@/assets/zubda-mascot.png";
import { toast } from "sonner"; // إضافة مكتبة الإشعارات المنبثقة

const ProfilePage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("info");
  const [isEditing, setIsEditing] = useState(false);

  // حالات لتغيير كلمة المرور
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  
  // حالات لظهور وإخفاء كلمات المرور (العين)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // حالة تفعيل الإشعارات
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const userString = localStorage.getItem("user_session");
  const user = userString ? JSON.parse(userString) : null;

  const [profileData, setProfileData] = useState({
    fullName: user ? user.name : "",
    email: user ? user.email : "",
    university: "",
    major: "",
    bio: ""
  });

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  if (!user) return null;

  const handleSave = () => {
    setIsEditing(false);
    toast.success("تم حفظ التعديلات بنجاح!");
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    if (newPassword !== confirmNewPassword) {
      setPasswordError("كلمتا المرور الجديدة غير متطابقتين.");
      return;
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      setPasswordError("كلمة المرور الجديدة ضعيفة. يجب أن تحتوي على أحرف كبيرة وصغيرة، أرقام، ورموز (8 خانات على الأقل).");
      return;
    }

    setIsUpdatingPassword(true);

    try {
      const response = await fetch("http://127.0.0.1:5000/api/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: profileData.email,
          current_password: currentPassword,
          new_password: newPassword
        }),
      });

      const data = await response.json();

      if (data.success) {
        setPasswordSuccess("تم تغيير كلمة المرور بنجاح!");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmNewPassword("");
        setShowCurrentPassword(false);
        setShowNewPassword(false);
        setShowConfirmPassword(false);
        
        setTimeout(() => {
          setIsChangingPassword(false);
          setPasswordSuccess(null);
        }, 3000);
      } else {
        setPasswordError(data.error);
      }
    } catch (err) {
      setPasswordError("حدث خطأ أثناء الاتصال بالخادم.");
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  return (
    <div className="min-h-screen bg-beige-lightest py-10" dir="rtl">
      <div className="container mx-auto px-4 max-w-5xl">
        
        <div className="bg-navy rounded-3xl p-8 relative overflow-hidden shadow-xl border border-gold/20 mb-8 flex flex-col md:flex-row items-center gap-6">
          <div className="absolute top-[-20%] left-[-10%] w-64 h-64 bg-gold/20 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="w-24 h-24 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center border-2 border-gold/40 shrink-0 relative z-10 overflow-hidden">
            <User size={40} className="text-gold-light" />
          </div>
          
          <div className="text-center md:text-right relative z-10 flex-1">
            <h1 className="font-amiri text-3xl font-bold text-white mb-2">{profileData.fullName}</h1>
            <p className="text-white/60 flex items-center justify-center md:justify-start gap-2 text-sm">
              <Mail size={14} /> {profileData.email}
            </p>
          </div>
          
          <img src={mascotImg} alt="زبدة" className="w-20 h-20 opacity-80 hidden md:block drop-shadow-lg" />
        </div>

        <div className="grid md:grid-cols-4 gap-8">
          <div className="md:col-span-1 space-y-2">
            <button 
              onClick={() => setActiveTab("info")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${
                activeTab === "info" ? "bg-white text-navy shadow-md border border-beige-dark" : "text-navy/60 hover:bg-white/50"
              }`}
            >
              <User size={18} className={activeTab === "info" ? "text-gold-dark" : ""} />
              المعلومات الشخصية
            </button>
            <button 
              onClick={() => setActiveTab("settings")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${
                activeTab === "settings" ? "bg-white text-navy shadow-md border border-beige-dark" : "text-navy/60 hover:bg-white/50"
              }`}
            >
              <Settings size={18} className={activeTab === "settings" ? "text-gold-dark" : ""} />
              إعدادات الحساب
            </button>
          </div>

          <div className="md:col-span-3">
            {activeTab === "info" && (
              <div className="bg-white rounded-2xl shadow-lg border border-beige-dark p-6 md:p-8 animate-in fade-in slide-in-from-bottom-4">
                <div className="flex justify-between items-center mb-6 border-b border-beige pb-4">
                  <h2 className="font-amiri text-2xl font-bold text-navy flex items-center gap-2">
                    <User className="text-gold" /> الهوية الأكاديمية
                  </h2>
                  <button 
                    onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                    className="text-sm font-bold bg-navy/5 hover:bg-navy/10 text-navy px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                  >
                    {isEditing ? <Save size={16} /> : <Edit2 size={16} />}
                    {isEditing ? "حفظ التعديلات" : "تعديل البيانات"}
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-navy/70 mb-2">الاسم الكامل</label>
                      <input 
                        type="text" 
                        disabled={!isEditing}
                        value={profileData.fullName}
                        onChange={(e) => setProfileData({...profileData, fullName: e.target.value})}
                        className="w-full bg-beige-lightest border border-beige-dark rounded-xl px-4 py-3 text-navy focus:outline-none focus:border-gold disabled:opacity-70 disabled:bg-gray-50 text-right"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-navy/70 mb-2">البريد الإلكتروني</label>
                      <input 
                        type="email" 
                        disabled
                        value={profileData.email}
                        dir="ltr"
                        className="w-full bg-gray-50 border border-beige-dark rounded-xl px-4 py-3 text-navy/60 cursor-not-allowed text-left"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="flex text-sm font-bold text-navy/70 mb-2 items-center gap-1">
                        <GraduationCap size={16} /> الجامعة / المؤسسة
                      </label>
                      <input 
                        type="text" 
                        disabled={!isEditing}
                        value={profileData.university}
                        onChange={(e) => setProfileData({...profileData, university: e.target.value})}
                        placeholder="أدخل اسم جامعتك..."
                        className="w-full bg-beige-lightest border border-beige-dark rounded-xl px-4 py-3 text-navy focus:outline-none focus:border-gold disabled:opacity-70 disabled:bg-gray-50 placeholder:text-navy/30 text-right"
                      />
                    </div>
                    <div>
                      <label className="flex text-sm font-bold text-navy/70 mb-2 items-center gap-1">
                        <BookOpen size={16} /> التخصص
                      </label>
                      <input 
                        type="text" 
                        disabled={!isEditing}
                        value={profileData.major}
                        onChange={(e) => setProfileData({...profileData, major: e.target.value})}
                        placeholder="أدخل تخصصك الأكاديمي..."
                        className="w-full bg-beige-lightest border border-beige-dark rounded-xl px-4 py-3 text-navy focus:outline-none focus:border-gold disabled:opacity-70 disabled:bg-gray-50 placeholder:text-navy/30 text-right"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-navy/70 mb-2">النبذة التعريفية (Bio)</label>
                    <textarea 
                      disabled={!isEditing}
                      value={profileData.bio}
                      onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                      placeholder="اكتب نبذة مختصرة عن اهتماماتك البحثية..."
                      className="w-full bg-beige-lightest border border-beige-dark rounded-xl px-4 py-3 text-navy focus:outline-none focus:border-gold disabled:opacity-70 disabled:bg-gray-50 min-h-[100px] resize-none placeholder:text-navy/30 text-right"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === "settings" && (
              <div className="bg-white rounded-2xl shadow-lg border border-beige-dark p-6 md:p-8 animate-in fade-in slide-in-from-bottom-4">
                <h2 className="font-amiri text-2xl font-bold text-navy flex items-center gap-2 mb-6 border-b border-beige pb-4">
                  <Settings className="text-gold" /> إعدادات الحساب
                </h2>
                
                <div className="space-y-4">
                  <div className="border border-beige-dark rounded-xl hover:border-gold/30 transition-colors overflow-hidden">
                    <div className="flex items-center justify-between p-4 bg-white">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-navy/5 rounded-lg text-navy"><Shield size={20} /></div>
                        <div>
                          <h4 className="font-bold text-navy">تغيير كلمة المرور</h4>
                          <p className="text-xs text-navy/60">قم بتحديث كلمة المرور الخاصة بك لضمان أمان حسابك</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => setIsChangingPassword(!isChangingPassword)}
                        className={`text-sm font-bold px-4 py-2 rounded-lg transition-colors ${isChangingPassword ? "bg-gray-100 text-gray-600" : "bg-navy text-white hover:bg-navy-light"}`}
                      >
                        {isChangingPassword ? "إلغاء" : "تحديث"}
                      </button>
                    </div>

                    {isChangingPassword && (
                      <div className="p-6 bg-beige-lightest border-t border-beige-dark animate-in slide-in-from-top-2">
                        {passwordError && (
                          <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm mb-4 border border-red-200">
                            {passwordError}
                          </div>
                        )}
                        {passwordSuccess && (
                          <div className="bg-green-50 text-green-700 p-3 rounded-lg text-sm mb-4 border border-green-200">
                            {passwordSuccess}
                          </div>
                        )}
                        
                        <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-sm">
                          <div>
                            <label className="block text-xs font-bold text-navy/70 mb-1">كلمة المرور الحالية</label>
                            <div className="relative">
                              <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 text-navy/40" size={16} />
                              <input 
                                type={showCurrentPassword ? "text" : "password"} 
                                required
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                className="w-full bg-white border border-beige-dark rounded-lg pr-10 pl-10 py-2 text-sm focus:outline-none focus:border-gold text-right"
                                dir="ltr"
                              />
                              {currentPassword.length > 0 && (
                                <button 
                                  type="button"
                                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-navy/40 hover:text-gold transition-colors focus:outline-none animate-in fade-in zoom-in duration-200"
                                >
                                  {showCurrentPassword ? <Eye size={16} /> : <EyeOff size={16} />}
                                </button>
                              )}
                            </div>
                          </div>
                          
                          <div>
                            <label className="block text-xs font-bold text-navy/70 mb-1">كلمة المرور الجديدة</label>
                            <div className="relative">
                              <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 text-navy/40" size={16} />
                              <input 
                                type={showNewPassword ? "text" : "password"} 
                                required
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full bg-white border border-beige-dark rounded-lg pr-10 pl-10 py-2 text-sm focus:outline-none focus:border-gold text-right"
                                dir="ltr"
                              />
                              {newPassword.length > 0 && (
                                <button 
                                  type="button"
                                  onClick={() => setShowNewPassword(!showNewPassword)}
                                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-navy/40 hover:text-gold transition-colors focus:outline-none animate-in fade-in zoom-in duration-200"
                                >
                                  {showNewPassword ? <Eye size={16} /> : <EyeOff size={16} />}
                                </button>
                              )}
                            </div>
                          </div>
                          
                          <div>
                            <label className="block text-xs font-bold text-navy/70 mb-1">تأكيد كلمة المرور الجديدة</label>
                            <div className="relative">
                              <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 text-navy/40" size={16} />
                              <input 
                                type={showConfirmPassword ? "text" : "password"} 
                                required
                                value={confirmNewPassword}
                                onChange={(e) => setConfirmNewPassword(e.target.value)}
                                className="w-full bg-white border border-beige-dark rounded-lg pr-10 pl-10 py-2 text-sm focus:outline-none focus:border-gold text-right"
                                dir="ltr"
                              />
                              {confirmNewPassword.length > 0 && (
                                <button 
                                  type="button"
                                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-navy/40 hover:text-gold transition-colors focus:outline-none animate-in fade-in zoom-in duration-200"
                                >
                                  {showConfirmPassword ? <Eye size={16} /> : <EyeOff size={16} />}
                                </button>
                              )}
                            </div>
                          </div>

                          <button 
                            type="submit" 
                            disabled={isUpdatingPassword}
                            className="w-full gradient-gold text-navy font-bold py-2.5 rounded-lg flex justify-center items-center gap-2 hover:opacity-90 disabled:opacity-50 text-sm mt-2"
                          >
                            {isUpdatingPassword ? <Loader2 className="animate-spin" size={16} /> : <Key size={16} />}
                            حفظ كلمة المرور
                          </button>
                        </form>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between p-4 border border-beige-dark rounded-xl hover:border-gold/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-navy/5 rounded-lg text-navy"><Bell size={20} /></div>
                      <div>
                        <h4 className="font-bold text-navy">الإشعارات والتنبيهات</h4>
                        <p className="text-xs text-navy/60">تلقي تنبيهات عند توفر أبحاث جديدة في مجالك</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={notificationsEnabled}
                        onChange={async (e) => {
                          const newState = e.target.checked;
                          const previousState = notificationsEnabled; // نحفظ الحالة السابقة للرجوع إليها في حال حدوث خطأ
                          setNotificationsEnabled(newState);
                          
                          try {
                            const response = await fetch("http://127.0.0.1:5000/api/toggle-notifications", {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ email: profileData.email, enabled: newState }),
                            });
                            
                            const data = await response.json();
                            if (data.success) {
                              if (newState) {
                                toast.success("تم تفعيل الإشعارات بنجاح! تفقد بريدك الإلكتروني.");
                              } else {
                                toast.info("تم إيقاف الإشعارات.");
                              }
                            } else {
                              setNotificationsEnabled(previousState);
                              toast.error("حدث خطأ أثناء حفظ الإعدادات.");
                            }
                          } catch (err) {
                            console.error("فشل تحديث الإشعارات");
                            setNotificationsEnabled(previousState);
                            toast.error("تعذر الاتصال بالخادم.");
                          }
                        }} 
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gold"></div>
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;