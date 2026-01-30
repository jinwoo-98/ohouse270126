import { Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { LookbookManager } from "@/components/admin/content/LookbookManager.tsx";

export default function LookbookManagerPage() {
  return (
    <div className="max-w-6xl mx-auto pb-20 space-y-8">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild><Link to="/admin/content"><ArrowLeft className="w-4 h-4" /></Link></Button>
        <div>
          <h1 className="2xl font-bold flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary" /> Quản Lý Chi Tiết Lookbook
          </h1>
          <p className="text-muted-foreground text-sm">Tạo mới, chỉnh sửa nội dung và gắn thẻ sản phẩm (hotspot) cho các bộ sưu tập không gian.</p>
        </div>
      </div>
      <LookbookManager />
    </div>
  );
}