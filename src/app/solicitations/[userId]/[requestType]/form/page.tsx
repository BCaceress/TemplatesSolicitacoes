"use client";

import { severityTooltip, tendencyTooltip, urgencyTooltip } from "@/components/SeverityTooltips";
import { useUser } from "@/contexts/UserContext";
import { clientDatabases } from "@/utils/clientDatabases";
import { generateSolicitationPDF } from "@/utils/pdfGenerator";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import BugReportOutlinedIcon from "@mui/icons-material/BugReportOutlined";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import LightbulbOutlinedIcon from "@mui/icons-material/LightbulbOutlined";
import Tooltip from "@mui/material/Tooltip";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import PropTypes from "prop-types";
import { ChangeEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";

// Define interface for form data to avoid type issues
interface FormData {
    title: string;
    details: string;
    criticality: string;
    attachments: File[];
    incidentDate: string;
    impact: string;
    affectsOthers: string;
    frequency: string;
    erpModule: string;
    moduleVersion: string;
    programCodes: string;
    affectedEstablishment: string;
    selectedDatabase: string;
    operatingSystem: string;
    benefitDescription: string;
    businessJustification: string;
    futureProcedure: string;
    operationalImpact: string;
    screenName: string; // Add the missing screenName property
    [key: string]: string | File[] | number; // Index signature to allow dynamic access
}

// Initial form state to avoid repetition
const initialFormState: FormData = {
    title: "",
    details: "",
    criticality: "",
    attachments: [],
    // Incident details
    incidentDate: new Date().toISOString().slice(0, 16),
    impact: "",
    affectsOthers: "no",
    frequency: "",
    // Technical information
    erpModule: "",
    moduleVersion: "",
    programCodes: "",
    affectedEstablishment: "",
    selectedDatabase: "",
    operatingSystem: "Windows 11",
    // Improvement specific fields
    benefitDescription: "",
    businessJustification: "",
    futureProcedure: "",  // New field for future process
    operationalImpact: "", // New field for operational impact
    screenName: "" // Initialize the missing screenName property
};

export default function SolicitationFormPage() {
    const { userId, requestType } = useParams();
    const router = useRouter();
    const [userName, setUserName] = useState("Carregando...");
    const [userRole, setUserRole] = useState("");
    const { selectedUser } = useUser();

    const [formData, setFormData] = useState<FormData>(initialFormState);
    const [availableDatabases, setAvailableDatabases] = useState<string[]>([]);
    const inputRefs = useRef<Record<string, HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | null>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [showSuccessMessage, setShowSuccessMessage] = useState(false);

    // Get request type details - memoized to prevent recreation on every render
    const requestTypes = useMemo(() => ({
        bugs: {
            title: "Reportar Bug",
            description: "Reporte problemas e falhas técnicas nos sistemas",
            color: "#09A08D",
            icon: <BugReportOutlinedIcon style={{ color: "white", fontSize: 24 }} />
        },
        improvements: {
            title: "Sugerir Melhoria",
            description: "Proponha aprimoramentos e novas funcionalidades",
            color: "#3C787A",
            icon: <LightbulbOutlinedIcon style={{ color: "white", fontSize: 24 }} />
        }
    }), []);

    const isImprovementRequest = requestType === "improvements";
    const currentRequestType = typeof requestType === 'string' ? requestTypes[requestType as keyof typeof requestTypes] : null;

    useEffect(() => {
        // If we have the user in context, use it
        if (selectedUser && selectedUser.id === userId) {
            setUserName(selectedUser.name);
            setUserRole(selectedUser.role);
            return;
        }

        // Otherwise, fetch the user data
        const fetchUserName = async () => {
            try {
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

    // Modified input handler that preserves focus and updates available databases
    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        const activeElement = document.activeElement as HTMLElement;
        const activeElementName = activeElement.getAttribute('name');

        setFormData(prevData => ({
            ...prevData,
            [name]: value
        }));

        // Update available databases when the client changes
        if (name === 'affectedEstablishment') {
            const databases = clientDatabases[value as keyof typeof clientDatabases] || [];
            setAvailableDatabases(databases);

            // Auto-select the only database if there's just one option
            if (databases.length === 1) {
                setFormData(prevData => ({
                    ...prevData,
                    selectedDatabase: databases[0]
                }));
            } else {
                // Clear the selected database if there are multiple options
                setFormData(prevData => ({
                    ...prevData,
                    selectedDatabase: ""
                }));
            }
        }

        // Restore focus after state update
        setTimeout(() => {
            if (activeElementName && inputRefs.current[activeElementName]) {
                inputRefs.current[activeElementName]?.focus();
            }
        }, 0);
    }, []);

    // Add a specific handler for textarea to avoid the reverse typing issue
    const handleTextareaChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        const element = e.target;
        const selectionStart = element.selectionStart;

        setFormData(prevData => ({
            ...prevData,
            [name]: value
        }));

        // Properly restore cursor position for textarea
        requestAnimationFrame(() => {
            if (inputRefs.current[name]) {
                const textareaRef = inputRefs.current[name] as HTMLTextAreaElement;
                textareaRef.focus();
                textareaRef.selectionStart = selectionStart;
                textareaRef.selectionEnd = selectionStart;
            }
        });
    }, []);

    const handleFileChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return;

        const files = Array.from(e.target.files);
        setFormData(prevData => ({
            ...prevData,
            attachments: [...prevData.attachments, ...files]
        }));
    }, []);

    const removeAttachment = useCallback((index: number) => {
        setFormData(prevData => {
            const updatedAttachments = [...prevData.attachments];
            updatedAttachments.splice(index, 1);
            return {
                ...prevData,
                attachments: updatedAttachments
            };
        });
    }, []);

    // Form validation - memoized
    const validateForm = useCallback(() => {
        const newErrors: Record<string, string> = {};
        const requiredFields = [
            { field: "title", message: "Título é obrigatório" },
            { field: "details", message: "Detalhes são obrigatórios" },
            { field: "incidentDate", message: "Data e hora são obrigatórios" },
            { field: "impact", message: "Gravidade é obrigatória" },
            { field: "criticality", message: "Urgência é obrigatória" },
            { field: "frequency", message: "Tendência é obrigatória" },
            { field: "affectedEstablishment", message: "Cliente afetado é obrigatório" },
            { field: "selectedDatabase", message: "Banco de dados é obrigatório" },
        ];

        // Add conditional required fields based on request type
        if (requestType === "bugs") {
            requiredFields.push(
                { field: "erpModule", message: "Módulo do ERP afetado é obrigatório" }
            );
        } else if (requestType === "improvements") {
            requiredFields.push(
                { field: "benefitDescription", message: "Descrição do benefício é obrigatória" }
            );
        }

        // Check each required field
        requiredFields.forEach(({ field, message }) => {
            const value = formData[field];
            if (value === undefined || (typeof value === "string" && !value.trim())) {
                newErrors[field] = message;
            }
        });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [formData, requestType]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            // Scroll to first error
            const firstErrorField = Object.keys(errors)[0];
            if (firstErrorField) {
                document.getElementById(firstErrorField)?.scrollIntoView({ behavior: "smooth", block: "center" });
            }
            return;
        }

        setIsSubmitting(true);

        try {
            // Generate PDF with form data using the utility function
            await generateSolicitationPDF(
                formData,
                userName,
                userRole,
                currentRequestType
            );

            // Here you would submit the data to your API
            // For now, we'll just simulate a submission
            await new Promise(resolve => setTimeout(resolve, 1000));

            console.log("Form submitted:", {
                userId,
                requestType,
                userName,
                userRole,
                ...formData
            });

            // Show success message
            setShowSuccessMessage(true);

            // Redirect after short delay (better UX than immediate redirect)
            setTimeout(() => {
                router.push(`/solicitations/${userId}`);
            }, 2000);
        } catch (error) {
            console.error("Error submitting form:", error);
            alert("Erro ao enviar o formulário. Tente novamente.");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Form field component for less repetition and consistent styling
    const FormField = ({
        id,
        label,
        type = "text",
        required = false,
        tooltip = null,
        children = null,
        placeholder = ""
    }: {
        id: string;
        label: string;
        type?: string;
        required?: boolean;
        tooltip?: React.ReactNode;
        children?: React.ReactNode;
        placeholder?: string;
    }) => (
        <div className="mb-5">
            <label
                htmlFor={id}
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center"
            >
                {label} {required && <span className="text-red-500 ml-1">*</span>}
                {tooltip && (
                    <Tooltip
                        title={tooltip}
                        arrow
                        placement="right"
                    >
                        <HelpOutlineIcon className="ml-1 text-gray-400" style={{ fontSize: 16 }} aria-label="Ajuda" />
                    </Tooltip>
                )}
            </label>

            {children || (
                <input
                    type={type}
                    id={id}
                    name={id}
                    value={formData[id] as string}
                    onChange={handleInputChange}
                    placeholder={placeholder}
                    ref={(el) => {
                        inputRefs.current[id] = el;
                    }}
                    className={`w-full px-4 py-3 border rounded-md focus:ring-2 focus:ring-[#09A08D] focus:border-[#09A08D] transition-all dark:bg-[#333] dark:border-gray-600 ${errors[id] ? "border-red-500" : "border-gray-300"}`}
                    aria-invalid={errors[id] ? "true" : "false"}
                    aria-describedby={errors[id] ? `${id}-error` : undefined}
                />
            )}

            {errors[id] && (
                <p className="text-red-500 text-xs mt-1 animate-fadeIn" id={`${id}-error`} role="alert">
                    {errors[id]}
                </p>
            )}
        </div>
    );

    // Type checking with PropTypes
    FormField.propTypes = {
        id: PropTypes.string.isRequired,
        label: PropTypes.string.isRequired,
        type: PropTypes.string,
        required: PropTypes.bool,
        tooltip: PropTypes.node,
        children: PropTypes.node,
        placeholder: PropTypes.string
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#2A2A2A]">
            {/* Success message overlay */}
            {showSuccessMessage && (
                <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 animate-fadeIn">
                    <div className="bg-white dark:bg-[#333] p-6 rounded-lg shadow-xl max-w-md mx-4 text-center">
                        <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Documento gerado com sucesso!</h3>
                        <p className="text-gray-600 dark:text-gray-300 mb-4">
                            O PDF foi gerado e baixado.
                        </p>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">
                            Redirecionando...
                        </p>
                    </div>
                </div>
            )}

            {/* Header with Colet Sistemas colors */}
            <div
                className="bg-gradient-to-r text-white py-6 md:py-8 shadow-lg"
                style={{ backgroundImage: `linear-gradient(to right, ${currentRequestType?.color || "#09A08D"}, #3C787A)` }}
            >
                <div className="container mx-auto px-4">
                    <h1 className="text-2xl md:text-3xl font-bold text-center">
                        {currentRequestType?.title || "Solicitação"}
                    </h1>
                    <p className="text-center text-white/90 mt-2 text-base md:text-lg">
                        Perfil selecionado: <span className="font-semibold">{userName}</span>
                        {userRole && <span className="text-white/70 ml-2">({userRole})</span>}
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-4 py-6 md:py-10">
                <div className="max-w-4xl mx-auto">
                    <Link
                        href={`/solicitations/${userId}`}
                        className="inline-flex items-center px-4 py-2 rounded-md bg-white dark:bg-[#3A3A3A] shadow-sm text-[#09A08D] hover:bg-gray-50 dark:hover:bg-[#444] transition-all mb-6 md:mb-8 border border-gray-100 dark:border-gray-700"
                        aria-label="Voltar para tipos de solicitação"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Voltar para tipos de solicitação
                    </Link>

                    <div className="bg-white dark:bg-[#2A2A2A] rounded-xl shadow-lg p-6 md:p-8 border border-gray-100 dark:border-gray-700">
                        {currentRequestType && (
                            <div className="flex flex-col sm:flex-row sm:items-center mb-6 md:mb-8 gap-4">
                                <div
                                    className="flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center mb-2 sm:mb-0 sm:mr-4 shadow-sm self-center sm:self-start"
                                    style={{ backgroundColor: currentRequestType.color }}
                                    aria-hidden="true"
                                >
                                    {currentRequestType.icon}
                                </div>
                                <div>
                                    <h2 className="text-xl md:text-2xl font-bold text-[#3A3A3A] dark:text-white text-center sm:text-left">
                                        {currentRequestType.title}
                                    </h2>
                                    <p className="text-gray-600 dark:text-gray-300 text-center sm:text-left">
                                        {currentRequestType.description}
                                    </p>
                                </div>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <FormField
                                id="title"
                                label="Título"
                                required
                                placeholder="Digite um título para sua solicitação"
                            />

                            {/* Detalhes do Incidente Section */}
                            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                                <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-5">
                                    {isImprovementRequest ? "Detalhes da Melhoria" : "Detalhes do Incidente"}
                                </h3>

                                <div className="space-y-5">
                                    <FormField
                                        id="details"
                                        label={isImprovementRequest ? "Justificativa" : "Descrição do Incidente"}
                                        required
                                        placeholder={isImprovementRequest ? "Descreva detalhadamente a mudança proposta." : "Descreva detalhadamente o incidente"}
                                    >
                                        <textarea
                                            id="details"
                                            name="details"
                                            value={formData.details}
                                            onChange={handleTextareaChange}
                                            rows={5}
                                            placeholder={isImprovementRequest ? "Descreva detalhadamente a mudança proposta." : "Descreva detalhadamente o incidente"}
                                            ref={(el) => {
                                                inputRefs.current.details = el;
                                            }}
                                            className={`w-full px-4 py-3 border rounded-md focus:ring-2 focus:ring-[#09A08D] focus:border-[#09A08D] transition-all dark:bg-[#333] dark:border-gray-600 ${errors.details ? "border-red-500" : "border-gray-300"}`}
                                            aria-invalid={errors.details ? "true" : "false"}
                                            aria-describedby={errors.details ? "details-error" : undefined}
                                        />
                                    </FormField>

                                    <FormField
                                        id="incidentDate"
                                        label={isImprovementRequest ? "Data da Solicitação" : "Data e Hora da Ocorrência"}
                                        type="datetime-local"
                                        required
                                    />

                                    {/* Improvement specific fields */}
                                    {isImprovementRequest && (
                                        <>
                                            <FormField
                                                id="benefitDescription"
                                                label="Descreva o Processo Atual"
                                                required
                                                placeholder="Descreva detalhadamente como o processo é executado atualmente."
                                            >
                                                <textarea
                                                    id="benefitDescription"
                                                    name="benefitDescription"
                                                    value={formData.benefitDescription}
                                                    onChange={handleTextareaChange}
                                                    rows={3}
                                                    placeholder="Descreva detalhadamente como o processo é executado atualmente."
                                                    ref={(el) => {
                                                        inputRefs.current.benefitDescription = el;
                                                    }}
                                                    className={`w-full px-4 py-3 border rounded-md focus:ring-2 focus:ring-[#09A08D] focus:border-[#09A08D] transition-all dark:bg-[#333] dark:border-gray-600 ${errors.benefitDescription ? "border-red-500" : "border-gray-300"}`}
                                                    aria-invalid={errors.benefitDescription ? "true" : "false"}
                                                    aria-describedby={errors.benefitDescription ? "benefitDescription-error" : undefined}
                                                />
                                            </FormField>

                                            <FormField
                                                id="futureProcedure"
                                                label="Descreva o Processo Futuro"
                                                placeholder="Descreva detalhadamente como o processo deverá funcionar após a implementação da melhoria."
                                            >
                                                <textarea
                                                    id="futureProcedure"
                                                    name="futureProcedure"
                                                    value={formData.futureProcedure}
                                                    onChange={handleTextareaChange}
                                                    rows={3}
                                                    placeholder="Descreva detalhadamente como o processo deverá funcionar após a implementação da melhoria."
                                                    ref={(el) => {
                                                        inputRefs.current.futureProcedure = el;
                                                    }}
                                                    className="w-full px-4 py-3 border rounded-md focus:ring-2 focus:ring-[#09A08D] focus:border-[#09A08D] transition-all dark:bg-[#333] dark:border-gray-600 border-gray-300"
                                                />
                                            </FormField>

                                            <FormField
                                                id="operationalImpact"
                                                label="Impacto nas Operações"
                                            >
                                                <select
                                                    id="operationalImpact"
                                                    name="operationalImpact"
                                                    value={formData.operationalImpact}
                                                    onChange={handleInputChange}
                                                    ref={(el) => {
                                                        inputRefs.current.operationalImpact = el;
                                                    }}
                                                    className="w-full px-4 py-3 border rounded-md focus:ring-2 focus:ring-[#09A08D] focus:border-[#09A08D] transition-all dark:bg-[#333] dark:border-gray-600 border-gray-300"
                                                >
                                                    <option value="">Selecione o nível de impacto</option>
                                                    <option value="Impacto significativo nas operações">Impacto significativo nas operações</option>
                                                    <option value="Impacto moderado nas operações">Impacto moderado nas operações</option>
                                                    <option value="Melhoria de processo sem impacto nas operações">Melhoria de processo sem impacto nas operações</option>
                                                </select>
                                            </FormField>
                                        </>
                                    )}

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                        <FormField
                                            id="impact"
                                            label="Gravidade"
                                            required
                                            tooltip={severityTooltip}
                                        >
                                            <select
                                                id="impact"
                                                name="impact"
                                                value={formData.impact}
                                                onChange={handleInputChange}
                                                ref={(el) => {
                                                    inputRefs.current.impact = el;
                                                }}
                                                className={`w-full px-4 py-3 border rounded-md focus:ring-2 focus:ring-[#09A08D] focus:border-[#09A08D] transition-all dark:bg-[#333] dark:border-gray-600 ${errors.impact ? "border-red-500" : "border-gray-300"}`}
                                                aria-invalid={errors.impact ? "true" : "false"}
                                                aria-describedby={errors.impact ? "impact-error" : undefined}
                                            >
                                                <option value="">Selecione a gravidade</option>
                                                <option value="1">1 - Muito Baixa</option>
                                                <option value="2">2 - Baixa</option>
                                                <option value="3">3 - Médio</option>
                                                <option value="4">4 - Alto</option>
                                                <option value="5">5 - Gravíssimo</option>
                                            </select>
                                        </FormField>

                                        <FormField
                                            id="criticality"
                                            label="Urgência"
                                            required
                                            tooltip={urgencyTooltip}
                                        >
                                            <select
                                                id="criticality"
                                                name="criticality"
                                                value={formData.criticality}
                                                onChange={handleInputChange}
                                                ref={(el) => {
                                                    inputRefs.current.criticality = el;
                                                }}
                                                className={`w-full px-4 py-3 border rounded-md focus:ring-2 focus:ring-[#09A08D] focus:border-[#09A08D] transition-all dark:bg-[#333] dark:border-gray-600 ${errors.criticality ? "border-red-500" : "border-gray-300"}`}
                                                aria-invalid={errors.criticality ? "true" : "false"}
                                                aria-describedby={errors.criticality ? "criticality-error" : undefined}
                                            >
                                                <option value="">Selecione a urgência</option>
                                                <option value="1">1 - Muito Baixa</option>
                                                <option value="2">2 - Baixa</option>
                                                <option value="3">3 - Média</option>
                                                <option value="4">4 - Alta</option>
                                                <option value="5">5 - Urgente</option>
                                            </select>
                                        </FormField>

                                        <FormField
                                            id="frequency"
                                            label="Tendência"
                                            required
                                            tooltip={tendencyTooltip}
                                        >
                                            <select
                                                id="frequency"
                                                name="frequency"
                                                value={formData.frequency}
                                                onChange={handleInputChange}
                                                ref={(el) => {
                                                    inputRefs.current.frequency = el;
                                                }}
                                                className={`w-full px-4 py-3 border rounded-md focus:ring-2 focus:ring-[#09A08D] focus:border-[#09A08D] transition-all dark:bg-[#333] dark:border-gray-600 ${errors.frequency ? "border-red-500" : "border-gray-300"}`}
                                                aria-invalid={errors.frequency ? "true" : "false"}
                                                aria-describedby={errors.frequency ? "frequency-error" : undefined}
                                            >
                                                <option value="">Selecione a tendência</option>
                                                <option value="1">1 - Raramente</option>
                                                <option value="2">2 - Ocasionalmente</option>
                                                <option value="3">3 - Eventualmente</option>
                                                <option value="4">4 - Frequentemente</option>
                                                <option value="5">5 - Sempre</option>
                                            </select>
                                        </FormField>
                                    </div>

                                    <div>
                                        <fieldset>
                                            <legend className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                Afeta outros usuários ou áreas
                                            </legend>
                                            <div className="flex items-center space-x-6 mt-1">
                                                <label className="inline-flex items-center">
                                                    <input
                                                        type="radio"
                                                        name="affectsOthers"
                                                        value="yes"
                                                        checked={formData.affectsOthers === "yes"}
                                                        onChange={handleInputChange}
                                                        className="form-radio text-[#09A08D] h-4 w-4 focus:ring-[#09A08D]"
                                                    />
                                                    <span className="ml-2 text-sm">Sim</span>
                                                </label>
                                                <label className="inline-flex items-center">
                                                    <input
                                                        type="radio"
                                                        name="affectsOthers"
                                                        value="no"
                                                        checked={formData.affectsOthers === "no"}
                                                        onChange={handleInputChange}
                                                        className="form-radio text-[#09A08D] h-4 w-4 focus:ring-[#09A08D]"
                                                    />
                                                    <span className="ml-2 text-sm">Não</span>
                                                </label>
                                            </div>
                                        </fieldset>
                                    </div>
                                </div>
                            </div>

                            {/* Technical Information Section */}
                            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                                <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-5">
                                    Informações Técnicas
                                </h3>
                                <FormField
                                    id="affectedEstablishment"
                                    label="Cliente Afetado"
                                    required
                                >
                                    <select
                                        id="affectedEstablishment"
                                        name="affectedEstablishment"
                                        value={formData.affectedEstablishment}
                                        onChange={handleInputChange}
                                        ref={(el) => {
                                            inputRefs.current.affectedEstablishment = el;
                                        }}
                                        className={`w-full px-4 py-3 border rounded-md focus:ring-2 focus:ring-[#09A08D] focus:border-[#09A08D] transition-all dark:bg-[#333] dark:border-gray-600 ${errors.affectedEstablishment ? "border-red-500" : "border-gray-300"}`}
                                        aria-invalid={errors.affectedEstablishment ? "true" : "false"}
                                        aria-describedby={errors.affectedEstablishment ? "affectedEstablishment-error" : undefined}
                                    >
                                        <option value="">Selecione o cliente</option>
                                        {Object.keys(clientDatabases).map((client) => (
                                            <option key={client} value={client}>
                                                {client}
                                            </option>
                                        ))}
                                    </select>
                                </FormField>

                                {/* Add the database selection field right after client selection */}
                                <FormField
                                    id="selectedDatabase"
                                    label="Banco de Dados"
                                    required
                                >
                                    <select
                                        id="selectedDatabase"
                                        name="selectedDatabase"
                                        value={formData.selectedDatabase}
                                        onChange={handleInputChange}
                                        ref={(el) => {
                                            inputRefs.current.selectedDatabase = el;
                                        }}
                                        className={`w-full px-4 py-3 border rounded-md focus:ring-2 focus:ring-[#09A08D] focus:border-[#09A08D] transition-all dark:bg-[#333] dark:border-gray-600 ${errors.selectedDatabase ? "border-red-500" : "border-gray-300"}`}
                                        aria-invalid={errors.selectedDatabase ? "true" : "false"}
                                        aria-describedby={errors.selectedDatabase ? "selectedDatabase-error" : undefined}
                                        disabled={availableDatabases.length === 0}
                                    >
                                        <option value="">Selecione o banco de dados</option>
                                        {availableDatabases.map((database, index) => (
                                            <option key={index} value={database}>
                                                {database}
                                            </option>
                                        ))}
                                    </select>
                                    {availableDatabases.length === 0 && formData.affectedEstablishment && (
                                        <p className="text-yellow-600 dark:text-yellow-400 text-xs mt-1">
                                            Selecione um cliente para ver os bancos de dados disponíveis
                                        </p>
                                    )}
                                </FormField>

                                <div className="space-y-5">
                                    <FormField
                                        id="erpModule"
                                        label="Módulo do Colet Afetado"
                                        required={requestType === "bugs"}
                                    >
                                        <select
                                            id="erpModule"
                                            name="erpModule"
                                            value={formData.erpModule}
                                            onChange={handleInputChange}
                                            ref={(el) => {
                                                inputRefs.current.erpModule = el;
                                            }}
                                            className={`w-full px-4 py-3 border rounded-md focus:ring-2 focus:ring-[#09A08D] focus:border-[#09A08D] transition-all dark:bg-[#333] dark:border-gray-600 ${errors.erpModule ? "border-red-500" : "border-gray-300"}`}
                                            aria-invalid={errors.erpModule ? "true" : "false"}
                                            aria-describedby={errors.erpModule ? "erpModule-error" : undefined}
                                        >
                                            <option value="">Selecione o módulo</option>
                                            <option value="Módulo Alertas">Módulo Alertas</option>
                                            <option value="Módulo Cadastro de usuários e permissões">Módulo Cadastro de usuários e permissões</option>
                                            <option value="Módulo Comercial">Módulo Comercial</option>
                                            <option value="Módulo Compras">Módulo Compras</option>
                                            <option value="Módulo Contábil">Módulo Contábil</option>
                                            <option value="Módulo Curtume">Módulo Curtume</option>
                                            <option value="Módulo Engenharia">Módulo Engenharia</option>
                                            <option value="Módulo Estoque">Módulo Estoque</option>
                                            <option value="Módulo Financeiro">Módulo Financeiro</option>
                                            <option value="Módulo Fiscal">Módulo Fiscal</option>
                                            <option value="Módulo Nota Fiscal de Saída">Módulo Nota Fiscal de Saída</option>
                                            <option value="Módulo Produção">Módulo Produção</option>
                                            <option value="Módulo Programas Exclusivos">Módulo Programas Exclusivos</option>
                                            <option value="Módulo Recebimento">Módulo Recebimento</option>
                                            <option value="Módulo Tratamento Térmico">Módulo Tratamento Térmico</option>
                                        </select>
                                    </FormField>

                                    <FormField
                                        id="moduleVersion"
                                        label="Versão do Módulo"
                                        placeholder="Ex: 2.5.1"
                                    />

                                    <FormField
                                        id="programCodes"
                                        label={isImprovementRequest ? "Programas Relacionados (se aplicável)" : "Códigos/Nomes de Programas Afetados"}
                                        placeholder={isImprovementRequest ? "Ex: PROG001 - Controle de Estoque" : "Ex: PROG001 - Controle de Estoque"}
                                    />

                                    <FormField
                                        id="operatingSystem"
                                        label="Sistema Operacional"
                                    >
                                        <select
                                            id="operatingSystem"
                                            name="operatingSystem"
                                            value={formData.operatingSystem}
                                            onChange={handleInputChange}
                                            ref={(el) => {
                                                inputRefs.current.operatingSystem = el;
                                            }}
                                            className="w-full px-4 py-3 border rounded-md focus:ring-2 focus:ring-[#09A08D] focus:border-[#09A08D] transition-all dark:bg-[#333] dark:border-gray-600 border-gray-300"
                                        >
                                            <option value="Linux">Linux</option>
                                            <option value="Windows 7">Windows 7</option>
                                            <option value="Windows 8">Windows 8</option>
                                            <option value="Windows 8.1">Windows 8.1</option>
                                            <option value="Windows 10">Windows 10</option>
                                            <option value="Windows 11">Windows 11</option>
                                            <option value="Windows Server 2012">Windows Server 2012</option>
                                            <option value="Windows Server 2016">Windows Server 2016</option>
                                            <option value="Windows Server 2019">Windows Server 2019</option>
                                            <option value="Windows Server 2022">Windows Server 2022</option>
                                            <option value="Windows Server 2025">Windows Server 2025</option>
                                        </select>
                                    </FormField>
                                </div>
                            </div>

                            {/* Attachments Section */}
                            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                                <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-3">
                                    Anexos {isImprovementRequest ? "(mockups, exemplos ou documentos)" : "(capturas de tela ou documentos)"}
                                </h3>
                                <div className="flex items-center justify-center w-full">
                                    <label
                                        htmlFor="file-upload"
                                        className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:bg-[#333] border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-[#3a3a3a]"
                                    >
                                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                            <CloudUploadIcon style={{ color: "#09A08D", fontSize: 30 }} />
                                            <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                                                <span className="font-semibold">Clique para carregar</span> ou arraste e solte
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                PNG, JPG (MAX. 5MB)
                                            </p>
                                        </div>
                                        <input
                                            id="file-upload"
                                            name="attachments"
                                            type="file"
                                            multiple
                                            className="hidden"
                                            onChange={handleFileChange}
                                        />
                                    </label>
                                </div>

                                {formData.attachments.length > 0 && (
                                    <div className="mt-4">
                                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Arquivos anexados:
                                        </p>
                                        <ul className="space-y-2">
                                            {formData.attachments.map((file, index) => (
                                                <li key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-[#333] rounded-md text-sm">
                                                    <div className="flex items-center">
                                                        <AttachFileIcon className="text-gray-400 mr-2" style={{ fontSize: 20 }} />
                                                        <span className="truncate max-w-[200px]">{file.name}</span>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeAttachment(index)}
                                                        className="text-red-500 hover:text-red-700"
                                                    >
                                                        Remover
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-end pt-6">
                                <button
                                    type="submit"
                                    className="px-6 py-3 bg-[#09A08D] text-white rounded-md hover:bg-[#078275] focus:outline-none focus:ring-2 focus:ring-[#09A08D] focus:ring-opacity-50 transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? "Gerando..." : "Gerar Solicitação"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
