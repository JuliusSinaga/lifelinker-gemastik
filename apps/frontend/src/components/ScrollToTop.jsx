import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Setiap kali 'pathname' berubah (pindah halaman), scroll ke atas
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}