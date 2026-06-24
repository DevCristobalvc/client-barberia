"use client";

import { createClient } from "@/lib/supabase/client";
import { Scissors, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError("Credenciales incorrectas. Verifica tu email y contraseña.");
      setLoading(false);
    } else {
      router.push(next);
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col px-5 pt-12 pb-8 max-w-sm mx-auto">
      <Link href="/" className="flex items-center gap-1.5 text-[#888888] hover:text-[#F5F5F5] transition-colors mb-10 w-fit">
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm">Volver</span>
      </Link>

      <div className="flex items-center gap-2.5 mb-8">
        <div className="w-9 h-9 bg-gold rounded-xl flex items-center justify-center">
          <Scissors className="w-4.5 h-4.5 text-[#0A0A0A]" />
        </div>
        <span className="text-xl font-semibold">BarberIA</span>
      </div>

      <h1 className="text-2xl font-bold mb-1">Bienvenido</h1>
      <p className="text-[#888888] text-sm mb-8">Inicia sesión para gestionar tus citas.</p>

      <form onSubmit={handleLogin} className="space-y-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm text-[#CCCCCC] font-medium">Correo electrónico</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@email.com"
            required
            className="bg-[#161616] border border-[#383838] rounded-xl px-4 py-3 text-sm text-[#F5F5F5] placeholder:text-[#555555] focus:outline-none focus:border-gold/50 transition-colors"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm text-[#CCCCCC] font-medium">Contraseña</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            className="bg-[#161616] border border-[#383838] rounded-xl px-4 py-3 text-sm text-[#F5F5F5] placeholder:text-[#555555] focus:outline-none focus:border-gold/50 transition-colors"
          />
        </div>

        {error && (
          <p className="text-sm text-red-300 bg-red-900/20 border border-red-700/40 rounded-xl px-4 py-3">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 bg-gold text-[#0A0A0A] font-bold rounded-xl text-sm hover:bg-gold-light transition-all active:scale-[0.98] disabled:opacity-50 mt-2"
        >
          {loading ? "Ingresando..." : "Ingresar"}
        </button>
      </form>

      <p className="text-center text-sm text-[#666666] mt-6">
        ¿No tienes cuenta?{" "}
        <Link href="/register" className="text-gold hover:text-gold-light transition-colors">
          Regístrate
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
