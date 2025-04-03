import PropTypes from "prop-types";
import { useMemo } from "react";

// Utility function to render severity level icons with appropriate colors
export const SeverityIcon = ({ level, text }) => {
    const color = useMemo(() => {
        switch (level) {
            case 1: return "#3498db"; 
            case 2: return "#2ecc71"; 
            case 3: return "#f1c40f"; 
            case 4: return "#e67e22"; 
            case 5: return "#e74c3c"; 
            default: return "#95a5a6"; 
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

// Memoized severity tooltips to prevent recreating on every render
export const severityTooltip = (
    <div className="p-2 text-xs">
        <h4 className="font-bold mb-2">Níveis de Gravidade:</h4>
        <SeverityIcon level={1} text="Muito Baixa - Melhorias, sugestões de ajustes em programas, novas necessidades dos clientes, etc." />
        <SeverityIcon level={2} text="Baixa - É aquele em que não há impedimento para trabalho dos colaboradores." />
        <SeverityIcon level={3} text="Médio - É aquele em que há impedimento para trabalho individual dos colaboradores e será necessário uma solução." />
        <SeverityIcon level={4} text="Alto - Impede o trabalho do usuário." />
        <SeverityIcon level={5} text="Gravíssimo - Impede o funcionamento de áreas e processos críticos." />
    </div>
);

export const urgencyTooltip = (
    <div className="p-2 text-xs">
        <h4 className="font-bold mb-2">Níveis de Urgência:</h4>
        <SeverityIcon level={1} text="Muito Baixa - Atende apenas um usuário" />
        <SeverityIcon level={2} text="Baixa - Atende ou pode vir a atender mas de um usuário/cliente" />
        <SeverityIcon level={3} text="Médio - Foi solicitado pela direção ou gerência do cliente" />
        <SeverityIcon level={4} text="Alto - Afeta um ou poucos clientes dentro de um mesmo módulo" />
        <SeverityIcon level={5} text="Gravíssimo - Afeta mais de um cliente" />
    </div>
);

export const tendencyTooltip = (
    <div className="p-2 text-xs">
        <h4 className="font-bold mb-2">Níveis de Tendência:</h4>
        <SeverityIcon level={1} text="Raramente - Impede o funcionamento de áreas e processos críticos." />
        <SeverityIcon level={2} text="Ocasionalmente - Afeta o processo atual, mas não aumenta as ações para a execução do processo." />
        <SeverityIcon level={3} text="Eventualmente - Não afeta o processo atual, mas aumenta as ações para a execução do mesmo." />
        <SeverityIcon level={4} text="Frequentemente - Aumento significativo de ações para executar o processo, ficando ruim no curto prazo." />
        <SeverityIcon level={5} text="Sempre - Vai piorar rapidamente, tanto para o cliente quanto para a Colet." />
    </div>
);
