import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Save, Loader2, MapPin, Phone, Mail, Clock, Image as ImageIcon, Code } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { toast } from "sonner";

export default function ShowroomForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);
  
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    phone: "",
    email: "",
    working_hours: "8:00 - 21:00 (Tất cả các ngày)",
    map_iframe_url: "",
    image_url: "",
    is_active: true,
    display_order: "1000"
  });

  useEffect(() => {
    if (id) fetchShowroom();
  }, [id]);

  const fetchShowroom = async () => {
    const { data } = await supabase.from('showrooms').select('*').eq('id', id).single();
    if (data) {
      setFormData({
        ...data,
        display_order: data.display_order?.toString() || "1000"
      });
    }
    setFetching(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.address || !formData.phone) {
      toast.error("Vui lòng nhập Tên, Địa chỉ và Số điện thoại.");
      return;
    }
    
    setLoading(true);
    const payload = {
      ...formData,
      display_order: parseInt(formData.display_order) || 1000,
    };

    try {
      if (isEdit) {
        await supabase.from('showrooms').update(payload).eq('id', id);
      } else {
        await supabase.from('showrooms').insert(payload);
      }
      toast.success("Đã lưu thông tin Showroom thành công!");
      navigate("/admin/showrooms");
    } catch (err: any) {
      toast.error("Lỗi khi lưu Showroom: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div className="flex items-center justify-center h-screen"><Loader2 className="w-10 h-10 animate-spin text-primary" /></div>;

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild><Link to="/admin/showrooms"><ArrowLeft className="w-4 h-4" /></Link></Button>
          <h1 className="text-2xl font-bold">{isEdit ? "Chỉnh sửa Showroom" : "Thêm Showroom mới"}</h1>
        </div>
        <Button onClick={handleSave} disabled={loading} className="btn-hero h-11 px-8 shadow-gold">
          {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          Lưu Showroom
        </Button>
      </div>

      <form onSubmit={handleSave} className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-3xl border shadow-sm space-y-6">
            <h3 className="text-sm font-bold uppercase tracking-widest text-primary flex items-center gap-2"><MapPin className="w-4 h-4" /> Thông tin cơ bản</h3>
            
            <div className="space-y-2">
              <Label>Tên Showroom *</Label>
              <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required className="h-12 text-lg font-bold" />
            </div>
            <div className="space-y-2">
              <Label>Địa chỉ chi tiết *</Label>
              <Input value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} required className="h-12" />
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="flex items-center gap-2"><Phone className="w-3 h-3" /> Số điện thoại *</Label>
                <Input value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} required className="h-12 font-mono" />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2"><Mail className="w-3 h-3" /> Email</Label>
                <Input value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="h-12 font-mono" />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="flex items-center gap-2"><Clock className="w-3 h-3" /> Giờ làm việc</Label>
              <Input value={formData.working_hours} onChange={e => setFormData({...formData, working_hours: e.target.value})} className="h-12" />
            </div>
          </div>
          
          <div className="bg-white p-8 rounded-3xl border shadow-sm space-y-6">
            <h3 className="text-sm font-bold uppercase tracking-widest text-primary flex items-center gap-2"><Code className="w-4 h-4" /> Mã nhúng bản đồ</h3>
            <div className="space-y-2">
              <Label>Google Maps Iframe URL</Label>
              <Textarea 
                value={formData.map_iframe_url} 
                onChange={e => setFormData({...formData, map_iframe_url: e.target.value})} 
                placeholder='<iframe src="https://www.google.com/maps/embed?..." ...></iframe>'
                className="font-mono text-xs min-h-[150px]"
              />
              <p className="text-[10px] text-muted-foreground italic">Dán mã nhúng HTML từ Google Maps.</p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-3xl border shadow-sm space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-widest text-primary flex items-center gap-2"><ImageIcon className="w-4 h-4" /> Ảnh đại diện</h3>
            <ImageUpload value={formData.image_url} onChange={url => setFormData({...formData, image_url: url as string})} />
          </div>
          
          <div className="bg-white p-6 rounded-3xl border shadow-sm space-y-4">
            <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-xl">
              <Label className="text-xs font-bold uppercase">Hiển thị trên web</Label>
              <Switch checked={formData.is_active} onCheckedChange={val => setFormData({...formData, is_active: val})} />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase text-muted-foreground">Thứ tự hiển thị</Label>
              <Input type="number" value={formData.display_order} onChange={e => setFormData({...formData, display_order: e.target.value})} className="h-11 rounded-xl" />
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}