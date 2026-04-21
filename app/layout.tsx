import { Suspense, type ReactNode } from "react";
import "./globals.css";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { ContactModalProvider } from "./components/contact/ContactModalProvider";
import BackgroundSplashGate from "./components/BackgroundSplashGate";

export const metadata = {
  title: "The Creativity Shoppe",
  description: "Creating ",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
      <BackgroundSplashGate minMs={250} />
        <AuthProvider>
          <CartProvider>
            <ContactModalProvider>
              <Suspense fallback={null}>
                <Navbar />
              </Suspense>

              <div className="h-0.5 w-full bg-sandstone/40" />
              <main>{children}</main>
              <Footer />
            </ContactModalProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
