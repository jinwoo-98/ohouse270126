import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Save, Loader2, Info, Layout } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { toast } from "sonner";

export default function ProjectForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    category: "Căn Hộ",
    location: "",
    area: "",
    style: "",
    year: new Date().getFullYear().toString(),
    description: "",
    image_url: ""
  });

  useEffect(() => {
    if (id) fetchProject();
  }, [id]);

  const fetchProject = async () => {
    const { data } = await supabase.from('projects').select('*').eq('id', id).single();
    if (data) setFormData(data);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (id) {
        await supabase.from('projects').update(formData).eq('id', id);
      } else {
        await supabase.from('projects').insert(formData);
      }
      toast.success("Đã lưu dự án thành công!");
      navigate("/admin/projects");
    } catch (err) {
      toast.error("Lỗi khi lưu dự án.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto pb-20">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild><Link to="/admin/projects"><ArrowLeft className="w-4 h-4" /></Link></Button>
          <h1 className="text-2xl font-bold">{id ? "Chỉnh sửa dự án" : "Thêm dự án mới"}</h1>
        </div>
        <Button onClick={handleSave} disabled={loading} className="btn-hero px-10 shadow-gold">
          {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          Lưu dự án
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-3xl border shadow-sm space-y-6">
            <h3 className="text-sm font-bold uppercase tracking-widest text-primary flex items-center gap-2"><Info className="w-4 h-4" /> Thông tin cơ bản</h3>
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Tên dự án</Label>
              <Input value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="h-12 text-lg font-bold" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Hạng mục</Label>
                <Input value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} placeholder="Biệt thự, Căn hộ..." />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Vị trí</Label>
                <Input value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} placeholder="Quận 1, TP.HCM..." />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Nội dung chi tiết</Label>
              <RichTextEditor value={formData.description} onChange={val => setFormData({...formData, description: val})} />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border shadow-sm space-y-4">
            <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Hình ảnh đại diện</Label>
            <ImageUpload value={formData.image_url} onChange={url => setFormData({...formData, image_url: url})} />
          </div>
          <div className="bg-white p-6 rounded-3xl border shadow-sm space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-widest text-primary flex items-center gap-2"><Layout className="w-4 h-4" /> Thông số dự án</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase text-muted-foreground">Diện tích</Label>
                <Input value={formData.area} onChange={e => setFormData({...formData, area: e.target.value})} placeholder="250m2..." />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase text-muted-foreground">Phong cách</Label>
                <Input value={formData.style} onChange={e => setFormData({...formData, style: e.target.value})} placeholder="Modern Classic..." />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase text-muted-foreground">Năm thực hiện</Label>
                <Input value={formData.year} onChange={e => setFormData({...formData, year: e.target.value})} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}