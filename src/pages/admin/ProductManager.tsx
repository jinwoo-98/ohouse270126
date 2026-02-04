import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Loader2, 
  Image as ImageIcon,
  ExternalLink,
  Star,
  ShoppingBag,
  Filter
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";

export default function ProductManager() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  // State for professional confirmation
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*, slug') // Đảm bảo lấy slug
        .order('display_order', { ascending: true })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error: any) {
      toast.error("Lỗi tải sản phẩm: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    
    const toastId = toast.loading("Đang xóa dữ liệu sản phẩm khỏi hệ thống...");
    try {
      const { error } = await supabase.from('products').delete().eq('id', deleteId);
      if (error) throw error;
      
      setProducts(products.filter(p => p.id !== deleteId));
      toast.success("Đã xóa sản phẩm thành công.", { id: toastId });
    } catch (error: any) {
      toast.error("Lỗi khi xóa: " + error.message, { id: toastId });
    } finally {
      setDeleteId(null);
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  function formatPrice(price: number) {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Danh Sách Sản Phẩm</h1>
          <p className="text-muted-foreground text-sm">Quản lý kho hàng và thiết lập Marketing cho website.</p>
        </div>
        <Button asChild className="btn-hero shadow-gold px-8 h-12 rounded-xl">
          <Link to="/admin/products/new"><Plus className="w-4 h-4 mr-2" /> Thêm sản phẩm mới</Link>
        </Button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-border overflow-hidden">
        <div className="p-4 border-b border-border bg-gray-50/50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative flex-1 w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Tìm theo tên sản phẩm..." 
              className="pl-10 h-11 bg-white rounded-xl border-border"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="h-11 px-4 text-[10px] font-bold uppercase tracking-widest border-border bg-white flex gap-2">
              <Filter className="w-3.5 h-3.5 text-primary" />
              Tổng: {filteredProducts.length}
            </Badge>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 text-[10px] uppercase tracking-widest font-bold text-muted-foreground border-b">
                <th className="px-6 py-4 text-center w-16">Vị trí</th>
                <th className="px-6 py-4">Thông tin sản phẩm</th>
                <th className="px-6 py-4">Giá tiền</th>
                <th className="px-6 py-4">Chỉ số Ảo</th>
                <th className="px-6 py-4 text-center">Trạng thái</th>
                <th className="px-6 py-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" /></td></tr>
              ) : filteredProducts.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-muted-foreground italic">Không có sản phẩm nào.</td></tr>
              ) : filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-6 py-4 text-center">
                    <span className="font-mono text-xs font-bold text-muted-foreground bg-secondary/50 px-2 py-1 rounded">{product.display_order || 1000}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gray-100 overflow-hidden shrink-0 border border-border shadow-sm">
                        {product.image_url ? <img src={product.image_url} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform" /> : <ImageIcon className="w-5 h-5 m-auto text-gray-300 mt-3.5" />}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-charcoal truncate max-w-[200px]">{product.name}</p>
                        <Badge variant="secondary" className="text-[9px] uppercase tracking-widest mt-1 py-0 px-2 h-4 bg-primary/5 text-primary border-none">{product.category_id}</Badge>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-primary">{formatPrice(product.price)}</p>
                    {product.original_price && <p className="text-[10px] text-muted-foreground line-through decoration-destructive/30">{formatPrice(product.original_price)}</p>}
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-charcoal">
                        <ShoppingBag className="w-3 h-3 text-emerald-500" /> {product.fake_sold || 0} đã bán
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-charcoal">
                        <Star className="w-3 h-3 text-amber-500 fill-amber-500" /> {product.fake_rating || 5.0} ({product.fake_review_count || 0})
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center gap-1.5">
                      {product.is_new && <Badge className="bg-blue-500 text-[8px] h-4 px-1.5 uppercase font-bold">Mới</Badge>}
                      {product.is_sale && <Badge className="bg-red-500 text-[8px] h-4 px-1.5 uppercase font-bold">Sale</Badge>}
                      {product.is_featured && <Badge className="bg-amber-500 text-[8px] h-4 px-1.5 uppercase font-bold">Hot</Badge>}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg" asChild title="Xem trên Web">
                        <Link to={`/san-pham/${product.slug || product.id}`} target="_blank"><ExternalLink className="w-4 h-4 text-muted-foreground hover:text-primary" /></Link>
                      </Button>
                      <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg text-blue-600 hover:bg-blue-50" asChild title="Sửa thông tin">
                        <Link to={`/admin/products/edit/${product.id}`}><Edit className="w-4 h-4" /></Link>
                      </Button>
                      <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg text-destructive hover:bg-destructive/10" title="Xóa" onClick={() => setDeleteId(product.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmDialog 
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Xác nhận xóa sản phẩm"
        description="Hành động này sẽ xóa vĩnh viễn sản phẩm khỏi kho hàng và không thể hoàn tác. Bạn có chắc chắn muốn tiếp tục?"
        confirmText="Vẫn xóa sản phẩm"
      />
    </div>
  );
}