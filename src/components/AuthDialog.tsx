"use client";

import { useState, useEffect, useRef } from "react";
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, AtSign, Smartphone, AlertTriangle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import PhoneInput from 'react-phone-number-input';
import HCaptcha from "@hcaptcha/react-hcaptcha";
import { E164Number } from 'libphonenumber-js/core';

// hCaptcha Site Key
const HCAPTCHA_SITE_KEY = "0fac0b70-8cd8-4418-ab96-b4d8b37e5a4a";

interface AuthDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthDialog({ isOpen, onClose }: AuthDialogProps) {
  const { isLoading, user } = useAuth();
  const [phone, setPhone] = useState<E164Number | undefined>();
  const [otp, setOtp] = useState('');
  const [isPhoneLoading, setIsPhoneLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const hcaptchaRef = useRef<HCaptcha>(null);

  useEffect(() => {
    if (user && isOpen) {
      onClose();
    }
  }, [user, isOpen, onClose]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const handlePhoneSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) {
      toast.error("Vui lòng nhập số điện thoại.");
      return;
    }

    if (!captchaToken) {
      toast.error("Vui lòng xác thực mã Captcha.");
      return;
    }

    setIsPhoneLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({ 
        phone,
        options: { captchaToken: captchaToken }
      });
      if (error) throw error;
      setOtpSent(true);
      setResendCooldown(60);
      toast.success("Mã OTP đã được gửi thành công.");
    } catch (error: any) {
      toast.error("Lỗi: " + (error.message || "Không thể gửi OTP"));
      hcaptchaRef.current?.resetCaptcha();
      setCaptchaToken(null);
    } finally {
      setIsPhoneLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || !otp) return;
    setIsPhoneLoading(true);
    try {
      const { error } = await supabase.auth.verifyOtp({ phone, token: otp, type: 'sms' });
      if (error) throw error;
      toast.success("Đăng nhập thành công!");
      onClose();
    } catch (error: any) {
      toast.error("Mã OTP không chính xác hoặc đã hết hạn.");
    } finally {
      setIsPhoneLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[450px] p-6 md:p-10 z-[110] overflow-y-auto max-h-[95vh] rounded-3xl border-none shadow-elevated">
        <DialogHeader className="text-center mb-6">
          <div className="flex flex-col items-center mb-2">
            <span className="text-3xl font-bold tracking-tight text-charcoal">OHOUSE</span>
            <span className="text-[10px] uppercase tracking-[0.3em] text-primary font-bold mt-1">Nội Thất Cao Cấp</span>
          </div>
        </DialogHeader>

        <Tabs defaultValue="email" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-secondary/30 rounded-xl p-1 h-12 mb-6">
            <TabsTrigger value="email" className="rounded-lg h-10 font-bold text-[10px] uppercase gap-2 data-[state=active]:bg-primary data-[state=active]:text-white">
              <AtSign className="w-3.5 h-3.5" /> Email
            </TabsTrigger>
            <TabsTrigger value="phone" className="rounded-lg h-10 font-bold text-[10px] uppercase gap-2 data-[state=active]:bg-primary data-[state=active]:text-white">
              <Smartphone className="w-3.5 h-3.5" /> Số điện thoại
            </TabsTrigger>
          </TabsList>

          <TabsContent value="email" className="animate-fade-in">
            <Auth
              supabaseClient={supabase}
              appearance={{
                theme: ThemeSupa,
                variables: {
                  default: {
                    colors: {
                      brand: 'hsl(var(--primary))',
                      brandAccent: 'hsl(var(--primary-foreground))',
                      inputBackground: 'transparent',
                    },
                    radii: { borderRadiusButton: '12px', inputBorderRadius: '12px' },
                  },
                },
                className: {
                  button: 'font-bold uppercase tracking-wider text-[10px] h-12 transition-all hover:scale-[1.02]',
                  input: 'h-12 border-border/60 focus:border-primary rounded-xl text-sm',
                  label: 'text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1',
                  anchor: 'text-xs font-bold text-primary hover:underline',
                }
              }}
              providers={['google']}
              redirectTo={window.location.origin}
              onlyThirdPartyProviders={false}
              view="sign_in"
              localization={{
                variables: {
                  sign_in: { email_label: 'Email', password_label: 'Mật khẩu', button_label: 'Đăng Nhập' },
                  sign_up: { email_label: 'Email', password_label: 'Mật khẩu', button_label: 'Đăng Ký' },
                }
              }}
            />
          </TabsContent>

          <TabsContent value="phone" className="animate-fade-in">
            {!otpSent ? (
              <form onSubmit={handlePhoneSignIn} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Số điện thoại của bạn</label>
                  <div className="luxury-phone-input">
                    <PhoneInput
                      international
                      defaultCountry="VN"
                      value={phone}
                      onChange={setPhone}
                    />
                  </div>
                </div>
                
                <div className="flex flex-col items-center justify-center py-2">
                  <div className="min-h-[78px] flex items-center justify-center">
                    <HCaptcha
                      sitekey={HCAPTCHA_SITE_KEY}
                      onVerify={(token) => setCaptchaToken(token)}
                      onExpire={() => setCaptchaToken(null)}
                      ref={hcaptchaRef}
                      theme="light"
                      size="normal"
                    />
                  </div>
                </div>

                <Button type="submit" disabled={isPhoneLoading || !phone || !captchaToken} className="w-full btn-hero h-12 shadow-gold rounded-xl text-[10px] font-bold">
                  {isPhoneLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'GỬI MÃ XÁC THỰC OTP'}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-6">
                <div className="text-center space-y-2">
                  <p className="text-xs text-muted-foreground">Mã xác thực đã được gửi tới</p>
                  <p className="font-bold text-charcoal">{phone}</p>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground text-center block">Nhập mã 6 số</label>
                  <Input 
                    type="text" 
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="000000"
                    className="h-14 text-center text-2xl font-bold tracking-[0.5em] rounded-xl border-2 focus:border-primary"
                    required
                  />
                </div>
                <Button type="submit" disabled={isPhoneLoading || otp.length < 6} className="w-full btn-hero h-12 shadow-gold rounded-xl text-[10px] font-bold">
                  {isPhoneLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'XÁC NHẬN ĐĂNG NHẬP'}
                </Button>
                <button 
                  type="button" 
                  onClick={() => setOtpSent(false)}
                  className="w-full text-[10px] font-bold uppercase tracking-widest text-primary hover:underline"
                >
                  Thay đổi số điện thoại
                </button>
              </form>
            )}
          </TabsContent>
        </Tabs>

        <div className="mt-8 pt-6 border-t border-border/40 text-center">
          <p className="text-[10px] text-muted-foreground italic leading-relaxed">
            Bằng việc tiếp tục, bạn đồng ý với Điều khoản dịch vụ và Chính sách bảo mật của OHOUSE.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}