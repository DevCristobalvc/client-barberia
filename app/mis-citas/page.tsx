"use client";

import { createClient } from "@/lib/supabase/client";
import { Scissors, ArrowLeft, Calendar, Clock } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const SHOP_ID = process.env.NEXT_PUBLIC_SHOP_ID || "00000000-0000-0000-0000-000000000001";
const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const STATUS_LABEL: Record<string, { label: string; color: string }> = {
  confirmed: { label: "Confirmada",  color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
  pending:   { label: "Pendiente",   color: "text-gold bg-gold/10 border-gold/20" },
  completed: { label: "Completada",  color: "text-[#888888] bg-[#1A1A1A] border-[#2A2A2A]" },
  cancelled: { label: "Cancelada",   color: "text-red-400 bg-red-900/10 border-red-900/20" },
  no_show:   { label: "No asistió",  color: "text-orange-400 bg-orange-900/10 border-orange-900/20" },
};

export default function MisCitasPage() {
  const router = useRouter();
  const [appointments, setAppointments] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) { router.push("/login?next=/mis-citas"); return; }

      try {
        const res = await fetch(`${API}/api/v1/appointments/${SHOP_ID}`);
        if (res.ok) {
          setAppointments(await res.json());
        } else {
          setError("No se pudieron cargar tus citas.");
        }
      } catch {
        setError("Backend no disponible. Inicia el servidor.");
      } finally {
        setLoading(false);
      }
    });
  }, []);

  return (
    <div className="min-h-screen bg-[#0A0A0A] px-5 pt-12 pb-8 max-w-sm mx-auto">
      <Link href="/perfil" className="flex items-center gap-1.5 text-[#888888] hover:text-[#F5F5F5] transition-colors mb-8 w-fit">
        <ArrowLeft className="w-4 h-4" /><span className="text-sm">Perfil</span>
      </Link>

      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 bg-gold/10 rounded-xl flex items-center justify-center">
          <Scissors className="w-4 h-4 text-gold" />
        </div>
        <div>
          <h1 className="text-lg font-bold">Mis citas</h1>
          <p className="text-xs text-[#888888]">BIA Barber Studio</p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-5 h-5 rounded-full border-2 border-gold border-t-transparent animate-spin" />
        </div>
      ) : error ? (
        <div className="bg-[#111111] border border-[#2A2A2A] rounded-2xl p-6 text-center">
          <p className="text-sm text-[#888888]">{error}</p>
        </div>
      ) : appointments.length === 0 ? (
        <div className="bg-[#111111] border border-[#2A2A2A] rounded-2xl p-8 text-center">
          <Calendar className="w-8 h-8 text-[#333333] mx-auto mb-3" />
          <p className="text-sm font-medium text-[#888888]">Sin citas aún</p>
          <p className="text-xs text-[#555555] mt-1">Habla con SofIA para reservar tu primera cita</p>
          <Link href="/" className="inline-block mt-4 px-4 py-2 bg-gold text-[#0A0A0A] text-sm font-semibold rounded-xl hover:bg-gold-light transition-colors">
            Reservar ahora
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {appointments.map((appt: Record<string, unknown>) => {
            const start  = new Date(appt.start_datetime as string);
            const status = STATUS_LABEL[appt.status as string] ?? STATUS_LABEL.pending;
            return (
              <div key={appt.id as string} className="bg-[#111111] border border-[#2A2A2A] rounded-2xl p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gold flex-shrink-0" />
                    <span className="text-sm font-medium">
                      {start.toLocaleDateString("es-CO", { weekday: "short", day: "numeric", month: "short" })}
                    </span>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${status.color}`}>
                    {status.label}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-[#888888]">
                  <Clock className="w-3.5 h-3.5" />
                  {start.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit", hour12: false })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
