import categoryTvStand from "@/assets/category-tv-stand.jpg";
import categorySofa from "@/assets/category-sofa.jpg";
import categoryDiningTable from "@/assets/category-dining-table.jpg";
import categoryCoffeeTable from "@/assets/category-coffee-table.jpg";
import categoryDesk from "@/assets/category-desk.jpg";
import categoryBed from "@/assets/category-bed.jpg";
import categoryLighting from "@/assets/category-lighting.jpg";

export interface Product {
  id: number;
  name: string;
  image: string;
  images: string[];
  price: number;
  originalPrice?: number;
  isNew?: boolean;
  isSale?: boolean;
  categorySlug: string;
  material: string;
  style: 'Luxury' | 'Minimalist' | 'Modern' | 'Classic';
  description: string;
  features: string[];
  colors: string[];
}

export const ALL_PRODUCTS: Product[] = [
  { 
    id: 1, name: "Kệ Tivi Gỗ Óc Chó Kết Hợp Đá", image: categoryTvStand, images: [categoryTvStand, categorySofa, categoryDiningTable], 
    price: 25990000, originalPrice: 32990000, isNew: true, isSale: true, categorySlug: "ke-tivi", material: "Gỗ Óc Chó", style: 'Luxury',
    description: "Kệ tivi cao cấp được chế tác từ gỗ óc chó nhập khẩu Bắc Mỹ, kết hợp mặt đá Sintered Stone chống trầy xước.",
    features: ["Chất liệu: Gỗ óc chó tự nhiên", "Mặt đá Sintered Stone 12mm", "Kích thước: 2000x400x450mm"],
    colors: ["Nâu Óc Chó", "Tự Nhiên"]
  },
  { 
    id: 2, name: "Sofa Góc Chữ L Vải Nhung Ý", image: categorySofa, images: [categorySofa, categoryCoffeeTable, categoryDiningTable],
    price: 45990000, categorySlug: "sofa", material: "Vải Nhung", style: 'Modern',
    description: "Sofa góc chữ L với chất liệu vải nhung Ý mềm mại, khung gỗ sồi chắc chắn và đệm mút k43 chống xẹp lún.",
    features: ["Vải nhung kháng khuẩn", "Khung gỗ sồi Nga", "Kích thước: 2800x1600mm"],
    colors: ["Xám Chuột", "Xanh Navy", "Be"]
  },
  { 
    id: 3, name: "Bàn Ăn Mặt Đá Marble 6 Ghế", image: categoryDiningTable, images: [categoryDiningTable, categoryCoffeeTable, categorySofa],
    price: 32990000, originalPrice: 38990000, isSale: true, categorySlug: "ban-an", material: "Đá Marble", style: 'Luxury',
    description: "Bộ bàn ăn 6 ghế hiện đại với mặt đá Marble tự nhiên vân mây và chân inox mạ vàng PVD.",
    features: ["Đá Marble tự nhiên", "Chân Inox 304 mạ vàng", "Bao gồm 6 ghế da Microfiber"],
    colors: ["Trắng Vân Mây", "Đen Tia Chớp"]
  },
  { 
    id: 4, name: "Bàn Trà Tròn Mặt Kính Cường Lực", image: categoryCoffeeTable, images: [categoryCoffeeTable, categorySofa],
    price: 12990000, categorySlug: "ban-tra", material: "Kính Cường Lực", style: 'Minimalist',
    description: "Bàn trà đôi tối giản với sự kết hợp giữa kính cường lực màu trà và khung thép sơn tĩnh điện.",
    features: ["Kính cường lực 10mm", "Khung thép không gỉ", "Dễ dàng vệ sinh"],
    colors: ["Vàng Gương", "Bạc Chrome"]
  },
  { 
    id: 5, name: "Bàn Làm Việc Gỗ Sồi Tự Nhiên", image: categoryDesk, images: [categoryDesk, categoryTvStand],
    price: 18990000, isNew: true, categorySlug: "ban-lam-viec", material: "Gỗ Sồi", style: 'Modern',
    description: "Bàn làm việc phong cách Scandinavian tối giản, tối ưu không gian làm việc tại nhà.",
    features: ["Gỗ sồi Mỹ nhập khẩu", "Ray ngăn kéo giảm chấn", "Sơn phủ Inchem cao cấp"],
    colors: ["Sồi Tự Nhiên", "Sồi Trắng"]
  },
  { 
    id: 6, name: "Giường Ngủ Bọc Da Ý Cao Cấp", image: categoryBed, images: [categoryBed, categorySofa],
    price: 38990000, originalPrice: 45990000, isSale: true, categorySlug: "giuong", material: "Da Thật", style: 'Luxury',
    description: "Giường ngủ bọc da bò thật 100%, thiết kế chuẩn Ergonomic mang lại giấc ngủ sâu và thư giãn.",
    features: ["Da bò thật nhập khẩu Ý", "Giát giường nan cong thông minh", "Bảo hành khung 5 năm"],
    colors: ["Kem", "Nâu Bò", "Ghi"]
  },
  { 
    id: 7, name: "Đèn Chùm Pha Lê Châu Âu", image: categoryLighting, images: [categoryLighting, categoryBed],
    price: 15990000, categorySlug: "den-trang-tri", material: "Pha Lê", style: 'Luxury',
    description: "Đèn chùm pha lê K9 lấp lánh, tạo điểm nhấn đẳng cấp cho không gian phòng khách hoặc sảnh lớn.",
    features: ["Pha lê K9 cao cấp", "Khung hợp kim mạ điện", "Tương thích đèn LED tiết kiệm điện"],
    colors: ["Vàng Gold"]
  },
  { id: 8, name: "Sofa Đơn Bọc Da Thật", image: categorySofa, images: [categorySofa], price: 19990000, isNew: true, categorySlug: "sofa", material: "Da Thật", style: 'Classic', description: "Ghế sofa đơn cổ điển bọc da thật.", features: ["Da bò thật", "Chân gỗ tự nhiên"], colors: ["Đen", "Nâu"] },
  { id: 9, name: "Kệ Tivi Treo Tường Hiện Đại", image: categoryTvStand, images: [categoryTvStand], price: 14990000, categorySlug: "ke-tivi", material: "Gỗ Công Nghiệp", style: 'Minimalist', description: "Thiết kế treo tường tiết kiệm diện tích.", features: ["Gỗ MDF chống ẩm", "Sơn 2K"], colors: ["Trắng", "Xám"] },
  { id: 10, name: "Bàn Ăn Gỗ Óc Chó 8 Ghế", image: categoryDiningTable, images: [categoryDiningTable], price: 42990000, originalPrice: 52990000, isSale: true, categorySlug: "ban-an", material: "Gỗ Óc Chó", style: 'Luxury', description: "Bàn ăn lớn cho gia đình đông người.", features: ["Gỗ óc chó nguyên khối", "8 ghế cao cấp"], colors: ["Nâu đậm"] },
  { id: 11, name: "Bàn Trà Gỗ Tần Bì Bắc Âu", image: categoryCoffeeTable, images: [categoryCoffeeTable], price: 8990000, categorySlug: "ban-tra", material: "Gỗ Sồi", style: 'Minimalist', description: "Phong cách Scandinavian nhẹ nhàng.", features: ["Gỗ tần bì", "Chân tiện tròn"], colors: ["Vàng sáng"] },
  { id: 12, name: "Đèn Sàn Trang Trí Phòng Khách", image: categoryLighting, images: [categoryLighting], price: 6990000, isNew: true, categorySlug: "den-trang-tri", material: "Kim Loại", style: 'Modern', description: "Đèn đứng trang trí góc sofa.", features: ["Thân kim loại", "Chụp vải linen"], colors: ["Đen", "Đồng"] },
  { id: 13, name: "Ghế Thư Giãn Da Bò", image: categorySofa, images: [categorySofa], price: 15000000, categorySlug: "sofa", material: "Da Thật", style: 'Modern', description: "Ghế thư giãn cho phòng đọc sách.", features: ["Cơ chế ngả lưng", "Da thật"], colors: ["Cam", "Xám"] },
  { id: 14, name: "Tủ Quần Áo Gỗ Sồi", image: categoryBed, images: [categoryBed], price: 22000000, categorySlug: "phong-ngu", material: "Gỗ Sồi", style: 'Modern', description: "Tủ quần áo 4 cánh gỗ sồi tự nhiên.", features: ["Gỗ sồi", "Ngăn kéo khóa"], colors: ["Tự nhiên"] },
  { id: 15, name: "Bàn Console Đá", image: categoryDesk, images: [categoryDesk], price: 55000000, categorySlug: "phong-khach", material: "Đá Marble", style: 'Luxury', description: "Bàn trang trí sảnh cao cấp.", features: ["Đá Marble Ý", "Khung inox"], colors: ["Trắng"] },
];