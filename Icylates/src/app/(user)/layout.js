import ScrollToTop from "@/components/common/ScrollToTop";
import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";

export default function RootLayout({ children }) {
  return (
    <>
      <Header />
      <ScrollToTop />
      {children}
      <Footer />
    </>
  );
}
