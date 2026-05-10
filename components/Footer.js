import Link from "next/link";
import { GraduationCap, SquareCode, Send, Mail } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-surface border-t border-border pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand Section */}
          <div className="col-span-1 md:col-span-1 space-y-6">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-text-1 tracking-tight">EduShare</span>
            </Link>
            <p className="text-text-2 text-sm leading-relaxed">
              Empowering students to share knowledge and grow together through peer-to-peer learning and resource sharing.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-text-3 hover:text-indigo-500">
                <SquareCode className="w-5 h-5" />
              </a>
              <a href="#" className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-text-3 hover:text-indigo-500">
                <Send className="w-5 h-5" />
              </a>
              <a href="#" className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-text-3 hover:text-indigo-500">
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-text-1">Platform</h3>
            <ul className="space-y-4">
              <li><Link href="/explore" className="text-text-2 hover:text-indigo-500 transition-colors text-sm">Explore Content</Link></li>
              <li><Link href="/leaderboard" className="text-text-2 hover:text-indigo-500 transition-colors text-sm">Leaderboard</Link></li>
              <li><Link href="/upload-notes" className="text-text-2 hover:text-indigo-500 transition-colors text-sm">Upload Resources</Link></li>
              <li><Link href="/credits" className="text-text-2 hover:text-indigo-500 transition-colors text-sm">Credit System</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-text-1">Support</h3>
            <ul className="space-y-4">
              <li><Link href="/help" className="text-text-2 hover:text-indigo-500 transition-colors text-sm">Help Center</Link></li>
              <li><Link href="/community" className="text-text-2 hover:text-indigo-500 transition-colors text-sm">Community Guidelines</Link></li>
              <li><Link href="/api/status" className="text-text-2 hover:text-indigo-500 transition-colors text-sm">Platform Status</Link></li>
              <li><Link href="mailto:support@edushare.com" className="text-text-2 hover:text-indigo-500 transition-colors text-sm">Contact Us</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div className="space-y-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-text-1">Legal</h3>
            <ul className="space-y-4">
              <li><Link href="/privacy" className="text-text-2 hover:text-indigo-500 transition-colors text-sm">Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-text-2 hover:text-indigo-500 transition-colors text-sm">Terms of Service</Link></li>
              <li><Link href="/dmca" className="text-text-2 hover:text-indigo-500 transition-colors text-sm">DMCA Policy</Link></li>
              <li><Link href="/cookies" className="text-text-2 hover:text-indigo-500 transition-colors text-sm">Cookie Settings</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border pt-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-text-3 text-sm font-medium">
            © {currentYear} EduShare Platform. All rights reserved. Built for students, by students.
          </p>
          <div className="flex items-center gap-6">
             <div className="flex items-center gap-2 text-[10px] font-bold text-text-3 uppercase tracking-widest bg-slate-100 dark:bg-white/5 px-3 py-1 rounded-full">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Live Network Status: Stable
             </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
