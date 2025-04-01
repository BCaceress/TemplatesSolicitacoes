"use client";

import { useUser } from "@/contexts/UserContext";
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
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

// Utility function to render severity level icons with appropriate colors
const SeverityIcon = ({ level, text }) => {
    const color = useMemo(() => {
        switch (level) {
            case 1: return "#3498db"; // Very Low - Light Blue
            case 2: return "#2ecc71"; // Low - Green
            case 3: return "#f1c40f"; // Medium - Yellow
            case 4: return "#e67e22"; // High - Orange
            case 5: return "#e74c3c"; // Critical - Red
            default: return "#95a5a6"; // Default gray
        }
    }, [level]);

    return (
        <div className="flex items-center mb-1">
            <span
                className="inline-block w-3 h-3 rounded-full mr-2"
                style={{ backgroundColor: color }}
                aria-hidden="true"
            />
            <span>{text}</span>
        </div>
    );
};

SeverityIcon.propTypes = {
    level: PropTypes.number.isRequired,
    text: PropTypes.string.isRequired
};

// Initial form state to avoid repetition
const initialFormState = {
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
    operatingSystem: "Windows 11"
};

// Client to database mapping
const clientDatabases = {
    "Agro Santos e Ernesto -PE- (97)": [
        "10.0.0.252:/dados/BDClientes/BDdivina.fdb",
        "10.0.0.252:/dados/BDClientes/BDanaluisa.fdb",
        "10.0.0.252:/dados/BDClientes/BDsantos.fdb",
        "10.0.0.252:/dados/BDClientes/BDernesto.fdb"
    ],
    "Base HS/Blass/Filial (50)": [
        "10.0.0.252:/dados/BDClientes/BDbase.fdb",
        "10.0.0.252:/dados/BDClientes/BDblass.fdb"
    ],
    "Berlinerluft (83)": ["10.0.0.252:/dados/BDClientes/BDberlinerluft.fdb"],
    "Biometal (176)": ["10.0.0.252:/dados/BDClientes/BDbiometal.fdb"],
    "Blue/WJM/Juck (164)": [
        "10.0.0.252:/dados/BDClientes/BDblue.fdb",
        "10.0.0.252:/dados/BDClientes/BDwjm.fdb",
        "10.0.0.252:/dados/BDClientes/BDjuck.fdb"
    ],
    "Blueplast (96)": ["10.0.0.252:/dados/BDClientes/BDblueplast.fdb"],
    "Bombas Beto (139)": ["10.0.0.252:/dados/BDClientes/BDbombasbeto.fdb"],
    "Brutt (111)": ["10.0.0.252:/dados/BDClientes/BDbrutt.fdb"],
    "Colet (Duo) (15)": ["10.0.0.252:/dados/BDColet/BDcolet.fdb"],
    "Couros do Vale (179)": ["10.0.0.252:/dados/BDClientes/BDcourosdovale.fdb"],
    "Crespi (66)": ["10.0.0.252:/dados/BDClientes/BDcrespi.fdb"],
    "Dalpiaz (148)": ["10.0.0.252:/dados/BDClientes/BDdalpiaz.fdb"],
    "Dover (28)": [
        "10.0.0.252:/dados/BDClientes/BDwds.fdb",
        "10.0.0.252:/dados/BDClientes/BDdover.fdb"
    ],
    "Dzainer (55)": ["10.0.0.252:/dados/BDClientes/BDdzainer.fdb"],
    "EKT Industrial (175)": ["10.0.0.252:/dados/BDClientes/BDektindustrial.fdb"],
    "Fable | F&R (165)": [
        "10.0.0.252:/dados/BDClientes/BDfable.fdb",
        "10.0.0.252:/dados/BDClientes/BDfer.fdb"
    ],
    "Fernanda (125)": ["10.0.0.252:/dados/BDClientes/BDfernanda.fdb"],
    "Feroli (159)": ["10.0.0.252:/dados/BDClientes/BDferoli.fdb"],
    "Golden Chemie (155)": ["10.0.0.252:/dados/BDClientes/BDgolden.fdb"],
    "Guarutemper (173)": ["10.0.0.252:/dados/BDClientes/BDguarutemper.fdb"],
    "Imac (51)": [
        "10.0.0.252:/dados/BDClientes/BDimac.fdb",
        "10.0.0.252:/dados/BDColet/BDimacsequenciamento.fdb"
    ],
    "Imex (156)": ["10.0.0.252:/dados/BDClientes/BDimex.fdb"],
    "Indutherm (150)": ["10.0.0.252:/dados/BDClientes/BDindutherm.fdb"],
    "JA Industrial (174)": ["10.0.0.252:/dados/BDClientes/BDinterpint.fdb", "10.0.0.252:/dados/BDClientes/BDinter-revest.fdb"],
    "Jet Sola (186)": ["10.0.0.252:/dados/BDClientes/BDjetsola.fdb"],
    "LLV (34)": ["10.0.0.252:/dados/BDClientes/BDllv.fdb"],
    "Mach Tooling (191)": ["10.0.0.252:/dados/BDClientes/BDmachtooling.fdb"],
    "Metal Moto (115)": ["10.0.0.252:/dados/BDClientes/BDmetalmoto.fdb"],
    "Metal Paulista (135)": ["10.0.0.252:/dados/BDClientes/BDmetalpaulista.fdb"],
    "Metal Sul (137)": ["10.0.0.252:/dados/BDClientes/BDmetalsul.fdb"],
    "Metal Técnica (2)": ["10.0.0.252:/dados/BDClientes/BDmetaltecnica.fdb", "10.0.0.252:/dados/BDClientes/BDmetaltrat.fdb"],
    "MK Sinter (123)": ["10.0.0.252:/dados/BDClientes/BDmksinter.fdb"],
    "Natur (7)": ["10.0.0.252:/dados/BDClientes/BDnatur.fdb"],
    "Niit Plasma (147)": ["10.0.0.252:/dados/BDClientes/BDttiplasma.fdb"],
    "Nobre (119)": ["10.0.0.252:/dados/BDClientes/BDnobre.fdb"],
    "Nobre Contabilidade Outras (121)": ["10.0.0.252:/dados/BDClientes/BDadeconto.fdb"],
    "Palagi (172)": ["10.0.0.252:/dados/BDClientes/BDpalagi.fdb"],
    "Paschoal & RT Metais (127)": ["10.0.0.252:/dados/BDClientes/BDpaschoal.fdb"],
    "Padrão Componentes (183)": ["10.0.0.252:/dados/BDColet/BDcomponentes.fdb"],
    "Padrão Curtume (94)": ["10.0.0.252:/dados/BDColet/BDcurtume.fdb"],
    "Padrão Manufatura (59)": ["10.0.0.252:/dados/BDColet/BDmanufatura.fdb"],
    "Padrão Tratamento Térmico (136)": ["10.0.0.252:/dados/BDColet/BDtratamentotermico.fdb"],
    "Pitía Bilhar (170)": ["10.0.0.252:/dados/BDClientes/BDpitia.fdb"],
    "Plasma (117)": ["10.0.0.252:/dados/BDClientes/BDplasma.fdb"],
    "Projelmec (74)": ["10.0.0.252:/dados/BDClientes/BDprojelmec.fdb"],
    "Reuter (65)": ["10.0.0.252:/dados/BDClientes/BDreuter.fdb", "10.0.0.252:/dados/BDClientes/BDmaristela.fdb"],
    "Rototech (90)": ["10.0.0.252:/dados/BDClientes/BDrototech.fdb"],
    "Salini MT (184)": ["10.0.0.252:/dados/BDClientes/BDsalinimt.fdb"],
    "SFTech (171)": ["10.0.0.252:/dados/BDClientes/BDsftech.fdb"],
    "Sinttec (153)": ["10.0.0.252:/dados/BDClientes/BDsinttec.fdb"],
    "Spier (189)": ["10.0.0.252:/dados/BDClientes/BDspier.fdb"],
    "SS Usinagem (187)": ["10.0.0.252:/dados/BDClientes/BDssusinagem.fdb"],
    "Sud Leather (188)": ["10.0.0.252:/dados/BDClientes/BDsud.fdb"],
    "Tecno-MIM (152)": ["10.0.0.252:/dados/BDClientes/BDtecnomim.fdb"],
    "Tecnovacum (138)": ["10.0.0.252:/dados/BDClientes/BDtecnovacum.fdb"],
    "Temperapar (169)": ["10.0.0.252:/dados/BDClientes/BDtemperapar.fdb"],
    "Temperaville (190)": ["10.0.0.252:/dados/BDClientes/BDtemperaville.fdb"],
    "Thermtec - PR (185)": ["10.0.0.252:/dados/BDClientes/BDthermtec.fdb"],
    "Traterm (167)": ["10.0.0.252:/dados/BDClientes/BDtraterm.fdb"],
    "Usimatos (177)": ["10.0.0.252:/dados/BDClientes/BDusimatos.fdb"],
    "Valence (160)": ["10.0.0.252:/dados/BDClientes/BDvalence.fdb", "10.0.0.252:/dados/BDClientes/BDvlc.fdb"],
    "Valesemi (97)": ["10.0.0.252:/dados/BDClientes/BDvalesemi.fdb"],
    "Volts (77)": ["10.0.0.252:/dados/BDClientes/BDvolts.fdb"],
    "Wolfstore (149)": [
        "10.0.0.252:/dados/BDClientes/BDstyle.fdb",
        "10.0.0.252:/dados/BDClientes/BDwolfstore.fdb",
        "10.0.0.252:/dados/BDClientes/BDwnordeste.fdb"
    ]
};

