import { useState, useMemo } from "react";
import categoryTvStand from "@/assets/category-tv-stand.jpg";
import categorySofa from "@/assets/category-sofa.jpg";
import categoryDiningTable from "@/assets/category-dining-table.jpg";
import categoryCoffeeTable from "@/assets/category-coffee-table.jpg";
import categoryDesk from "@/assets/category-desk.jpg";
import categoryBed from "@/assets/category-bed.jpg";
import categoryLighting from "@/assets/category-lighting.jpg";

interface Product {
  id: number;
  name: string;
  image: string;
  price: number;
  originalPrice?: number;
  isNew?: boolean;
  isSale?: boolean;
  categorySlug: string;
  material: string;
  style: 'Luxury' | 'Minimalist' | 'Modern' | 'Classic';
}

interface Filters {
  priceRange: string[];
  materials: string[];
  styles: string[];
  sortBy: 'newest' | 'price-asc' | 'price-desc' | 'popular';
  searchQuery?: string;
  saleOnly?: boolean;
}

const ALL_PRODUCTS: Product[] = [
  { id: 1, name: "Kệ Tivi Gỗ Óc Chó Kết Hợp Đá", image: categoryTvStand, price: 25990000, originalPrice: 32990000, isNew: true, isSale: true, categorySlug: "ke-tivi", material: "Gỗ Óc Chó", style: 'Luxury' },
  { id: 2, name: "Sofa Góc Chữ L Vải Nhung Ý", image: categorySofa, price: 45990000, categorySlug: "sofa", material: "Vải Nhung", style: 'Modern' },
  { id: 3, name: "Bàn Ăn Mặt Đá Marble 6 Ghế", image: categoryDiningTable, price: 32990000, originalPrice: 38990000, isSale: true, categorySlug: "ban-an", material: "Đá Marble", style: 'Luxury' },
  { id: 4, name: "Bàn Trà Tròn Mặt Kính Cường Lực", image: categoryCoffeeTable, price: 12990000, categorySlug: "ban-tra", material: "Kính Cường Lực", style: 'Minimalist' },
  { id: 5, name: "Bàn Làm Việc Gỗ Sồi Tự Nhiên", image: categoryDesk, price: 18990000, isNew: true, categorySlug: "ban-lam-viec", material: "Gỗ Sồi", style: 'Modern' },
  { id: 6, name: "Giường Ngủ Bọc Da Ý Cao Cấp", image: categoryBed, price: 38990000, originalPrice: 45990000, isSale: true, categorySlug: "giuong", material: "Da Thật", style: 'Luxury' },
  { id: 7, name: "Đèn Chùm Pha Lê Phong Cách Châu Âu", image: categoryLighting, price: 15990000, categorySlug: "den-trang-tri", material: "Pha Lê", style: 'Luxury' },
  { id: 8, name: "Sofa Đơn Bọc Da Thật", image: categorySofa, price: 19990000, isNew: true, categorySlug: "sofa", material: "Da Thật", style: 'Classic' },
  { id: 9, name: "Kệ Tivi Treo Tường Hiện Đại", image: categoryTvStand, price: 14990000, categorySlug: "ke-tivi", material: "Gỗ Công Nghiệp", style: 'Minimalist' },
  { id: 10, name: "Bàn Ăn Gỗ Óc Chó 8 Ghế", image: categoryDiningTable, price: 42990000, originalPrice: 52990000, isSale: true, categorySlug: "ban-an", material: "Gỗ Óc Chó", style: 'Luxury' },
  { id: 11, name: "Bàn Trà Gỗ Tần Bì Bắc Âu", image: categoryCoffeeTable, price: 8990000, categorySlug: "ban-tra", material: "Gỗ Sồi", style: 'Minimalist' },
  { id: 12, name: "Đèn Sàn Trang Trí Phòng Khách", image: categoryLighting, price: 6990000, isNew: true, categorySlug: "den-trang-tri", material: "Kim Loại", style: 'Modern' },
  { id: 13, name: "Ghế Thư Giãn Da Bò", image: categorySofa, price: 15000000, categorySlug: "sofa", material: "Da Thật", style: 'Modern' },
  { id: 14, name: "Tủ Quần Áo Gỗ Sồi", image: categoryBed, price: 22000000, categorySlug: "phong-ngu", material: "Gỗ Sồi", style: 'Modern' },
  { id: 15, name: "Bàn Console Đá", image: categoryDesk, price: 55000000, categorySlug: "phong-khach", material: "Đá Marble", style: 'Luxury' },
];

const categoryMap: Record<string, string[]> = {
  "phong-khach": ["ke-tivi", "sofa", "ban-tra", "den-trang-tri"],
  "phong-ngu": ["giuong", "phong-ngu"],
  "phong-an": ["ban-an"],
  "sale": ALL_PRODUCTS.filter(p => p.isSale).map(p => p.categorySlug),
};

const priceRangeMap: Record<string, [number, number]> = {
  "0-10": [0, 10000000],
  "10-20": [10000000, 20000000],
  "20-50": [20000000, 50000000],
  "50+": [50000000, Infinity],
};

export function useProducts(slug: string, initialSearch?: string) {
  const [filters, setFilters] = useState<Filters>({
    priceRange: [],
    materials: [],
    styles: [],
    sortBy: 'newest',
    searchQuery: initialSearch || '',
    saleOnly: false,
  });
  const [isLoading, setIsLoading] = useState(false);

  const rawProducts = useMemo(() => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 300);

    let result = [...ALL_PRODUCTS];

    if (slug !== "noi-that") {
      const targetSlugs = categoryMap[slug] || [slug];
      result = result.filter(p => targetSlugs.includes(p.categorySlug) || slug === p.categorySlug);
    }

    return result;
  }, [slug]);

  const filteredAndSortedProducts = useMemo(() => {
    let result = [...rawProducts];

    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      result = result.filter(p => 
        p.name.toLowerCase().includes(query) || 
        p.material.toLowerCase().includes(query)
      );
    }

    if (filters.saleOnly) {
      result = result.filter(p => p.isSale);
    }

    if (filters.priceRange.length > 0) {
      result = result.filter(product => {
        return filters.priceRange.some(rangeKey => {
          const [min, max] = priceRangeMap[rangeKey];
          return product.price >= min && product.price < max;
        });
      });
    }

    if (filters.materials.length > 0) {
      result = result.filter(product => filters.materials.includes(product.material));
    }

    if (filters.styles.length > 0) {
      result = result.filter(product => filters.styles.includes(product.style));
    }

    switch (filters.sortBy) {
      case 'price-asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'newest':
        result.sort((a, b) => b.id - a.id);
        break;
      case 'popular':
        result.sort(() => Math.random() - 0.5);
        break;
    }

    return result;
  }, [rawProducts, filters]);

  const updateFilters = (newFilters: Partial<Filters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const toggleFilter = (key: keyof Filters, value: string) => {
    setFilters(prev => {
      const currentValues = prev[key] as string[];
      if (currentValues.includes(value)) {
        return { ...prev, [key]: currentValues.filter(v => v !== value) };
      } else {
        return { ...prev, [key]: [...currentValues, value] };
      }
    });
  };

  const clearFilters = () => {
    setFilters({
      priceRange: [],
      materials: [],
      styles: [],
      sortBy: 'newest',
      searchQuery: '',
      saleOnly: false,
    });
  };

  return {
    products: filteredAndSortedProducts,
    filters,
    updateFilters,
    toggleFilter,
    clearFilters,
    isLoading,
  };
}