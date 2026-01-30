import { Sparkles } from "lucide-react";
import { ShopTheLookManager } from "@/components/admin/homepage/ShopTheLookManager";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function ShopTheLookPage() {
  return (
    <div className="max-w-6xl mx-auto pb-20 space-y-8">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild><Link to="/admin/homepage"><ArrowLeft className="w-4 h-4" /></Link></Button>
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary" /> Quản Lý Shop The Look
          </h1>
          <p className="text-muted-foreground text-sm">Tạo và chỉnh sửa các bộ sưu tập không gian, gắn thẻ sản phẩm.</p>
        </div>
      </div>
      <ShopTheLookManager />
    </div>
  );
}