import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export default function PageForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    category: "support",
    content: ""
  });

  useEffect(() => {
    if (id) fetchPage();
  }, [id]);

  const fetchPage = async () => {
    const { data } = await supabase.from('site_pages').select('*').eq('id', id).single();
    if (data) setFormData(data);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (id) {
        await supabase.from('site_pages').update(formData).eq('id', id);
      } else {
        await supabase.from('site_pages').insert(formData);
      }
      toast.success("Đã lưu trang thành công!");
      navigate("/admin/pages");
    } catch (err) {
      toast.error("Lỗi khi lưu trang.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild><Link to="/admin/pages"><ArrowLeft className="w-4 h-4" /></Link></Button>
          <h1 className="text-2xl font-bold">{id ? "Chỉnh sửa trang" : "Tạo trang mới"}</h1>
        </div>
        <Button onClick={handleSave} disabled={loading} className="btn-hero h-11 px-8 shadow-gold">
          {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          Lưu nội dung
        </Button>
      </div>

      <form onSubmit={handleSave} className="bg-white p-8 rounded-2xl border shadow-sm space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label>Tiêu đề trang</Label>
            <Input value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="Ví dụ: Chính Sách Bảo Hành" required />
          </div>
          <div className="space-y-2">
            <Label>Đường dẫn (Slug)</Label>
            <Input value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value})} placeholder="bao-hanh" required disabled={!!id} />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Phân loại</Label>
          <Select value={formData.category} onValueChange={val => setFormData({...formData, category: val})}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="support">Hỗ trợ khách hàng</SelectItem>
              <SelectItem value="company">Về công ty</SelectItem>
              <SelectItem value="other">Khác</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Nội dung (Hỗ trợ mã HTML)</Label>
          <Textarea 
            value={formData.content} 
            onChange={e => setFormData({...formData, content: e.target.value})} 
            placeholder="Nhập nội dung trang tại đây..."
            className="min-h-[400px] font-mono text-sm leading-relaxed"
          />
          <p className="text-[10px] text-muted-foreground italic">
            Gợi ý: Bạn có thể sử dụng các thẻ HTML như <h3>, <p>, <ul>, <li> để định dạng nội dung.
          </p>
        </div>
      </form>
    </div>
  );
}