"use client";
import { useUser } from "@/contexts/UserContext";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const { setSelectedUser } = useUser();

  const supportTeam = [
    { name: "Bruno Fernandes", id: "bruno", role: "Equipe de Suporte" },
    { name: "Cristiane Lichmann", id: "cristiane", role: "Equipe de Suporte" },
    { name: "Diego Cordeiro", id: "diegoC", role: "Equipe de Suporte" },
    { name: "Diego Felipe", id: "diegoF", role: "Equipe de Suporte" },
    { name: "Marcel Jaques", id: "marcel", role: "Equipe de Suporte" },
    { name: "Thiago Simon", id: "thiago", role: "Equipe de Suporte" },
  ];

  const analystTeam = [
    { name: "Cristiano Huhnfleisch", id: "cristiano", role: "Equipe de Implantação" },
    { name: "Matheus Pochmann", id: "matheus", role: "Equipe de Implantação" },
  ];

  const handleUserSelect = (user) => {
    setSelectedUser({
      id: user.id,
      name: user.name,
      role: user.role
    });
    router.push(`/solicitations/${user.id}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-[#3A3A3A] dark:to-[#333333]">
      {/* Header with Colet Sistemas colors and subtle pattern */}
      <div className="bg-gradient-to-r from-[#09A08D] to-[#3C787A] text-white py-8 shadow-lg relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
        <div className="container mx-auto px-4 relative z-10">
          <h1 className="text-4xl font-bold mb-2 text-center">
            Colet Sistemas -  Templates para Solicitações
          </h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Left Column - Information */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white dark:bg-[#2A2A2A] rounded-xl shadow-xl p-8 border-t-4 border-[#09A08D] backdrop-blur-sm bg-opacity-90 dark:bg-opacity-90">
              <h2 className="text-2xl font-bold mb-6 text-[#3A3A3A] dark:text-white border-b border-gray-200 dark:border-gray-700 pb-3">
                Como funciona
              </h2>

              <div className="space-y-6">
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  Este portal foi criado para centralizar todas as solicitações relacionadas aos sistemas da Colet, garantindo um processo de atendimento mais ágil e padronizado.
                </p>

                <div className="grid grid-cols-1 gap-6 mt-6">
                  <div className="bg-gray-50 dark:bg-[#3A3A3A] p-6 rounded-lg border-l-4 border-[#09A08D] hover:bg-gradient-to-br hover:from-white hover:to-gray-50 dark:hover:from-[#3A3A3A] dark:hover:to-[#333333]">
                    <div className="bg-[#09A08D]/10 dark:bg-[#09A08D]/20 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#09A08D]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </div>
                    <h3 className="font-semibold text-lg text-[#09A08D] dark:text-[#09A08D] mb-3">
                      Reportar Problemas
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">
                      Reporte bugs e falhas técnicas encontradas nos sistemas da Colet de forma estruturada e eficiente.
                    </p>
                  </div>

                  <div className="bg-gray-50 dark:bg-[#3A3A3A] p-6 rounded-lg border-l-4 border-[#3C787A] hover:bg-gradient-to-br hover:from-white hover:to-gray-50 dark:hover:from-[#3A3A3A] dark:hover:to-[#333333]">
                    <div className="bg-[#3C787A]/10 dark:bg-[#3C787A]/20 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#3C787A]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <h3 className="font-semibold text-lg text-[#3C787A] dark:text-[#3C787A] mb-3">
                      Sugerir Melhorias
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">
                      Proponha aprimoramentos e funcionalidades para nossos sistemas, contribuindo para a evolução das soluções.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - User Selection */}
          <div className="lg:col-span-2 bg-white dark:bg-[#2A2A2A] rounded-xl shadow-xl backdrop-blur-sm bg-opacity-90 dark:bg-opacity-90">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-white dark:from-[#2A2A2A] dark:to-[#333333] rounded-t-xl">
              <h2 className="text-2xl font-bold text-[#3A3A3A] dark:text-white">
                Selecione seu Perfil
              </h2>
            </div>

            <div className="p-8">
              <div className="mb-10">
                <h3 className="text-lg font-bold mb-5 text-[#3A3A3A] dark:text-white flex items-center">
                  <span className="inline-block w-4 h-4 bg-[#09A08D] rounded-full mr-3"></span>
                  Equipe de Suporte
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {supportTeam.map((user) => (
                    <div key={user.id}>
                      <button
                        onClick={() => handleUserSelect(user)}
                        className="w-full flex items-center p-4 bg-white dark:bg-[#343434] rounded-lg hover:bg-[#09A08D]/5 dark:hover:bg-[#09A08D]/10 transition-all duration-300 border border-gray-200 dark:border-gray-700 group hover:shadow-md relative"
                      >
                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#09A08D] to-[#0B8A7B] flex items-center justify-center text-white font-bold mr-4 shadow-md group-hover:shadow-lg transition-all duration-300">
                          {user.name.charAt(0)}
                        </div>
                        <div className="text-left flex-1">
                          <span className="font-medium text-[#3A3A3A] dark:text-white text-lg block">{user.name}</span>
                          <span className="text-sm text-gray-500 dark:text-gray-400">{user.role}</span>
                        </div>
                        <div className="text-gray-400 group-hover:text-[#09A08D] transition-colors duration-300">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold mb-5 text-[#3A3A3A] dark:text-white flex items-center">
                  <span className="inline-block w-4 h-4 bg-[#3C787A] rounded-full mr-3"></span>
                  Equipe de Implantação
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {analystTeam.map((user) => (
                    <div key={user.id}>
                      <button
                        onClick={() => handleUserSelect(user)}
                        className="w-full flex items-center p-4 bg-white dark:bg-[#343434] rounded-lg hover:bg-[#3C787A]/5 dark:hover:bg-[#3C787A]/10 transition-all duration-300 border border-gray-200 dark:border-gray-700 group hover:shadow-md relative"
                      >
                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#3C787A] to-[#346B6D] flex items-center justify-center text-white font-bold mr-4 shadow-md group-hover:shadow-lg transition-all duration-300">
                          {user.name.charAt(0)}
                        </div>
                        <div className="text-left flex-1">
                          <span className="font-medium text-[#3A3A3A] dark:text-white text-lg block">{user.name}</span>
                          <span className="text-sm text-gray-500 dark:text-gray-400">{user.role}</span>
                        </div>
                        <div className="text-gray-400 group-hover:text-[#3C787A] transition-colors duration-300">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <footer className="mt-16 border-t border-gray-200 dark:border-gray-700 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-[#09A08D] font-bold text-xl mb-4 md:mb-0">
              Colet Sistemas
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              © {new Date().getFullYear()} | Todos os direitos reservados
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
