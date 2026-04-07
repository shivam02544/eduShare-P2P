import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { LoadingProvider } from "@/context/LoadingContext";
import { ThemeProvider } from "@/context/ThemeContext";
import Navbar from "@/components/Navbar";
import ProgressBar from "@/components/ProgressBar";
import MouseEffects from "@/components/MouseEffects";

export const metadata = {
  title: "EduShare – Peer Knowledge Exchange",
  description: "Share knowledge, upload resources, and grow together.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <AuthProvider>
            <LoadingProvider>
              <MouseEffects />
              <ProgressBar />
              <Navbar />
              <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 animate-fade-in">
                {children}
              </main>
            </LoadingProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
