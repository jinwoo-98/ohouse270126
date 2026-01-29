"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, X, Bot, User, Loader2, Sparkles, Phone, MessageCircle, Facebook, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLocation } from "react-router-dom";

interface ChatAction {
  label: string;
  icon: any;
  href?: string;
  onClick?: () => void;
  color: string;
}

interface Message {
  id: string;
  text: string;
  sender: 'bot' | 'user';
  timestamp: Date;
  actions?: ChatAction[];
}

const KNOWLEDGE_BASE = {
  general_shipping: "OHOUSE miễn phí vận chuyển toàn quốc cho đơn hàng từ 5 triệu đồng. Thời gian giao hàng từ 3-7 ngày tùy khu vực.",
  general_warranty: "Bảo hành chính hãng 2 năm cho kết cấu và chất liệu. Bảo trì trọn đời.",
  general_contact: "Hotline: 1900 888 999 (8h-21h)."
};

export function AIChatWindow({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const location = useLocation();
  const isProductPage = location.pathname.includes('/san-pham/');
  
  const [messages, setMessages] = useState<Message[]>([
    { 
      id: '1', 
      text: "Xin chào! Tôi là trợ lý ảo OHOUSE. Tôi có thể giúp gì cho bạn hôm nay?", 
      sender: 'bot', 
      timestamp: new Date() 
    }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Reset chat when opening on a new page type
  useEffect(() => {
    if (isOpen) {
      if (isProductPage) {
        setMessages([{ 
          id: Date.now().toString(), 
          text: "Xin chào! Bạn đang quan tâm đến sản phẩm này phải không? Tôi có thể giải đáp về kích thước, chất liệu hay phí vận chuyển ngay lập tức.", 
          sender: 'bot', 
          timestamp: new Date() 
        }]);
      }
    }
  }, [isOpen, isProductPage]);

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

    // Simulated Logic
    setTimeout(() => {
      const query = input.toLowerCase();
      let responseText = "";
      
      // Basic Context Handling
      if (query.includes("giá") || query.includes("bao nhiêu")) {
        responseText = isProductPage 
          ? "Giá sản phẩm đang hiển thị ngay bên cạnh ảnh đó ạ. Mức giá này đã bao gồm VAT nhưng chưa gồm phí vận chuyển (nếu đơn < 5tr)." 
          : "Bạn có thể xem giá chi tiết của từng sản phẩm trên website. Chúng tôi luôn cam kết giá tốt nhất!";
      } else if (query.includes("ship") || query.includes("vận chuyển") || query.includes("giao hàng")) {
        responseText = KNOWLEDGE_BASE.general_shipping;
      } else if (query.includes("bảo hành")) {
        responseText = KNOWLEDGE_BASE.general_warranty;
      } else if (query.includes("chất liệu") || query.includes("gỗ gì") || query.includes("da gì")) {
        responseText = isProductPage 
          ? "Sản phẩm này được chế tác từ nguyên liệu cao cấp (chi tiết xem tại mục Thông số kỹ thuật bên dưới). Nếu bạn cần ảnh thực tế bề mặt chất liệu, hãy nhắn Zalo cho chúng tôi nhé."
          : "Các sản phẩm của OHOUSE sử dụng gỗ sồi/óc chó nhập khẩu và da bò Ý/vải nỉ cao cấp.";
      } else {
        responseText = "Câu hỏi này hơi khó với tôi. Để được tư vấn chính xác nhất, bạn vui lòng liên hệ trực tiếp với chuyên viên OHOUSE nhé:";
      }

      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: responseText,
        sender: 'bot',
        timestamp: new Date(),
        actions: query.includes("tư vấn") || responseText.includes("liên hệ") ? [
          { label: "Zalo Chat", icon: MessageCircle, href: "https://zalo.me/0909123456", color: "bg-blue-500" },
          { label: "Messenger", icon: Facebook, href: "https://m.me/ohouse.vn", color: "bg-indigo-600" }
        ] : undefined
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
          <div className="bg-charcoal p-4 text-cream flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center">
                <Bot className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="text-sm font-bold flex items-center gap-2">
                  OHOUSE AI
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                </h3>
                <p className="text-[10px] text-taupe uppercase tracking-widest">Hỗ trợ 24/7</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} className="text-cream hover:bg-white/10 rounded-full h-8 w-8">
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Messages Area */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-secondary/10 custom-scrollbar">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`max-w-[85%] p-3.5 rounded-2xl text-sm leading-relaxed ${
                  msg.sender === 'user' 
                    ? 'bg-primary text-primary-foreground rounded-tr-none shadow-gold' 
                    : 'bg-white text-foreground rounded-tl-none shadow-sm border border-border/40'
                }`}>
                  <div className="whitespace-pre-line">{msg.text}</div>
                </div>
                
                {msg.actions && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {msg.actions.map((action, idx) => (
                      <a 
                        key={idx} 
                        href={action.href} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-white text-[10px] font-bold transition-transform hover:scale-105 ${action.color} shadow-sm`}
                      >
                        <action.icon className="w-3 h-3" />
                        {action.label}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white p-3 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-2 border border-border/40">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
                  <span className="text-xs text-muted-foreground italic">Đang trả lời...</span>
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="p-3 bg-white border-t border-border">
            <div className="relative">
              <Input 
                placeholder="Nhập câu hỏi của bạn..." 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                className="pr-12 h-11 rounded-xl bg-secondary/20 border-none focus-visible:ring-1 focus-visible:ring-primary"
              />
              <Button 
                onClick={handleSend}
                size="icon" 
                className="absolute right-1 top-1 w-9 h-9 rounded-lg shadow-sm"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}