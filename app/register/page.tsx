"use client";

import { createClient } from "@/lib/supabase/client";
import { Scissors, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const handle = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error: signUpError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: { full_name: form.name, phone: form.phone },
      },
    });

    if (signUpError) {
      setError(signUpError.message === "User already registered"
        ? "Ya existe una cuenta con ese correo."
        : signUpError.message);
      setLoading(false);
    } else {
      router.push("/?registered=1");
    }
  };

  const f = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((p) => ({ ...p, [k]: e.target.value }));

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col px-5 pt-12 pb-8 max-w-sm mx-auto">
      <Link href="/" className="flex items-center gap-1.5 text-[#888888] hover:text-[#F5F5F5] transition-colors mb-10 w-fit">
        <ArrowLeft className="w-4 h-4" /><span className="text-sm">Volver</span>
      </Link>

      <div className="flex items-center gap-2.5 mb-8">
        <div className="w-9 h-9 bg-gold rounded-xl flex items-center justify-center">
          <Scissors className="w-4 h-4 text-[#0A0A0A]" />
        </div>
        <span className="text-xl font-semibold">BIA Barber Studio</span>
      </div>

      <h1 className="text-2xl font-bold mb-1">Crear cuenta</h1>
      <p className="text-[#888888] text-sm mb-8">Regístrate para gestionar tus citas.</p>

      <form onSubmit={handle} className="space-y-4">
        {[
          { label: "Nombre completo", key: "name",     type: "text",     placeholder: "Tu nombre" },
          { label: "Correo",          key: "email",    type: "email",    placeholder: "tu@email.com" },
          { label: "Teléfono",        key: "phone",    type: "tel",      placeholder: "+57 300 000 0000" },
          { label: "Contraseña",      key: "password", type: "password", placeholder: "Mínimo 6 caracteres" },
        ].map(({ label, key, type, placeholder }) => (
          <div key={key} className="flex flex-col gap-1.5">
            <label className="text-sm text-[#CCCCCC] font-medium">{label}</label>
            <input
              type={type}
              value={form[key as keyof typeof form]}
              onChange={f(key as keyof typeof form)}
              placeholder={placeholder}
              required
              minLength={key === "password" ? 6 : undefined}
              className="bg-[#161616] border border-[#383838] rounded-xl px-4 py-3 text-base text-[#F5F5F5] placeholder:text-[#555555] focus:outline-none focus:border-gold/50 transition-colors"
            />
          </div>
        ))}

        {error && (
          <p className="text-sm text-red-300 bg-red-900/20 border border-red-700/40 rounded-xl px-4 py-3">{error}</p>
        )}

        <button type="submit" disabled={loading}
          className="w-full py-3.5 bg-gold text-[#0A0A0A] font-bold rounded-xl text-sm hover:bg-gold-light transition-all active:scale-[0.98] disabled:opacity-50 mt-2">
          {loading ? "Creando cuenta..." : "Crear cuenta"}
        </button>
      </form>

      <p className="text-center text-sm text-[#666666] mt-6">
        ¿Ya tienes cuenta?{" "}
        <Link href="/login" className="text-gold hover:text-gold-light transition-colors">Inicia sesión</Link>
      </p>
    </div>
  );
}
