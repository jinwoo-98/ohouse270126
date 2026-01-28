"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, X, Bot, User, Loader2, Sparkles, Phone, MessageCircle, Facebook, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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

// Giả lập dữ liệu kiến thức từ website
const KNOWLEDGE_BASE = {
  categories: ["sofa", "bàn ăn", "giường", "kệ tivi", "đèn trang trí", "tủ quần áo"],
  policies: {
    shipping: "OHOUSE miễn phí vận chuyển toàn quốc cho đơn hàng từ 5 triệu đồng. Thời gian giao hàng từ 3-7 ngày tùy khu vực.",
    warranty: "Tất cả sản phẩm nội thất tại OHOUSE được bảo hành chính hãng 2 năm cho các lỗi kỹ thuật từ nhà sản xuất.",
    returns: "Chúng tôi hỗ trợ đổi trả trong vòng 30 ngày nếu sản phẩm còn nguyên tem mác và chưa qua sử dụng/lắp đặt."
  },
  services: {
    design: "OHOUSE cung cấp dịch vụ tư vấn thiết kế 3D hoàn toàn miễn phí khi bạn đăng ký dịch vụ thi công nội thất trọn gói.",
    cooperation: "Chúng tôi luôn chào đón các đối tác là Đại lý, Nhà thầu và Kiến trúc sư với chính sách chiết khấu cực kỳ hấp dẫn."
  },
  showrooms: "Hiện OHOUSE có 2 showroom lớn tại:\n1. 123 Nguyễn Huệ, Quận 1, TP.HCM\n2. 456 Phố Huế, Quận Hai Bà Trưng, Hà Nội."
};

export function AIChatWindow({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [messages, setMessages] = useState<Message[]>([
    { 
      id: '1', 
      text: "Xin chào! Tôi là trợ lý ảo OHOUSE. Tôi đã sẵn sàng hỗ trợ bạn về thông tin sản phẩm, chính sách giao hàng hoặc tư vấn thiết kế. Bạn cần giúp gì ạ?", 
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

  const getContactActions = (): ChatAction[] => [
    { label: "Gọi Hotline", icon: Phone, href: "tel:1900888999", color: "bg-green-600" },
    { label: "Zalo Chat", icon: MessageCircle, href: "https://zalo.me/0909123456", color: "bg-blue-500" },
    { label: "Messenger", icon: Facebook, href: "https://m.me/ohouse.vn", color: "bg-indigo-600" }
  ];

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

    // Logic xử lý phản hồi dựa trên kiến thức web
    setTimeout(() => {
      const query = input.toLowerCase();
      let responseText = "";
      let actions: ChatAction[] | undefined = undefined;

      if (query.includes("vận chuyển") || query.includes("giao hàng") || query.includes("ship")) {
        responseText = KNOWLEDGE_BASE.policies.shipping;
      } else if (query.includes("bảo hành") || query.includes("sửa chữa")) {
        responseText = KNOWLEDGE_BASE.policies.warranty;
      } else if (query.includes("đổi trả") || query.includes("hoàn tiền")) {
        responseText = KNOWLEDGE_BASE.policies.returns;
      } else if (query.includes("thiết kế") || query.includes("3d") || query.includes("tư vấn")) {
        responseText = KNOWLEDGE_BASE.services.design;
      } else if (query.includes("địa chỉ") || query.includes("showroom") || query.includes("cửa hàng") || query.includes("ở đâu")) {
        responseText = KNOWLEDGE_BASE.showrooms;
      } else if (KNOWLEDGE_BASE.categories.some(cat => query.includes(cat))) {
        const foundCat = KNOWLEDGE_BASE.categories.find(cat => query.includes(cat));
        responseText = `OHOUSE có rất nhiều mẫu ${foundCat} cao cấp với thiết kế sang trọng. Bạn có thể xem chi tiết tại danh mục sản phẩm trên website hoặc để tôi kết nối bạn với tư vấn viên để xem ảnh thực tế nhé?`;
        actions = getContactActions();
      } else {
        // Trường hợp không có thông tin rõ ràng
        responseText = "Xin lỗi, hiện tại tôi chưa tìm thấy thông tin chính xác về yêu cầu này trong hệ thống. Để được hỗ trợ tốt nhất, bạn vui lòng kết nối trực tiếp với chuyên viên tư vấn của chúng tôi qua các kênh sau:";
        actions = getContactActions();
      }

      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: responseText,
        sender: 'bot',
        timestamp: new Date(),
        actions: actions
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
          className="fixed inset-0 md:inset-auto md:bottom-24 md:right-8 w-full md:w-[420px] h-full md:h-[650px] bg-card md:rounded-3xl shadow-elevated z-[120] flex flex-col overflow-hidden border border-border/40"
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
                <p className="text-[10px] text-taupe uppercase tracking-widest">Tư vấn trực tuyến 24/7</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} className="text-cream hover:bg-white/10 rounded-full">
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Messages Area */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-6 bg-secondary/10 custom-scrollbar">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed ${
                  msg.sender === 'user' 
                    ? 'bg-primary text-primary-foreground rounded-tr-none shadow-gold' 
                    : 'bg-card text-foreground rounded-tl-none shadow-subtle border border-border/40'
                }`}>
                  <div className="whitespace-pre-line">{msg.text}</div>
                </div>
                
                {/* Render Actions if any */}
                {msg.actions && (
                  <div className="flex flex-wrap gap-2 mt-3 w-[85%]">
                    {msg.actions.map((action, idx) => (
                      <a 
                        key={idx} 
                        href={action.href} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className={`flex items-center gap-2 px-3 py-2 rounded-xl text-white text-xs font-bold transition-transform hover:scale-105 active:scale-95 ${action.color} shadow-sm`}
                      >
                        <action.icon className="w-3.5 h-3.5" />
                        {action.label}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-card p-4 rounded-2xl rounded-tl-none shadow-subtle flex items-center gap-2 border border-border/40">
                  <Loader2 className="w-4 h-4 animate-spin text-primary" />
                  <span className="text-xs text-muted-foreground italic">AI đang xử lý thông tin...</span>
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="p-4 bg-card border-t border-border">
            <div className="relative">
              <Input 
                placeholder="Hỏi về sản phẩm, bảo hành, showroom..." 
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
            <div className="flex items-center justify-center gap-4 mt-3">
               <p className="text-[9px] text-muted-foreground flex items-center gap-1 uppercase tracking-widest font-bold">
                <Sparkles className="w-3 h-3 text-primary" /> OHOUSE AI Engine
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}