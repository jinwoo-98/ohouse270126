import { Link } from "react-router-dom";
import { 
  MonitorPlay, 
  Image, 
  List, 
  Sparkles, 
  TrendingUp, 
  LayoutGrid, 
  Palette,
  ChevronRight,
  ArrowLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";

const homepageSections = [
  {
    icon: Image,
    title: "Slideshow Banner",
    description: "Quản lý các banner lớn xoay vòng ở đầu trang chủ.",
    href: "/admin/homepage/slides",
    color: "text-primary bg-primary/5 border-primary/20"
  },
  {
    icon: Palette,
    title: "Văn Bản & Màu Sắc",
    description: "Tùy chỉnh tiêu đề, mô tả và màu sắc cho các phần trên trang chủ.",
    href: "/admin/homepage/sections",
    color: "text-blue-600 bg-blue-50 border-blue-200"
  },
  {
    icon: List,
    title: "USP Bar",
    description: "Quản lý các cam kết thương hiệu (USP) hiển thị dưới banner.",
    href: "/admin/homepage/usp",
    color: "text-green-600 bg-green-50 border-green-200"
  },
  {
    icon: LayoutGrid,
    title: "Danh mục & Menu",
    description: "Quản lý danh mục hiển thị trên trang chủ và menu header.",
    href: "/admin/homepage/categories-menu",
    color: "text-indigo-600 bg-indigo-50 border-indigo-200"
  },
  {
    icon: Sparkles,
    title: "Shop The Look",
    description: "Quản lý các bộ sưu tập không gian và gắn thẻ sản phẩm.",
    href: "/admin/homepage/looks",
    color: "text-purple-600 bg-purple-50 border-purple-200"
  },
  {
    icon: TrendingUp,
    title: "Từ khóa & Sản phẩm Badge",
    description: "Quản lý từ khóa tìm kiếm và gắn nhãn Flash Sale/Nổi bật.",
    href: "/admin/homepage/marketing",
    color: "text-amber-600 bg-amber-50 border-amber-200"
  },
];

export default function HomepageSectionManager() {
  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        {/* Đã loại bỏ nút quay lại */}
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3">
            <MonitorPlay className="w-7 h-7 text-primary" />
            Quản Lý Trang Chủ
          </h1>
          <p className="text-muted-foreground text-sm">Chọn một mục để bắt đầu chỉnh sửa nội dung tương ứng trên trang chủ.</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {homepageSections.map((section) => (
          <Link 
            key={section.title} 
            to={section.href}
            className="group block bg-white p-6 rounded-2xl border border-border/60 hover:border-primary/40 hover:shadow-medium transition-all duration-300"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${section.color}`}>
                  <section.icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-charcoal group-hover:text-primary transition-colors">{section.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{section.description}</p>
                </div>
              </div>
              <div className="p-2 bg-secondary/40 rounded-full group-hover:bg-primary group-hover:text-white transition-colors">
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}