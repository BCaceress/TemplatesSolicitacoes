"use client";

import { useUser } from "@/contexts/UserContext";
import BugReportOutlinedIcon from '@mui/icons-material/BugReportOutlined';
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined';
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function SolicitationTypePage() {
    const { userId } = useParams();
    const [userName, setUserName] = useState("Carregando...");
    const [userRole, setUserRole] = useState("");
    const { selectedUser } = useUser();

    useEffect(() => {
        // If we have the user in context, use it
        if (selectedUser && selectedUser.id === userId) {
            setUserName(selectedUser.name);
            setUserRole(selectedUser.role);
            return;
        }

        // Otherwise, fetch the user data or use a fallback
        const fetchUserName = async () => {
            try {
                // Replace this with your actual API call
                // For now, using some simple mapping
                const supportTeam = [
                    { name: "Cristiane", id: "cristiane", role: "Equipe de Suporte" },
                    { name: "Bruno", id: "bruno", role: "Equipe de Suporte" },
                    { name: "Diego", id: "diego", role: "Equipe de Suporte" },
                    { name: "Thiago", id: "thiago", role: "Equipe de Suporte" },
                ];

                const analystTeam = [
                    { name: "Matheus", id: "matheus", role: "Equipe de Análise" },
                    { name: "Cristiano", id: "cristiano", role: "Equipe de Análise" },
                ];

                const allUsers = [...supportTeam, ...analystTeam];
                const user = allUsers.find(u => u.id === userId);

                if (user) {
                    setUserName(user.name);
                    setUserRole(user.role);
                } else {
                    setUserName("Usuário Desconhecido");
                    setUserRole("Perfil não identificado");
                }

            } catch (error) {
                console.error("Error fetching user data:", error);
                setUserName("Usuário");
                setUserRole("Perfil não identificado");
            }
        };

        fetchUserName();
    }, [userId, selectedUser]);

    const requestTypes = [
        {
            id: "bugs",
            title: "Reportar Bugs",
            description: "Reportar problemas e falhas técnicas nos sistemas",
            color: "#09A08D",
            icon: <BugReportOutlinedIcon style={{ color: 'white', fontSize: 24 }} />
        },
        {
            id: "improvements",
            title: "Reportar Melhorias",
            description: "Propor aprimoramentos e novas funcionalidades",
            color: "#3C787A",
            icon: <LightbulbOutlinedIcon style={{ color: 'white', fontSize: 24 }} />
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#2A2A2A]">
            {/* Header with Colet Sistemas colors */}
            <div className="bg-gradient-to-r from-[#09A08D] to-[#3C787A] text-white py-8 shadow-lg">
                <div className="container mx-auto px-4">
                    <h1 className="text-3xl font-bold text-center">
                        Nova Solicitação
                    </h1>
                    <p className="text-center text-white/90 mt-2 text-lg">
                        Perfil selecionado: <span className="font-semibold">{userName}</span>
                        {userRole && <span className="text-white/70 ml-2">({userRole})</span>}
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-4 py-10">
                <div className="max-w-4xl mx-auto">
                    <Link
                        href="/"
                        className="inline-flex items-center px-4 py-2 rounded-md bg-white dark:bg-[#3A3A3A] shadow-sm text-[#09A08D] hover:bg-gray-50 dark:hover:bg-[#444] transition-all mb-8 border border-gray-100 dark:border-gray-700"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Voltar para seleção de usuário
                    </Link>

                    <div className="bg-white dark:bg-[#2A2A2A] rounded-xl shadow-lg p-8 border border-gray-100 dark:border-gray-700">
                        <h2 className="text-2xl font-bold mb-8 text-[#3A3A3A] dark:text-white text-center">
                            Selecione o tipo de solicitação
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {requestTypes.map((type) => (
                                <div key={type.id}>
                                    <Link
                                        href={`/solicitations/${userId}/${type.id}`}
                                        className="flex items-start p-6 bg-white dark:bg-[#333] rounded-xl hover:shadow-md transition-all duration-300 border border-gray-100 dark:border-gray-600 h-full group"
                                        style={{
                                            borderLeft: `5px solid ${type.color}`,
                                        }}
                                    >
                                        <div
                                            className="flex-shrink-0 w-14 h-14 rounded-lg flex items-center justify-center mr-5 shadow-sm"
                                            style={{ backgroundColor: type.color }}
                                        >
                                            {type.icon}
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-bold text-xl mb-2" style={{ color: type.color }}>
                                                {type.title}
                                            </h3>
                                            <p className="text-gray-600 dark:text-gray-300">
                                                {type.description}
                                            </p>
                                        </div>
                                    </Link>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