export default function SolicitationFormPage() {
    const { userId, requestType } = useParams();
    const router = useRouter();
    const [userName, setUserName] = useState("Carregando...");
    const [userRole, setUserRole] = useState("");
    const { selectedUser } = useUser();

    const [formData, setFormData] = useState(initialFormState);
    const [availableDatabases, setAvailableDatabases] = useState([]);
    const inputRefs = useRef({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState({});
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

    const currentRequestType = requestTypes[requestType];

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
    const handleInputChange = useCallback((e) => {
        const { name, value } = e.target;
        const activeElementName = document.activeElement.name;

        setFormData(prevData => ({
            ...prevData,
            [name]: value
        }));

        // Update available databases when the client changes
        if (name === 'affectedEstablishment') {
            const databases = clientDatabases[value] || [];
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
                inputRefs.current[activeElementName].focus();
            }
        }, 0);
    }, []);

    // Add a specific handler for textarea to avoid the reverse typing issue
    const handleTextareaChange = useCallback((e) => {
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
                inputRefs.current[name].focus();
                inputRefs.current[name].selectionStart = selectionStart;
                inputRefs.current[name].selectionEnd = selectionStart;
            }
        });
    }, []);

    const handleFileChange = useCallback((e) => {
        const files = Array.from(e.target.files);
        setFormData(prevData => ({
            ...prevData,
            attachments: [...prevData.attachments, ...files]
        }));
    }, []);

    const removeAttachment = useCallback((index) => {
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
        const newErrors = {};
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
        }

        // Check each required field
        requiredFields.forEach(({ field, message }) => {
            if (!formData[field] || (typeof formData[field] === "string" && !formData[field].trim())) {
                newErrors[field] = message;
            }
        });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [formData, requestType]);

    const handleSubmit = async (e) => {
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

    // Memoized severity tooltips to prevent recreating on every render
    const severityTooltip = useMemo(() => (
        <div className="p-2 text-xs">
            <h4 className="font-bold mb-2">Níveis de Gravidade:</h4>
            <SeverityIcon level={1} text="Muito Baixa - Melhorias, sugestões de ajustes em programas, novas necessidades dos clientes, etc." />
            <SeverityIcon level={2} text="Baixa - É aquele em que não há impedimento para trabalho dos colaboradores." />
            <SeverityIcon level={3} text="Médio - É aquele em que há impedimento para trabalho individual dos colaboradores e será necessário uma solução." />
            <SeverityIcon level={4} text="Alto - Impede o trabalho do usuário." />
            <SeverityIcon level={5} text="Gravíssimo - Impede o funcionamento de áreas e processos críticos." />
        </div>
    ), []);

    const urgencyTooltip = useMemo(() => (
        <div className="p-2 text-xs">
            <h4 className="font-bold mb-2">Níveis de Urgência:</h4>
            <SeverityIcon level={1} text="Muito Baixa - Atende apenas um usuário" />
            <SeverityIcon level={2} text="Baixa - Atende ou pode vir a atender mas de um usuário/cliente" />
            <SeverityIcon level={3} text="Médio - Foi solicitado pela direção ou gerência do cliente" />
            <SeverityIcon level={4} text="Alto - Afeta um ou poucos clientes dentro de um mesmo módulo" />
            <SeverityIcon level={5} text="Gravíssimo - Afeta mais de um cliente" />
        </div>
    ), []);

    const tendencyTooltip = useMemo(() => (
        <div className="p-2 text-xs">
            <h4 className="font-bold mb-2">Níveis de Tendência:</h4>
            <SeverityIcon level={1} text="Raramente - Impede o funcionamento de áreas e processos críticos." />
            <SeverityIcon level={2} text="Ocasionalmente - Afeta o processo atual, mas não aumenta as ações para a execução do processo." />
            <SeverityIcon level={3} text="Eventualmente - Não afeta o processo atual, mas aumenta as ações para a execução do mesmo." />
            <SeverityIcon level={4} text="Frequentemente - Aumento significativo de ações para executar o processo, ficando ruim no curto prazo." />
            <SeverityIcon level={5} text="Sempre - Vai piorar rapidamente, tanto para o cliente quanto para a Colet." />
        </div>
    ), []);

    // Form field component for less repetition and consistent styling
    const FormField = ({
        id,
        label,
        type = "text",
        required = false,
        tooltip = null,
        children = null,
        placeholder = ""
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
                    value={formData[id]}
                    onChange={handleInputChange}
                    placeholder={placeholder}
                    ref={el => inputRefs.current[id] = el}
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
                                    Detalhes do Incidente
                                </h3>

                                <div className="space-y-5">
                                    <FormField
                                        id="details"
                                        label="Descrição do Incidente"
                                        required
                                        placeholder="Descreva detalhadamente o incidente"
                                    >
                                        <textarea
                                            id="details"
                                            name="details"
                                            value={formData.details}
                                            onChange={handleTextareaChange}
                                            rows={5}
                                            placeholder="Descreva detalhadamente o incidente"
                                            ref={el => inputRefs.current.details = el}
                                            className={`w-full px-4 py-3 border rounded-md focus:ring-2 focus:ring-[#09A08D] focus:border-[#09A08D] transition-all dark:bg-[#333] dark:border-gray-600 ${errors.details ? "border-red-500" : "border-gray-300"}`}
                                            aria-invalid={errors.details ? "true" : "false"}
                                            aria-describedby={errors.details ? "details-error" : undefined}
                                        />
                                    </FormField>

                                    <FormField
                                        id="incidentDate"
                                        label="Data e Hora da Ocorrência"
                                        type="datetime-local"
                                        required
                                    />

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
                                        className={`w-full px-4 py-3 border rounded-md focus:ring-2 focus:ring-[#09A08D] focus:border-[#09A08D] transition-all dark:bg-[#333] dark:border-gray-600 ${errors.affectedEstablishment ? "border-red-500" : "border-gray-300"}`}
                                        aria-invalid={errors.affectedEstablishment ? "true" : "false"}
                                        aria-describedby={errors.affectedEstablishment ? "affectedEstablishment-error" : undefined}
                                    >
                                        <option value="">Selecione o cliente</option>
                                        <option value="Agro Santos e Ernesto -PE- (97)">Agro Santos e Ernesto -PE- (97)</option>
                                        <option value="Base HS/Blass/Filial (50)">Base HS/Blass/Filial (50)</option>
                                        <option value="Berlinerluft (83)">Berlinerluft (83)</option>
                                        <option value="Biometal (176)">Biometal (176)</option>
                                        <option value="Blue/WJM/Juck (164)">Blue/WJM/Juck (164)</option>
                                        <option value="Blueplast (96)">Blueplast (96)</option>
                                        <option value="Bombas Beto (139)">Bombas Beto (139)</option>
                                        <option value="Brutt (111)">Brutt (111)</option>
                                        <option value="Colet (Duo) (15)">Colet (Duo) (15)</option>
                                        <option value="Couros do Vale (179)">Couros do Vale (179)</option>
                                        <option value="Crespi (66)">Crespi (66)</option>
                                        <option value="Dalpiaz (148)">Dalpiaz (148)</option>
                                        <option value="Dover (28)">Dover (28)</option>
                                        <option value="Dzainer (55)">Dzainer (55)</option>
                                        <option value="EKT Industrial (175)">EKT Industrial (175)</option>
                                        <option value="Fable | F&R (165)">Fable | F&R (165)</option>
                                        <option value="Fernanda (125)">Fernanda (125)</option>
                                        <option value="Feroli (159)">Feroli (159)</option>
                                        <option value="Golden Chemie (155)">Golden Chemie (155)</option>
                                        <option value="Guarutemper (173)">Guarutemper (173)</option>
                                        <option value="Imac (51)">Imac (51)</option>
                                        <option value="Imex (156)">Imex (156)</option>
                                        <option value="Indutherm (150)">Indutherm (150)</option>
                                        <option value="JA Industrial (174)">JA Industrial (174)</option>
                                        <option value="Jet Sola (186)">Jet Sola (186)</option>
                                        <option value="LLV (34)">LLV (34)</option>
                                        <option value="Mach Tooling (191)">Mach Tooling (191)</option>
                                        <option value="Metal Moto (115)">Metal Moto (115)</option>
                                        <option value="Metal Paulista (135)">Metal Paulista (135)</option>
                                        <option value="Metal Sul (137)">Metal Sul (137)</option>
                                        <option value="Metal Técnica (2)">Metal Técnica (2)</option>
                                        <option value="MK Sinter (123)">MK Sinter (123)</option>
                                        <option value="Natur (7)">Natur (7)</option>
                                        <option value="Niit Plasma (147)">Niit Plasma (147)</option>
                                        <option value="Nobre (119)">Nobre (119)</option>
                                        <option value="Nobre Contabilidade Outras (121)">Nobre Contabilidade Outras (121)</option>
                                        <option value="Palagi (172)">Palagi (172)</option>
                                        <option value="Paschoal & RT Metais (127)">Paschoal & RT Metais (127)</option>
                                        <option value="Padrão Componentes (183)">Padrão Componentes (183)</option>
                                        <option value="Padrão Curtume (94)">Padrão Curtume (94)</option>
                                        <option value="Padrão Manufatura (59)">Padrão Manufatura (59)</option>
                                        <option value="Padrão Tratamento Térmico (136)">Padrão Tratamento Térmico (136)</option>
                                        <option value="Pitía Bilhar (170)">Pitía Bilhar (170)</option>
                                        <option value="Plasma (117)">Plasma (117)</option>
                                        <option value="Projelmec (74)">Projelmec (74)</option>
                                        <option value="Reuter (65)">Reuter (65)</option>
                                        <option value="Rototech (90)">Rototech (90)</option>
                                        <option value="Salini MT (184)">Salini MT (184)</option>
                                        <option value="SFTech (171)">SFTech (171)</option>
                                        <option value="Sinttec (153)">Sinttec (153)</option>
                                        <option value="Spier (189)">Spier (189)</option>
                                        <option value="SS Usinagem (187)">SS Usinagem (187)</option>
                                        <option value="Sud Leather (188)">Sud Leather (188)</option>
                                        <option value="Tecno-MIM (152)">Tecno-MIM (152)</option>
                                        <option value="Tecnovacum (138)">Tecnovacum (138)</option>
                                        <option value="Temperapar (169)">Temperapar (169)</option>
                                        <option value="Temperaville (190)">Temperaville (190)</option>
                                        <option value="Thermtec - PR (185)">Thermtec - PR (185)</option>
                                        <option value="Traterm (167)">Traterm (167)</option>
                                        <option value="Usimatos (177)">Usimatos (177)</option>
                                        <option value="Valence (160)">Valence (160)</option>
                                        <option value="Valesemi (97)">Valesemi (97)</option>
                                        <option value="Volts (77)">Volts (77)</option>
                                        <option value="Wolfstore (149)">Wolfstore (149)</option>
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
                                        label="Códigos/Nomes de Programas Afetados"
                                        placeholder="Ex: PROG001 - Controle de Estoque"
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
                                            className="w-full px-4 py-3 border rounded-md focus:ring-2 focus:ring-[#09A08D] focus:border-[#09A08D] transition-all dark:bg-[#333] dark:border-gray-600 border-gray-300"
                                        >
                                            <option value="Windows 7">Windows 7</option>
                                            <option value="Windows 8">Windows 8</option>
                                            <option value="Windows 8.1">Windows 8.1</option>
                                            <option value="Windows 10">Windows 10</option>
                                            <option value="Windows 11">Windows 11</option>
                                            <option value="Windows Server 2012">Windows Server 2012</option>
                                            <option value="Windows Server 2016">Windows Server 2016</option>
                                            <option value="Windows Server 2019">Windows Server 2019</option>
                                        </select>
                                    </FormField>
                                </div>
                            </div>

                            {/* Attachments Section */}
                            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                                <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-3">
                                    Anexos (capturas de tela ou documentos)
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
