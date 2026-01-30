import { User, Heart, ShoppingBag, Package, Ticket, Star, History, Headset } from "lucide-react";

// Dữ liệu menu sản phẩm và dịch vụ giờ đây được quản lý động thông qua hook `useCategories`
// và được chỉnh sửa trong khu vực Admin -> Danh mục.

export const accountMenuItems = [
  { name: "Tài khoản", href: "/tai-khoan/thong-tin", icon: User, requiresAuth: true },
  { name: "Đơn hàng", href: "/tai-khoan/don-hang", icon: Package, requiresAuth: true },
  { name: "Phiếu giảm giá", href: "/tai-khoan/vouchers", icon: Ticket, requiresAuth: true },
  { name: "Điểm thưởng", href: "/tai-khoan/points", icon: Star, requiresAuth: true },
  { name: "Danh sách yêu thích", href: "/yeu-thich", icon: Heart, requiresAuth: false },
  { name: "Lịch sử xem", href: "/lich-su-xem", icon: History, requiresAuth: false },
  { name: "Liên hệ", href: "/lien-he", icon: Headset, requiresAuth: false },
];