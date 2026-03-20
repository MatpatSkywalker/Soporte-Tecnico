import React, { useState } from "react";
import { Link } from "wouter";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Filter, Search, Inbox, ArrowRight } from "lucide-react";
import { useListTickets, ListTicketsStatus } from "@workspace/api-client-react";
import { Navbar } from "@/components/Navbar";
import { StatusBadge } from "@/components/StatusBadge";
import { ProblemTypeIcon } from "@/components/ProblemTypeIcon";

type FilterTab = 'todos' | ListTicketsStatus;

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<FilterTab>('todos');
  
  // Convert 'todos' to undefined for the API call
  const queryStatus = activeTab === 'todos' ? undefined : activeTab;
  
  const { data: tickets, isLoading, isError } = useListTickets(
    { status: queryStatus },
    { query: { refetchInterval: 30000 } } // Auto refresh every 30s
  );

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold font-display text-foreground">Panel de Administración</h1>
            <p className="text-muted-foreground mt-1">Gestiona y da seguimiento a los tickets de soporte</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex overflow-x-auto pb-4 mb-2 -mx-4 px-4 sm:mx-0 sm:px-0 hide-scrollbar gap-2">
          {[
            { id: 'todos', label: 'Todos los tickets' },
            { id: 'cargado', label: 'Nuevos (Cargados)' },
            { id: 'en_revision', label: 'En Revisión' },
            { id: 'finalizado', label: 'Finalizados' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as FilterTab)}
              className={`whitespace-nowrap px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-foreground text-background shadow-md'
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border/50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse mt-4">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-56 bg-secondary/50 rounded-2xl border border-border/50"></div>
            ))}
          </div>
        ) : isError ? (
          <div className="text-center py-20 bg-destructive/5 rounded-2xl border border-destructive/20 mt-4">
            <p className="text-destructive font-semibold">Error al cargar los tickets. Intenta nuevamente.</p>
          </div>
        ) : tickets?.length === 0 ? (
          <div className="text-center py-24 bg-secondary/30 rounded-3xl border border-dashed border-border mt-4 flex flex-col items-center">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
              <Inbox className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2 font-display">No hay tickets</h3>
            <p className="text-muted-foreground max-w-sm">
              {activeTab === 'todos' 
                ? 'Aún no se ha recibido ningún ticket en el sistema.' 
                : 'No hay tickets con este estado actualmente.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
            {tickets?.map((ticket) => (
              <Link 
                key={ticket.id} 
                href={`/admin/tickets/${ticket.id}`}
                className="group bg-card rounded-2xl p-6 border border-border shadow-sm hover:shadow-xl hover:border-primary/30 hover:-translate-y-1 transition-all duration-300 flex flex-col h-full cursor-pointer relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-primary to-accent opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <div className="flex justify-between items-start mb-4">
                  <div className="bg-secondary/60 px-3 py-1 rounded-md text-xs font-mono font-bold text-secondary-foreground border border-border/50 group-hover:border-primary/20 transition-colors">
                    {ticket.ticketNumber}
                  </div>
                  <StatusBadge status={ticket.status} />
                </div>

                <div className="mb-4 flex-1">
                  <h3 className="font-bold text-lg text-foreground leading-tight line-clamp-1 group-hover:text-primary transition-colors">
                    {ticket.company}
                  </h3>
                  <p className="text-muted-foreground text-sm flex items-center gap-1.5 mt-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-border" />
                    {ticket.clientName}
                  </p>
                </div>

                <div className="pt-4 border-t border-border flex items-center justify-between mt-auto">
                  <div className="flex items-center gap-2 text-sm font-medium text-foreground bg-secondary/50 px-2.5 py-1.5 rounded-lg">
                    <ProblemTypeIcon type={ticket.problemType} className="w-4 h-4 text-primary" />
                    <span className="capitalize">{ticket.problemType}</span>
                  </div>
                  <div className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                    {format(new Date(ticket.createdAt), "dd MMM, HH:mm", { locale: es })}
                    <ArrowRight className="w-3.5 h-3.5 ml-1 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-primary" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
