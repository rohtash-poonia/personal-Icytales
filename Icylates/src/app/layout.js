/** @format */

import { Archivo, Berkshire_Swash } from "next/font/google";
import "./globals.css";
import { WishlistProvider } from "@/components/context/WishlistContext";
import { AuthProvider } from "@/components/context/AuthContext";
import { CartProvider } from "@/components/context/CartContext";

const archivo = Archivo({
  variable: "--font-archivo-family",
  subsets: ["latin"],
});

const berkshire = Berkshire_Swash({
  variable: "--font-berkshire-mono",
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
});

export const metadata = {
  title: "Icy Tales",
  description: "Discover handcrafted ice cream, classic sundaes, and your next favorite flavor at IcyTales.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${archivo.variable} ${berkshire.variable}  antialiased`}
      >
        <AuthProvider>
          <WishlistProvider>
            <CartProvider>{children}</CartProvider>
          </WishlistProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
