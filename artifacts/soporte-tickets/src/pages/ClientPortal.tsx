import React, { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Building2, User, Mail, Phone, Cpu, 
  MonitorSmartphone, MessageSquare, CheckCircle2, ArrowRight
} from "lucide-react";
import { ProblemType } from "@workspace/api-client-react";
import { useTicketMutations } from "@/hooks/use-tickets";
import { Navbar } from "@/components/Navbar";

const formSchema = z.object({
  clientName: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  company: z.string().min(1, "El nombre de la empresa es requerido"),
  email: z.string().email("Correo electrónico inválido"),
  phone: z.string().min(6, "El teléfono debe tener al menos 6 caracteres"),
  problemType: z.enum([ProblemType.hardware, ProblemType.software], {
    required_error: "Selecciona el tipo de problema",
  }),
  description: z.string().min(10, "Describe el problema con más detalle (mínimo 10 caracteres)"),
});

type FormData = z.infer<typeof formSchema>;

export default function ClientPortal() {
  const { createTicket } = useTicketMutations();
  const [successTicketData, setSuccessTicketData] = useState<{ number: string, email: string } | null>(null);

  const { register, handleSubmit, formState: { errors }, watch, setValue, reset } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      problemType: ProblemType.software,
    }
  });

  const selectedType = watch("problemType");

  const onSubmit = (data: FormData) => {
    createTicket.mutate({ data }, {
      onSuccess: (response) => {
        setSuccessTicketData({
          number: response.ticketNumber,
          email: response.email
        });
        reset();
      }
    });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      {/* Background Image & Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src={`${import.meta.env.BASE_URL}images/hero-bg.png`} 
          alt="Background" 
          className="w-full h-[60vh] object-cover opacity-50"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/10 via-background/80 to-background" />
      </div>

      <Navbar />

      <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10 flex flex-col items-center">
        
        <AnimatePresence mode="wait">
          {!successTicketData ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4 }}
              className="w-full"
            >
              <div className="text-center mb-10">
                <img src={`${import.meta.env.BASE_URL}images/logo.png`} alt="Logo" className="w-20 h-20 mx-auto mb-6 rounded-2xl shadow-xl shadow-primary/10 bg-white" />
                <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4 font-display">
                  ¿En qué podemos <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">ayudarte?</span>
                </h1>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  Carga tu problema a continuación y nuestro equipo técnico se pondrá en contacto contigo a la brevedad.
                </p>
              </div>

              <div className="glass-panel rounded-3xl p-6 md:p-10 w-full relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary via-accent to-primary" />
                
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                  {/* Contact Info Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                        <User className="w-4 h-4 text-muted-foreground" /> Nombre Completo
                      </label>
                      <input 
                        {...register("clientName")}
                        className="w-full px-4 py-3 rounded-xl bg-secondary/50 border border-border focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        placeholder="Ej. Juan Pérez"
                      />
                      {errors.clientName && <p className="text-destructive text-sm mt-1">{errors.clientName.message}</p>}
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-muted-foreground" /> Empresa
                      </label>
                      <input 
                        {...register("company")}
                        className="w-full px-4 py-3 rounded-xl bg-secondary/50 border border-border focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        placeholder="Ej. TechCorp SA"
                      />
                      {errors.company && <p className="text-destructive text-sm mt-1">{errors.company.message}</p>}
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                        <Mail className="w-4 h-4 text-muted-foreground" /> Correo Electrónico
                      </label>
                      <input 
                        type="email"
                        {...register("email")}
                        className="w-full px-4 py-3 rounded-xl bg-secondary/50 border border-border focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        placeholder="juan@empresa.com"
                      />
                      {errors.email && <p className="text-destructive text-sm mt-1">{errors.email.message}</p>}
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                        <Phone className="w-4 h-4 text-muted-foreground" /> Teléfono
                      </label>
                      <input 
                        type="tel"
                        {...register("phone")}
                        className="w-full px-4 py-3 rounded-xl bg-secondary/50 border border-border focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        placeholder="+54 9 11 1234-5678"
                      />
                      {errors.phone && <p className="text-destructive text-sm mt-1">{errors.phone.message}</p>}
                    </div>
                  </div>

                  <div className="w-full h-px bg-border" />

                  {/* Problem Type Selector */}
                  <div className="space-y-4">
                    <label className="text-sm font-semibold text-foreground">Tipo de Problema</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <button
                        type="button"
                        onClick={() => setValue("problemType", ProblemType.software)}
                        className={`flex items-start p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                          selectedType === ProblemType.software 
                            ? 'border-primary bg-primary/5 shadow-md shadow-primary/10' 
                            : 'border-border bg-white hover:border-primary/50'
                        }`}
                      >
                        <div className={`p-2 rounded-lg mr-4 ${selectedType === ProblemType.software ? 'bg-primary text-white' : 'bg-secondary text-muted-foreground'}`}>
                          <MonitorSmartphone className="w-6 h-6" />
                        </div>
                        <div>
                          <h4 className={`font-semibold ${selectedType === ProblemType.software ? 'text-primary' : 'text-foreground'}`}>Software</h4>
                          <p className="text-sm text-muted-foreground mt-1">Programas, sistema operativo, lentitud, virus</p>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setValue("problemType", ProblemType.hardware)}
                        className={`flex items-start p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                          selectedType === ProblemType.hardware 
                            ? 'border-primary bg-primary/5 shadow-md shadow-primary/10' 
                            : 'border-border bg-white hover:border-primary/50'
                        }`}
                      >
                        <div className={`p-2 rounded-lg mr-4 ${selectedType === ProblemType.hardware ? 'bg-primary text-white' : 'bg-secondary text-muted-foreground'}`}>
                          <Cpu className="w-6 h-6" />
                        </div>
                        <div>
                          <h4 className={`font-semibold ${selectedType === ProblemType.hardware ? 'text-primary' : 'text-foreground'}`}>Hardware</h4>
                          <p className="text-sm text-muted-foreground mt-1">Equipos físicos, pantalla rota, no enciende</p>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-muted-foreground" /> Descripción del Problema
                    </label>
                    <textarea 
                      {...register("description")}
                      rows={5}
                      className="w-full px-4 py-3 rounded-xl bg-secondary/50 border border-border focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                      placeholder="Por favor, describe detalladamente qué está sucediendo..."
                    />
                    {errors.description && <p className="text-destructive text-sm mt-1">{errors.description.message}</p>}
                  </div>

                  {/* Submit Button */}
                  <div className="pt-4 flex justify-end">
                    <button
                      type="submit"
                      disabled={createTicket.isPending}
                      className="group flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-4 bg-primary text-primary-foreground font-semibold rounded-xl shadow-lg shadow-primary/25 hover:shadow-xl hover:bg-primary/90 hover:-translate-y-0.5 active:translate-y-0 active:shadow-md disabled:opacity-70 disabled:cursor-not-allowed transition-all"
                    >
                      {createTicket.isPending ? (
                        "Enviando ticket..."
                      ) : (
                        <>
                          Enviar Ticket <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full max-w-lg mt-12 text-center glass-panel rounded-3xl p-10 relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-emerald-400 to-emerald-600" />
              
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.2, bounce: 0.5 }}
                className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6"
              >
                <CheckCircle2 className="w-12 h-12" />
              </motion.div>
              
              <h2 className="text-3xl font-bold font-display text-foreground mb-2">¡Ticket Cargado!</h2>
              <p className="text-muted-foreground mb-8 text-lg">
                Hemos recibido tu solicitud y enviado una confirmación a <strong className="text-foreground">{successTicketData.email}</strong>.
              </p>

              <div className="bg-secondary/50 rounded-2xl p-6 mb-8 border border-border/50">
                <p className="text-sm text-muted-foreground mb-2 uppercase tracking-wider font-semibold">Tu número de ticket</p>
                <div className="text-4xl font-mono font-bold text-primary tracking-tight">
                  {successTicketData.number}
                </div>
              </div>

              <button
                onClick={() => setSuccessTicketData(null)}
                className="px-6 py-3 bg-secondary text-secondary-foreground font-semibold rounded-xl hover:bg-secondary/80 transition-colors w-full sm:w-auto"
              >
                Cargar otro ticket
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
