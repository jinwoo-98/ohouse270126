"use client";

import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronUp, Bot, X } from "lucide-react";
import { AIChatWindow } from "@/components/contact/AIChatWindow";
import { FloatingContact } from "./FloatingContact";
import { cn } from "@/lib/utils";

export function FloatingActions() {
  const location = useLocation();
  const [isBackToTopVisible, setIsBackToTopVisible] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Hide on Admin pages
  const isAdminPage = location.pathname.startsWith('/admin');

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 500) {
        setIsBackToTopVisible(true);
      } else {
        setIsBackToTopVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  if (isAdminPage) return null;

  return (
    <>
      {/* Contact Buttons (Bottom Left) */}
      <FloatingContact />

      {/* AI & Navigation Buttons (Bottom Right) */}
      <div className="fixed bottom-8 right-6 md:right-8 z-[100] flex flex-col gap-3">
        {/* AI Chat Trigger */}
        <motion.button
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          onClick={() => setIsChatOpen(!isChatOpen)}
          className={cn(
            "p-3 md:p-4 rounded-full shadow-elevated transition-all duration-300 group relative",
            isChatOpen 
              ? "bg-destructive text-destructive-foreground rotate-90" 
              : "bg-primary text-primary-foreground hover:scale-110 shadow-gold"
          )}
          aria-label="Chat with AI"
        >
          {isChatOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <>
              <Bot className="w-6 h-6" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 border-2 border-background rounded-full animate-pulse" />
            </>
          )}
        </motion.button>

        {/* Back To Top */}
        <AnimatePresence>
          {isBackToTopVisible && (
            <motion.button
              initial={{ opacity: 0, scale: 0.5, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.5, y: 10 }}
              onClick={scrollToTop}
              className="p-3 md:p-4 bg-charcoal text-cream rounded-full shadow-elevated hover:bg-primary hover:text-primary-foreground transition-all duration-300 group"
              aria-label="Back to top"
            >
              <ChevronUp className="w-6 h-6 group-hover:-translate-y-1 transition-transform" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      <AIChatWindow isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </>
  );
}