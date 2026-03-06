import { VariantOptionManager } from "@/components/admin/product-form/VariantOptionManager";
import { Tag } from "lucide-react";

export default function VariantOptionPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-3">
          <Tag className="w-7 h-7 text-primary" />
          Quản Lý Phân Loại Biến Thể
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Định nghĩa các nhóm phân loại (Màu sắc, Kích thước, Chất liệu...) để tạo biến thể giá và kho hàng cho sản phẩm.
        </p>
      </div>
      
      <VariantOptionManager />
    </div>
  );
}