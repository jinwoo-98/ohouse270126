import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Edit, Trash2, Loader2, Save, Code, GripVertical, AlertCircle, ShieldAlert, Info, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { cn } from "@/lib/utils";
import { sanitizeTrackingScript } from "@/lib/sanitize";
import { useAuth } from "@/contexts/AuthContext";
import { Checkbox } from "@/components/ui/checkbox";

const TRACKING_TYPES = [
  { id: 'gtm', label: 'Google Tag Manager', placeholder: 'GTM-XXXXXXX' },
  { id: 'ga4', label: 'Google Analytics 4', placeholder: 'G-XXXXXXX' },
  { id: 'fbpixel', label: 'Facebook Pixel', placeholder: '1234567890' },
  { id: 'custom', label: 'Mã tùy chỉnh (Custom Script)', placeholder: '<script>...</script>' },
];

export default function TrackingManager() {
  const { user } = useAuth();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [scripts, setScripts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [editingScript, setEditingScript] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  
  // Form states
  const [selectedType, setSelectedType] = useState('gtm');
  const [integrationId, setIntegrationId] = useState('');
  const [riskAccepted, setRiskAccepted] = useState(false);

  useEffect(() => {
    fetchScripts();
    fetchUserRole();
  }, [user]);

  const fetchUserRole = async () => {
    if (!user) return;
    const { data } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    setUserRole(data?.role || 'user');
  };

  const fetchScripts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('tracking_scripts')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      setScripts(data || []);
    } catch (error) {
      toast.error("Lỗi tải mã theo dõi.");
    } finally {
      setLoading(false);
    }
  };

  const generateScriptFromTemplate = (type: string, id: string) => {
    const cleanId = id.trim();
    if (!cleanId) return "";

    switch (type) {
      case 'gtm':
        return `<!-- GTM -->\n<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${cleanId}');</script>`;
      case 'ga4':
        return `<!-- GA4 -->\n<script async src="https://www.googletagmanager.com/gtag/js?id=${cleanId}"></script>\n<script>window.dataLayer = window.dataLayer || [];function gtag(){dataLayer.push(arguments);}gtag('js', new Date());gtag('config', '${cleanId}');</script>`;
      case 'fbpixel':
        return `<!-- FB Pixel -->\n<script>!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window, document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init', '${cleanId}');fbq('track', 'PageView');</script>`;
      default:
        return "";
    }
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const location = formData.get('location') as string;
    let scriptContent = "";

    if (selectedType === 'custom') {
      if (!riskAccepted) {
        toast.error("Vui lòng xác nhận bạn đã hiểu rủi ro bảo mật khi sử dụng mã tùy chỉnh.");
        return;
      }
      if (userRole !== 'admin') {
        toast.error("Chỉ Quản trị viên (Admin) mới có quyền chèn mã tùy chỉnh.");
        return;
      }
      scriptContent = formData.get('script_content') as string;
    } else {
      scriptContent = generateScriptFromTemplate(selectedType, integrationId);
    }

    if (!name || !scriptContent || !location) {
      toast.error("Vui lòng điền đầy đủ thông tin.");
      return;
    }

    setSaving(true);
    const sanitizedContent = sanitizeTrackingScript(scriptContent);

    const payload = {
      name,
      location,
      script_content: sanitizedContent,
      is_active: editingScript?.is_active ?? true,
      display_order: editingScript?.display_order ?? scripts.length + 1,
    };

    const { error } = editingScript?.id
      ? await supabase.from('tracking_scripts').update(payload).eq('id', editingScript.id)
      : await supabase.from('tracking_scripts').insert(payload);

    setSaving(false);

    if (error) {
      toast.error("Lỗi lưu dữ liệu: " + error.message);
    } else {
      toast.success("Đã lưu mã theo dõi thành công.");
      setIsOpen(false);
      fetchScripts();
    }
  };

  const toggleActive = async (id: string, current: boolean) => {
    const { error } = await supabase.from('tracking_scripts').update({ is_active: !current }).eq('id', id);
    if (error) {
      toast.error("Lỗi cập nhật: " + error.message);
    } else {
      setScripts(scripts.map(s => s.id === id ? { ...s, is_active: !current } : s));
      toast.success("Đã cập nhật trạng thái.");
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const toastId = toast.loading("Đang xóa mã theo dõi...");
    try {
      const { error } = await supabase.from('tracking_scripts').delete().eq('id', deleteId);
      if (error) throw error;
      toast.success("Đã xóa mã theo dõi.", { id: toastId });
      fetchScripts();
    } catch (e) {
      toast.error("Lỗi khi xóa.", { id: toastId });
    } finally {
      setDeleteId(null);
    }
  };

  const onDragEnd = async (result: DropResult) => {
    const { destination, source } = result;
    if (!destination || destination.index === source.index) return;

    const newScripts = Array.from(scripts);
    const [reorderedItem] = newScripts.splice(source.index, 1);
    newScripts.splice(destination.index, 0, reorderedItem);

    setScripts(newScripts);

    try {
      const promises = newScripts.map((item, index) => 
        supabase
          .from('tracking_scripts')
          .update({ display_order: index + 1 })
          .eq('id', item.id)
      );
      
      await Promise.all(promises);
      toast.success("Đã cập nhật thứ tự hiển thị.");
    } catch (error) {
      toast.error("Lỗi khi lưu thứ tự.");
      fetchScripts();
    }
  };

  const openAddDialog = () => {
    setEditingScript({ location: 'head', is_active: true });
    setSelectedType('gtm');
    setIntegrationId('');
    setRiskAccepted(false);
    setIsOpen(true);
  };

  const openEditDialog = (script: any) => {
    setEditingScript(script);
    // Try to detect type from content
    if (script.script_content.includes('googletagmanager.com/gtm.js')) setSelectedType('gtm');
    else if (script.script_content.includes('gtag/js')) setSelectedType('ga4');
    else if (script.script_content.includes('connect.facebook.net')) setSelectedType('fbpixel');
    else setSelectedType('custom');
    
    setIntegrationId(''); // We don't reverse engineer the ID for simplicity
    setRiskAccepted(false);
    setIsOpen(true);
  };

  return (
    <div className="max-w-5xl mx-auto pb-20 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3">
            <Code className="w-7 h-7 text-primary" />
            Quản Lý Mã Theo Dõi
          </h1>
          <p className="text-muted-foreground text-sm">Tích hợp các công cụ phân tích và marketing một cách an toàn.</p>
        </div>
        <Button onClick={openAddDialog} className="btn-hero h-11 shadow-gold">
          <Plus className="w-4 h-4 mr-2" /> Thêm Mã Mới
        </Button>
      </div>

      <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-4">
        <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-1" />
        <div className="space-y-1">
          <p className="text-sm text-amber-800 font-bold">Cảnh báo bảo mật quan trọng</p>
          <p className="text-xs text-amber-700 leading-relaxed">
            Việc chèn mã JavaScript tùy chỉnh có thể gây rủi ro bảo mật nghiêm trọng nếu tài khoản bị xâm nhập. 
            Khuyến khích sử dụng các <strong>Tích hợp có sẵn</strong> (GTM, GA4) thay vì dán mã thô.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      ) : scripts.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-border text-muted-foreground italic">Chưa có mã theo dõi nào được thêm.</div>
      ) : (
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="scripts-list">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
                {scripts.map((script, index) => (
                  <Draggable key={script.id} draggableId={script.id} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={cn(
                          "bg-white p-4 rounded-2xl border shadow-sm flex items-center gap-4 transition-all",
                          snapshot.isDragging ? "shadow-elevated scale-[1.01] border-primary/40 z-50" : ""
                        )}
                      >
                        <div {...provided.dragHandleProps} className="text-muted-foreground/30 hover:text-primary cursor-grab active:cursor-grabbing px-1">
                          <GripVertical className="w-5 h-5" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-sm text-charcoal truncate">{script.name}</h3>
                          <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest mt-1">
                            <span className={cn("px-2 py-0.5 rounded-full", script.location === 'head' ? "bg-blue-100 text-blue-600" : "bg-green-100 text-green-600")}>
                              {script.location === 'head' ? 'HEAD' : 'BODY'}
                            </span>
                            <span className="text-muted-foreground">Thứ tự: {script.display_order}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 border-l border-border/50 pl-4">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold uppercase text-muted-foreground">Active</span>
                            <Switch checked={script.is_active} onCheckedChange={() => toggleActive(script.id, script.is_active)} />
                          </div>
                          <Button variant="ghost" size="icon" className="h-9 w-9 text-blue-600 hover:bg-blue-50" onClick={() => openEditDialog(script)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-9 w-9 text-destructive hover:bg-destructive/10" onClick={() => setDeleteId(script.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      )}

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl rounded-3xl p-0 overflow-hidden border-none shadow-elevated">
          <div className="bg-charcoal p-6 text-white">
            <DialogHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center text-primary">
                  <Code className="w-6 h-6" />
                </div>
                <DialogTitle className="text-lg font-bold">{editingScript?.id ? "Chỉnh sửa Mã" : "Thêm Mã Theo Dõi"}</DialogTitle>
              </div>
            </DialogHeader>
          </div>
          <form id="script-form" onSubmit={handleSave} className="p-8 space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Tên gợi nhớ (VD: GTM Marketing)</Label>
                <Input name="name" defaultValue={editingScript?.name} required className="h-11 rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Vị trí chèn mã</Label>
                <Select name="location" defaultValue={editingScript?.location || 'head'}>
                  <SelectTrigger className="h-11 rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="head">{'Trong thẻ <head>'}</SelectItem>
                    <SelectItem value="body">{'Ngay sau thẻ <body>'}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4 p-5 bg-secondary/30 rounded-2xl border border-border/50">
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-primary">Loại tích hợp</Label>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger className="h-11 rounded-xl bg-white"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {TRACKING_TYPES.map(t => (
                      <SelectItem key={t.id} value={t.id}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedType !== 'custom' ? (
                <div className="space-y-2 animate-fade-in">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    Nhập ID {TRACKING_TYPES.find(t => t.id === selectedType)?.label}
                  </Label>
                  <Input 
                    value={integrationId} 
                    onChange={e => setIntegrationId(e.target.value)}
                    placeholder={TRACKING_TYPES.find(t => t.id === selectedType)?.placeholder}
                    className="h-11 rounded-xl bg-white font-mono"
                    required={selectedType !== 'custom'}
                  />
                  <div className="flex items-center gap-2 p-2 bg-emerald-50 rounded-lg border border-emerald-100">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <p className="text-[10px] text-emerald-700 font-medium">Hệ thống sẽ tự động tạo mã an toàn từ ID này.</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 animate-fade-in">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-destructive">Nội dung mã tùy chỉnh (HTML/JS)</Label>
                    <Textarea 
                      name="script_content" 
                      defaultValue={editingScript?.script_content} 
                      required={selectedType === 'custom'}
                      rows={8} 
                      placeholder="Dán toàn bộ mã script vào đây..."
                      className="rounded-xl font-mono text-xs resize-none bg-white"
                    />
                  </div>
                  
                  <div className="p-4 bg-red-50 border border-red-100 rounded-xl space-y-3">
                    <div className="flex items-center gap-2 text-destructive">
                      <ShieldAlert className="w-4 h-4" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">Xác nhận rủi ro</span>
                    </div>
                    <div className="flex items-start space-x-3">
                      <Checkbox 
                        id="risk-check" 
                        checked={riskAccepted} 
                        onCheckedChange={(val) => setRiskAccepted(!!val)}
                        className="mt-1 data-[state=checked]:bg-destructive data-[state=checked]:border-destructive"
                      />
                      <Label htmlFor="risk-check" className="text-[10px] text-red-800 leading-relaxed cursor-pointer font-medium">
                        Tôi xác nhận mã này là an toàn và đã được kiểm tra kỹ lưỡng. Tôi hiểu rằng việc chèn mã sai có thể làm hỏng website hoặc gây rủi ro bảo mật.
                      </Label>
                    </div>
                    {userRole !== 'admin' && (
                      <p className="text-[9px] text-red-600 font-bold italic">
                        * Bạn đang ở vai trò Editor. Chỉ Admin mới có thể lưu mã tùy chỉnh.
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-4 border-t gap-3">
              <Button variant="ghost" onClick={() => setIsOpen(false)} className="rounded-xl h-12 px-8 font-bold text-xs uppercase">Hủy bỏ</Button>
              <Button 
                type="submit" 
                disabled={saving || (selectedType === 'custom' && (userRole !== 'admin' || !riskAccepted))} 
                className="btn-hero h-12 px-10 shadow-gold"
              >
                {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />} Lưu Mã
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog 
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Xác nhận xóa mã theo dõi"
        description="Mã này sẽ bị xóa vĩnh viễn khỏi hệ thống và không còn được chèn vào website."
        confirmText="Vẫn xóa mã"
      />
    </div>
  );
}