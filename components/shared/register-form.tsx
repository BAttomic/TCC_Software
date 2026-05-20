"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { registerUser } from "@/server/actions/auth.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const FormSchema = z.object({
  name: z.string().min(2, "Informe seu nome"),
  email: z.string().email("Informe um e-mail valido"),
  password: z.string().min(8, "A senha deve ter no minimo 8 caracteres"),
});

type FormInput = z.infer<typeof FormSchema>;

export function RegisterForm() {
  const router = useRouter();
  const form = useForm<FormInput>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    const result = await registerUser({ ...values, role: "buyer" });

    if (!result.ok) {
      toast.error(result.message);
      return;
    }

    toast.success(result.message);
    router.push("/login");
  });

  return (
    <Card className="w-full max-w-md border-slate-200/70 bg-white/80 backdrop-blur">
      <CardHeader>
        <CardTitle>Criar conta</CardTitle>
        <CardDescription>Cadastre-se para comprar ingressos em segundos.</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={onSubmit}>
          <div className="space-y-1">
            <label className="text-sm font-medium" htmlFor="name">
              Nome completo
            </label>
            <Input id="name" autoComplete="name" {...form.register("name")} />
            {form.formState.errors.name ? (
              <p className="text-xs text-red-600">{form.formState.errors.name.message}</p>
            ) : null}
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium" htmlFor="email">
              E-mail
            </label>
            <Input id="email" type="email" autoComplete="email" {...form.register("email")} />
            {form.formState.errors.email ? (
              <p className="text-xs text-red-600">{form.formState.errors.email.message}</p>
            ) : null}
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium" htmlFor="password">
              Senha
            </label>
            <Input id="password" type="password" autoComplete="new-password" {...form.register("password")} />
            {form.formState.errors.password ? (
              <p className="text-xs text-red-600">{form.formState.errors.password.message}</p>
            ) : null}
          </div>

          <Button className="w-full" disabled={form.formState.isSubmitting} type="submit">
            {form.formState.isSubmitting ? "Criando conta..." : "Criar conta"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
