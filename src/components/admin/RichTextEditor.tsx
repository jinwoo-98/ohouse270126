import React, { useRef, useMemo } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface RichTextEditorProps {
  value: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

export function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const quillRef = useRef<ReactQuill>(null);

  // Trình xử lý tải ảnh tùy chỉnh
  const imageHandler = () => {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.setAttribute('multiple', 'true'); // Cho phép chọn nhiều ảnh
    input.click();

    input.onchange = async () => {
      const files = Array.from(input.files || []);
      if (files.length === 0) return;

      const toastId = toast.loading(`Đang tải lên ${files.length} ảnh...`);

      try {
        const quill = quillRef.current?.getEditor();
        if (!quill) return;

        // Lưu vị trí con trỏ hiện tại
        const range = quill.getSelection(true);
        let currentIndex = range.index;

        // Hàm tải 1 file lên Supabase
        const uploadFile = async (file: File) => {
          const fileExt = file.name.split('.').pop();
          const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
          const { error } = await supabase.storage.from('uploads').upload(fileName, file);
          if (error) throw error;
          const { data: { publicUrl } } = supabase.storage.from('uploads').getPublicUrl(fileName);
          return publicUrl;
        };

        // Tải tất cả ảnh và giữ đúng thứ tự
        const urls = await Promise.all(files.map(file => uploadFile(file)));

        // Chèn các ảnh vào Quill theo thứ tự
        urls.forEach(url => {
          quill.insertEmbed(currentIndex, 'image', url);
          currentIndex += 1; // Di chuyển vị trí chèn cho ảnh tiếp theo
        });

        toast.success("Đã chèn ảnh thành công", { id: toastId });
      } catch (error: any) {
        toast.error("Lỗi khi tải ảnh vào bài viết: " + error.message, { id: toastId });
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
  }), []);

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