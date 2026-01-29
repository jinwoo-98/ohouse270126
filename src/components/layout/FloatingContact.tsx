"use client";

import { motion } from "framer-motion";
import { Phone, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export function FloatingContact() {
  const contacts = [
    {
      id: 'zalo',
      icon: MessageCircle,
      href: "https://zalo.me/0909123456",
      label: "Chat Zalo",
      color: "bg-blue-600 shadow-blue-500/20"
    },
    {
      id: 'phone',
      icon: Phone,
      href: "tel:1900888999",
      label: "Gọi Hotline",
      color: "bg-green-600 shadow-green-500/20"
    }
  ];

  return (
    <div className="fixed bottom-6 left-6 z-[100] flex flex-col gap-3">
      {contacts.map((contact, idx) => (
        <motion.a
          key={contact.id}
          href={contact.href}
          target="_blank"
          rel="noopener noreferrer"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: idx * 0.2 }}
          className={cn(
            "flex items-center gap-3 p-3 rounded-full text-white shadow-elevated hover:scale-110 transition-all group",
            contact.color
          )}
        >
          <div className="relative">
            <contact.icon className="w-6 h-6" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 border-2 border-white rounded-full animate-ping" />
          </div>
          <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-xs transition-all duration-500 text-sm font-bold uppercase tracking-widest pr-2">
            {contact.label}
          </span>
        </motion.a>
      ))}
    </div>
  );
}