import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Menu } from "lucide-react";
import { Input } from "@/components/ui/input";
import { AnimatePresence } from "framer-motion";
import { SearchSuggestions } from "../SearchSuggestions";

interface HeaderSearchProps {
  onOpenMobileMenu: () => void;
}

export function HeaderSearch({ onOpenMobileMenu }: HeaderSearchProps) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/tim-kiem?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchFocused(false);
    }
  };

  const handleKeywordSearch = (keyword: string) => {
    setSearchQuery(keyword);
    navigate(`/tim-kiem?q=${encodeURIComponent(keyword)}`);
    setIsSearchFocused(false);
  };

  return (
    <div className="flex-1 flex items-center lg:max-w-[250px] relative" ref={searchContainerRef}>
      <div className="flex items-center lg:hidden gap-1">
        <button 
          className="p-3 -ml-3 hover:bg-secondary rounded-lg transition-colors" 
          onClick={onOpenMobileMenu}
        >
          <Menu className="w-6 h-6" />
        </button>
        <button 
          className="md:hidden p-3 hover:bg-secondary rounded-lg transition-colors" 
          onClick={onOpenMobileMenu}
        >
          <Search className="w-6 h-6" />
        </button>
      </div>
      
      <form onSubmit={handleSearch} className="hidden md:flex items-center flex-1 relative">
        <Search className="absolute left-3 w-4 h-4 text-muted-foreground" />
        <Input 
          placeholder="Tìm sản phẩm..." 
          className="pl-10 pr-4 h-10 text-sm bg-secondary/50 border-0 focus-visible:ring-1"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setIsSearchFocused(true)}
        />
      </form>
      
      <AnimatePresence>
        {isSearchFocused && (
          <SearchSuggestions 
            isVisible={isSearchFocused} 
            onClose={() => setIsSearchFocused(false)}
            onKeywordClick={handleKeywordSearch}
            searchQuery={searchQuery}
          />
        )}
      </AnimatePresence>
    </div>
  );
}