import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Save, Loader2, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export default function AttributeForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    type: "single",
    note: ""
  });
  const [options, setOptions] = useState<string[]>([]);
  const [newOption, setNewOption] = useState("");

  useEffect(() => {
    if (id) fetchAttribute();
  }, [id]);

  const fetchAttribute = async () => {
    const { data } = await supabase.from('attributes').select('*').eq('id', id).single();
    if (data) {
      setFormData({ name: data.name, type: data.type, note: data.note || "" });
      setOptions(data.options || []);
    }
  };

  const handleAddOption = (e: React.FormEvent) => {
    e.preventDefault();
    if (newOption.trim()) {
      setOptions([...options, newOption.trim()]);
      setNewOption("");
    }
  };

  const removeOption = (index: number) => {
    setOptions(options.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!formData.name) { toast.error("Vui lòng nhập tên thuộc tính"); return; }
    
    setLoading(true);
    const payload = { ...formData, options };
    
    try {
      if (id) {
        await supabase.from('attributes').update(payload).eq('id', id);
      } else {
        await supabase.from('attributes').insert(payload);
      }
      toast.success("Đã lưu thuộc tính!");
      navigate("/admin/attributes");
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild><Link to="/admin/attributes"><ArrowLeft className="w-4 h-4" /></Link></Button>
          <h1 className="text-2xl font-bold">{id ? "Chỉnh sửa thuộc tính" : "Tạo thuộc tính mới"}</h1>
        </div>
        <Button onClick={handleSave} disabled={loading} className="btn-hero shadow-gold">
          {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />} Lưu lại
        </Button>
      </div>

      <div className="bg-white p-8 rounded-2xl border shadow-sm space-y-6">
        <div className="space-y-2">
          <Label>Tên thuộc tính</Label>
          <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="VD: Màu sắc, Chất liệu..." />
        </div>

        <div className="space-y-2">
          <Label>Loại nhập liệu</Label>
          <Select value={formData.type} onValueChange={val => setFormData({...formData, type: val})}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="single">Chọn 1 giá trị (Single Select)</SelectItem>
              <SelectItem value="multiple">Chọn nhiều giá trị (Multi Select)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-3">
          <Label>Các giá trị tùy chọn</Label>
          <div className="flex gap-2">
            <Input 
              value={newOption} 
              onChange={e => setNewOption(e.target.value)} 
              placeholder="Nhập giá trị và ấn Enter (VD: Đỏ, Xanh...)" 
              onKeyDown={e => e.key === 'Enter' && handleAddOption(e)}
            />
            <Button onClick={handleAddOption} variant="secondary"><Plus className="w-4 h-4" /></Button>
          </div>
          <div className="flex flex-wrap gap-2 p-4 bg-gray-50 rounded-xl border min-h-[100px] content-start">
            {options.length === 0 && <span className="text-sm text-muted-foreground italic">Chưa có giá trị nào.</span>}
            {options.map((opt, i) => (
              <Badge key={i} variant="outline" className="pl-3 pr-1 py-1 bg-white gap-2 h-8">
                {opt}
                <button onClick={() => removeOption(i)} className="hover:bg-red-100 p-1 rounded-full text-muted-foreground hover:text-red-600 transition-colors"><X className="w-3 h-3" /></button>
              </Badge>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Ghi chú</Label>
          <Textarea value={formData.note} onChange={e => setFormData({...formData, note: e.target.value})} placeholder="Ghi chú nội bộ về thuộc tính này..." />
        </div>
      </div>
    </div>
  );
}