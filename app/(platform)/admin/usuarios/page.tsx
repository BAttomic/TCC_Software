import { connectDB } from "@/lib/db";
import { requireRole } from "@/lib/require-role";
import { createStaffUserAction, deleteStaffUserAction, updateStaffUserAction } from "@/server/actions/users.actions";
import { findAllUsers } from "@/modules/identity/repositories/user.repository";

export const dynamic = "force-dynamic";

type AdminUsersPageProps = {
  searchParams: Promise<{
    status?: string;
  }>;
};

const roleOptions = ["buyer", "organizer", "operator", "admin"] as const;

export default async function AdminUsersPage({ searchParams }: AdminUsersPageProps) {
  await requireRole("admin");
  await connectDB();

  const params = await searchParams;
  const users = await findAllUsers();

  return (
    <main className="mx-auto min-h-screen w-full max-w-[96rem] px-4 py-10 sm:px-6">
      <div className="mb-8 rounded-3xl border border-slate-200 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-800 p-6 text-white shadow-xl">
        <p className="text-sm uppercase tracking-[0.25em] text-slate-300">Administração</p>
        <h1 className="mt-2 text-3xl font-bold">Funcionários e acessos</h1>
        <p className="mt-2 max-w-3xl text-slate-300">
          Cadastre e atualize contas de operadores, organizadores e administradores para check-in, entrada gratuita e outras rotinas do sistema.
        </p>
      </div>

      {params.status ? (
        <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          {params.status}
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-bold text-slate-950">Novo funcionário</h2>
          <p className="mt-1 text-sm text-slate-600">Cria uma conta com permissão adequada para uso interno.</p>

          <form action={createStaffUserAction} className="mt-6 space-y-4">
            <Field label="Nome" name="name" placeholder="Nome completo" />
            <Field label="E-mail" name="email" type="email" placeholder="funcionario@ticketflow.com" />
            <Field label="Senha temporária" name="password" type="password" placeholder="Senha inicial" />
            <div className="space-y-1">
              <label className="text-sm font-medium" htmlFor="role">
                Perfil
              </label>
              <select id="role" name="role" className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm">
                {roleOptions.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </div>

            <button className="h-11 w-full rounded-xl bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800" type="submit">
              Criar funcionário
            </button>
          </form>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-bold text-slate-950">Contas existentes</h2>
          <div className="mt-4 space-y-4">
            {users.map((user) => (
              <article key={user._id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <form action={updateStaffUserAction.bind(null, user._id)} className="space-y-3">
                  <div className="grid gap-3 md:grid-cols-2">
                    <Field label="Nome" name="name" defaultValue={user.name} />
                    <Field label="E-mail" name="email" type="email" defaultValue={user.email} />
                  </div>

                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="space-y-1">
                      <label className="text-sm font-medium" htmlFor={`role-${user._id}`}>
                        Perfil
                      </label>
                      <select id={`role-${user._id}`} name="role" defaultValue={user.role} className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm">
                        {roleOptions.map((role) => (
                          <option key={role} value={role}>
                            {role}
                          </option>
                        ))}
                      </select>
                    </div>
                    <Field label="Nova senha" name="password" type="password" placeholder="Deixe em branco se nao alterar" />
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <button className="rounded-xl bg-amber-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-amber-300" type="submit">
                      Salvar alterações
                    </button>
                  </div>
                </form>

                <form action={deleteStaffUserAction.bind(null, user._id)} className="mt-3">
                  <button className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-100" type="submit">
                    Excluir conta
                  </button>
                </form>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

function Field({
  label,
  name,
  type = "text",
  defaultValue,
  placeholder,
}: {
  label: string;
  name: string;
  type?: string;
  defaultValue?: string;
  placeholder?: string;
}) {
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium" htmlFor={name}>
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-slate-500"
      />
    </div>
  );
}