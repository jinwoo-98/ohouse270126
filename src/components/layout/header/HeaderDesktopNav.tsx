import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { secondaryLinks } from "@/constants/header-data";
import { useCategories } from "@/hooks/useCategories";

export function HeaderDesktopNav() {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const { data, isLoading } = useCategories();

  const mainCategories = data?.mainCategories || [];
  const productCategories = data?.productCategories || {};

  return (
    <div className="hidden lg:block">
      <div className="bg-card border-b border-border/50">
        <div className="container-luxury flex items-center justify-center gap-6 h-9">
          {secondaryLinks.map((link, index) => (
            <React.Fragment key={link.name}>
              <Link to={link.href} className="text-xs text-muted-foreground hover:text-primary transition-colors">{link.name}</Link>
              {index < secondaryLinks.length - 1 && <span className="text-border">|</span>}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="bg-card">
        <div className="container-luxury">
          <nav className="flex items-center justify-center gap-1">
            {isLoading ? (
              <div className="h-10 flex items-center gap-4">
                {[1,2,3,4,5].map(i => <div key={i} className="w-20 h-4 bg-secondary animate-pulse rounded" />)}
              </div>
            ) : mainCategories.map((item) => (
              <div 
                key={item.name} 
                className="relative" 
                onMouseEnter={() => item.hasDropdown && setActiveDropdown(item.dropdownKey)} 
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <Link 
                  to={item.href} 
                  className={`flex items-center gap-1 px-4 py-2.5 text-sm font-bold tracking-wide transition-colors hover:text-primary uppercase ${item.isHighlight ? "text-destructive" : "text-charcoal/80"}`}
                >
                  {item.name}
                </Link>
                {item.hasDropdown && activeDropdown === item.dropdownKey && productCategories[item.dropdownKey] && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="absolute left-0 top-full z-50">
                    <div className="bg-card rounded-2xl shadow-elevated border border-border/40 p-3 min-w-[200px]">
                      {productCategories[item.dropdownKey].map((subItem) => (
                        <Link 
                          key={subItem.name} 
                          to={subItem.href} 
                          className="block px-4 py-3 text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-primary/5 hover:text-primary transition-colors" 
                          onClick={() => setActiveDropdown(null)}
                        >
                          {subItem.name}
                        </Link>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
}