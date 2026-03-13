"use client";

import AppNavbar from "@/components/AppNavbar";
import { useUser } from "@/contexts/UserContext";
import BugReportOutlinedIcon from "@mui/icons-material/BugReportOutlined";
import LightbulbOutlinedIcon from "@mui/icons-material/LightbulbOutlined";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function SolicitationTypePage() {
  const { userId } = useParams();
  const [userName, setUserName] = useState("Carregando...");
  const [userRole, setUserRole] = useState("");
  const { selectedUser } = useUser();

  useEffect(() => {
    if (selectedUser && selectedUser.id === userId) {
      setUserName(selectedUser.name);
      setUserRole(selectedUser.role);
      return;
    }

    const supportTeam = [
      { name: "Bruno Fernandes", id: "bruno", role: "Suporte" },
      { name: "Cristiane Lichmann", id: "cristiane", role: "Suporte" },
      { name: "Diego Cordeiro", id: "diegoC", role: "Suporte" },
      { name: "Diego Felipe", id: "diegoF", role: "Suporte" },
      { name: "Marcel Jaques", id: "marcel", role: "Suporte" },
      { name: "Rafael Pinheiro", id: "rafael", role: "Suporte" },
    ];

    const deploymentTeam = [{ name: "Matheus Pochmann", id: "matheus", role: "Implantacao" }];
    const user = [...supportTeam, ...deploymentTeam].find((entry) => entry.id === userId);

    if (user) {
      setUserName(user.name);
      setUserRole(user.role);
    } else {
      setUserName("Usuario Desconhecido");
      setUserRole("Perfil nao identificado");
    }
  }, [userId, selectedUser]);

  const requestTypes = [
    {
      id: "bugs",
      title: "Reportar Bugs",
      description: "Comunique falhas tecnicas com impacto, urgencia e evidencias.",
      color: "#0d9b88",
      icon: <BugReportOutlinedIcon style={{ color: "white", fontSize: 24 }} />,
    },
    {
      id: "improvements",
      title: "Sugerir Melhorias",
      description: "Registre oportunidades de evolucao com contexto e beneficio esperado.",
      color: "#2f6f71",
      icon: <LightbulbOutlinedIcon style={{ color: "white", fontSize: 24 }} />,
    },
  ];

  return (
    <div className="app-shell">
      <AppNavbar title="Nova Solicitacao" subtitle={`${userName}${userRole ? ` (${userRole})` : ""}`} backHref="/" />

      <main className="container mx-auto px-4 py-8 md:py-10">
        <div className="max-w-5xl mx-auto">
          <section className="app-card mt-2 p-6 md:p-8">
            <h2 className="text-2xl font-bold text-[#13211f] dark:text-white">Escolha o tipo de solicitacao</h2>
            <p className="mt-2 text-sm md:text-base text-gray-600 dark:text-gray-300">
              Selecione uma categoria para abrir o formulario correspondente.
            </p>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
              {requestTypes.map((type) => (
                <Link
                  key={type.id}
                  href={`/solicitations/${userId}/${type.id}`}
                  className="interactive-card h-full p-5 md:p-6 flex items-start gap-4"
                  style={{ borderLeft: `5px solid ${type.color}` }}
                >
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center shadow-sm shrink-0"
                    style={{ backgroundColor: type.color }}
                  >
                    {type.icon}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-lg md:text-xl font-bold" style={{ color: type.color }}>
                      {type.title}
                    </h3>
                    <p className="mt-1 text-sm md:text-base text-gray-600 dark:text-gray-300">{type.description}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
