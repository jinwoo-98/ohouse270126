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
    <div className="rich-editor-wrapper bg-white border rounded-xl overflow-hidden shadow-sm">
      <ReactQuill 
        ref={quillRef}
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
      />
      <style>{`
        /* Ép buộc khung editor có chiều cao cố định và không được giãn ra */
        .rich-editor-wrapper .quill {
          height: 550px !important;
          display: flex !important;
          flex-direction: column !important;
        }

        /* Cố định thanh công cụ ở trên cùng */
        .rich-editor-wrapper .ql-toolbar.ql-snow {
          flex-shrink: 0 !important;
          border: none !important;
          border-bottom: 1px solid #f0f0f0 !important;
          background: #fafafa !important;
          z-index: 10 !important;
        }

        /* Cho phép vùng nội dung tự co giãn và xuất hiện thanh cuộn riêng */
        .rich-editor-wrapper .ql-container.ql-snow {
          flex-grow: 1 !important;
          overflow-y: auto !important;
          border: none !important;
          display: flex !important;
          flex-direction: column !important;
          height: auto !important; /* Quan trọng: để flex-grow hoạt động */
        }

        /* Đảm bảo vùng soạn thảo chiếm hết diện tích container */
        .rich-editor-wrapper .ql-editor {
          flex-grow: 1 !important;
          min-height: 100% !important;
          padding: 25px !important;
          font-family: 'Montserrat', sans-serif !important;
          font-size: 14px !important;
          line-height: 1.6 !important;
        }

        /* Tùy chỉnh thanh cuộn cho đẹp và dễ nhìn */
        .rich-editor-wrapper .ql-container::-webkit-scrollbar {
          width: 8px;
        }
        .rich-editor-wrapper .ql-container::-webkit-scrollbar-track {
          background: #f1f1f1;
        }
        .rich-editor-wrapper .ql-container::-webkit-scrollbar-thumb {
          background: #ccc;
          border-radius: 10px;
        }
        .rich-editor-wrapper .ql-container::-webkit-scrollbar-thumb:hover {
          background: #b08d55;
        }

        .rich-editor-wrapper .ql-editor img { 
          max-width: 100%; 
          border-radius: 12px; 
          margin: 15px 0; 
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
        }
        
        .rich-editor-wrapper .ql-editor a { 
          color: #b08d55 !important; 
          text-decoration: underline !important; 
          font-weight: bold; 
        }
      `}</style>
    </div>
  );
}