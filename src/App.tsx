import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { CartProvider } from "./contexts/CartContext";
import { WishlistProvider } from "./contexts/WishlistContext";
import ScrollToTop from "./components/ScrollToTop";
import { FloatingActions } from "./components/layout/FloatingActions";

// Public Pages
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
import CooperationPage from "./pages/CooperationPage";
import LookDetailPage from "./pages/LookDetailPage";

// Admin Pages
import AdminLayout from "./layouts/AdminLayout";
import DashboardOverview from "./pages/admin/DashboardOverview";
import ThemeSettings from "./pages/admin/ThemeSettings";
import GeneralSettings from "./pages/admin/GeneralSettings";
import HomepageManager from "./pages/admin/HomepageManager";
import ProductManager from "./pages/admin/ProductManager";
import ProductForm from "./pages/admin/ProductForm";
import CategoryManager from "./pages/admin/CategoryManager";
import CategoryForm from "./pages/admin/CategoryForm";
import AttributeManager from "./pages/admin/AttributeManager";
import AttributeForm from "./pages/admin/AttributeForm";
import OrderManager from "./pages/admin/OrderManager";
import DesignRequestManager from "./pages/admin/DesignRequestManager";
import ContactMessageManager from "./pages/admin/ContactMessageManager";
import PageManager from "./pages/admin/PageManager";
import PageForm from "./pages/admin/PageForm";
import NewsManager from "./pages/admin/NewsManager";
import NewsForm from "./pages/admin/NewsForm";
import ProjectManager from "./pages/admin/ProjectManager";
import ProjectForm from "./pages/admin/ProjectForm";
import ReviewManager from "./pages/admin/ReviewManager";
import SubscriberManager from "./pages/admin/SubscriberManager";
import MarketingTools from "./pages/admin/MarketingTools";
import TeamManager from "./pages/admin/TeamManager";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner position="top-center" />
      <BrowserRouter>
        <ScrollToTop />
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <Routes>
                {/* Chuyển hướng / sang /trangchu */}
                <Route path="/" element={<Navigate to="/trangchu" replace />} />
                <Route path="/trangchu" element={<Index />} />
                
                <Route path="/tim-kiem" element={<SearchPage />} />
                
                {/* Đổi route từ :id sang :slug */}
                <Route path="/san-pham/:slug" element={<ProductDetailPage />} />
                
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
                <Route path="/y-tuong/:id" element={<LookDetailPage />} />
                <Route path="/thiet-ke" element={<DesignServicePage />} />
                <Route path="/ve-chung-toi" element={<AboutPage />} />
                <Route path="/tuyen-dung" element={<RecruitmentPage />} />
                <Route path="/tin-tuc" element={<NewsPage />} />
                <Route path="/tin-tuc/:id" element={<NewsDetailPage />} />
                <Route path="/du-an" element={<ProjectsPage />} />
                <Route path="/du-an/:id" element={<ProjectDetailPage />} />
                <Route path="/lien-he" element={<ContactPage />} />
                <Route path="/hop-tac" element={<CooperationPage />} />
                
                <Route path="/ho-tro/:slug" element={<SupportPage />} />

                {/* Admin Routes */}
                <Route path="/admin" element={<AdminLayout />}>
                  <Route index element={<DashboardOverview />} />
                  <Route path="homepage" element={<HomepageManager />} />
                  <Route path="orders" element={<OrderManager />} />
                  <Route path="products" element={<ProductManager />} />
                  <Route path="products/new" element={<ProductForm />} />
                  <Route path="products/edit/:id" element={<ProductForm />} />
                  <Route path="categories" element={<CategoryManager />} />
                  <Route path="categories/new" element={<CategoryForm />} />
                  <Route path="categories/edit/:id" element={<CategoryForm />} />
                  <Route path="attributes" element={<AttributeManager />} />
                  <Route path="attributes/new" element={<AttributeForm />} />
                  <Route path="attributes/edit/:id" element={<AttributeForm />} />
                  <Route path="marketing" element={<MarketingTools />} />
                  <Route path="reviews" element={<ReviewManager />} />
                  <Route path="subscribers" element={<SubscriberManager />} />
                  <Route path="projects" element={<ProjectManager />} />
                  <Route path="projects/new" element={<ProjectForm />} />
                  <Route path="projects/edit/:id" element={<ProjectForm />} />
                  <Route path="design-requests" element={<DesignRequestManager />} />
                  <Route path="messages" element={<ContactMessageManager />} />
                  <Route path="pages" element={<PageManager />} />
                  <Route path="pages/new" element={<PageForm />} />
                  <Route path="pages/edit/:id" element={<PageForm />} />
                  <Route path="news" element={<NewsManager />} />
                  <Route path="news/new" element={<NewsForm />} />
                  <Route path="news/edit/:id" element={<NewsForm />} />
                  <Route path="theme" element={<ThemeSettings />} />
                  <Route path="settings" element={<GeneralSettings />} />
                  <Route path="team" element={<TeamManager />} />
                </Route>

                <Route path="/:slug" element={<CategoryPage />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
              <FloatingActions />
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;