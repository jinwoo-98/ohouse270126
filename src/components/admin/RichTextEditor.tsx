import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

interface RichTextEditorProps {
  value: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

const modules = {
  toolbar: [
    [{ 'header': [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike', 'blockquote'],
    [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }],
    ['link', 'image', 'video'], // Thêm link, ảnh và video vào toolbar
    ['clean'],
    [{ 'color': [] }, { 'background': [] }],
    [{ 'align': [] }],
  ],
};

const formats = [
  'header', 'bold', 'italic', 'underline', 'strike', 'blockquote',
  'list', 'bullet', 'indent', 'link', 'image', 'video', 'color', 'background', 'align'
];

export function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  return (
    <div className="bg-white">
      <ReactQuill 
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
        className="min-h-[350px] rounded-lg overflow-hidden"
      />
      <style>{`
        .ql-container {
          min-height: 300px;
          font-size: 16px;
        }
        .ql-editor img {
          max-width: 100%;
          height: auto;
        }
        .ql-editor iframe {
          width: 100%;
          aspect-ratio: 16 / 9;
        }
      `}</style>
    </div>
  );
}