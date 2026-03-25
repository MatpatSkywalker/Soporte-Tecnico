import React, { useState } from "react";
import { useParams, Link, useLocation } from "wouter";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
  ArrowLeft, Building2, User, Mail, Phone, Clock, 
  MessageSquare, Lock, Send, AlertCircle, Trash2, X
} from "lucide-react";
import { useGetTicket, TicketStatus } from "@workspace/api-client-react";
import { useTicketMutations } from "@/hooks/use-tickets";
import { Navbar } from "@/components/Navbar";
import { StatusBadge } from "@/components/StatusBadge";
import { ProblemTypeIcon } from "@/components/ProblemTypeIcon";

const commentSchema = z.object({
  content: z.string().min(1, "El mensaje no puede estar vacío"),
  isInternal: z.boolean().default(false)
});

type CommentFormData = z.infer<typeof commentSchema>;

export default function TicketDetail() {
  const { id } = useParams<{ id: string }>();
  const ticketId = Number(id);
  const [, navigate] = useLocation();
  const [confirmDelete, setConfirmDelete] = useState(false);
  
  const { data: ticket, isLoading, isError } = useGetTicket(ticketId);
  const { updateStatus, addComment, deleteTicket } = useTicketMutations();

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<CommentFormData>({
    resolver: zodResolver(commentSchema),
    defaultValues: { isInternal: false }
  });

  const isInternalWatch = watch("isInternal");

  const onStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value as TicketStatus;
    updateStatus.mutate({ 
      id: ticketId, 
      data: { status: newStatus } 
    });
  };

  const onAddComment = (data: CommentFormData) => {
    addComment.mutate({
      id: ticketId,
      data
    }, {
      onSuccess: () => reset()
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (isError || !ticket) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
            <h2 className="text-2xl font-bold font-display text-foreground">Ticket no encontrado</h2>
            <Link href="/admin" className="mt-4 text-primary hover:underline inline-block">
              Volver al panel
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <Link href="/admin" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mb-3">
              <ArrowLeft className="w-4 h-4 mr-1.5" /> Volver a la lista
            </Link>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold font-display text-foreground">{ticket.ticketNumber}</h1>
              <StatusBadge status={ticket.status} className="text-sm px-3 py-1" />
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-3 bg-card p-2 rounded-xl border border-border shadow-sm">
              <label className="text-sm font-medium text-muted-foreground pl-2">Estado:</label>
              <select 
                value={ticket.status}
                onChange={onStatusChange}
                disabled={updateStatus.isPending}
                className="bg-secondary/50 border border-border text-foreground text-sm rounded-lg focus:ring-primary focus:border-primary block px-3 py-2 cursor-pointer outline-none transition-colors"
              >
                <option value="cargado">Cargado</option>
                <option value="en_revision">En Revisión</option>
                <option value="finalizado">Finalizado</option>
              </select>
            </div>

            {confirmDelete ? (
              <div className="flex items-center gap-2 bg-white border border-destructive/30 rounded-xl px-3 py-2 shadow-sm">
                <span className="text-sm font-medium text-destructive">¿Eliminar ticket?</span>
                <button
                  onClick={() => deleteTicket.mutate({ id: ticketId }, { onSuccess: () => navigate('/admin') })}
                  disabled={deleteTicket.isPending}
                  className="px-3 py-1 text-sm font-bold bg-destructive text-white rounded-lg hover:bg-destructive/90 transition-colors disabled:opacity-60"
                >
                  {deleteTicket.isPending ? "Eliminando..." : "Sí, eliminar"}
                </button>
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="p-1 text-muted-foreground hover:text-foreground rounded-lg hover:bg-secondary transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmDelete(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 border border-border hover:border-destructive/30 transition-all bg-card shadow-sm"
              >
                <Trash2 className="w-4 h-4" />
                Eliminar
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Details */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
              <h3 className="text-lg font-bold font-display border-b border-border pb-3 mb-4">Información del Cliente</h3>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <User className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-foreground">{ticket.clientName}</p>
                    <p className="text-xs text-muted-foreground">Contacto</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Building2 className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-foreground">{ticket.company}</p>
                    <p className="text-xs text-muted-foreground">Empresa</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
                  <div>
                    <a href={`mailto:${ticket.email}`} className="text-sm font-medium text-primary hover:underline">{ticket.email}</a>
                    <p className="text-xs text-muted-foreground">Email</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
                  <div>
                    <a href={`tel:${ticket.phone}`} className="text-sm font-medium text-foreground hover:text-primary transition-colors">{ticket.phone}</a>
                    <p className="text-xs text-muted-foreground">Teléfono</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
              <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
                <h3 className="text-lg font-bold font-display">Detalle del Problema</h3>
                <div className="flex items-center gap-1.5 text-xs font-semibold bg-secondary px-2 py-1 rounded-md text-foreground">
                  <ProblemTypeIcon type={ticket.problemType} className="w-3.5 h-3.5 text-primary" />
                  <span className="capitalize">{ticket.problemType}</span>
                </div>
              </div>
              
              <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                {ticket.description}
              </p>

              <div className="mt-6 pt-4 border-t border-border flex items-center text-xs text-muted-foreground gap-1.5">
                <Clock className="w-4 h-4" />
                Creado el {format(new Date(ticket.createdAt), "d 'de' MMMM, yyyy 'a las' HH:mm", { locale: es })}
              </div>
            </div>
          </div>

          {/* Right Column: Comments/Timeline */}
          <div className="lg:col-span-2 flex flex-col bg-card rounded-2xl border border-border shadow-sm overflow-hidden h-[calc(100vh-12rem)] min-h-[600px]">
            <div className="p-4 border-b border-border bg-secondary/30 flex justify-between items-center">
              <h3 className="font-bold font-display flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-muted-foreground" /> 
                Seguimiento
              </h3>
              <span className="text-xs font-medium text-muted-foreground bg-white px-2 py-1 rounded-md border border-border">
                {ticket.comments.length} mensaje(s)
              </span>
            </div>

            {/* Comments List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50">
              {ticket.comments.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
                  <MessageSquare className="w-12 h-12 mb-3 opacity-20" />
                  <p>Aún no hay comentarios en este ticket.</p>
                </div>
              ) : (
                ticket.comments.map((comment) => (
                  <div 
                    key={comment.id} 
                    className={`flex gap-4 ${comment.isInternal ? 'ml-0 mr-8' : 'ml-8 mr-0 flex-row-reverse'}`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-sm border ${
                      comment.isInternal ? 'bg-amber-100 border-amber-200 text-amber-600' : 'bg-primary/10 border-primary/20 text-primary'
                    }`}>
                      {comment.isInternal ? <Lock className="w-4 h-4" /> : <User className="w-4 h-4" />}
                    </div>
                    
                    <div className={`flex-1 rounded-2xl p-4 shadow-sm border ${
                      comment.isInternal 
                        ? 'bg-amber-50/50 border-amber-100 rounded-tl-none' 
                        : 'bg-white border-border rounded-tr-none'
                    }`}>
                      <div className={`flex items-center justify-between mb-2 ${comment.isInternal ? '' : 'flex-row-reverse'}`}>
                        <span className={`text-xs font-bold uppercase tracking-wider ${comment.isInternal ? 'text-amber-700' : 'text-primary'}`}>
                          {comment.isInternal ? 'Nota Interna' : 'Mensaje al Cliente'}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(comment.createdAt), "dd MMM, HH:mm", { locale: es })}
                        </span>
                      </div>
                      <p className={`text-sm whitespace-pre-wrap leading-relaxed ${comment.isInternal ? 'text-amber-900' : 'text-foreground'}`}>
                        {comment.content}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Comment Form */}
            <div className="p-4 bg-white border-t border-border">
              <form onSubmit={handleSubmit(onAddComment)} className="flex flex-col gap-3">
                <textarea 
                  {...register("content")}
                  rows={3}
                  placeholder={isInternalWatch ? "Escribe una nota interna (el cliente no la verá)..." : "Escribe un mensaje para enviar al cliente..."}
                  className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 transition-all resize-none ${
                    isInternalWatch 
                      ? 'bg-amber-50/50 border-amber-200 focus:ring-amber-500/20 focus:border-amber-500 placeholder:text-amber-600/50' 
                      : 'bg-secondary/30 border-border focus:ring-primary/20 focus:border-primary'
                  }`}
                />
                
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <div className="relative flex items-center">
                      <input 
                        type="checkbox" 
                        {...register("isInternal")}
                        className="peer sr-only" 
                      />
                      <div className="w-10 h-5 bg-secondary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500 transition-colors"></div>
                    </div>
                    <span className={`text-sm font-medium transition-colors ${isInternalWatch ? 'text-amber-600' : 'text-muted-foreground group-hover:text-foreground'}`}>
                      Es una nota interna
                    </span>
                  </label>

                  <button
                    type="submit"
                    disabled={addComment.isPending}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-white shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                      isInternalWatch 
                        ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/20' 
                        : 'bg-primary hover:bg-primary/90 shadow-primary/20'
                    }`}
                  >
                    {addComment.isPending ? "Enviando..." : (
                      <>Enviar {isInternalWatch ? 'Nota' : 'Mensaje'} <Send className="w-4 h-4 ml-1" /></>
                    )}
                  </button>
                </div>
                {errors.content && <span className="text-xs text-destructive">{errors.content.message}</span>}
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
