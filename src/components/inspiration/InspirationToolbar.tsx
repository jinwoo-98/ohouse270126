"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Home, Palette, Layers, Zap, X, RotateCcw, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

// --- Sub-components (Adapted for Multi-select) ---

// Component cho bộ lọc chính (Không gian - Vẫn là Single Select)
function SpaceFilter({ filterOptions, filters, updateFilter }: any) {
  const currentCategory = filterOptions.categories.find((c: any) => c.slug === filters.selectedCategorySlug);
  const isFiltered = filters.selectedCategorySlug !== "all";
  
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          className={cn(
            "h-9 px-3 text-[10px] font-bold uppercase tracking-normal border-border/60 hover:bg-secondary/50 justify-center text-center flex-col w-auto",
            "sm:h-11 sm:px-4 sm:text-xs sm:tracking-widest sm:flex-none sm:flex-row sm:gap-1",
            isFiltered && "bg-primary text-white border-primary hover:bg-primary/90"
          )}
        >
          <Home className="w-4 h-4 hidden sm:block shrink-0" />
          <span className="leading-tight whitespace-nowrap">{isFiltered ? currentCategory?.name : "Không Gian"}</span>
          <ChevronDown className="w-3 h-3 ml-1 opacity-50 shrink-0 hidden sm:block" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-4 rounded-2xl shadow-elevated border-none z-30" align="start">
        <div className="space-y-1">
          {filterOptions.categories.map((cat: any) => (
            <button
              key={cat.id}
              onClick={() => updateFilter('selectedCategorySlug', cat.slug)}
              className={cn(
                "w-full text-left px-3 py-2.5 text-sm rounded-xl transition-colors flex items-center justify-between",
                filters.selectedCategorySlug === cat.slug ? "bg-primary text-white font-bold" : "hover:bg-secondary/50"
              )}
            >
              {cat.name}
              {filters.selectedCategorySlug === cat.slug && <Check className="w-4 h-4" />}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

// Component cho bộ lọc phụ (Style, Material, Color) - Hỗ trợ Multi-select
function SubFilter({ title, icon: Icon, options, selected, filterKey, updateFilter }: any) {
  const isFiltered = selected.length > 0;
  
  const handleToggle = (value: string) => {
    const newSelection = selected.includes(value)
      ? selected.filter((v: string) => v !== value)
      : [...selected, value];
      
    updateFilter(filterKey, newSelection);
  };

  const selectedCount = selected.length;
  const selectedLabel = selectedCount > 0 ? `${selectedCount} đã chọn` : title;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          className={cn(
            "h-9 px-3 text-[10px] font-bold uppercase tracking-normal border-border/60 hover:bg-secondary/50 justify-center text-center flex-col w-auto",
            "sm:h-11 sm:px-4 sm:text-xs sm:tracking-widest sm:flex-none sm:flex-row sm:gap-1",
            isFiltered && "bg-primary text-white border-primary hover:bg-primary/90"
          )}
        >
          <Icon className="w-4 h-4 hidden sm:block shrink-0" />
          <span className="leading-tight whitespace-nowrap">{selectedLabel}</span>
          <ChevronDown className="w-3 h-3 ml-1 opacity-50 shrink-0 hidden sm:block" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-4 rounded-2xl shadow-elevated border-none z-30" align="start">
        <div className="space-y-4">
          <h4 className="font-bold text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{title}</h4>
          <div className="space-y-1 max-h-64 overflow-y-auto custom-scrollbar pr-2">
            {options.map((opt: string) => (
              <label key={opt} className="flex items-center justify-between gap-3 cursor-pointer group/item p-1.5 -ml-1.5 rounded-lg transition-colors hover:bg-secondary/50">
                <span className={cn("text-sm font-medium", selected.includes(opt) ? "text-primary font-bold" : "text-foreground/80")}>{opt}</span>
                <Checkbox 
                  checked={selected.includes(opt)} 
                  onCheckedChange={() => handleToggle(opt)} 
                  className="data-[state=checked]:bg-primary" 
                />
              </label>
            ))}
          </div>
          {selectedCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => updateFilter(filterKey, [])}
              className="w-full text-destructive hover:bg-destructive/10 text-[10px] font-bold uppercase"
            >
              <X className="w-3 h-3 mr-1" /> Bỏ chọn tất cả
            </Button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

// --- Main Toolbar Component ---

interface InspirationToolbarProps {
  lookCount: number;
  filterOptions: any;
  filters: any;
  updateFilter: (key: string, value: string | string[]) => void;
  onResetFilters: () => void;
}

export function InspirationToolbar({ lookCount, filterOptions, filters, updateFilter, onResetFilters }: InspirationToolbarProps) {
  const isMobile = useIsMobile();
  const isAnyFilterActive = filters.selectedCategorySlug !== 'all' || filters.selectedStyle.length > 0 || filters.selectedMaterial.length > 0 || filters.selectedColor.length > 0;

  return (
    <div className="bg-background/95 backdrop-blur-md shadow-medium py-3 border-b border-border/40">
      <div className="container-luxury">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Left: Count & Reset */}
          <div className="flex items-center justify-between md:justify-start w-full md:w-auto gap-4">
            <h2 className="text-sm md:text-base font-bold text-charcoal uppercase tracking-widest shrink-0">
              {lookCount} Lookbooks
            </h2>
            
            {isAnyFilterActive && (
              <Button 
                variant="ghost" 
                onClick={onResetFilters}
                className="h-9 px-3 text-[10px] font-bold uppercase tracking-widest text-destructive hover:bg-destructive/10 rounded-xl"
              >
                <RotateCcw className="w-3 h-3 mr-1" /> Reset Lọc
              </Button>
            )}
          </div>

          {/* Right: Filters (4 buttons) */}
          <div className="flex justify-between md:justify-end gap-2 md:gap-3 w-full md:w-auto overflow-x-auto pb-1 no-scrollbar">
            
            {/* 1. Không Gian (Category) */}
            <SpaceFilter 
              filterOptions={filterOptions} 
              filters={filters} 
              updateFilter={updateFilter} 
            />
            
            {/* 2. Phong Cách (Style) */}
            <SubFilter
              title="Phong Cách"
              icon={Layers}
              options={filterOptions.styles}
              selected={filters.selectedStyle}
              filterKey="selectedStyle"
              updateFilter={updateFilter}
            />
            
            {/* 3. Chất Liệu (Material) */}
            <SubFilter
              title="Chất Liệu"
              icon={Zap}
              options={filterOptions.materials}
              selected={filters.selectedMaterial}
              filterKey="selectedMaterial"
              updateFilter={updateFilter}
            />
            
            {/* 4. Màu Sắc (Color) */}
            <SubFilter
              title="Màu Sắc"
              icon={Palette}
              options={filterOptions.colors}
              selected={filters.selectedColor}
              filterKey="selectedColor"
              updateFilter={updateFilter}
            />
          </div>
        </div>
      </div>
    </div>
  );
}