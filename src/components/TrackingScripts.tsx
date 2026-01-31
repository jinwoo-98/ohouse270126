import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Script {
  id: string;
  location: 'head' | 'body';
  script_content: string;
}

export function TrackingScripts() {
  const [scripts, setScripts] = useState<Script[]>([]);

  useEffect(() => {
    const fetchScripts = async () => {
      const { data } = await supabase
        .from('tracking_scripts')
        .select('id, location, script_content')
        .eq('is_active', true)
        .order('display_order', { ascending: true });
      
      setScripts(data || []);
    };
    fetchScripts();
  }, []);

  useEffect(() => {
    if (scripts.length === 0) return;

    const headScripts = scripts.filter(s => s.location === 'head');
    const bodyScripts = scripts.filter(s => s.location === 'body');

    // Function để chèn script vào DOM
    const injectScripts = (scripts: Script[], target: 'head' | 'body') => {
      const targetElement = target === 'head' ? document.head : document.body;
      
      scripts.forEach(script => {
        // Kiểm tra xem script đã được chèn chưa (dựa trên ID)
        if (document.getElementById(`tracking-script-${script.id}`)) return;

        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = script.script_content;
        
        // Chèn từng phần tử con (script, noscript, iframe...)
        Array.from(tempDiv.children).forEach(child => {
          const element = child.cloneNode(true) as HTMLElement;
          element.id = `tracking-script-${script.id}`; // Gắn ID để tránh chèn trùng
          targetElement.appendChild(element);
        });
      });
    };

    // Chèn vào Head
    injectScripts(headScripts, 'head');

    // Chèn vào Body (sử dụng setTimeout để đảm bảo body đã sẵn sàng)
    const bodyTimeout = setTimeout(() => {
      injectScripts(bodyScripts, 'body');
    }, 100);

    return () => {
      clearTimeout(bodyTimeout);
      // Dọn dẹp khi component unmount (chủ yếu cho hot reload)
      scripts.forEach(script => {
        const elements = document.querySelectorAll(`#tracking-script-${script.id}`);
        elements.forEach(el => el.remove());
      });
    };
  }, [scripts]);

  // Component này không render gì cả, chỉ quản lý DOM side effects
  return null;
}