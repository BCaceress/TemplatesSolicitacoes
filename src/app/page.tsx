"use client";

import AppNavbar from "@/components/AppNavbar";
import { useUser } from "@/contexts/UserContext";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  name: string;
  role: string;
}

const supportTeam: User[] = [
  { name: "Bruno Fernandes", id: "bruno", role: "Suporte" },
  { name: "Cristiane Lichmann", id: "cristiane", role: "Suporte" },
  { name: "Diego Cordeiro", id: "diegoC", role: "Suporte" },
  { name: "Diego Felipe", id: "diegoF", role: "Suporte" },
  { name: "Marcel Jaques", id: "marcel", role: "Suporte" },
  { name: "Rafael Pinheiro", id: "rafael", role: "Suporte" },
];

const deploymentTeam: User[] = [{ name: "Matheus Pochmann", id: "matheus", role: "Implantacao" }];

export default function Home() {
  const router = useRouter();
  const { setSelectedUser } = useUser();

  const handleUserSelect = (user: User) => {
    setSelectedUser({
      id: user.id,
      name: user.name,
      role: user.role,
    });
    router.push(`/solicitations/${user.id}`);
  };

  return (
    <div className="app-shell">
      <AppNavbar
        title="Central de Solicitacoes"
        subtitle="Escolha seu perfil para abrir chamados de bug ou melhorias."
      />

      <main className="container mx-auto px-4 py-8 md:py-12">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 md:gap-8">
          <aside className="app-card p-6 md:p-7 xl:sticky xl:top-8 xl:h-fit">
            <h2 className="text-xl font-bold text-[#13211f] dark:text-white">Como funciona</h2>
            <p className="mt-3 text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed">
              O fluxo foi pensado para reduzir retrabalho: voce seleciona seu perfil, define o tipo de solicitacao e
              preenche um formulario padronizado para facilitar a analise do time tecnico.
            </p>

            <div className="mt-6 space-y-4">
              <div className="section-card p-4 border-l-4 border-[#0d9b88]">
                <p className="font-semibold text-[#0d9b88]">1. Reportar bugs</p>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                  Informe impacto, urgencia e evidencias para agilizar o diagnostico.
                </p>
              </div>
              <div className="section-card p-4 border-l-4 border-[#2f6f71]">
                <p className="font-semibold text-[#2f6f71]">2. Sugerir melhorias</p>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                  Descreva o processo atual e o beneficio esperado da mudanca.
                </p>
              </div>
            </div>
          </aside>

          <section className="xl:col-span-2 app-card p-6 md:p-8">
            <h2 className="text-2xl font-bold text-[#13211f] dark:text-white">Selecione seu perfil</h2>
            <p className="mt-2 text-sm md:text-base text-gray-600 dark:text-gray-300">Clique no seu nome para continuar.</p>

            <div className="mt-8">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-[#0d9b88]">Equipe de Suporte</h3>
              <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                {supportTeam.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => handleUserSelect(user)}
                    className="interactive-card cursor-pointer w-full p-4 text-left flex items-center gap-3 md:gap-4"
                  >
                    <div className="w-11 h-11 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-[#0d9b88] to-[#0a8574] text-white font-bold flex items-center justify-center">
                      {user.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-[#13211f] dark:text-white truncate">{user.name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{user.role}</p>
                    </div>
                    <span className="text-[#0d9b88] text-xl leading-none" aria-hidden="true">
                      ›
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-8">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-[#2f6f71]">Equipe de Implantacao</h3>
              <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                {deploymentTeam.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => handleUserSelect(user)}
                    className="interactive-card cursor-pointer w-full p-4 text-left flex items-center gap-3 md:gap-4"
                  >
                    <div className="w-11 h-11 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-[#2f6f71] to-[#255d5f] text-white font-bold flex items-center justify-center">
                      {user.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-[#13211f] dark:text-white truncate">{user.name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{user.role}</p>
                    </div>
                    <span className="text-[#2f6f71] text-xl leading-none" aria-hidden="true">
                      ›
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </section>
        </div>

        <footer className="mt-10 md:mt-14 border-t border-[color:var(--border)] pt-6 text-sm text-gray-500 dark:text-gray-400">
          © {new Date().getFullYear()} Colet Sistemas
        </footer>
      </main>
    </div>
  );
}
