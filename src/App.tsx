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
import { TrackingScripts } from "./components/TrackingScripts";

// Public Pages
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import CategoryPage from "./pages/CategoryPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import ContentPage from "./pages/ContentPage";
import SupportPage from "./pages/SupportPage";
import CartPage from "./pages/CartPage";
import WishlistPage from "./pages/WishlistPage";
import RecentlyViewedPage from "./pages/RecentlyViewedPage";
import AccountPage from "./pages/AccountPage";
import ProfileDashboard from "./pages/ProfileDashboard";
import NewsPage from "./pages/NewsPage";
import NewsDetailPage from "./pages/NewsDetailPage";
import ProjectsPage from "./pages/ProjectsPage";
import ProjectDetailPage from "./pages/ProjectDetailPage";
import ContactPage from "./pages/ContactPage";
import InspirationPage from "./pages/InspirationPage";
import DesignServicePage from "./pages/DesignServicePage";
import SearchPage from "./pages/SearchPage";
import OrderSuccessPage from "./pages/OrderSuccessPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import CooperationPage from "./pages/CooperationPage";
import LookDetailPage from "./pages/LookDetailPage";
import ShowroomPage from "./pages/ShowroomPage"; // Import ShowroomPage

// Admin Pages
import AdminLayout from "./layouts/AdminLayout";
import DashboardOverview from "./pages/admin/DashboardOverview";
import ThemeSettings from "./pages/admin/ThemeSettings";
import GeneralSettings from "./pages/admin/GeneralSettings";
import HomepageSectionManager from "./pages/admin/HomepageSectionManager";
import ProductManager from "./pages/admin/ProductManager";
import ProductForm from "./pages/admin/ProductForm";
import CategoryManager from "./pages/admin/CategoryManager";
import CategoryForm from "./pages/admin/CategoryForm";
import AttributeManager from "./pages/admin/AttributeManager";
import AttributeForm from "./pages/admin/AttributeForm";
import OrderManager from "./pages/admin/OrderManager";
import PageManager from "./pages/admin/PageManager";
import PageForm from "./pages/admin/PageForm";
import NewsManager from "./pages/admin/NewsManager";
import NewsForm from "./pages/admin/NewsForm";
import ProjectManager from "./pages/admin/ProjectManager";
import ProjectForm from "./pages/admin/ProjectForm";
import ReviewManager from "./pages/admin/ReviewManager";
import MarketingTools from "./pages/admin/MarketingTools";
import TeamManager from "./pages/admin/TeamManager";
import CustomerHub from "./pages/admin/CustomerHub"; 
import CooperationRequestManager from "./pages/admin/CooperationRequestManager";
import TrackingManager from "./pages/admin/TrackingManager";
import ShowroomManager from "./pages/admin/ShowroomManager"; // Import mới
import ShowroomForm from "./pages/admin/ShowroomForm"; // Import mới

// Homepage Sub-pages
import SlidePage from "./pages/admin/homepage/SlidePage.tsx";
import SectionConfigPage from "./pages/admin/homepage/SectionConfigPage.tsx";
import USPPage from "./pages/admin/homepage/USPPage.tsx";
import CategoryMenuPage from "./pages/admin/homepage/CategoryMenuPage.tsx";
import ShopTheLookPage from "./pages/admin/homepage/ShopTheLookPage.tsx";
import MarketingPage from "./pages/admin/homepage/MarketingPage.tsx";

// CMS Sub-pages
import LookbookManagerPage from "./pages/admin/content/LookbookManagerPage.tsx";
import LookbookForm from "./pages/admin/content/LookbookForm.tsx";


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
              <TrackingScripts />
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
                <Route path="/showroom" element={<ShowroomPage />} /> {/* Sử dụng ShowroomPage mới */}
                <Route path="/cam-hung" element={<InspirationPage />} />
                <Route path="/y-tuong/:id" element={<LookDetailPage />} />
                <Route path="/thiet-ke" element={<DesignServicePage />} />
                <Route path="/ve-chung-toi" element={<ContentPage />} />
                <Route path="/tuyen-dung" element={<ContentPage />} />
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
                  
                  {/* Homepage Manager (New Structure) */}
                  <Route path="homepage" element={<HomepageSectionManager />} />
                  <Route path="homepage/slides" element={<SlidePage />} />
                  <Route path="homepage/sections" element={<SectionConfigPage />} />
                  <Route path="homepage/usp" element={<USPPage />} />
                  <Route path="homepage/categories-menu" element={<CategoryMenuPage />} />
                  <Route path="homepage/looks" element={<ShopTheLookPage />} />
                  <Route path="homepage/marketing" element={<MarketingPage />} />
                  
                  {/* CMS Hub - Merged into main routes */}
                  <Route path="content/looks" element={<LookbookManagerPage />} />
                  <Route path="content/looks/new" element={<LookbookForm />} />
                  <Route path="content/looks/edit/:id" element={<LookbookForm />} />
                  <Route path="cooperation-requests" element={<CooperationRequestManager />} />
                  
                  {/* Sales & Product Management */}
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
                  <Route path="reviews" element={<ReviewManager />} />
                  
                  {/* Marketing & Customer */}
                  <Route path="customers" element={<CustomerHub />} /> 
                  <Route path="marketing" element={<MarketingTools />} />
                  
                  {/* System Settings */}
                  <Route path="theme" element={<ThemeSettings />} />
                  <Route path="settings" element={<GeneralSettings />} />
                  <Route path="tracking" element={<TrackingManager />} />
                  <Route path="team" element={<TeamManager />} />
                  
                  {/* Showroom Management (New) */}
                  <Route path="showrooms" element={<ShowroomManager />} />
                  <Route path="showrooms/new" element={<ShowroomForm />} />
                  <Route path="showrooms/edit/:id" element={<ShowroomForm />} />

                  {/* Missing CMS Routes */}
                  <Route path="pages" element={<PageManager />} />
                  <Route path="pages/new" element={<PageForm />} />
                  <Route path="pages/edit/:id" element={<PageForm />} />
                  <Route path="news" element={<NewsManager />} />
                  <Route path="news/new" element={<NewsForm />} />
                  <Route path="news/edit/:id" element={<NewsForm />} />
                  <Route path="projects" element={<ProjectManager />} />
                  <Route path="projects/new" element={<ProjectForm />} />
                  <Route path="projects/edit/:id" element={<ProjectForm />} />
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