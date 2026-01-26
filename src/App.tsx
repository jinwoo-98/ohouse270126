import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import CategoryPage from "./pages/CategoryPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import AboutPage from "./pages/AboutPage";
import SupportPage from "./pages/SupportPage";
import CartPage from "./pages/CartPage";
import WishlistPage from "./pages/WishlistPage";
import AccountPage from "./pages/AccountPage";
import RecruitmentPage from "./pages/RecruitmentPage";
import NewsPage from "./pages/NewsPage";
import ProjectsPage from "./pages/ProjectsPage";
import ContactPage from "./pages/ContactPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          
          {/* Room Category Pages */}
          <Route path="/noi-that" element={<CategoryPage />} />
          <Route path="/phong-khach" element={<CategoryPage />} />
          <Route path="/phong-ngu" element={<CategoryPage />} />
          <Route path="/phong-an" element={<CategoryPage />} />
          <Route path="/phong-tam" element={<CategoryPage />} />
          <Route path="/phong-lam-viec" element={<CategoryPage />} />
          
          {/* Product Category Pages */}
          <Route path="/sofa" element={<CategoryPage />} />
          <Route path="/ban-an" element={<CategoryPage />} />
          <Route path="/ban-tra" element={<CategoryPage />} />
          <Route path="/ke-tivi" element={<CategoryPage />} />
          <Route path="/giuong" element={<CategoryPage />} />
          <Route path="/ban-lam-viec" element={<CategoryPage />} />
          <Route path="/den-trang-tri" element={<CategoryPage />} />
          <Route path="/decor" element={<CategoryPage />} />
          <Route path="/sale" element={<CategoryPage />} />
          
          {/* Product Detail */}
          <Route path="/san-pham/:id" element={<ProductDetailPage />} />
          
          {/* Cart & Wishlist */}
          <Route path="/gio-hang" element={<CartPage />} />
          <Route path="/yeu-thich" element={<WishlistPage />} />
          
          {/* Account */}
          <Route path="/tai-khoan" element={<AccountPage />} />
          
          {/* About Pages */}
          <Route path="/ve-chung-toi" element={<AboutPage />} />
          <Route path="/tuyen-dung" element={<RecruitmentPage />} />
          <Route path="/tin-tuc" element={<NewsPage />} />
          <Route path="/du-an" element={<ProjectsPage />} />
          <Route path="/lien-he" element={<ContactPage />} />
          <Route path="/hop-tac" element={<ContactPage />} />
          
          {/* Support Pages */}
          <Route path="/ho-tro/:slug" element={<SupportPage />} />
          <Route path="/huong-dan" element={<SupportPage />} />
          <Route path="/doi-tra" element={<SupportPage />} />
          <Route path="/bao-hanh" element={<SupportPage />} />
          <Route path="/thanh-toan" element={<SupportPage />} />
          <Route path="/van-chuyen" element={<SupportPage />} />
          <Route path="/faq" element={<SupportPage />} />
          
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
