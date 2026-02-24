import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { sanitizeTrackingScript } from "@/lib/sanitize";

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

    /**
     * Safely injects scripts into the DOM using a contextual fragment.
     * This method allows script execution while maintaining better control than innerHTML.
     */
    const injectScripts = (scripts: Script[], target: 'head' | 'body') => {
      const targetElement = target === 'head' ? document.head : document.body;
      
      scripts.forEach(script => {
        const containerId = `tracking-script-container-${script.id}`;
        // Prevent duplicate injection
        if (document.getElementById(containerId)) return;

        // Sanitize again before injection for defense in depth
        const sanitized = sanitizeTrackingScript(script.script_content);
        
        try {
          // Create a fragment from the sanitized HTML
          const fragment = document.createRange().createContextualFragment(sanitized);
          
          // Wrap in a hidden span to manage the script group and allow easy cleanup
          const wrapper = document.createElement('span');
          wrapper.id = containerId;
          wrapper.style.display = 'none';
          wrapper.appendChild(fragment);
          
          targetElement.appendChild(wrapper);
        } catch (e) {
          console.error(`[TrackingScripts] Failed to inject script ${script.id}:`, e);
        }
      });
    };

    // Inject head scripts immediately
    injectScripts(headScripts, 'head');

    // Inject body scripts with a small delay to ensure body is ready
    const bodyTimeout = setTimeout(() => {
      injectScripts(bodyScripts, 'body');
    }, 100);

    return () => {
      clearTimeout(bodyTimeout);
      // Cleanup injected scripts on unmount
      scripts.forEach(script => {
        const el = document.getElementById(`tracking-script-container-${script.id}`);
        if (el) el.remove();
      });
    };
  }, [scripts]);

  // This component manages side effects and doesn't render visible UI
  return null;
}