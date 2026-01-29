import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { 
  Search, 
  Trash2, 
  Loader2, 
  Star, 
  Edit,
  AlertTriangle,
  Save,
  User,
  MessageSquare,
  ImageIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { cn } from "@/lib/utils";

export default function ReviewManager() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [ratingFilter, setRatingFilter] = useState("all");

  const [editingReview, setEditingReview] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          products (
            name,
            image_url,
            slug
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReviews(data || []);
    } catch (error: any) {
      console.error("Lỗi:", error);
      toast.error("Không thể tải danh sách đánh giá.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa đánh giá này?")) return;
    try {
      const { error } = await supabase.from('reviews').delete().eq('id', id);
      if (error) throw error;
      setReviews(reviews.filter(r => r.id !== id));
      toast.success("Đã xóa đánh giá thành công.");
    } catch (error: any) {
      toast.error("Lỗi xóa: " + error.message);
    }
  };

  const handleEditClick = (review: any) => {
    setEditingReview({ ...review });
    setIsEditDialogOpen(true);
  };

  const handleUpdate = async () => {
    if (!editingReview.user_name || !editingReview.comment) {
      toast.error("Vui lòng nhập đầy đủ tên và nội dung.");
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('reviews')
        .update({
          user_name: editingReview.user_name,
          rating: editingReview.rating,
          comment: editingReview.comment,
          image_url: editingReview.image_url
        })
        .eq('id', editingReview.id);

      if (error) throw error;

      toast.success("Đã cập nhật đánh giá thành công!");
      setIsEditDialogOpen(false);
      fetchReviews();
    } catch (error: any) {
      toast.error("Lỗi cập nhật: " + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const filtered = reviews.filter(r => {
    const productName = r.products?.name || "";
    const matchesSearch = 
      r.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.comment?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      productName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRating = ratingFilter === "all" || r.rating.toString() === ratingFilter;
    return matchesSearch && matchesRating;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Quản Lý Đánh Giá</h1>
        <p className="text-muted-foreground text-sm">Danh sách ý kiến và phản hồi thực tế từ khách hàng.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-border overflow-hidden">
        <div className="p-4 border-b bg-gray-50/50 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Tìm theo nội dung, tên khách, sản phẩm..." 
              className="pl-10 bg-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={ratingFilter} onValueChange={setRatingFilter}>
            <SelectTrigger className="w-[180px] bg-white">
              <SelectValue placeholder="Lọc theo sao" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả số sao</SelectItem>
              <SelectItem value="5">5 Sao</SelectItem>
              <SelectItem value="4">4 Sao</SelectItem>
              <SelectItem value="3">3 Sao</SelectItem>
              <SelectItem value="2">2 Sao</SelectItem>
              <SelectItem value="1">1 Sao</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 text-[10px] uppercase font-bold text-muted-foreground border-b">
                <th className="px-6 py-4">Sản phẩm</th>
                <th className="px-6 py-4">Khách hàng</th>
                <th className="px-6 py-4">Đánh giá</th>
                <th className="px-6 py-4">Hình ảnh</th>
                <th className="px-6 py-4">Nội dung</th>
                <th className="px-6 py-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr><td colSpan={6} className="p-12 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" /></td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="p-12 text-center text-muted-foreground italic py-20">Không có đánh giá nào được tìm thấy.</td></tr>
              ) : filtered.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 max-w-[220px]">
                    {item.products ? (
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden shrink-0 border">
                          <img src={item.products.image_url} alt="" className="w-full h-full object-cover" />
                        </div>
                        <Link to={`/san-pham/${item.products.slug}`} target="_blank" className="text-xs font-bold hover:text-primary truncate block">
                          {item.products.name}
                        </Link>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-destructive">
                        <AlertTriangle className="w-4 h-4" />
                        <span className="text-[10px] font-bold">Lỗi liên kết SP</span>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-charcoal">{item.user_name || "Khách hàng"}</p>
                    <p className="text-[10px] text-muted-foreground">{new Date(item.created_at).toLocaleDateString('vi-VN')}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={cn("w-3.5 h-3.5", i < item.rating ? "fill-current" : "text-gray-200")} />
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {item.image_url ? (
                      <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden border">
                        <img src={item.image_url} alt="Review" className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <span className="text-[10px] text-muted-foreground italic">Không có ảnh</span>
                    )}
                  </td>
                  <td className="px-6 py-4 max-w-[250px]">
                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 italic">"{item.comment}"</p>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => handleEditClick(item)} className="text-blue-600 hover:bg-blue-50">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)} className="text-muted-foreground hover:text-destructive transition-colors">
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

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px] rounded-3xl p-0 overflow-hidden border-none shadow-elevated">
          <div className="bg-charcoal p-6 text-white">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3 text-lg font-bold">
                <Edit className="w-5 h-5 text-primary" />
                Chỉnh Sửa Đánh Giá
              </DialogTitle>
            </DialogHeader>
          </div>

          <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                  <User className="w-3 h-3" /> Tên khách hàng
                </Label>
                <Input 
                  value={editingReview?.user_name || ""} 
                  onChange={(e) => setEditingReview({ ...editingReview, user_name: e.target.value })}
                  className="h-12 rounded-xl"
                />
              </div>

              <div className="space-y-3">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                  <Star className="w-3 h-3" /> Số sao đánh giá
                </Label>
                <div className="flex gap-1.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setEditingReview({ ...editingReview, rating: s })}
                      className={cn(
                        "w-9 h-9 rounded-xl flex items-center justify-center transition-all border",
                        editingReview?.rating === s 
                          ? "bg-primary border-primary text-white shadow-gold" 
                          : "bg-secondary/30 border-border text-muted-foreground hover:border-primary/40"
                      )}
                    >
                      <span className="font-bold text-sm">{s}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <ImageIcon className="w-3 h-3" /> Hình ảnh thực tế (Tùy chọn)
              </Label>
              <ImageUpload 
                value={editingReview?.image_url || ""} 
                onChange={(url) => setEditingReview({ ...editingReview, image_url: url as string })} 
              />
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <MessageSquare className="w-3 h-3" /> Nội dung nhận xét
              </Label>
              <Textarea 
                value={editingReview?.comment || ""} 
                onChange={(e) => setEditingReview({ ...editingReview, comment: e.target.value })}
                rows={5}
                className="rounded-xl resize-none leading-relaxed"
              />
            </div>
          </div>

          <DialogFooter className="p-6 bg-gray-50 border-t flex gap-3">
            <Button variant="ghost" onClick={() => setIsEditDialogOpen(false)} className="rounded-xl h-12 flex-1 font-bold text-xs uppercase">
              Hủy bỏ
            </Button>
            <Button onClick={handleUpdate} disabled={isSaving} className="btn-hero h-12 flex-[2] rounded-xl shadow-gold">
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
              LƯU THAY ĐỔI
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}