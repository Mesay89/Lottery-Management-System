import { Link } from 'react-router-dom'
import { Ticket } from 'lucide-react'

export function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-[#1a7a4a] flex items-center justify-center text-white">
                <Ticket className="w-4 h-4" />
              </div>
              <span className="font-bold text-white text-lg">OLMS</span>
            </div>
            <p className="text-sm text-slate-400">
              Secure, transparent Lottery Management & Digital Ticketing System for authorized Ethiopian operators.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-3 text-sm">Quick Links</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><Link to="/" className="hover:text-white">Home</Link></li>
              <li><Link to="/results" className="hover:text-white">Official Results</Link></li>
              <li><Link to="/login" className="hover:text-white">Login</Link></li>
              <li><Link to="/register" className="hover:text-white">Register</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-3 text-sm">Supported Payments</h4>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 rounded-full bg-emerald-900/50 border border-emerald-700 text-emerald-300 text-xs font-medium">
                Telebirr
              </span>
              <span className="px-3 py-1 rounded-full bg-blue-900/50 border border-blue-700 text-blue-300 text-xs font-medium">
                CBE Birr
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-4">
              Must be 18+ to participate. Play responsibly.
            </p>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-slate-800 text-center text-xs text-slate-500">
          © {new Date().getFullYear()} OLMS Lottery Management System. All rights reserved.
        </div>
      </div>
    </footer>
  )
}

export default Footer
