import React from "react";
import { Link, useLocation } from "wouter";
import { LayoutDashboard, LifeBuoy } from "lucide-react";

export function Navbar() {
  const [location] = useLocation();

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <LifeBuoy className="w-5 h-5" />
            </div>
            <span className="font-display font-bold text-xl text-foreground">
              Soporte<span className="text-primary">Tech</span>
            </span>
          </div>
          
          <div className="flex items-center space-x-4">
            <Link 
              href="/" 
              className={`text-sm font-medium transition-colors hover:text-primary ${location === '/' ? 'text-primary' : 'text-muted-foreground'}`}
            >
              Portal Cliente
            </Link>
            <Link 
              href="/admin" 
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                location.startsWith('/admin') 
                  ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20' 
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              }`}
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
