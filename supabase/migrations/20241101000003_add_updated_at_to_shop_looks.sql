-- Đảm bảo cột updated_at tồn tại
ALTER TABLE public.shop_looks 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Đảm bảo cột slug tồn tại
ALTER TABLE public.shop_looks 
ADD COLUMN IF NOT EXISTS slug TEXT;

-- Tạo index cho slug để tìm kiếm nhanh hơn
CREATE INDEX IF NOT EXISTS shop_looks_slug_idx ON public.shop_looks (slug);

-- Cập nhật trigger để tự động update updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_shop_looks_updated ON public.shop_looks;
CREATE TRIGGER on_shop_looks_updated
  BEFORE UPDATE ON public.shop_looks
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Gửi thông báo để reload schema cache của PostgREST (Thủ thuật)
NOTIFY pgrst, 'reload schema';