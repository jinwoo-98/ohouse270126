import { User, Heart, ShoppingBag, Package, Ticket, Star, History, Headset } from "lucide-react";

export const productCategories: Record<string, { name: string; href: string }[]> = {
  "phong-khach": [
    { name: "Sofa & Ghế", href: "/sofa" },
    { name: "Bàn Trà", href: "/ban-tra" },
    { name: "Kệ Tivi", href: "/ke-tivi" },
    { name: "Đèn Sàn", href: "/den-san" },
    { name: "Tủ Trang Trí", href: "/tu-trang-tri" },
  ],
  "phong-ngu": [
    { name: "Giường Ngủ", href: "/giuong" },
    { name: "Tủ Quần Áo", href: "/tu-quan-ao" },
    { name: "Bàn Trang Điểm", href: "/ban-trang-diem" },
    { name: "Đèn Ngủ", href: "/den-ngu" },
  ],
  "phong-an": [
    { name: "Bàn Ăn", href: "/ban-an" },
    { name: "Ghế Ăn", href: "/ghe-an" },
    { name: "Tủ Rượu", href: "/tu-ruou" },
    { name: "Đèn Chùm", href: "/den-chum" },
  ],
  "ban-ghe": [
    { name: "Ghế Sofa", href: "/sofa" },
    { name: "Ghế Ăn", href: "/ghe-an" },
    { name: "Ghế Thư Giãn", href: "/ghe-thu-gian" },
    { name: "Bàn Làm Việc", href: "/ban-lam-viec" },
    { name: "Bàn Console", href: "/ban-console" },
  ],
  "den-trang-tri": [
    { name: "Đèn Chùm", href: "/den-chum" },
    { name: "Đèn Sàn", href: "/den-san" },
    { name: "Đèn Bàn", href: "/den-ban" },
    { name: "Đèn Tường", href: "/den-tuong" },
  ],
  "decor": [
    { name: "Tranh Trang Trí", href: "/tranh" },
    { name: "Thảm", href: "/tham" },
    { name: "Gương", href: "/guong" },
    { name: "Bình Hoa", href: "/binh-hoa" },
  ]
};

export const secondaryLinks = [
  { name: "Showroom", href: "/showroom" },
  { name: "Cảm Hứng", href: "/cam-hung" },
  { name: "Thiết Kế Miễn Phí", href: "/thiet-ke" },
  { name: "Hướng Dẫn", href: "/ho-tro/huong-dan" },
  { name: "Dự Án", href: "/du-an" },
  { name: "Hợp Tác B2B", href: "/hop-tac" },
];

export const mainCategories = [
  { name: "Phòng Khách", href: "/phong-khach", hasDropdown: true, dropdownKey: "phong-khach" },
  { name: "Phòng Ngủ", href: "/phong-ngu", hasDropdown: true, dropdownKey: "phong-ngu" },
  { name: "Phòng Ăn", href: "/phong-an", hasDropdown: true, dropdownKey: "phong-an" },
  { name: "Bàn & Ghế", href: "/ban-ghe", hasDropdown: true, dropdownKey: "ban-ghe" },
  { name: "Đèn", href: "/den-trang-tri", hasDropdown: true, dropdownKey: "den-trang-tri" },
  { name: "Decor", href: "/decor", hasDropdown: true, dropdownKey: "decor" },
  { name: "Bán Chạy", href: "/ban-chay", hasDropdown: false },
  { name: "Mới", href: "/moi", hasDropdown: false },
  { name: "Sale", href: "/sale", hasDropdown: false, isHighlight: true },
];

export const accountMenuItems = [
  { name: "Tài khoản", href: "/tai-khoan/thong-tin", icon: User, requiresAuth: true },
  { name: "Đơn hàng", href: "/tai-khoan/don-hang", icon: Package, requiresAuth: true },
  { name: "Phiếu giảm giá", href: "/tai-khoan/vouchers", icon: Ticket, requiresAuth: true },
  { name: "Điểm thưởng", href: "/tai-khoan/points", icon: Star, requiresAuth: true },
  { name: "Danh sách yêu thích", href: "/yeu-thich", icon: Heart, requiresAuth: false },
  { name: "Lịch sử xem", href: "/lich-su-xem", icon: History, requiresAuth: false },
  { name: "Liên hệ", href: "/lien-he", icon: Headset, requiresAuth: false },
];