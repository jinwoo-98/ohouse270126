import React, { useRef, useMemo } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface RichTextEditorProps {
  value: string;
  onChange: (content: string) => void;
  placeholder?: string;
  contextTitle?: string; 
}

export function RichTextEditor({ value, onChange, placeholder, contextTitle }: RichTextEditorProps) {
  const quillRef = useRef<ReactQuill>(null);

  const imageHandler = () => {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.setAttribute('multiple', 'true');
    input.click();

    input.onchange = async () => {
      const files = Array.from(input.files || []);
      if (files.length === 0) return;

      const toastId = toast.loading(`Đang tải lên ${files.length} ảnh...`);

      try {
        const quill = quillRef.current?.getEditor();
        if (!quill) return;

        const range = quill.getSelection(true);
        let currentIndex = range.index;

        const uploadFile = async (file: File) => {
          const fileExt = file.name.split('.').pop();
          const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
          const { error } = await supabase.storage.from('uploads').upload(fileName, file);
          if (error) throw error;
          const { data: { publicUrl } } = supabase.storage.from('uploads').getPublicUrl(fileName);
          return publicUrl;
        };

        const urls = await Promise.all(files.map(file => uploadFile(file)));

        for (const url of urls) {
          const manualAlt = prompt(
            `Nhập mô tả SEO cho ảnh này:\n(Để trống để tự động dùng: ${contextTitle || 'Tên sản phẩm'})`, 
            contextTitle || ""
          );
          
          quill.insertEmbed(currentIndex, 'image', url);
          
          setTimeout(() => {
            const images = quill.root.querySelectorAll('img');
            const lastImg = images[images.length - 1];
            if (lastImg && !lastImg.getAttribute('alt')) {
              lastImg.setAttribute('alt', manualAlt || "");
            }
          }, 0);

          currentIndex += 1;
        }

        toast.success("Đã chèn ảnh thành công", { id: toastId });
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
    <div className="bg-white border rounded-xl overflow-hidden flex flex-col shadow-sm">
      <ReactQuill 
        ref={quillRef}
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
        className="flex-1 flex flex-col"
      />
      <style>{`
        /* Container chính của Quill */
        .quill { 
          display: flex; 
          flex-direction: column; 
          height: 550px; /* Chiều cao tổng thể của khung soạn thảo */
        }
        
        /* Thanh công cụ (Toolbar) */
        .ql-toolbar.ql-snow { 
          border: none; 
          border-bottom: 1px solid #f0f0f0; 
          padding: 12px; 
          background: #fafafa;
          flex-shrink: 0; /* Không cho phép co lại */
        }
        
        /* Vùng chứa nội dung (Editor area) */
        .ql-container.ql-snow { 
          border: none; 
          flex: 1; /* Chiếm toàn bộ không gian còn lại */
          overflow-y: auto; /* Cho phép cuộn nội dung bên trong */
          font-family: 'Montserrat', sans-serif; 
          font-size: 14px; 
        }
        
        /* Tùy chỉnh thanh cuộn cho vùng soạn thảo */
        .ql-container::-webkit-scrollbar {
          width: 6px;
        }
        .ql-container::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
        .ql-container::-webkit-scrollbar-thumb:hover {
          background: #cbd5e1;
        }

        .ql-editor {
          min-height: 100%;
          padding: 20px;
        }
        
        .ql-editor a { color: #b08d55 !important; text-decoration: underline !important; font-weight: bold; }
        .ql-editor img { max-width: 100%; border-radius: 8px; margin: 10px 0; }
      `}</style>
    </div>
  );
}