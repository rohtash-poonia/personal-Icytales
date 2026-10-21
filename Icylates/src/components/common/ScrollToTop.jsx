"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { BottomToTop } from "./Icons";

const ScrollToTop = () => {
  const [isVisible, setIsVisible] = useState(false);

  // Show / hide button on scroll
  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  // Scroll to top
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    isVisible && (
      <button
        onClick={scrollToTop}
        className="fixed bottom-6 right-6 z-50 bg-pink-500 hover:bg-pink-600 transition rounded-md  shadow-lg"
      >
        <BottomToTop />
      </button>
    )
  );
};

export default ScrollToTop;
