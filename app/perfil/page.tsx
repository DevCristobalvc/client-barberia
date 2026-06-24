"use client";

import { createClient } from "@/lib/supabase/client";
import { Scissors, ArrowLeft, LogOut, User, Phone, Mail } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface UserProfile {
  name: string;
  email: string;
  phone: string;
}

export default function PerfilPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) { router.push("/login"); return; }
      setProfile({
        name:  data.user.user_metadata?.full_name || data.user.email?.split("@")[0] || "Cliente",
        email: data.user.email || "",
        phone: data.user.user_metadata?.phone || "",
      });
      setLoading(false);
    });
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  if (loading) return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
      <div className="w-5 h-5 rounded-full border-2 border-gold border-t-transparent animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0A0A0A] px-5 pt-12 pb-8 max-w-sm mx-auto">
      <Link href="/" className="flex items-center gap-1.5 text-[#888888] hover:text-[#F5F5F5] transition-colors mb-8 w-fit">
        <ArrowLeft className="w-4 h-4" /><span className="text-sm">Volver al chat</span>
      </Link>

      {/* Avatar */}
      <div className="flex flex-col items-center mb-8">
        <div className="w-20 h-20 rounded-full bg-gold/20 border-2 border-gold/40 flex items-center justify-center mb-3">
          <span className="text-3xl font-bold text-gold">{profile?.name[0]}</span>
        </div>
        <h1 className="text-xl font-bold">{profile?.name}</h1>
        <p className="text-sm text-[#888888] mt-0.5">Cliente · BIA Barber Studio</p>
      </div>

      {/* Info */}
      <div className="bg-[#111111] border border-[#2A2A2A] rounded-2xl overflow-hidden mb-4">
        {[
          { icon: <User className="w-4 h-4 text-gold" />,  label: "Nombre",  value: profile?.name },
          { icon: <Mail className="w-4 h-4 text-gold" />,  label: "Correo",  value: profile?.email },
          { icon: <Phone className="w-4 h-4 text-gold" />, label: "Teléfono", value: profile?.phone || "No registrado" },
        ].map(({ icon, label, value }, i) => (
          <div key={i} className={`flex items-center gap-3 px-5 py-4 ${i > 0 ? "border-t border-[#1A1A1A]" : ""}`}>
            <div className="w-8 h-8 rounded-lg bg-gold/10 flex items-center justify-center flex-shrink-0">{icon}</div>
            <div>
              <p className="text-xs text-[#888888]">{label}</p>
              <p className="text-sm font-medium mt-0.5">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Mis citas */}
      <Link href="/mis-citas" className="flex items-center justify-between bg-[#111111] border border-[#2A2A2A] rounded-2xl px-5 py-4 mb-4 hover:border-gold/20 transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gold/10 flex items-center justify-center">
            <Scissors className="w-4 h-4 text-gold" />
          </div>
          <div>
            <p className="text-sm font-medium">Mis citas</p>
            <p className="text-xs text-[#888888]">Historial y próximas</p>
          </div>
        </div>
        <ArrowLeft className="w-4 h-4 text-[#555555] rotate-180" />
      </Link>

      {/* Logout */}
      <button onClick={logout}
        className="flex items-center gap-3 w-full bg-[#111111] border border-[#2A2A2A] rounded-2xl px-5 py-4 hover:border-red-900/40 hover:bg-red-900/5 transition-colors text-left">
        <div className="w-8 h-8 rounded-lg bg-red-900/20 flex items-center justify-center">
          <LogOut className="w-4 h-4 text-red-400" />
        </div>
        <p className="text-sm font-medium text-red-400">Cerrar sesión</p>
      </button>
    </div>
  );
}
