"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface QuickViewVariantsProps {
  tierConfig: any[];
  selectedValues: Record<string, string>;
  onValueSelect: (tierName: string, value: string) => void;
}

export function QuickViewVariants({ tierConfig, selectedValues, onValueSelect }: QuickViewVariantsProps) {
  if (!tierConfig || tierConfig.length === 0) return null;

  return (
    <div className="space-y-6 pt-6 border-t border-border/40">
      {tierConfig.map((tier: any, idx: number) => (
        <div key={idx} className="space-y-3">
          <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">
            {tier.name}: <span className="text-charcoal">{selectedValues[tier.name] || "Chưa chọn"}</span>
          </span>
          <div className="flex flex-wrap gap-3">
            {tier.values.map((val: any) => {
              const isObj = val !== null && typeof val === 'object';
              const label = isObj ? val.label : val;
              const imageUrl = isObj ? val.image_url : null;
              const isSelected = selectedValues[tier.name] === label;

              return (
                <button
                  key={label}
                  onClick={() => onValueSelect(tier.name, label)}
                  className={cn(
                    "transition-all border-2 relative flex items-center justify-center overflow-hidden",
                    imageUrl 
                      ? "w-14 h-14 rounded-xl p-0.5" 
                      : "px-4 py-2 rounded-xl text-xs font-bold min-w-[60px]",
                    isSelected 
                      ? "border-primary bg-primary/5 text-primary" 
                      : "border-border bg-white hover:border-primary/40 text-charcoal"
                  )}
                  title={label}
                >
                  {imageUrl ? (
                    <div className="w-full h-full rounded-lg overflow-hidden relative bg-secondary/20">
                      <img 
                        src={imageUrl} 
                        alt={label} 
                        className="w-full h-full object-cover" 
                      />
                      {isSelected && (
                        <div className="absolute inset-0 bg-primary/10 flex items-center justify-center">
                          <div className="bg-primary text-white rounded-full p-0.5 shadow-sm">
                            <Check className="w-3 h-3" />
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <span className="whitespace-nowrap">{label}</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}