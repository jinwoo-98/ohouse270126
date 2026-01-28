import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { CartProvider } from "./contexts/CartContext";
import { WishlistProvider } from "./contexts/WishlistContext";
import ScrollToTop from "./components/ScrollToTop";
import { BackToTop } from "./components/layout/BackToTop";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import CategoryPage from "./pages/CategoryPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import AboutPage from "./pages/AboutPage";
import SupportPage from "./pages/SupportPage";
import CartPage from "./pages/CartPage";
import WishlistPage from "./pages/WishlistPage";
import RecentlyViewedPage from "./pages/RecentlyViewedPage";
import AccountPage from "./pages/AccountPage";
import ProfileDashboard from "./pages/ProfileDashboard";
import RecruitmentPage from "./pages/RecruitmentPage";
import NewsPage from "./pages/NewsPage";
import NewsDetailPage from "./pages/NewsDetailPage";
import ProjectsPage from "./pages/ProjectsPage";
import ProjectDetailPage from "./pages/ProjectDetailPage";
import ContactPage from "./pages/ContactPage";
import ShowroomPage from "./pages/ShowroomPage";
import InspirationPage from "./pages/InspirationPage";
import DesignServicePage from "./pages/DesignServicePage";
import SearchPage from "./pages/SearchPage";
import OrderSuccessPage from "./pages/OrderSuccessPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";

const queryClient = new QueryClient();

// List of all category and subcategory slugs to avoid manual maintenance
const categoryRoutes = [
  "noi-that", "phong-khach", "phong-ngu", "phong-an", "phong-tam", "phong-lam-viec",
  "sofa", "ban-tra", "ke-tivi", "den-san", "tu-trang-tri",
  "giuong", "tu-quan-ao", "ban-trang-diem", "den-ngu",
  "ban-an", "ghe-an", "tu-ruou", "den-chum",
  "ban-ghe", "ghe-thu-gian", "ban-lam-viec", "ban-console",
  "den-trang-tri", "den-ban", "den-tuong",
  "decor", "tranh", "tham", "guong", "binh-hoa",
  "sale", "ban-chay", "moi"
];

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Toaster asSonner position="top-center" />
      <BrowserRouter>
        <ScrollToTop />
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <Routes>
                <Route path="/" element={<Index />} />
                
                {/* Dynamic Category Routes */}
                {categoryRoutes.map(slug => (
                  <Route key={slug} path={`/${slug}`} element={<CategoryPage />} />
                ))}

                <Route path="/tim-kiem" element={<SearchPage />} />
                <Route path="/san-pham/:id" element={<ProductDetailPage />} />
                <Route path="/gio-hang" element={<CartPage />} />
                <Route path="/yeu-thich" element={<ProfileDashboard />} />
                <Route path="/lich-su-xem" element={<RecentlyViewedPage />} />
                <Route path="/dat-hang-thanh-cong" element={<OrderSuccessPage />} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />
                
                <Route path="/tai-khoan" element={<ProfileDashboard />}>
                  <Route index element={<Navigate to="thong-tin" replace />} />
                  <Route path="thong-tin" element={<></>} />
                  <Route path="don-hang" element={<></>} />
                  <Route path="vouchers" element={<></>} />
                  <Route path="points" element={<></>} />
                  <Route path="dia-chi" element={<></>} />
                  <Route path="cai-dat" element={<></>} />
                </Route>

                <Route path="/dang-nhap" element={<AccountPage />} />
                <Route path="/showroom" element={<ShowroomPage />} />
                <Route path="/cam-hung" element={<InspirationPage />} />
                <Route path="/thiet-ke" element={<DesignServicePage />} />
                <Route path="/y-tuong/:slug" element={<InspirationPage />} />
                <Route path="/ve-chung-toi" element={<AboutPage />} />
                <Route path="/tuyen-dung" element={<RecruitmentPage />} />
                <Route path="/tin-tuc" element={<NewsPage />} />
                <Route path="/tin-tuc/:id" element={<NewsDetailPage />} />
                <Route path="/du-an" element={<ProjectsPage />} />
                <Route path="/du-an/:id" element={<ProjectDetailPage />} />
                <Route path="/lien-he" element={<ContactPage />} />
                <Route path="/hop-tac" element={<ContactPage />} />
                <Route path="/ho-tro/:slug" element={<SupportPage />} />
                <Route path="/huong-dan" element={<SupportPage />} />
                <Route path="/doi-tra" element={<SupportPage />} />
                <Route path="/bao-hanh" element={<SupportPage />} />
                <Route path="/thanh-toan" element={<SupportPage />} />
                <Route path="/van-chuyen" element={<SupportPage />} />
                <Route path="/faq" element={<SupportPage />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
              <BackToTop />
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;