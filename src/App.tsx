import { Suspense, lazy } from "react";
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
import { PageLoader } from "./components/layout/PageLoader";

// Lazy load public pages
const Index = lazy(() => import("./pages/Index"));
const CategoryPage = lazy(() => import("./pages/CategoryPage"));
const ProductDetailPage = lazy(() => import("./pages/ProductDetailPage"));
const ContentPage = lazy(() => import("./pages/ContentPage"));
const SupportPage = lazy(() => import("./pages/SupportPage"));
const CartPage = lazy(() => import("./pages/CartPage"));
const WishlistPage = lazy(() => import("./pages/WishlistPage"));
const RecentlyViewedPage = lazy(() => import("./pages/RecentlyViewedPage"));
const AccountPage = lazy(() => import("./pages/AccountPage"));
const ProfileDashboard = lazy(() => import("./pages/ProfileDashboard"));
const NewsPage = lazy(() => import("./pages/NewsPage"));
const NewsDetailPage = lazy(() => import("./pages/NewsDetailPage"));
const ProjectsPage = lazy(() => import("./pages/ProjectsPage"));
const ProjectDetailPage = lazy(() => import("./pages/ProjectDetailPage"));
const ContactPage = lazy(() => import("./pages/ContactPage"));
const InspirationPage = lazy(() => import("./pages/InspirationPage"));
const DesignServicePage = lazy(() => import("./pages/DesignServicePage"));
const SearchPage = lazy(() => import("./pages/SearchPage"));
const OrderSuccessPage = lazy(() => import("./pages/OrderSuccessPage"));
const ResetPasswordPage = lazy(() => import("./pages/ResetPasswordPage"));
const CooperationPage = lazy(() => import("./pages/CooperationPage"));
const LookDetailPage = lazy(() => import("./pages/LookDetailPage"));
const ShowroomPage = lazy(() => import("./pages/ShowroomPage"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Admin Pages
import AdminLayout from "./layouts/AdminLayout";
import DashboardOverview from "./pages/admin/DashboardOverview";
import ThemeSettings from "./pages/admin/ThemeSettings";
import GeneralSettings from "./pages/admin/GeneralSettings";
import SeoSettings from "./pages/admin/SeoSettings"; 
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
import ShowroomManager from "./pages/admin/ShowroomManager";
import ShowroomForm from "./pages/admin/ShowroomForm";
import DesignServiceConfig from "./pages/admin/DesignServiceConfig";
import AdminAccount from "./pages/admin/AdminAccount"; // Import mới

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
import LookbookFilterPage from "./pages/admin/content/LookbookFilterPage.tsx";

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
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  <Route path="/" element={<Navigate to="/trangchu" replace />} />
                  <Route path="/trangchu" element={<Index />} />
                  <Route path="/tim-kiem" element={<SearchPage />} />
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
                    <Route path="account" element={<AdminAccount />} />
                    <Route path="homepage" element={<HomepageSectionManager />} />
                    <Route path="homepage/slides" element={<SlidePage />} />
                    <Route path="homepage/sections" element={<SectionConfigPage />} />
                    <Route path="homepage/usp" element={<USPPage />} />
                    <Route path="homepage/categories-menu" element={<CategoryMenuPage />} />
                    <Route path="homepage/looks" element={<ShopTheLookPage />} />
                    <Route path="homepage/marketing" element={<MarketingPage />} />
                    
                    <Route path="content/looks" element={<LookbookManagerPage />} />
                    <Route path="content/looks/new" element={<LookbookForm />} />
                    <Route path="content/looks/edit/:id" element={<LookbookForm />} />
                    <Route path="content/looks/filters" element={<LookbookFilterPage />} />
                    <Route path="design-config" element={<DesignServiceConfig />} />
                    <Route path="cooperation-requests" element={<CooperationRequestManager />} />
                    
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
                    
                    <Route path="customers" element={<CustomerHub />} /> 
                    <Route path="marketing" element={<MarketingTools />} />
                    
                    <Route path="theme" element={<ThemeSettings />} />
                    <Route path="settings" element={<GeneralSettings />} />
                    <Route path="seo" element={<SeoSettings />} /> 
                    <Route path="tracking" element={<TrackingManager />} />
                    <Route path="team" element={<TeamManager />} />
                    <Route path="showrooms" element={<ShowroomManager />} />
                    <Route path="showrooms/new" element={<ShowroomForm />} />
                    <Route path="showrooms/edit/:id" element={<ShowroomForm />} />

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
              </Suspense>
              <FloatingActions />
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;