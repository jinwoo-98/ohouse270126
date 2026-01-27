import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Cuộn về đầu trang (0, 0) với hiệu ứng mượt mà hoặc tức thì
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}