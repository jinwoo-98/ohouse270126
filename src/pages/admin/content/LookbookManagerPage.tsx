import { Sparkles, ListFilter, Plus, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LookbookList } from "@/components/admin/content/LookbookList";

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
      
      <div className="flex justify-end gap-3">
        <Button asChild variant="outline" className="h-10 px-6 text-[10px] font-bold uppercase tracking-widest border-primary/20 text-primary hover:bg-primary/5">
          <Link to="/admin/content/looks/filters">
            <ListFilter className="w-4 h-4 mr-2" /> Quản lý Tùy chọn Bộ lọc
          </Link>
        </Button>
        <Button asChild className="btn-hero h-10 shadow-gold">
          <Link to="/admin/content/looks/new"><Plus className="w-4 h-4 mr-2" /> Thêm Lookbook</Link>
        </Button>
      </div>
      
      <LookbookList />
    </div>
  );
}