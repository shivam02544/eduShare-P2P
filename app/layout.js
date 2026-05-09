import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { LoadingProvider } from "@/context/LoadingContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { Toaster } from "react-hot-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProgressBar from "@/components/ProgressBar";
import MouseEffects from "@/components/MouseEffects";
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';

export const metadata = {
  title: "EduShare – Peer Knowledge Exchange",
  description: "Share knowledge, upload resources, and grow together on EduShare — the student-driven learning platform.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${GeistSans.variable} ${GeistMono.variable}`}>

      <body>
        <a href="#main-content" className="skip-link">Skip to main content</a>
        <ThemeProvider>
          <AuthProvider>
            <LoadingProvider>
              {/*
                Position: bottom-right on desktop — less intrusive and avoids
                mobile browser address-bar overlap that top-center causes on scroll.
                containerStyle adds env(safe-area-inset-bottom) for notched phones.
              */}
              <Toaster
                position="bottom-right"
                toastOptions={{
                  duration: 3500,
                  style: {
                    background: "var(--surface)",
                    color: "var(--text-1)",
                    border: "1px solid var(--border)",
                    borderRadius: "16px",
                    fontSize: "14px",
                    fontWeight: "500",
                    boxShadow: "var(--shadow-lg)",
                    maxWidth: "380px",
                  },
                  success: {
                    iconTheme: { primary: "#10b981", secondary: "#fff" },
                  },
                  error: {
                    iconTheme: { primary: "#f43f5e", secondary: "#fff" },
                    duration: 5000,
                  },
                }}
                containerStyle={{
                  bottom: "calc(env(safe-area-inset-bottom, 0px) + 80px)",
                  right: "16px",
                }}
              />
              <MouseEffects />
              <ProgressBar />
              <Navbar />
              <main
                id="main-content"
                role="main"
                aria-label="Main content"
                className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-28 lg:pb-8"
              >
                {children}
              </main>
              <Footer />
            </LoadingProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
