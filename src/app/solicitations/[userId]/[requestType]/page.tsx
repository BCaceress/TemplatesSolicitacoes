"use client";

import AppNavbar from "@/components/AppNavbar";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";

export default function SolicitationTypeBridgePage() {
  const params = useParams();
  const userId = params.userId as string;
  const requestType = params.requestType as string;
  const router = useRouter();

  useEffect(() => {
    if (!userId || !requestType) {
      router.push("/solicitations");
      return;
    }

    const validRequestTypes = ["bugs", "improvements"];
    if (!validRequestTypes.includes(requestType)) {
      router.push(`/solicitations/${userId}`);
      return;
    }

    router.push(`/solicitations/${userId}/${requestType}/form`);
  }, [userId, requestType, router]);

  return (
    <div className="app-shell">
      <AppNavbar title="Nova Solicitacao" subtitle="Preparando formulario..." backHref={`/solicitations/${userId}`} />
      <div className="flex items-center justify-center p-4 min-h-[calc(100vh-88px)] md:min-h-[calc(100vh-104px)]">
        <div className="app-card p-8 text-center max-w-sm w-full">
          <div className="inline-block animate-spin h-9 w-9 border-4 border-t-[#0d9b88] border-r-[#0d9b88] border-b-transparent border-l-transparent rounded-full" />
          <p className="mt-4 text-gray-700 dark:text-gray-200">Redirecionando para o formulario...</p>
        </div>
      </div>
    </div>
  );
}
