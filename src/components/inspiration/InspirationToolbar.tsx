"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Home, Palette, Layers, Zap, X, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

// --- Sub-components (Copied and adapted from InspirationPage) ---

// Component con cho các bộ lọc phụ (Style, Material, Color)
function FilterCollapsible({ title, options, selected, onSelect, filterKey }: { title: string, options: string[], selected: string[], onSelect: (value: string) => void, filterKey: string }) {
  
  if (options.length === 0) return null;

  return (
    <div className="w-full space-y-2">
      <h4 className="font-bold text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{title}</h4>
      <div className="space-y-1">
        <label className="flex items-center gap-3 cursor-pointer group/item p-1.5 -ml-1.5 rounded-lg transition-colors">
          <Checkbox 
            id={`${filterKey}-all`} 
            checked={selected.includes("all")} 
            onCheckedChange={() => onSelect("all")} 
            className="data-[state=checked]:bg-primary" 
          />
          <span className={cn("text-sm font-medium", selected.includes("all") ? "text-primary font-bold" : "text-foreground/80")}>Tất Cả</span>
        </label>
        {options.map((opt) => (
          <label key={opt} className="flex items-center gap-3 cursor-pointer group/item p-1.5 -ml-1.5 rounded-lg transition-colors">
            <Checkbox 
              id={`${filterKey}-${opt}`} 
              checked={selected.includes(opt)} 
              onCheckedChange={() => onSelect(opt)} 
              className="data-[state=checked]:bg-primary" 
            />
            <span className={cn("text-sm font-medium", selected.includes(opt) ? "text-primary font-bold" : "text-foreground/80")}>{opt}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

// Component cho bộ lọc chính (Không gian)
function SpaceFilter({ filterOptions, filters, updateFilter }: any) {
  const currentCategory = filterOptions.categories.find((c: any) => c.slug === filters.selectedCategorySlug);
  const isFiltered = filters.selectedCategorySlug !== "all";
  
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          className={cn(
            // Mobile optimization: flex-1, h-9 (từ h-12), text-[10px]
            "flex-1 min-w-0 h-9 px-2 text-[10px] font-bold uppercase tracking-normal border-border/60 hover:bg-secondary/50 justify-center text-center flex-col",
            // Desktop styles
            "sm:h-11 sm:px-6 sm:text-xs sm:tracking-widest sm:flex-none sm:flex-row sm:gap-1",
            isFiltered && "bg-primary text-white border-primary hover:bg-primary/90"
          )}
        >
          <Home className="w-4 h-4 hidden sm:block shrink-0" />
          <span className="leading-tight line-clamp-2">{isFiltered ? currentCategory?.name : "Không Gian"}</span>
          <ChevronDown className="w-3 h-3 ml-1 opacity-50 shrink-0 hidden sm:block" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-4 rounded-2xl shadow-elevated border-none z-30" align="start">
        <div className="space-y-1">
          {filterOptions.categories.map((cat: any) => (
            <button
              key={cat.slug}
              onClick={() => updateFilter('selectedCategorySlug', cat.slug)}
              className={cn(
                "w-full text-left px-3 py-2.5 text-sm rounded-xl transition-colors",
                filters.selectedCategorySlug === cat.slug ? "bg-primary text-white font-bold" : "hover:bg-secondary/50"
              )}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

// Component cho bộ lọc phụ (Style, Material, Color)
function SubFilter({ title, icon: Icon, options, selected, filterKey, updateFilter }: any) {
  const isFiltered = selected !== "all";
  
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          className={cn(
            // Mobile optimization: flex-1, h-9 (từ h-12), text-[10px]
            "flex-1 min-w-0 h-9 px-2 text-[10px] font-bold uppercase tracking-normal border-border/60 hover:bg-secondary/50 justify-center text-center flex-col",
            // Desktop styles
            "sm:h-11 sm:px-6 sm:text-xs sm:tracking-widest sm:flex-none sm:flex-row sm:gap-1",
            isFiltered && "bg-primary text-white border-primary hover:bg-primary/90"
          )}
        >
          <Icon className="w-4 h-4 hidden sm:block shrink-0" />
          <span className="leading-tight line-clamp-2">{title}</span>
          <ChevronDown className="w-3 h-3 ml-1 opacity-50 shrink-0 hidden sm:block" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-4 rounded-2xl shadow-elevated border-none z-30" align="start">
        <FilterCollapsible 
          title={title} 
          options={options} 
          selected={selected} 
          onSelect={(val) => updateFilter(filterKey, val)} 
          filterKey={filterKey}
        />
      </PopoverContent>
    </Popover>
  );
}

// --- Main Toolbar Component ---

interface InspirationToolbarProps {
  lookCount: number;
  filterOptions: any;
  filters: any;
  updateFilter: (key: string, value: string) => void;
  onResetFilters: () => void;
}

export function InspirationToolbar({ lookCount, filterOptions, filters, updateFilter, onResetFilters }: InspirationToolbarProps) {
  const isMobile = useIsMobile();
  const isAnyFilterActive = filters.selectedCategorySlug !== 'all' || filters.selectedStyle !== 'all' || filters.selectedMaterial !== 'all' || filters.selectedColor !== 'all';

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
          <div className="flex justify-between md:justify-end gap-2 md:gap-3 w-full md:w-auto">
            
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