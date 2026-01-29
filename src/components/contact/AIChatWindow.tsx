"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, X, Bot, Loader2, MessageCircle, Facebook } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ChatAction {
  label: string;
  icon: any;
  href?: string;
  color: string;
}

interface Message {
  id: string;
  text: string;
  sender: 'bot' | 'user';
  timestamp: Date;
  actions?: ChatAction[];
}

interface AIChatWindowProps {
  isOpen: boolean; 
  onClose: () => void;
  productContext?: any; // Product data passed from detail page
}

export function AIChatWindow({ isOpen, onClose, productContext }: AIChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const greeting = productContext 
        ? `Xin chào! Tôi thấy bạn đang quan tâm đến "${productContext.name}". Tôi có thể giúp bạn giải đáp về kích thước, chất liệu hay cách phối đồ cho sản phẩm này đấy!`
        : "Xin chào! Tôi là trợ lý ảo OHOUSE. Tôi có thể giúp gì cho bạn hôm nay?";
      
      setMessages([{ id: '1', text: greeting, sender: 'bot', timestamp: new Date() }]);
    }
  }, [isOpen, productContext]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: Message = { id: Date.now().toString(), text: input, sender: 'user', timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    // Simulated AI response logic
    setTimeout(() => {
      const query = input.toLowerCase();
      let responseText = "";
      
      if (productContext) {
        if (query.includes("chất liệu") || query.includes("làm bằng gì")) {
          responseText = productContext.material 
            ? `Sản phẩm này được làm từ ${productContext.material}. Ngoài ra, bạn có thể xem chi tiết ở phần mô tả phía dưới nhé.`
            : "Sản phẩm được làm từ các vật liệu cao cấp tuyển chọn. Bạn có thể xem chi tiết cấu tạo ở mục thông số kỹ thuật ngay bên dưới ảnh sản phẩm đấy ạ.";
        } else if (query.includes("giá") || query.includes("bao nhiêu tiền")) {
          responseText = `Sản phẩm "${productContext.name}" đang có giá là ${new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(productContext.price)}.`;
        } else {
          responseText = `Cảm ơn bạn đã hỏi về "${productContext.name}". Câu hỏi của bạn về "${input}" khá chi tiết, tôi sẽ chuyển thông tin này cho chuyên viên tư vấn để gọi lại hỗ trợ bạn ngay nhé!`;
        }
      } else {
        responseText = "Chào bạn! Hiện tại tôi đang cập nhật thêm kiến thức. Để được hỗ trợ nhanh nhất về đơn hàng hoặc sản phẩm, bạn có thể để lại SĐT hoặc nhắn qua Zalo giúp tôi nhé.";
      }

      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: responseText,
        sender: 'bot',
        timestamp: new Date(),
        actions: responseText.includes("chuyển thông tin") ? [
          { label: "Nhắn Zalo Ngay", icon: MessageCircle, href: "https://zalo.me/0909123456", color: "bg-blue-500" }
        ] : undefined
      };

      setMessages(prev => [...prev, botMsg]);
      setIsTyping(false);
    }, 1200);
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
          <div className="bg-charcoal p-4 text-cream flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center">
                <Bot className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="text-sm font-bold flex items-center gap-2">OHOUSE AI <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span></h3>
                <p className="text-[10px] text-taupe uppercase tracking-widest">Trợ lý sản phẩm</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} className="text-cream hover:bg-white/10 rounded-full h-8 w-8"><X className="w-4 h-4" /></Button>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-secondary/10 custom-scrollbar">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`max-w-[85%] p-3.5 rounded-2xl text-sm leading-relaxed ${msg.sender === 'user' ? 'bg-primary text-primary-foreground rounded-tr-none shadow-gold' : 'bg-white text-foreground rounded-tl-none shadow-sm border border-border/40'}`}>
                  {msg.text}
                </div>
                {msg.actions && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {msg.actions.map((action, idx) => (
                      <a key={idx} href={action.href} target="_blank" rel="noopener noreferrer" className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-white text-[10px] font-bold transition-transform hover:scale-105 ${action.color} shadow-sm`}>
                        <action.icon className="w-3 h-3" /> {action.label}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white p-3 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-2 border border-border/40">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" /><span className="text-xs text-muted-foreground italic">AI đang trả lời...</span>
                </div>
              </div>
            )}
          </div>

          <div className="p-3 bg-white border-t border-border">
            <div className="relative">
              <Input placeholder="Nhập câu hỏi của bạn..." value={input} onChange={(e) => setInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSend()} className="pr-12 h-11 rounded-xl bg-secondary/20 border-none" />
              <Button onClick={handleSend} size="icon" className="absolute right-1 top-1 w-9 h-9 rounded-lg shadow-sm"><Send className="w-4 h-4" /></Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}