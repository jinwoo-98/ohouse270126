import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { mainCategories, secondaryLinks, productCategories } from "@/constants/header-data";

export function HeaderDesktopNav() {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

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
            {mainCategories.map((item) => (
              <div 
                key={item.name} 
                className="relative" 
                onMouseEnter={() => item.hasDropdown && setActiveDropdown(item.dropdownKey || item.name)} 
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <Link 
                  to={item.href} 
                  className={`flex items-center gap-1 px-4 py-2.5 text-sm font-medium tracking-wide transition-colors hover:text-primary ${item.isHighlight ? "text-destructive" : "text-foreground"}`}
                >
                  {item.name}
                </Link>
                {item.hasDropdown && activeDropdown === (item.dropdownKey || item.name) && productCategories[item.dropdownKey || item.name] && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="absolute left-0 top-full z-50">
                    <div className="bg-card rounded-lg shadow-elevated border border-border p-2 min-w-[180px]">
                      {productCategories[item.dropdownKey || item.name].map((subItem) => (
                        <Link 
                          key={subItem.name} 
                          to={subItem.href} 
                          className="block px-4 py-2.5 text-sm rounded-md hover:bg-secondary hover:text-primary transition-colors" 
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