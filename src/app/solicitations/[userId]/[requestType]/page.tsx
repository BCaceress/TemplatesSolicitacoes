"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";

export default function SolicitationTypeBridgePage() {
    const { userId, requestType } = useParams();
    const router = useRouter();

    useEffect(() => {
        // Redirect to the form page
        router.push(`/solicitations/${userId}/${requestType}/form`);
    }, [userId, requestType, router]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#2A2A2A]">
            <div className="text-center">
                <div className="inline-block animate-spin h-8 w-8 border-4 border-t-[#09A08D] border-r-[#09A08D] border-b-transparent border-l-transparent rounded-full"></div>
                <p className="mt-4 text-gray-600 dark:text-gray-300">Redirecionando para o formulário...</p>
            </div>
        </div>
    );
}
