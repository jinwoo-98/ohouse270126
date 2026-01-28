"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, X, Bot, User, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Message {
  id: string;
  text: string;
  sender: 'bot' | 'user';
  timestamp: Date;
}

export function AIChatWindow({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [messages, setMessages] = useState<Message[]>([
    { 
      id: '1', 
      text: "Xin chào! Tôi là trợ lý ảo OHOUSE. Tôi có thể giúp gì cho bạn về thông tin sản phẩm hoặc tư vấn nội thất không?", 
      sender: 'bot', 
      timestamp: new Date() 
    }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      text: input,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    // Giả lập phản hồi từ AI
    setTimeout(() => {
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: "Cảm ơn bạn đã quan tâm! Hiện tại tôi đang được nâng cấp để hỗ trợ bạn tốt hơn. Bạn có thể để lại số điện thoại hoặc liên hệ Hotline 1900 888 999 để được nhân viên tư vấn ngay lập tức nhé.",
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMsg]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="fixed inset-0 md:inset-auto md:bottom-24 md:right-8 w-full md:w-[400px] h-full md:h-[600px] bg-card md:rounded-3xl shadow-elevated z-[120] flex flex-col overflow-hidden border border-border/40"
        >
          {/* Header */}
          <div className="bg-charcoal p-5 text-cream flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center">
                <Bot className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="text-sm font-bold flex items-center gap-2">
                  OHOUSE AI Assistant
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                </h3>
                <p className="text-[10px] text-taupe uppercase tracking-widest">Hỗ trợ trực tuyến 24/7</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} className="text-cream hover:bg-white/10 rounded-full">
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Messages Area */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-4 bg-secondary/10 custom-scrollbar">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed ${
                  msg.sender === 'user' 
                    ? 'bg-primary text-primary-foreground rounded-tr-none shadow-gold' 
                    : 'bg-card text-foreground rounded-tl-none shadow-subtle'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-card p-4 rounded-2xl rounded-tl-none shadow-subtle flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-primary" />
                  <span className="text-xs text-muted-foreground italic">AI đang trả lời...</span>
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="p-4 bg-card border-t border-border">
            <div className="relative">
              <Input 
                placeholder="Nhập câu hỏi của bạn..." 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                className="pr-12 h-12 rounded-xl bg-secondary/30 border-none focus-visible:ring-1 focus-visible:ring-primary"
              />
              <Button 
                onClick={handleSend}
                size="icon" 
                className="absolute right-1 top-1 w-10 h-10 rounded-lg shadow-gold"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-[9px] text-center text-muted-foreground mt-3 flex items-center justify-center gap-1 uppercase tracking-widest font-bold">
              <Sparkles className="w-3 h-3 text-primary" /> Powered by OHOUSE AI Core
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}