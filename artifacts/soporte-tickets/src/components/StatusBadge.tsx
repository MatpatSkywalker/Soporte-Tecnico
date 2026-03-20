import React from "react";
import { TicketStatus } from "@workspace/api-client-react/src/generated/api.schemas";

interface StatusBadgeProps {
  status: TicketStatus;
  className?: string;
}

export function StatusBadge({ status, className = "" }: StatusBadgeProps) {
  const config = {
    cargado: {
      label: "Cargado",
      classes: "bg-slate-100 text-slate-700 border-slate-200",
    },
    en_revision: {
      label: "En Revisión",
      classes: "bg-amber-50 text-amber-700 border-amber-200",
    },
    finalizado: {
      label: "Finalizado",
      classes: "bg-emerald-50 text-emerald-700 border-emerald-200",
    },
  };

  const { label, classes } = config[status] || config.cargado;

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${classes} ${className}`}>
      {status === 'en_revision' && <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5 animate-pulse" />}
      {status === 'finalizado' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5" />}
      {status === 'cargado' && <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mr-1.5" />}
      {label}
    </span>
  );
}
