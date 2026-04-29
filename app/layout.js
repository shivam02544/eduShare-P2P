import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { LoadingProvider } from "@/context/LoadingContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { Toaster } from "react-hot-toast";
import Navbar from "@/components/Navbar";
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
        <ThemeProvider>
          <AuthProvider>
            <LoadingProvider>
              <Toaster
                position="top-center"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: "var(--surface)",
                    color: "var(--text-1)",
                    border: "1px solid var(--border)",
                    borderRadius: "16px",
                    fontSize: "14px",
                    fontWeight: "500",
                    boxShadow: "var(--shadow-lg)",
                  },
                  success: {
                    iconTheme: {
                      primary: "#10b981",
                      secondary: "#fff",
                    },
                  },
                }}
              />
              <MouseEffects />
              <ProgressBar />
              <Navbar />
              <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-28 lg:pb-8">
                {children}
              </main>
            </LoadingProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
