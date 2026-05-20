import { connectDB } from "@/lib/db";
import { requireRole } from "@/lib/require-role";
import { findById } from "@/modules/identity/repositories/user.repository";
import { updateProfileAction, changePasswordAction, deleteAccountAction } from "@/server/actions/profile.actions";
import { DataExportButton } from "@/components/shared/data-export-button";
import { Button } from "@/components/ui/button";
import { User, Lock, ShieldAlert, FileJson } from "lucide-react";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<{ status?: string }>;
};

export default async function ProfilePage({ searchParams }: PageProps) {
  const session = await requireRole(["buyer", "organizer", "operator", "admin"]);
  await connectDB();

  const { status } = await searchParams;
  const user = await findById(session.user.id);

  if (!user) {
    return <main className="p-10 text-center text-slate-500">Usuário não encontrado.</main>;
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-2xl px-4 py-10 sm:px-6">
      <div className="mb-8 rounded-3xl border border-slate-200 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-800 p-6 text-white">
        <div className="flex items-center gap-3">
          <User className="h-8 w-8 text-amber-400" />
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-slate-300">Conta</p>
            <h1 className="text-3xl font-bold">Meu perfil</h1>
          </div>
        </div>
      </div>

      {status && (
        <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          {status}
        </div>
      )}

      {/* Profile info */}
      <section className="mb-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <User className="h-5 w-5 text-slate-500" />
          <h2 className="text-lg font-bold text-slate-950">Informações pessoais</h2>
        </div>

        <form action={updateProfileAction} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Nome completo" name="name" defaultValue={user.name} required />
            <Field label="Telefone" name="phone" type="tel" defaultValue={user.phone ?? ""} placeholder="+55 (31) 99999-9999" />
          </div>
          <div className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
            <p><strong>E-mail:</strong> {user.email}</p>
            <p className="mt-1"><strong>Perfil:</strong> <span className="capitalize">{user.role}</span></p>
          </div>
          <Button type="submit">Salvar alterações</Button>
        </form>
      </section>

      {/* Change password */}
      <section className="mb-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <Lock className="h-5 w-5 text-slate-500" />
          <h2 className="text-lg font-bold text-slate-950">Alterar senha</h2>
        </div>

        <form action={changePasswordAction} className="space-y-4">
          <Field label="Senha atual" name="currentPassword" type="password" required />
          <Field label="Nova senha" name="newPassword" type="password" placeholder="Mínimo 8 caracteres" required />
          <Button type="submit" variant="outline">Alterar senha</Button>
        </form>
      </section>

      {/* LGPD */}
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <FileJson className="h-5 w-5 text-slate-500" />
          <h2 className="text-lg font-bold text-slate-950">Seus dados (LGPD)</h2>
        </div>
        <p className="mb-4 text-sm text-slate-600">
          De acordo com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018), você tem direito a acessar, corrigir e
          solicitar a exclusão dos seus dados pessoais.
        </p>
        <div className="flex flex-wrap gap-3">
          <DataExportButton />
        </div>
      </section>

      {/* Delete account */}
      <section className="mt-6 rounded-3xl border border-rose-200 bg-rose-50 p-6">
        <div className="mb-4 flex items-center gap-2">
          <ShieldAlert className="h-5 w-5 text-rose-600" />
          <h2 className="text-lg font-bold text-rose-800">Zona de perigo</h2>
        </div>
        <p className="mb-4 text-sm text-rose-700">
          Excluir sua conta remove permanentemente todos os seus dados, pedidos e ingressos. Esta ação é irreversível.
        </p>
        <form
          action={deleteAccountAction}
          onSubmit={(e) => {
            if (!confirm("Tem certeza? Esta ação não pode ser desfeita.")) {
              e.preventDefault();
            }
          }}
        >
          <Button type="submit" variant="destructive">
            Excluir minha conta
          </Button>
        </form>
      </section>
    </main>
  );
}

function Field({
  label,
  name,
  type = "text",
  defaultValue,
  placeholder,
  required,
}: {
  label: string;
  name: string;
  type?: string;
  defaultValue?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium text-slate-700" htmlFor={name}>
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        defaultValue={defaultValue}
        placeholder={placeholder}
        required={required}
        className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-slate-500"
      />
    </div>
  );
}
