import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Index from "./pages/Index";
import SearchPage from "./pages/SearchPage";
import ChatPage from "./pages/ChatPage";
import AboutPage from "./pages/AboutPage";
import NotFound from "./pages/NotFound";
import AIDetectorPage from "./pages/AIDetectorPage";
import IdeasPage from "./pages/IdeasPage"; 
import LoginPage from "./pages/LoginPage"; 
import ProfilePage from "./pages/ProfilePage"; // 1. إضافة استيراد صفحة الملف الشخصي هنا

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/ideas" element={<IdeasPage />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/detect" element={<AIDetectorPage />} />
          <Route path="/login" element={<LoginPage />} /> 
          <Route path="/profile" element={<ProfilePage />} /> {/* 2. إضافة مسار صفحة الملف الشخصي هنا */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Footer />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;