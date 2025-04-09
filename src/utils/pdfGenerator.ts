import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import React from 'react'; // Add React import for JSX namespace

interface FormData {
  title: string;
  details: string;
  screenName: string;
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
  // Additional properties for improvement requests
  benefitDescription?: string;
  futureProcedure?: string;
  operationalImpact?: string;
}

interface RequestType {
  title: string;
  description: string;
  color: string;
  icon?: React.ReactElement;
}

/**
 * Calculate criticality score based on severity, urgency, and trend
 * @returns A score between 1 and 125
 */
const calculateCriticalityScore = (impact: string, criticality: string, frequency: string): number => {
  // Convert string values to numbers
  const impactValue = parseInt(impact) || 1;
  const criticalityValue = parseInt(criticality) || 1;
  const frequencyValue = parseInt(frequency) || 1;

  // Calculate the score (severity × urgency × trend)
  return impactValue * criticalityValue * frequencyValue;
};

/**
 * Get color based on criticality score
 */
const getCriticalityScoreColor = (score: number): string => {
  if (score <= 25) return "#3498db"; // Light blue
  if (score <= 50) return "#2ecc71"; // Green
  if (score <= 75) return "#f1c40f"; // Yellow
  if (score <= 100) return "#e67e22"; // Orange
  return "#e74c3c"; // Red for scores 101-125
};

/**
 * Get text label for criticality score range
 */
const getCriticalityScoreLabel = (score: number): string => {
  if (score <= 25) return "Baixa";
  if (score <= 50) return "Moderada";
  if (score <= 75) return "Média";
  if (score <= 100) return "Alta";
  return "Crítica";
};

/**
 * Formata a data para exibição no formato brasileiro, subtraindo 3 horas
 */
const formatBrazilianDate = (dateString: string): string => {
  try {
    // Converte a string de data ISO para objeto Date
    const date = new Date(dateString);

    // Subtrai 3 horas para ajustar ao fuso horário desejado
    const adjustedDate = new Date(date.getTime() - (3 * 60 * 60 * 1000));

    // Formata para o padrão brasileiro (dia/mês/ano hora:minutos)
    return adjustedDate.toLocaleString('pt-BR');
  } catch (error) {
    console.error("Erro ao formatar a data:", error);
    // Em caso de erro, retorna a data atual (também ajustada)
    const now = new Date();
    const adjusted = new Date(now.getTime() - (3 * 60 * 60 * 1000));
    return adjusted.toLocaleString('pt-BR');
  }
};

/**
 * Generates a PDF based on the solicitation form data with enhanced professional design
 */
