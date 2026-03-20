import React from "react";
import { Link, useLocation } from "wouter";
import { LayoutDashboard } from "lucide-react";
import mapsysLogo from "/images/mapsys-logo.png";

export function Navbar() {
  const [location] = useLocation();

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
            <img src={mapsysLogo} alt="MapSys logo" className="h-10 w-auto object-contain" />
            <div className="flex flex-col leading-tight">
              <span className="font-display font-bold text-lg" style={{ color: 'hsl(225 70% 15%)' }}>
                MapSys
              </span>
              <span className="text-xs font-medium" style={{ color: 'hsl(217 78% 46%)' }}>
                Soporte Técnico
              </span>
            </div>
          </Link>

          <div className="flex items-center space-x-3">
            <Link
              href="/"
              className={`text-sm font-medium transition-colors px-3 py-2 rounded-lg ${
                location === '/'
                  ? 'text-primary bg-primary/8'
                  : 'text-muted-foreground hover:text-primary hover:bg-primary/5'
              }`}
            >
              Portal Cliente
            </Link>
            <Link
              href="/admin"
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                location.startsWith('/admin')
                  ? 'text-white shadow-md'
                  : 'text-white/90 hover:text-white'
              }`}
              style={{
                background: location.startsWith('/admin')
                  ? 'linear-gradient(135deg, hsl(217 78% 42%) 0%, hsl(200 90% 50%) 100%)'
                  : 'linear-gradient(135deg, hsl(217 78% 46%) 0%, hsl(200 90% 55%) 100%)',
              }}
            >
              <LayoutDashboard className="w-4 h-4" />
              Administración
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
