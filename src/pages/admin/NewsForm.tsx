import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Save, Loader2, Image as ImageIcon, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { AIContentAssistant } from "@/components/admin/AIContentAssistant";
import { toast } from "sonner";

export default function NewsForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    image_url: "",
    category: "Xu Hướng",
    read_time: "5 phút đọc",
    is_featured: false
  });

  useEffect(() => {
    if (id) fetchNews();
  }, [id]);

  const fetchNews = async () => {
    const { data } = await supabase.from('news').select('*').eq('id', id).single();
    if (data) setFormData(data);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const slug = formData.slug || formData.title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
    
    try {
      if (id) {
        await supabase.from('news').update({...formData, slug}).eq('id', id);
      } else {
        await supabase.from('news').insert({...formData, slug});
      }
      toast.success("Đã lưu bài viết thành công!");
      navigate("/admin/news");
    } catch (err) {
      toast.error("Lỗi khi lưu bài viết.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto pb-20">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild><Link to="/admin/news"><ArrowLeft className="w-4 h-4" /></Link></Button>
          <h1 className="text-2xl font-bold">{id ? "Chỉnh sửa bài viết" : "Viết bài mới"}</h1>
        </div>
        <Button onClick={handleSave} disabled={loading} className="btn-hero px-10 shadow-gold">
          {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          Lưu bài viết
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-3xl border shadow-sm space-y-6">
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Tiêu đề bài viết</Label>
              <Input value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="h-12 text-lg font-bold" required />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Tóm tắt ngắn (Excerpt)</Label>
              <Input value={formData.excerpt} onChange={e => setFormData({...formData, excerpt: e.target.value})} placeholder="Mô tả ngắn hiển thị ở trang danh sách..." />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between mb-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Nội dung chi tiết</Label>
                <AIContentAssistant 
                  contentType="news" 
                  contextTitle={formData.title} 
                  onInsert={(val) => setFormData({...formData, content: val})} 
                />
              </div>
              <RichTextEditor value={formData.content} onChange={val => setFormData({...formData, content: val})} />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border shadow-sm space-y-4">
            <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Ảnh đại diện bài viết</Label>
            <ImageUpload value={formData.image_url} onChange={url => setFormData({...formData, image_url: url as string})} />
          </div>

          <div className="bg-white p-6 rounded-3xl border shadow-sm space-y-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Danh mục</Label>
              <Input value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Thời gian đọc</Label>
              <Input value={formData.read_time} onChange={e => setFormData({...formData, read_time: e.target.value})} />
            </div>
            <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-2xl">
              <div className="flex flex-col">
                <span className="text-xs font-bold uppercase">Bài viết nổi bật</span>
                <span className="text-[9px] text-muted-foreground italic">Hiện to ở đầu trang tin</span>
              </div>
              <Switch checked={formData.is_featured} onCheckedChange={val => setFormData({...formData, is_featured: val})} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}