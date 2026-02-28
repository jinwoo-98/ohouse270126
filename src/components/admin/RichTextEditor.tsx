import React, { useRef, useMemo, useState, useEffect } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Image as ImageIcon, Save, Settings2, X, Check } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface RichTextEditorProps {
  value: string;
  onChange: (content: string) => void;
  placeholder?: string;
  contextTitle?: string; 
}

interface ImageAltItem {
  src: string;
  alt: string;
  index: number;
}

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

export function RichTextEditor({ value, onChange, placeholder, contextTitle }: RichTextEditorProps) {
  const quillRef = useRef<ReactQuill>(null);
  const [isAltModalOpen, setIsAltModalOpen] = useState(false);
  const [imageList, setImageList] = useState<ImageAltItem[]>([]);

  const extractImages = () => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(value || "", 'text/html');
    const images = doc.querySelectorAll('img');
    
    const list: ImageAltItem[] = [];
    images.forEach((img, idx) => {
      list.push({
        src: img.getAttribute('src') || "",
        alt: img.getAttribute('alt') || "",
        index: idx
      });
    });
    
    setImageList(list);
    if (list.length === 0) {
      toast.info("Không tìm thấy ảnh nào trong nội dung bài viết.");
      return;
    }
    setIsAltModalOpen(true);
  };

  const handleSaveAlts = () => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(value || "", 'text/html');
    const images = doc.querySelectorAll('img');

    imageList.forEach((item, idx) => {
      if (images[idx]) {
        images[idx].setAttribute('alt', item.alt);
      }
    });

    onChange(doc.body.innerHTML);
    setIsAltModalOpen(false);
    toast.success("Đã cập nhật Alt cho tất cả ảnh!");
  };

  const updateAltInList = (index: number, newAlt: string) => {
    setImageList(prev => prev.map((item, i) => i === index ? { ...item, alt: newAlt } : item));
  };

  const imageHandler = () => {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/jpeg,image/png,image/webp,image/gif');
    input.setAttribute('multiple', 'true');
    input.click();

    input.onchange = async () => {
      const files = Array.from(input.files || []);
      if (files.length === 0) return;

      // Validation
      for (const file of files) {
        if (!ALLOWED_TYPES.includes(file.type)) {
          toast.error(`Định dạng tệp "${file.name}" không được hỗ trợ.`);
          return;
        }
        if (file.size > MAX_FILE_SIZE) {
          toast.error(`Tệp "${file.name}" quá lớn (tối đa 2MB).`);
          return;
        }
      }

      const toastId = toast.loading(`Đang tải lên ${files.length} ảnh...`);

      try {
        const quill = quillRef.current?.getEditor();
        if (!quill) return;

        const range = quill.getSelection(true);
        let currentIndex = range.index;

        for (const file of files) {
          const fileExt = file.name.split('.').pop();
          const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
          const { error } = await supabase.storage.from('uploads').upload(fileName, file, {
            contentType: file.type,
            upsert: false
          });
          
          if (error) throw error;
          
          const { data: { publicUrl } } = supabase.storage.from('uploads').getPublicUrl(fileName);

          quill.insertEmbed(currentIndex, 'image', publicUrl);
          
          setTimeout(() => {
            const images = quill.root.querySelectorAll('img');
            const targetImg = Array.from(images).find(img => img.getAttribute('src') === publicUrl);
            if (targetImg && !targetImg.getAttribute('alt')) {
              targetImg.setAttribute('alt', contextTitle || "");
            }
          }, 100);

          currentIndex += 1;
        }

        toast.success("Đã chèn ảnh thành công.", { id: toastId });
      } catch (error: any) {
        toast.error("Lỗi khi tải ảnh: " + error.message, { id: toastId });
      }
    };
  };

  const modules = useMemo(() => ({
    toolbar: {
      container: [
        [{ 'header': [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike', 'blockquote'],
        [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }],
        ['link', 'image', 'video'], 
        ['clean'],
        [{ 'color': [] }, { 'background': [] }],
        [{ 'align': [] }],
      ],
      handlers: {
        image: imageHandler
      }
    }
  }), [contextTitle]);

  const formats = [
    'header', 'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'bullet', 'indent', 'link', 'image', 'video', 'color', 'background', 'align'
  ];

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <Button 
          type="button" 
          variant="outline" 
          size="sm" 
          onClick={extractImages}
          className="h-9 rounded-xl border-primary/30 text-primary hover:bg-primary/5 font-bold text-[10px] uppercase tracking-widest gap-2"
        >
          <Settings2 className="w-3.5 h-3.5" /> Quản lý Alt ảnh bài viết
        </Button>
      </div>

      <div className="rich-editor-wrapper bg-white border rounded-xl overflow-hidden shadow-sm">
        <ReactQuill 
          ref={quillRef}
          theme="snow"
          value={value}
          onChange={onChange}
          modules={modules}
          formats={formats}
          placeholder={placeholder}
          className="vn-text-fix" // Áp dụng fix ngay tại đây
        />
      </div>

      <div className="hidden">
        <style>{`
          .rich-editor-wrapper .quill {
            height: 550px !important;
            display: flex !important;
            flex-direction: column !important;
          }
          .rich-editor-wrapper .ql-toolbar.ql-snow {
            flex-shrink: 0 !important;
            border: none !important;
            border-bottom: 1px solid #f0f0f0 !important;
            background: #fafafa !important;
            z-index: 10 !important;
          }
          .rich-editor-wrapper .ql-container.ql-snow {
            flex-grow: 1 !important;
            overflow-y: auto !important;
            border: none !important;
            display: flex !important;
            flex-direction: column !important;
            height: auto !important;
          }
          .rich-editor-wrapper .ql-editor {
            flex-grow: 1 !important;
            min-height: 100% !important;
            padding: 25px !important;
            font-family: 'Montserrat', sans-serif !important;
            font-size: 14px !important;
            line-height: 1.6 !important;
            /* Ép quy tắc ngắt dòng tiếng Việt trong editor */
            word-break: normal !important;
            overflow-wrap: break-word !important;
            text-align: left !important;
          }
          .rich-editor-wrapper .ql-container::-webkit-scrollbar { width: 8px; }
          .rich-editor-wrapper .ql-container::-webkit-scrollbar-thumb { background: #ccc; border-radius: 10px; }
          .rich-editor-wrapper .ql-editor img { max-width: 100%; border-radius: 12px; margin: 15px 0; }
        `}</style>
      </div>

      <Dialog open={isAltModalOpen} onOpenChange={setIsAltModalOpen}>
        <DialogContent className="max-w-2xl rounded-3xl p-0 overflow-hidden border-none shadow-elevated z-[160]">
          <div className="bg-charcoal p-6 text-white">
            <DialogHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center text-primary">
                  <ImageIcon className="w-5 h-5" />
                </div>
                <DialogTitle className="text-lg font-bold uppercase tracking-widest">Tối Ưu SEO Hình Ảnh</DialogTitle>
              </div>
            </DialogHeader>
          </div>

          <div className="p-6 max-h-[60vh] overflow-y-auto custom-scrollbar space-y-4 bg-secondary/10">
            {imageList.map((item, idx) => (
              <div key={idx} className="flex items-center gap-6 p-4 bg-white rounded-2xl border border-border/50 shadow-sm group">
                <div className="w-20 h-20 rounded-xl overflow-hidden border border-border/40 shrink-0 bg-gray-50">
                  <img src={item.src} className="w-full h-full object-cover" alt="Preview" />
                </div>
                <div className="flex-1 space-y-2">
                  <Label className="text-[10px] font-bold uppercase text-muted-foreground">Mô tả Alt (Ảnh {idx + 1})</Label>
                  <Input 
                    value={item.alt} 
                    onChange={(e) => updateAltInList(idx, e.target.value)}
                    placeholder="Nhập mô tả cho ảnh này..."
                    className="h-11 rounded-xl border-border/60 focus:border-primary"
                  />
                </div>
              </div>
            ))}
          </div>

          <DialogFooter className="p-6 bg-white border-t flex gap-3">
            <Button variant="ghost" onClick={() => setIsAltModalOpen(false)} className="rounded-xl h-12 flex-1 font-bold text-xs uppercase">
              Hủy bỏ
            </Button>
            <Button onClick={handleSaveAlts} className="btn-hero h-12 flex-[2] rounded-xl shadow-gold">
              <Check className="w-4 h-4 mr-2" /> LƯU TẤT CẢ THAY ĐỔI
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}