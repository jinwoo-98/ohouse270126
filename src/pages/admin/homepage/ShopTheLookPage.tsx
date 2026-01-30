import { Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { FeaturedLookManager } from "@/components/admin/homepage/FeaturedLookManager";

export default function ShopTheLookPage() {
  return (
    <div className="max-w-6xl mx-auto pb-20 space-y-8">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild><Link to="/admin/homepage"><ArrowLeft className="w-4 h-4" /></Link></Button>
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary" /> Quản Lý Shop The Look (Trang Chủ)
          </h1>
          <p className="text-muted-foreground text-sm">
            Tại đây, bạn có thể sắp xếp thứ tự và chọn những Lookbook nào sẽ được hiển thị nổi bật trên Trang Chủ.
          </p>
          <p className="text-xs text-muted-foreground mt-2 italic">
            Để tạo mới hoặc chỉnh sửa chi tiết (gắn thẻ sản phẩm, đổi ảnh), vui lòng truy cập mục <Link to="/admin/content/looks" className="text-primary underline">Quản lý nội dung Lookbook</Link>.
          </p>
        </div>
      </div>
      <FeaturedLookManager />
    </div>
  );
}