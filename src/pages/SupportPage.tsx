import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronRight, Truck, RefreshCw, Shield, CreditCard, HelpCircle, FileText, Phone } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const supportPages: Record<string, { title: string; icon: any; content: React.ReactNode }> = {
  "huong-dan": {
    title: "Hướng Dẫn Mua Hàng",
    icon: FileText,
    content: (
      <div className="space-y-6">
        <div>
          <h3 className="font-bold text-lg mb-3">Bước 1: Tìm kiếm sản phẩm</h3>
          <p className="text-muted-foreground">Sử dụng thanh tìm kiếm hoặc duyệt qua các danh mục để tìm sản phẩm bạn yêu thích.</p>
        </div>
        <div>
          <h3 className="font-bold text-lg mb-3">Bước 2: Thêm vào giỏ hàng</h3>
          <p className="text-muted-foreground">Chọn màu sắc, số lượng và nhấn "Thêm vào giỏ hàng".</p>
        </div>
        <div>
          <h3 className="font-bold text-lg mb-3">Bước 3: Thanh toán</h3>
          <p className="text-muted-foreground">Điền thông tin giao hàng, chọn phương thức thanh toán và xác nhận đơn hàng.</p>
        </div>
        <div>
          <h3 className="font-bold text-lg mb-3">Bước 4: Nhận hàng</h3>
          <p className="text-muted-foreground">Theo dõi đơn hàng và nhận sản phẩm tại địa chỉ đã đăng ký.</p>
        </div>
      </div>
    ),
  },
  "doi-tra": {
    title: "Chính Sách Đổi Trả",
    icon: RefreshCw,
    content: (
      <div className="space-y-6">
        <div className="bg-secondary/50 p-5 rounded-lg">
          <h3 className="font-bold text-lg mb-3">Điều Kiện Đổi Trả</h3>
          <ul className="list-disc list-inside text-muted-foreground space-y-2">
            <li>Sản phẩm còn nguyên tem, nhãn mác</li>
            <li>Chưa qua sử dụng hoặc lắp đặt</li>
            <li>Có đầy đủ hóa đơn mua hàng</li>
            <li>Thời gian đổi trả trong vòng 30 ngày</li>
          </ul>
        </div>
        <div>
          <h3 className="font-bold text-lg mb-3">Quy Trình Đổi Trả</h3>
          <ol className="list-decimal list-inside text-muted-foreground space-y-2">
            <li>Liên hệ hotline 1900 888 999</li>
            <li>Cung cấp mã đơn hàng và lý do đổi trả</li>
            <li>OHOUSE sẽ xác nhận và hướng dẫn</li>
            <li>Gửi sản phẩm về kho OHOUSE</li>
            <li>Nhận sản phẩm mới hoặc hoàn tiền</li>
          </ol>
        </div>
      </div>
    ),
  },
  "bao-hanh": {
    title: "Chính Sách Bảo Hành",
    icon: Shield,
    content: (
      <div className="space-y-6">
        <div className="bg-primary/10 p-5 rounded-lg">
          <h3 className="font-bold text-lg mb-3 text-primary">Bảo Hành 2 Năm</h3>
          <p className="text-muted-foreground">Tất cả sản phẩm OHOUSE được bảo hành 2 năm cho các lỗi kỹ thuật từ nhà sản xuất.</p>
        </div>
        <div>
          <h3 className="font-bold text-lg mb-3">Phạm Vi Bảo Hành</h3>
          <ul className="list-disc list-inside text-muted-foreground space-y-2">
            <li>Lỗi kết cấu, khung xương sản phẩm</li>
            <li>Lỗi cơ cấu vận hành (ray trượt, bản lề...)</li>
            <li>Lỗi bề mặt do sản xuất</li>
          </ul>
        </div>
        <div>
          <h3 className="font-bold text-lg mb-3">Không Bảo Hành</h3>
          <ul className="list-disc list-inside text-muted-foreground space-y-2">
            <li>Hư hỏng do sử dụng sai cách</li>
            <li>Hao mòn tự nhiên theo thời gian</li>
            <li>Sản phẩm đã qua sửa chữa bên ngoài</li>
          </ul>
        </div>
      </div>
    ),
  },
  "thanh-toan": {
    title: "Hình Thức Thanh Toán",
    icon: CreditCard,
    content: (
      <div className="space-y-6">
        <div className="grid md:grid-cols-2 gap-4">
          {[
            { title: "Thanh toán COD", desc: "Thanh toán khi nhận hàng, áp dụng toàn quốc" },
            { title: "Chuyển khoản", desc: "Chuyển khoản ngân hàng trước khi giao hàng" },
            { title: "Thẻ tín dụng", desc: "Visa, Mastercard, JCB" },
            { title: "Ví điện tử", desc: "Momo, ZaloPay, VNPay" },
          ].map((item) => (
            <div key={item.title} className="bg-secondary/50 p-4 rounded-lg">
              <h3 className="font-semibold mb-1">{item.title}</h3>
              <p className="text-sm text-muted-foreground">{item.desc}</p>
            </div>
          ))}
        </div>
        <div className="bg-primary/10 p-5 rounded-lg">
          <h3 className="font-bold mb-2">Trả Góp 0% Lãi Suất</h3>
          <p className="text-muted-foreground">Áp dụng cho đơn hàng từ 5 triệu đồng, kỳ hạn 6-12 tháng qua các ngân hàng đối tác.</p>
        </div>
      </div>
    ),
  },
  "van-chuyen": {
    title: "Chính Sách Vận Chuyển",
    icon: Truck,
    content: (
      <div className="space-y-6">
        <div className="bg-primary/10 p-5 rounded-lg">
          <h3 className="font-bold text-lg mb-3 text-primary">Miễn Phí Vận Chuyển</h3>
          <p className="text-muted-foreground">Áp dụng cho tất cả đơn hàng từ 5 triệu đồng trên toàn quốc.</p>
        </div>
        <div>
          <h3 className="font-bold text-lg mb-3">Thời Gian Giao Hàng</h3>
          <ul className="text-muted-foreground space-y-2">
            <li className="flex justify-between py-2 border-b">
              <span>Nội thành HCM, Hà Nội</span>
              <span className="font-semibold">1-3 ngày</span>
            </li>
            <li className="flex justify-between py-2 border-b">
              <span>Các tỉnh lân cận</span>
              <span className="font-semibold">3-5 ngày</span>
            </li>
            <li className="flex justify-between py-2">
              <span>Các tỉnh xa</span>
              <span className="font-semibold">5-7 ngày</span>
            </li>
          </ul>
        </div>
      </div>
    ),
  },
  "faq": {
    title: "Câu Hỏi Thường Gặp",
    icon: HelpCircle,
    content: (
      <Accordion type="single" collapsible className="w-full">
        {[
          { q: "Làm sao để theo dõi đơn hàng?", a: "Bạn có thể theo dõi đơn hàng bằng cách đăng nhập tài khoản và vào mục 'Đơn hàng của tôi', hoặc liên hệ hotline 1900 888 999." },
          { q: "OHOUSE có lắp đặt tại nhà không?", a: "Có, OHOUSE cung cấp dịch vụ lắp đặt miễn phí cho tất cả sản phẩm nội thất lớn tại HCM và Hà Nội." },
          { q: "Sản phẩm có đúng như hình không?", a: "Tất cả hình ảnh đều là ảnh chụp thực tế. Tuy nhiên màu sắc có thể chênh lệch nhẹ do cài đặt màn hình." },
          { q: "Có thể đặt hàng theo kích thước riêng không?", a: "Có, OHOUSE nhận đặt hàng theo yêu cầu với phụ phí và thời gian sản xuất tùy thuộc vào sản phẩm." },
          { q: "Chính sách bảo hành như thế nào?", a: "Tất cả sản phẩm OHOUSE được bảo hành 2 năm cho lỗi kỹ thuật từ nhà sản xuất." },
        ].map((item, idx) => (
          <AccordionItem key={idx} value={`item-${idx}`}>
            <AccordionTrigger className="text-left font-semibold">{item.q}</AccordionTrigger>
            <AccordionContent className="text-muted-foreground">{item.a}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    ),
  },
};

const supportMenu = [
  { slug: "huong-dan", title: "Hướng Dẫn Mua Hàng", icon: FileText },
  { slug: "doi-tra", title: "Chính Sách Đổi Trả", icon: RefreshCw },
  { slug: "bao-hanh", title: "Chính Sách Bảo Hành", icon: Shield },
  { slug: "thanh-toan", title: "Hình Thức Thanh Toán", icon: CreditCard },
  { slug: "van-chuyen", title: "Chính Sách Vận Chuyển", icon: Truck },
  { slug: "faq", title: "Câu Hỏi Thường Gặp", icon: HelpCircle },
];

export default function SupportPage() {
  const { slug } = useParams();
  const currentPage = supportPages[slug || "huong-dan"] || supportPages["huong-dan"];
  const Icon = currentPage.icon;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1">
        {/* Breadcrumb */}
        <div className="bg-secondary/50 py-3">
          <div className="container-luxury">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Link to="/" className="hover:text-primary transition-colors">Trang chủ</Link>
              <ChevronRight className="w-4 h-4" />
              <span className="text-foreground font-medium">{currentPage.title}</span>
            </div>
          </div>
        </div>

        <div className="container-luxury py-8 md:py-12">
          <div className="grid lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <aside className="lg:col-span-1">
              <div className="bg-card rounded-lg p-4 shadow-subtle sticky top-24">
                <h3 className="font-bold text-lg mb-4">Hỗ Trợ</h3>
                <nav className="space-y-1">
                  {supportMenu.map((item) => (
                    <Link
                      key={item.slug}
                      to={`/ho-tro/${item.slug}`}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                        slug === item.slug ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary'
                      }`}
                    >
                      <item.icon className="w-4 h-4" />
                      <span className="text-sm font-medium">{item.title}</span>
                    </Link>
                  ))}
                </nav>
                
                <div className="mt-6 pt-6 border-t border-border">
                  <div className="flex items-center gap-3 text-sm">
                    <Phone className="w-5 h-5 text-primary" />
                    <div>
                      <p className="font-semibold">Hotline</p>
                      <a href="tel:1900888999" className="text-primary">1900 888 999</a>
                    </div>
                  </div>
                </div>
              </div>
            </aside>

            {/* Content */}
            <motion.div 
              className="lg:col-span-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="bg-card rounded-lg p-6 md:p-8 shadow-subtle">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <h1 className="text-2xl font-bold">{currentPage.title}</h1>
                </div>
                {currentPage.content}
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
