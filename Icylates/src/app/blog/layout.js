import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";
import ScrollToTop from "@/components/common/ScrollToTop";

export default function BlogLayout({ children }) {
  return <><Header /><ScrollToTop />{children}<Footer /></>;
}
