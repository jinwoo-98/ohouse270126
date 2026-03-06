"use client";

import React from "react";
import { SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { StarRating } from "@/components/product/detail/ProductReviews";
import { formatPrice } from "@/lib/utils";

interface QuickViewHeaderProps {
  name: string;
  price: number;
  originalPrice?: number | null;
  rating: number;
  reviewCount: number;
}

export function QuickViewHeader({ name, price, originalPrice, rating, reviewCount }: QuickViewHeaderProps) {
  return (
    <div className="space-y-4">
      <SheetHeader>
        <SheetTitle className="text-2xl font-display font-bold leading-tight text-left text-charcoal">
          {name}
        </SheetTitle>
      </SheetHeader>
      <div className="flex items-center gap-4">
        <span className="text-3xl font-bold text-primary">{formatPrice(price)}</span>
        {originalPrice && (
          <span className="text-sm text-muted-foreground line-through opacity-50">{formatPrice(originalPrice)}</span>
        )}
      </div>
      <div className="flex items-center gap-2">
        <StarRating rating={rating} size="w-4 h-4" />
        <span className="text-xs text-muted-foreground ml-2">({reviewCount} nhận xét)</span>
      </div>
    </div>
  );
}