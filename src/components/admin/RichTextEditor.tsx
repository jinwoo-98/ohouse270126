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
    ['link', 'clean'],
    [{ 'color': [] }, { 'background': [] }],
    [{ 'align': [] }],
  ],
};

const formats = [
  'header', 'bold', 'italic', 'underline', 'strike', 'blockquote',
  'list', 'bullet', 'indent', 'link', 'color', 'background', 'align'
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
        className="min-h-[300px] rounded-lg overflow-hidden"
      />
    </div>
  );
}