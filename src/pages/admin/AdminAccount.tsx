"use client";

import { motion } from "framer-motion";
import { User, ShieldCheck, KeyRound, Mail, UserCircle } from "lucide-react";
import { ProfileForm } from "@/components/profile/ProfileForm";
import { PasswordChangeForm } from "@/components/profile/PasswordChangeForm";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AdminAccount() {
  const { user } = useAuth();

  return (
    <div className="max-w-4xl mx-auto pb-20 space-y-8">
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-3xl border shadow-sm"
      >
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shadow-inner">
            <UserCircle className="w-12 h-12" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-charcoal">{user?.email}</h1>
            <div className="flex items-center gap-2 mt-2">
              <Badge className="bg-primary/10 text-primary border-none uppercase text-[9px] font-bold tracking-widest px-3">
                Quản trị viên hệ thống
              </Badge>
              <span className="text-[10px] text-muted-foreground font-mono uppercase">ID: {user?.id.slice(0, 12)}...</span>
            </div>
          </div>
        </div>
      </motion.div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="bg-white border p-1 rounded-xl h-12 shadow-sm">
          <TabsTrigger value="profile" className="rounded-lg h-10 px-8 data-[state=active]:bg-primary data-[state=active]:text-white font-bold text-xs uppercase gap-2">
            <User className="w-4 h-4" /> Thông tin cá nhân
          </TabsTrigger>
          <TabsTrigger value="password" className="rounded-lg h-10 px-8 data-[state=active]:bg-primary data-[state=active]:text-white font-bold text-xs uppercase gap-2">
            <KeyRound className="w-4 h-4" /> Đổi mật khẩu
          </TabsTrigger>
        </TabsList>

        <div className="bg-white p-8 rounded-3xl border shadow-sm min-h-[400px]">
          <TabsContent value="profile" className="mt-0 animate-fade-in outline-none">
            <div className="max-w-xl">
              <div className="mb-8">
                <h3 className="text-lg font-bold text-charcoal flex items-center gap-2">
                  <Mail className="w-5 h-5 text-primary" /> Cập nhật hồ sơ
                </h3>
                <p className="text-sm text-muted-foreground mt-1">Thông tin này sẽ hiển thị trong các hoạt động quản trị của bạn.</p>
              </div>
              <ProfileForm />
            </div>
          </TabsContent>

          <TabsContent value="password" className="mt-0 animate-fade-in outline-none">
            <div className="max-w-xl">
              <div className="mb-8">
                <h3 className="text-lg font-bold text-charcoal flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-primary" /> Bảo mật tài khoản
                </h3>
                <p className="text-sm text-muted-foreground mt-1">Vui lòng nhập mật khẩu mới có độ bảo mật cao.</p>
              </div>
              <PasswordChangeForm />
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}