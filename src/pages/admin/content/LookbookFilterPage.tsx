import { ListFilter } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { LookbookFilterManager } from "@/components/admin/content/LookbookFilterManager";

export default function LookbookFilterPage() {
  return (
    <div className="max-w-6xl mx-auto pb-20 space-y-8">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild><Link to="/admin/content/looks"><ArrowLeft className="w-4 h-4" /></Link></Button>
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ListFilter className="w-6 h-6 text-primary" /> Quản Lý Bộ Lọc Lookbook
          </h1>
          <p className="text-muted-foreground text-sm">Tạo và quản lý các tùy chọn cho bộ lọc Phong cách, Chất liệu, Màu sắc trên trang Cảm hứng.</p>
        </div>
      </div>
      <LookbookFilterManager />
    </div>
  );
}