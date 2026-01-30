import { Link } from "react-router-dom";
import { 
  LayoutTemplate, 
  Sparkles, 
  Briefcase, 
  Newspaper, 
  MessageSquare, 
  Settings,
  ChevronRight
} from "lucide-react";

const contentSections = [
  {
    icon: Sparkles,
    title: "Quản Lý Lookbook",
    description: "Tạo, chỉnh sửa chi tiết và gắn thẻ sản phẩm cho các bộ sưu tập không gian.",
    href: "/admin/content/looks",
    color: "text-purple-600 bg-purple-50 border-purple-200"
  },
  {
    icon: Briefcase,
    title: "Trang Dự Án",
    description: "Đăng tải và quản lý các dự án, công trình đã thực hiện.",
    href: "/admin/projects",
    color: "text-blue-600 bg-blue-50 border-blue-200"
  },
  {
    icon: Newspaper,
    title: "Trang Tin Tức",
    description: "Viết bài mới, quản lý các bài blog, tin tức và sự kiện.",
    href: "/admin/news",
    color: "text-green-600 bg-green-50 border-green-200"
  },
  {
    icon: LayoutTemplate,
    title: "Trang Dịch Vụ Thiết Kế",
    description: "Xem và quản lý các yêu cầu tư vấn thiết kế từ khách hàng.",
    href: "/admin/design-requests",
    color: "text-indigo-600 bg-indigo-50 border-indigo-200"
  },
  {
    icon: MessageSquare,
    title: "Trang Liên Hệ",
    description: "Quản lý tin nhắn và thông tin liên hệ hiển thị trên trang.",
    href: "/admin/messages",
    color: "text-orange-600 bg-orange-50 border-orange-200"
  },
  {
    icon: Settings,
    title: "Trang Tĩnh (Giới thiệu, Hợp tác...)",
    description: "Chỉnh sửa nội dung các trang tĩnh như Giới thiệu, Tuyển dụng, Hợp tác.",
    href: "/admin/pages",
    color: "text-gray-600 bg-gray-100 border-gray-200"
  }
];

export default function ContentManager() {
  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-3">
          <LayoutTemplate className="w-7 h-7 text-primary" />
          Quản Trị Nội Dung (CMS)
        </h1>
        <p className="text-muted-foreground text-sm">Chọn một mục để bắt đầu chỉnh sửa nội dung tương ứng.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {contentSections.map((section) => (
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