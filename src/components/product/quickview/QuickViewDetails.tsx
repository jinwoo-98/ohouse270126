"use client";

import React, { useState } from "react";
import { FileText, Ruler, Info, ChevronDown, ChevronUp } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";

interface QuickViewDetailsProps {
  description?: string;
  dimensionImageUrl?: string;
  attributes: any[];
}

export function QuickViewDetails({ description, dimensionImageUrl, attributes }: QuickViewDetailsProps) {
  const [isDescriptionOpen, setIsDescriptionOpen] = useState(false);
  const [isDimensionsOpen, setIsDimensionsOpen] = useState(false);
  const [isSpecsOpen, setIsSpecsOpen] = useState(false);

  return (
    <div className="space-y-2 pt-6 border-t border-border/40">
      {description && (
        <Collapsible open={isDescriptionOpen} onOpenChange={setIsDescriptionOpen} className="border-b border-border/40 pb-4">
          <CollapsibleTrigger className="flex items-center justify-between w-full py-4 text-left group">
            <div className="flex items-center gap-3">
              <FileText className="w-4 h-4 text-primary" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-charcoal">Khám phá sản phẩm</span>
            </div>
            {isDescriptionOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </CollapsibleTrigger>
          <CollapsibleContent className="animate-accordion-down relative">
            <div className="vn-text-fix text-sm text-muted-foreground pb-8 w-full overflow-hidden" dangerouslySetInnerHTML={{ __html: description }} />
            {isDescriptionOpen && (
              <div className="flex justify-center pt-4 border-t border-dashed border-border/40">
                <Button variant="ghost" size="sm" onClick={() => setIsDescriptionOpen(false)} className="text-[10px] font-bold uppercase tracking-widest text-primary hover:bg-primary/5 gap-2">
                  Thu gọn nội dung <ChevronUp className="w-3 h-3" />
                </Button>
              </div>
            )}
          </CollapsibleContent>
        </Collapsible>
      )}

      {dimensionImageUrl && (
        <Collapsible open={isDimensionsOpen} onOpenChange={setIsDimensionsOpen} className="border-b border-border/40 pb-4">
          <CollapsibleTrigger className="flex items-center justify-between w-full py-4 group">
            <div className="flex items-center gap-3">
              <Ruler className="w-4 h-4 text-primary" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-charcoal">Kích thước kỹ thuật</span>
            </div>
            {isDimensionsOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </CollapsibleTrigger>
          <CollapsibleContent className="pb-4 animate-accordion-down">
            <div className="rounded-2xl overflow-hidden border border-border/50 bg-white p-2">
              <img src={dimensionImageUrl} alt="Kích thước" className="w-full h-auto object-contain" />
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}

      {attributes.length > 0 && (
        <Collapsible open={isSpecsOpen} onOpenChange={setIsSpecsOpen} className="pb-4">
          <CollapsibleTrigger className="flex items-center justify-between w-full py-4 group">
            <div className="flex items-center gap-3">
              <Info className="w-4 h-4 text-primary" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-charcoal">Thông số chi tiết</span>
            </div>
            {isSpecsOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </CollapsibleTrigger>
          <CollapsibleContent className="pb-4 animate-accordion-down">
            <div className="grid gap-2">
              {attributes.map((attr, i) => (
                <div key={i} className="flex items-start justify-between gap-4 py-2.5 border-b border-dashed border-border/40 text-xs">
                  <span className="text-muted-foreground font-medium shrink-0">{attr.name}</span>
                  <span className="text-charcoal font-bold text-right break-words max-w-[70%]">
                    {Array.isArray(attr.value) ? attr.value.join(", ") : attr.value}
                  </span>
                </div>
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}
    </div>
  );
}