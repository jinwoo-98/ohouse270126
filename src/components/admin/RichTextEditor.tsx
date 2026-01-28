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
    ['link', 'image', 'video'], 
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
    <div className="bg-white border rounded-xl overflow-hidden">
      <ReactQuill 
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
        className="min-h-[350px]"
      />
      <style>{`
        /* Container styling */
        .quill {
          display: flex;
          flex-direction: column;
        }
        .ql-toolbar.ql-snow {
          border: none;
          border-bottom: 1px solid #f0f0f0;
          padding: 12px;
          background: #fafafa;
        }
        .ql-container.ql-snow {
          border: none;
          min-height: 300px;
          font-family: 'Montserrat', sans-serif;
          font-size: 14px;
        }
        
        /* Highlight links in the editor */
        .ql-editor a {
          color: #b08d55 !important;
          text-decoration: underline !important;
          font-weight: bold;
          cursor: pointer;
        }
        
        /* Editor content images and video */
        .ql-editor img {
          max-width: 100%;
          border-radius: 8px;
          margin: 10px 0;
        }
        .ql-editor iframe {
          width: 100%;
          aspect-ratio: 16 / 9;
          border-radius: 8px;
        }

        /* Toolbar button hover */
        .ql-snow.ql-toolbar button:hover,
        .ql-snow .ql-toolbar button:hover,
        .ql-snow.ql-toolbar button:focus,
        .ql-snow .ql-toolbar button:focus,
        .ql-snow.ql-toolbar button.ql-active,
        .ql-snow .ql-toolbar button.ql-active {
          color: #b08d55;
        }
        .ql-snow.ql-toolbar button:hover .ql-stroke,
        .ql-snow .ql-toolbar button:hover .ql-stroke,
        .ql-snow.ql-toolbar button:focus .ql-stroke,
        .ql-snow .ql-toolbar button:focus .ql-stroke,
        .ql-snow.ql-toolbar button.ql-active .ql-stroke,
        .ql-snow .ql-toolbar button.ql-active .ql-stroke {
          stroke: #b08d55;
        }
        
        /* Fix for link input tooltip appearing correctly */
        .ql-snow .ql-tooltip {
          z-index: 1000;
          border-radius: 8px;
          box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1);
          border: 1px solid #f0f0f0;
        }
      `}</style>
    </div>
  );
}