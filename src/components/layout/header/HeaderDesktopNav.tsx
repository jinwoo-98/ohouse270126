import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useCategories } from "@/hooks/useCategories";

export function HeaderDesktopNav() {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const { data, isLoading } = useCategories();

  const mainCategories = data?.mainCategories || [];
  const productCategories = data?.productCategories || {};

  return (
    <div className="hidden lg:block bg-card border-t border-border/40">
      <div className="container-luxury">
        <nav className="flex items-center justify-center">
          {isLoading ? (
            <div className="h-12 flex items-center gap-8">
              {[1,2,3,4,5,6,7].map(i => (
                <div key={i} className="w-20 h-4 bg-secondary animate-pulse rounded" />
              ))}
            </div>
          ) : (
            mainCategories.map((item) => (
              <div 
                key={item.name} 
                className="relative group" 
                onMouseEnter={() => item.hasDropdown && setActiveDropdown(item.dropdownKey)} 
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <Link 
                  to={item.href} 
                  className={`
                    flex items-center h-12 px-5 text-[11px] font-bold tracking-[0.1em] transition-all uppercase relative
                    ${item.isHighlight ? "text-destructive" : "text-charcoal/70 hover:text-primary"}
                  `}
                >
                  {item.name}
                  {/* Active Indicator Line */}
                  <span className="absolute bottom-0 left-5 right-5 h-0.5 bg-primary scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
                </Link>

                <AnimatePresence>
                  {item.hasDropdown && activeDropdown === item.dropdownKey && productCategories[item.dropdownKey] && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }} 
                      animate={{ opacity: 1, y: 0 }} 
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute left-0 top-full z-50 pt-1"
                    >
                      <div className="bg-card rounded-2xl shadow-elevated border border-border/40 p-3 min-w-[220px]">
                        {productCategories[item.dropdownKey].map((subItem) => (
                          <Link 
                            key={subItem.name} 
                            to={subItem.href} 
                            className="block px-4 py-3 text-[10px] font-bold uppercase tracking-widest rounded-xl hover:bg-primary/5 hover:text-primary transition-colors" 
                            onClick={() => setActiveDropdown(null)}
                          >
                            {subItem.name}
                          </Link>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))
          )}
        </nav>
      </div>
    </div>
  );
}