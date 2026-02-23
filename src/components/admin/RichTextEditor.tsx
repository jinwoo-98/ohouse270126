import React, { useRef, useMemo } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface RichTextEditorProps {
  value: string;
  onChange: (content: string) => void;
  placeholder?: string;
  contextTitle?: string; // Thêm tiêu đề sản phẩm để làm gợi ý Alt
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

        // Tải ảnh lên
        const urls = await Promise.all(files.map(file => uploadFile(file)));

        // Sau khi tải xong, hỏi Alt text cho từng ảnh (Chiến lược 1)
        for (const url of urls) {
          const manualAlt = prompt(
            `Nhập mô tả SEO cho ảnh này:\n(Để trống để tự động dùng: ${contextTitle || 'Tên sản phẩm'})`, 
            contextTitle || ""
          );
          
          // Chèn ảnh vào editor
          quill.insertEmbed(currentIndex, 'image', url);
          
          // Nếu có nhập Alt, chúng ta sẽ tìm thẻ img vừa chèn và gán Alt
          // Lưu ý: Quill insertEmbed không hỗ trợ gán Alt trực tiếp dễ dàng, 
          // nên ta sẽ xử lý gán Alt vào DOM của editor ngay lập tức.
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
    <div className="bg-white border rounded-xl overflow-hidden">
      <ReactQuill 
        ref={quillRef}
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
        className="min-h-[350px]"
      />
      <style>{`
        .quill { display: flex; flex-direction: column; }
        .ql-toolbar.ql-snow { border: none; border-bottom: 1px solid #f0f0f0; padding: 12px; background: #fafafa; }
        .ql-container.ql-snow { border: none; min-height: 300px; font-family: 'Montserrat', sans-serif; font-size: 14px; }
        .ql-editor a { color: #b08d55 !important; text-decoration: underline !important; font-weight: bold; }
        .ql-editor img { max-width: 100%; border-radius: 8px; margin: 10px 0; }
      `}</style>
    </div>
  );
}