export const generateSolicitationPDF = async (
  formData: FormData,
  userName: string,
  userRole: string,
  requestType: RequestType | null
) => {
  // Early return or default values if requestType is null
  if (!requestType) {
    // Use a default request type
    requestType = {
      title: 'Solicitação',
      description: 'Solicitação do sistema',
      color: '#3498db', // Default blue color
    };
  }

  // Check if this is an improvement request based on the requestType title
  const isImprovementRequest = requestType.title.toLowerCase().includes('melhoria');

  // Create a hidden div with formatted content for PDF
  const pdfContent = document.createElement("div");
  pdfContent.style.padding = "16px";
  pdfContent.style.position = "absolute";
  pdfContent.style.left = "-9999px";

  // Get current date formatted
  const currentDate = new Date().toLocaleDateString('pt-BR');

  // Formatar a data do incidente utilizando a hora definida pelo usuário
  let formattedIncidentDate = formatBrazilianDate(formData.incidentDate);

  // Calculate criticality score
  const criticalityScore = calculateCriticalityScore(formData.impact, formData.criticality, formData.frequency);
  const scoreColor = getCriticalityScoreColor(criticalityScore);
  const scoreLabel = getCriticalityScoreLabel(criticalityScore);

  const affectsOthersText = formData.affectsOthers === "yes" ? "Sim" : "Não";

  // Generate color accent based on request type
  const accentColor = requestType.color;

  // Logo path - using the public path
  const logoPath = '/images/logo.png';

  // Calculate appropriate minimum height for description box based on content length
  // This ensures the box grows with the content while maintaining minimum size
  const descriptionMinHeight = Math.max(120, Math.min(500, 100 + formData.details.length / 3));

  // HTML content for the PDF will differ based on the request type
  let htmlContent = `
    <div style="font-family: 'Arial', sans-serif; max-width: 800px; color: #333; line-height: 1.5; background-color: white; margin: 0 auto;">
      <!-- Header - Logo, Title and date -->
      <div style="background-color: #3A3A3A; color: white; padding: 10px 15px; border-radius: 8px 8px 0 0; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 2px 8px rgba(0,0,0,0.2);">
        <div style="display: flex; align-items: center;">
          <img src="${logoPath}" alt="COLET Logo" style="height: 35px; margin-right: 15px;">
          <div>
            <h1 style="margin: 0; font-size: 16px; font-weight: 600; letter-spacing: 0.5px;">${requestType.title}</h1>
            <p style="margin: 5px 0 0 0; font-size: 11px; opacity: 0.9;">${requestType.description}</p>
          </div>
        </div>
        <div style="text-align: right; padding: 6px 10px; border-radius: 6px;">
          <div style="font-size: 12px; font-weight: 600;">COLET SISTEMAS</div>
          <div style="font-size: 11px; margin-top: 3px; opacity: 0.9;">${currentDate}</div>
        </div>
      </div>
      
      <!-- Document title - Updated with vertical alignment -->
      <div style="margin-bottom: 6px; text-align: center; padding: 4px; background-color: #f5f7fa; border-radius: 6px; border-left: 4px solid ${accentColor}; display: flex; align-items: center; justify-content: center; min-height: 35px;">
        <h1 style="margin: 0; font-size: 14px; color: #2c3e50; font-weight: 500;">${formData.title}</h1>
      </div>
      
      <!-- Report Summary - Two column layout with reduced vertical spacing -->
      <div style="display: flex; margin-bottom: 8px; gap: 12px;">
        <!-- Left column: Request information -->
        <div style="flex: 3; background-color: #f9fafc; padding: 8px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.06); border: 1px solid #eaecef;">
          <h2 style="margin: 0 0 5px 0; font-size: 13px; color: #444; border-bottom: 2px solid ${accentColor}; padding-bottom: 4px;">Informações do Chamado</h2>
          
          <div style="display: grid; grid-template-columns: 72px 1fr; row-gap: 6px; font-size: 10px; align-items: center;">
           
            <div style="font-weight: 600; color: #555;">Data:</div>
            <div>${formattedIncidentDate}</div>
            
            <div style="font-weight: 600; color: #555;">Cliente:</div>
            <div>${formData.affectedEstablishment || 'Não especificado'}</div>

            <div style="font-weight: 600; color: #555;">Atendente:</div>
            <div>${userName} <span style="color: #666; font-size: 9px;">(${userRole})</span></div>
            
            <div style="font-weight: 600; color: #555;">Afeta outros:</div>
            <div>${affectsOthersText}</div>
          </div>
        </div>
        
        <!-- Right column: GUT Matrix (Technical Version) -->
        <div style="flex: 1; background: linear-gradient(135deg, ${scoreColor} 0%, ${scoreColor}CC 100%); color: #fff; border-radius: 8px; padding: 8px; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; box-shadow: 0 2px 6px rgba(0,0,0,0.15);">
          <div style="font-size: 10px; font-weight: 500; margin-bottom: 1px; text-transform: uppercase; letter-spacing: 1px;">MATRIZ GUT</div>
          <div style="font-size: 25px; font-weight: 700; margin-bottom: 2px; text-shadow: 1px 1px 2px rgba(0,0,0,0.2);">${criticalityScore}</div>
          <div style="font-size: 11px; margin-bottom: 4px; font-weight: 600; letter-spacing: 0.5px;">${scoreLabel}</div>
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); color: #fff; gap: 4px; font-size: 10px; padding: 3px 6px; border-radius: 4px; width: 80%;">
            <div style="display: flex; flex-direction: column; align-items: center;">
              <span style="font-weight: 600;">G</span>
              <span>${formData.impact}</span>
            </div>
            <div style="display: flex; flex-direction: column; align-items: center;">
              <span style="font-weight: 600;">U</span>
              <span>${formData.criticality}</span>
            </div>
            <div style="display: flex; flex-direction: column; align-items: center;">
              <span style="font-weight: 600;">T</span>
              <span>${formData.frequency}</span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Description section - Updated for better text handling -->
      <div style="margin-bottom: 10px; background-color: #fff; border-radius: 8px; box-shadow: 0 1px 6px rgba(0,0,0,0.08); overflow: hidden; border: 1px solid #eaecef;">
        <h4 style="font-size: 10px; font-weight: 600; color: #fff; background-color: #3A3A3A; padding: 6px 12px; margin: 0; display: flex; align-items: center;">
          ${isImprovementRequest ? 'JUSTIFICATIVA DA MELHORIA' : 'DESCRIÇÃO DO PROBLEMA'}
        </h4>
        <div style="background-color: #fff; padding: 12px; border-radius: 0 0 8px 8px; font-size: 9px; line-height: 1.5; text-align: justify; min-height: ${descriptionMinHeight}px; white-space: pre-wrap; word-break: break-word; overflow-wrap: break-word;">
          ${formData.details.trim() || 'Nenhuma descrição fornecida.'}
        </div>
      </div>`;

  // Add improvement specific sections if this is an improvement request
  if (isImprovementRequest) {
    // Calculate min height based on content length for process descriptions
    const currentProcessMinHeight = Math.max(100, Math.min(300, 80 + (formData.benefitDescription?.length || 0) / 4));
    const futureProcessMinHeight = Math.max(100, Math.min(300, 80 + (formData.futureProcedure?.length || 0) / 4));

    htmlContent += `
      <!-- Current Process Section - Only for improvement requests -->
      <div style="margin-bottom: 10px; background-color: #fff; border-radius: 8px; box-shadow: 0 1px 6px rgba(0,0,0,0.08); overflow: hidden; border: 1px solid #eaecef;">
        <h4 style="font-size: 10px; font-weight: 600; color: #fff; background-color: #3A3A3A; padding: 6px 12px; margin: 0; display: flex; align-items: center;">
          PROCESSO ATUAL
        </h4>
        <div style="background-color: #fff; padding: 12px; border-radius: 0 0 8px 8px; font-size: 9px; line-height: 1.5; text-align: justify; min-height: ${currentProcessMinHeight}px; white-space: pre-wrap; word-break: break-word; overflow-wrap: break-word;">
          ${formData.benefitDescription?.trim() || 'Nenhuma descrição do processo atual fornecida.'}
        </div>
      </div>

      <!-- Future Process Section - Only for improvement requests -->
      <div style="margin-bottom: 10px; background-color: #fff; border-radius: 8px; box-shadow: 0 1px 6px rgba(0,0,0,0.08); overflow: hidden; border: 1px solid #eaecef;">
        <h4 style="font-size: 10px; font-weight: 600; color: #fff; background-color: #3A3A3A; padding: 6px 12px; margin: 0; display: flex; align-items: center;">
          PROCESSO FUTURO DESEJADO
        </h4>
        <div style="background-color: #fff; padding: 12px; border-radius: 0 0 8px 8px; font-size: 9px; line-height: 1.5; text-align: justify; min-height: ${futureProcessMinHeight}px; white-space: pre-wrap; word-break: break-word; overflow-wrap: break-word;">
          ${formData.futureProcedure?.trim() || 'Nenhuma descrição do processo futuro fornecida.'}
        </div>
      </div>
      
      <!-- Operational Impact - Only for improvement requests -->
      <div style="margin-bottom: 10px; background-color: #fff; border-radius: 8px; box-shadow: 0 1px 6px rgba(0,0,0,0.08); overflow: hidden; border: 1px solid #eaecef;">
        <h4 style="font-size: 10px; font-weight: 600; color: #fff; background-color: #3A3A3A; padding: 6px 12px; margin: 0; display: flex; align-items: center;">
          IMPACTO OPERACIONAL
        </h4>
        <div style="background-color: #fff; padding: 12px; border-radius: 0 0 8px 8px; font-size: 9px; line-height: 1.5; display: flex; align-items: center; min-height: 50px;">
          <div style="background-color: ${formData.operationalImpact ? '#f8f9fb' : '#fff'}; padding: 8px 12px; border-radius: 4px; border: 1px solid ${formData.operationalImpact ? '#e1e4e8' : 'transparent'}; width: 100%;">
            ${formData.operationalImpact || 'Não especificado'}
          </div>
        </div>
      </div>`;
  }

  // Technical Information section (common for both types)
  htmlContent += `
      <!-- Technical Information -->
      <div style="margin-bottom: 10px; background-color: #fff; border-radius: 8px; box-shadow: 0 1px 6px rgba(0,0,0,0.08); overflow: hidden; border: 1px solid #eaecef;">
        <h4 style="font-size: 11px; font-weight: 600; color: #fff; background-color: #3A3A3A; padding: 6px 12px; margin: 0; display: flex; align-items: center;">
          INFORMAÇÕES TÉCNICAS
        </h4>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; padding: 6px; background-color: #f9fafc;">
          <div style="background-color: white; padding: 6px; border-radius: 6px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); border: 1px solid #eaecef;">
            <div style="font-size: 9px; font-weight: 600; color: #555; margin-bottom: 4px; display: flex; align-items: center; line-height: 1;">
              Módulo ERP</div>
            <div style="font-size: 9px;">${formData.erpModule || 'Não especificado'}</div>
          </div>

          <div style="background-color: white; padding: 6px; border-radius: 6px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); border: 1px solid #eaecef;">
            <div style="font-size: 9px; font-weight: 600; color: #555; margin-bottom: 4px; display: flex; align-items: center; line-height: 1;">
              Versão</div>
            <div style="font-size: 9px;">${formData.moduleVersion || 'Não especificada'}</div>
          </div>
          
          <div style="background-color: white; padding: 6px; border-radius: 6px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); border: 1px solid #eaecef;">
            <div style="font-size: 9px; font-weight: 600; color: #555; margin-bottom: 4px; display: flex; align-items: center; line-height: 1;">
              Código/Programa</div>
            <div style="font-size: 9px;">${formData.programCodes || 'Não especificado'}</div>
          </div>
          
          <div style="background-color: white; padding: 6px; border-radius: 6px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); border: 1px solid #eaecef; ">
            <div style="font-size: 9px; font-weight: 600; color: #555; margin-bottom: 4px; display: flex; align-items: center; line-height: 1;">
              Sistema Operacional</div>
            <div style="font-size: 9px;">${formData.operatingSystem || 'Não especificado'}</div>
          </div>

          <div style="background-color: white; padding: 6px; border-radius: 6px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); border: 1px solid #eaecef; grid-column: span 2;">
            <div style="font-size: 9px; font-weight: 600; color: #555; margin-bottom: 4px; display: flex; align-items: center; line-height: 1;">
              Banco de Dados</div>
            <div style="font-size: 9px;">${formData.selectedDatabase || 'Não especificado'}</div>
          </div>
        </div>
      </div>
    </div>
  `;

  pdfContent.innerHTML = htmlContent;

  document.body.appendChild(pdfContent);

  // Generate the PDF
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true
  });

  // Add metadata to the PDF
  pdf.setProperties({
    title: `${requestType.title}: ${formData.title}`,
    subject: `${requestType.title}: ${formData.title}`,
    author: userName,
    creator: 'COLET System'
  });

  const canvas = await html2canvas(pdfContent, {
    scale: 2.5,
    useCORS: true,
    logging: false,
    backgroundColor: '#ffffff'
  });

  const imgData = canvas.toDataURL('image/png');
  const imgWidth = 210; // A4 width in mm
  const pageHeight = 287; // A4 height in mm (slightly reduced to ensure no cutoff at page bottom)
  const imgHeight = canvas.height * imgWidth / canvas.width;

  // Implement smart page breaks to avoid cutting content in the middle
  // Instead of cutting the image at fixed intervals, we'll split it into logical sections
  const contentSections = [];

  // Determine if the content is large enough to need multiple pages
  if (imgHeight > pageHeight) {
    // Calculate how many pages we need
    const numPages = Math.ceil(imgHeight / pageHeight);
    const pageHeightInPixels = (pageHeight / imgWidth) * canvas.width;

    // For each page, try to find a good breaking point (empty space) if possible
    for (let i = 0; i < numPages; i++) {
      const startY = i * pageHeightInPixels;
      let endY = Math.min((i + 1) * pageHeightInPixels, canvas.height);

      // If this is not the last page, try to find a better breaking point
      // by looking for empty space within a reasonable range
      if (i < numPages - 1 && endY < canvas.height) {
        // Look for a better breaking point within 5% of the page height
        const searchRange = 0.05 * pageHeightInPixels;
        const searchStart = Math.max(0, endY - searchRange);
        const searchEnd = Math.min(canvas.height, endY + searchRange);

        // We'll use this section as is if we can't find a better breaking point
        contentSections.push({
          startY: startY,
          endY: endY
        });
      } else {
        // Last page or no better breaking point found
        contentSections.push({
          startY: startY,
          endY: endY
        });
      }
    }
  } else {
    // Content fits on a single page
    contentSections.push({
      startY: 0,
      endY: canvas.height
    });
  }

  // Add the content to the PDF, handling each section as a separate page
  contentSections.forEach((section, index) => {
    if (index > 0) {
      pdf.addPage();
    }

    const sectionHeight = section.endY - section.startY;
    const sectionHeightInMM = sectionHeight * (imgWidth / canvas.width);

    // Position to place the image - negative values move image up to show the part we want
    const yPositionInMM = -(section.startY * (imgWidth / canvas.width));

    // Add the entire image but position it to show only the current section
    pdf.addImage(imgData, 'PNG', 0, yPositionInMM, imgWidth, imgHeight);
  });

  // Add attachments header with smaller font size
  if (formData.attachments.length > 0) {
    pdf.addPage();

    // Simplified attachments header - more professional with smaller size
    pdf.setFillColor(parseInt(accentColor.substring(1, 3), 16), parseInt(accentColor.substring(3, 5), 16), parseInt(accentColor.substring(5, 7), 16));
    pdf.rect(0, 0, 210, 10, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(11);
    pdf.text('Anexos', 15, 7);

    let yPosition = 25;

    for (let i = 0; i < formData.attachments.length; i++) {
      const file = formData.attachments[i];

      // Clean file information display
      pdf.setTextColor(80, 80, 80);
      pdf.setFontSize(12);
      pdf.text(`${i + 1}. ${file.name}`, 15, yPosition);

      // Add file type and size on the same line
      pdf.setFontSize(9);
      pdf.setTextColor(120, 120, 120);
      pdf.text(`${file.type || 'Tipo desconhecido'} · ${(file.size / 1024).toFixed(1)} KB`, 15, yPosition + 5);

      yPosition += 15;

      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        await new Promise<void>((resolve) => { // Remove unused 'reject' parameter
          reader.onload = function (event) {
            try {
              if (!event.target || event.target.result === null) {
                throw new Error("Failed to load image data");
              }
              const imgData = event.target.result as string;

              // Calculate dimensions to fit on page with margins
              const imgProps = pdf.getImageProperties(imgData);
              const maxWidth = 170; // Slightly narrower for better margins
              const maxHeight = 210; // Reduced max height to ensure no cut-offs

              // Calculate dimensions maintaining aspect ratio
              let imgWidth = imgProps.width;
              let imgHeight = imgProps.height;

              // Scale down if wider than maxWidth
              if (imgWidth > maxWidth) {
                const ratio = maxWidth / imgWidth;
                imgWidth = maxWidth;
                imgHeight = imgHeight * ratio;
              }

              // Further scale down if taller than maxHeight
              if (imgHeight > maxHeight) {
                const ratio = maxHeight / imgHeight;
                imgHeight = maxHeight;
                imgWidth = imgWidth * ratio;
              }

              // Check if image will fit on current page with 40px margin at bottom (increased from 30)
              if (yPosition + imgHeight + 40 > 260) { // Reduced from 270 to provide more bottom margin
                pdf.addPage();
                pdf.setFillColor(parseInt(accentColor.substring(1, 3), 16), parseInt(accentColor.substring(3, 5), 16), parseInt(accentColor.substring(5, 7), 16));
                pdf.rect(0, 0, 210, 10, 'F');
                pdf.setTextColor(255, 255, 255);
                pdf.setFontSize(11);
                pdf.text('Visualização dos Anexos (continuação)', 15, 7);
                yPosition = 25;
              }

              // Add a light background for the image area
              pdf.setFillColor(248, 249, 250); // Light gray background
              pdf.setDrawColor(200, 200, 200);
              pdf.roundedRect(15, yPosition, imgWidth + 10, imgHeight + 10, 3, 3, 'FD');

              // Center the image in the background area
              const xOffset = 20; // 15 (left margin) + 5 (padding)
              const yOffset = yPosition + 5; // 5px padding from top of background

              // Add image
              pdf.addImage(imgData, 'JPEG', xOffset, yOffset, imgWidth, imgHeight);

              // Add caption below the image
              yPosition += imgHeight + 15;
              pdf.setFontSize(8);
              pdf.setTextColor(100, 100, 100);

              // Format the caption with ellipsis if too long
              const caption = `Fig ${i + 1}: ${file.name.length > 50 ? file.name.substring(0, 47) + '...' : file.name}`;
              const textWidth = pdf.getStringUnitWidth(caption) * 8 * 0.352778; // Convert to mm

              // Center the caption under the image
              const captionX = Math.max(15, 15 + (imgWidth / 2) - (textWidth / 2));
              pdf.text(caption, captionX, yPosition);

              yPosition += 20; // Additional space after image and caption
              resolve(); // Call resolve without arguments
            } catch (error) {
              console.error("Error processing image:", error);
              // Fallback for image processing errors
              pdf.setDrawColor(220, 220, 220);
              pdf.setFillColor(245, 245, 245);
              pdf.roundedRect(15, yPosition, 180, 20, 2, 2, 'FD');
              pdf.setTextColor(180, 0, 0);
              pdf.setFontSize(10);
              pdf.text(`Erro ao processar a imagem: ${file.name}`, 20, yPosition + 12);
              yPosition += 30;
              resolve(); // Call resolve without arguments
            }
          };
          reader.onerror = function (error) {
            console.error("Error reading file:", error);
            pdf.setDrawColor(220, 220, 220);
            pdf.setFillColor(245, 245, 245);
            pdf.roundedRect(15, yPosition, 180, 20, 2, 2, 'FD');
            pdf.setTextColor(180, 0, 0);
            pdf.setFontSize(10);
            pdf.text(`Erro ao carregar o arquivo: ${file.name}`, 20, yPosition + 12);
            yPosition += 30;
            resolve(); // Call resolve without arguments
          };
          reader.readAsDataURL(file);
        });
      } else {
        // For non-image files, simple indication
        pdf.setDrawColor(220, 220, 220);
        pdf.setFillColor(245, 245, 245);
        pdf.roundedRect(15, yPosition, 180, 15, 2, 2, 'FD');
        pdf.setTextColor(100, 100, 100);
        pdf.setFontSize(10);
        pdf.text(`Arquivo não visualizável: ${file.type || 'formato desconhecido'}`, 20, yPosition + 9);

        yPosition += 25;
      }

      // Add new page if needed for next attachment - check with a larger margin
      if (yPosition > 250 && i < formData.attachments.length - 1) { // Reduced from 260 for more margin
        pdf.addPage();
        pdf.setFillColor(parseInt(accentColor.substring(1, 3), 16), parseInt(accentColor.substring(3, 5), 16), parseInt(accentColor.substring(5, 7), 16));
        pdf.rect(0, 0, 210, 10, 'F');
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(11);
        pdf.text('Visualização dos Anexos (continuação)', 15, 7);
        yPosition = 25;
      }
    }
  }

  // Add minimalist page numbers with smaller font
  const totalPages = pdf.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i);
    pdf.setFontSize(8); // Reduced font size for page numbers
    pdf.setTextColor(130, 130, 130);

    // Simple page numbers without footer line
    pdf.text(`Página ${i} de ${totalPages}`, 195, 286, { align: 'right' });
  }

  // Remove the temporary div
  document.body.removeChild(pdfContent);

  // Generate a structured filename for developers - without bug ID
  const date = new Date(formData.incidentDate);
  const dateString = `${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}`;
  const filename = `${requestType.title.replace(/\s+/g, '_')}_${dateString}_${formData.title.substring(0, 20).replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;

  // Save the PDF
  pdf.save(filename);
};
