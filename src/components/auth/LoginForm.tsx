"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/lib/supabase/client";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(3, "A senha deve ter pelo menos 3 caracteres"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginForm() {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    setErrorMessage("");

    console.log("📥 Dados recebidos do formulário:", data);

    try {
      const { data: userData, error } = await supabase
        .from("users")
        .select("id, is_master, organization_id")
        .eq("email", data.email)
        .eq("password", data.password)
        .maybeSingle();

      if (error) {
        console.error("❌ Erro ao buscar usuário na tabela 'users':", error.message);
        throw new Error("Erro no servidor. Tente novamente.");
      }

      console.log("✅ Resultado da consulta de usuário:", userData);

      if (!userData) {
        console.warn("⚠️ Nenhum usuário encontrado com os dados fornecidos.");
        throw new Error("Email ou senha inválidos");
      }

      // Redirecionamento condicional
      if (userData.is_master) {
        console.log("🔁 Redirecionando para /admin/master");
        router.push("/admin/master");
        return;
      }

      if (userData.organization_id) {
        const { data: orgData, error: orgError } = await supabase
          .from("organizations")
          .select("slug")
          .eq("id", userData.organization_id)
          .single();

        if (orgError) {
          console.error("❌ Erro ao buscar organização:", orgError.message);
          throw new Error("Organização não encontrada");
        }

        if (!orgData?.slug) {
          console.warn("⚠️ Organização encontrada mas sem 'slug'");
          throw new Error("Organização inválida");
        }

        console.log(`🔁 Redirecionando para /admin/${orgData.slug}`);
        router.push(`/admin/${orgData.slug}`);
        return;
      }

      console.warn("⚠️ Usuário autenticado, mas sem is_master nem organização_id");
      router.push("/");
    } catch (error: any) {
      console.error("❌ Erro geral no login:", error);
      setErrorMessage(error.message || "Erro ao fazer login");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        id="email"
        label="Email"
        type="email"
        placeholder="seu@email.com"
        {...register("email")}
        error={errors.email?.message}
        required
      />

      <Input
        id="password"
        label="Senha"
        type="password"
        placeholder="******"
        {...register("password")}
        error={errors.password?.message}
        required
      />

      {errorMessage && (
        <div className="p-3 bg-red-100 text-red-700 rounded-md">
          {errorMessage}
        </div>
      )}

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? "Entrando..." : "Entrar"}
      </Button>
    </form>
  );
}
