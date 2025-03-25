import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

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
    operatingSystem: string;
}

interface RequestType {
    title: string;
    description: string;
    color: string;
    icon?: JSX.Element;
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
 * Generates a PDF based on the solicitation form data with enhanced professional design
 */
export const generateSolicitationPDF = async (
    formData: FormData,
    userName: string,
    userRole: string,
    requestType: RequestType
) => {
    // Create a hidden div with formatted content for PDF
    const pdfContent = document.createElement("div");
    pdfContent.style.padding = "16px";
    pdfContent.style.position = "absolute";
    pdfContent.style.left = "-9999px";

    // Get current date formatted
    const currentDate = new Date().toLocaleDateString('pt-BR');

    // Format incident date for display
    let formattedIncidentDate = '';
    try {
        const incidentDate = new Date(formData.incidentDate);
        formattedIncidentDate = incidentDate.toLocaleString('pt-BR');
    } catch (e) {
        formattedIncidentDate = formData.incidentDate || 'Não especificada';
    }

    // Calculate criticality score
    const criticalityScore = calculateCriticalityScore(formData.impact, formData.criticality, formData.frequency);
    const scoreColor = getCriticalityScoreColor(criticalityScore);
    const scoreLabel = getCriticalityScoreLabel(criticalityScore);

    const affectsOthersText = formData.affectsOthers === "yes" ? "Sim" : "Não";

    // Generate color accent based on request type
    const accentColor = requestType.color;

    // Logo path - using the public path
    const logoPath = '/images/logo.png';

    pdfContent.innerHTML = `
    <div style="font-family: 'Courier New', 'Consolas', monospace; max-width: 800px; color: #333; line-height: 1.5; background-color: white; margin: 0 auto;">
      <!-- Header - Logo, Title and date -->
      <div style="background-color: ${accentColor}; color: white; padding: 10px 12px; border-radius: 6px 6px 0 0; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 2px 8px rgba(0,0,0,0.15);">
        <div style="display: flex; align-items: center;">
          <img src="${logoPath}" alt="COLET Logo" style="height: 40px; margin-right: 15px;">
          <div>
            <h1 style="margin: 0; font-size: 22px; font-weight: 500; letter-spacing: 0.4px; font-family: 'Arial', sans-serif;">${requestType.title}</h1>
            <p style="margin: 8px 0 0 0; font-size: 13px; opacity: 0.9;">${requestType.description}</p>
          </div>
        </div>
        <div style="text-align: right;">
          <div style="font-size: 13px; font-weight: 600;">COLET SISTEMAS</div>
          <div style="font-size: 12px; margin-top: 5px; opacity: 0.9;">${currentDate}</div>
        </div>
      </div>
      
      <!-- Report Summary - Two column layout -->
      <div style="display: flex; margin-bottom: 20px; gap: 20px;">
        <!-- Left column: Bug summary -->
        <div style="flex: 3; background-color: #f9fafc; padding: 10px; border-radius: 6px; box-shadow: 0 1px 4px rgba(0,0,0,0.08); border-left: 3px solid ${accentColor};">
          <h2 style="margin: 0 0 8px 0; font-size: 15px; color: #444; letter-spacing: 0.2px; border-bottom: 1px solid #eaecef; padding-bottom: 10px; font-family: 'Consolas', monospace;">${formData.title}</h2>
          <div style="font-size: 14px; margin-bottom: 10px; display: flex; font-family: 'Courier New', monospace;">
            <span style="font-weight: 600; color: #555; min-width: 75px;">Relator:</span> 
            <span>${userName} (${userRole})</span>
          </div>
          <div style="font-size: 14px; margin-bottom: 10px; display: flex; font-family: 'Courier New', monospace;">
            <span style="font-weight: 600; color: #555; min-width: 75px;">Data:</span>
            <span>${formattedIncidentDate}</span>
          </div>
          <div style="font-size: 14px; display: flex; font-family: 'Courier New', monospace;">
            <span style="font-weight: 600; color: #555; min-width: 75px;">Cliente:</span>
            <span>${formData.affectedEstablishment || 'Não especificado'}</span>
          </div>
        </div>
        
        <!-- Right column: GUT Matrix (Technical Version) -->
        <div style="flex: 1; background-color:${scoreColor}; color: #fff; border-radius: 4px; padding: 10px; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; box-shadow: 0 1px 3px rgba(0,0,0,0.1); border: 1px solid #ddd;">
          <div style="font-size: 10px; font-weight: 500; margin-bottom: 3px; text-transform: uppercase; font-family: 'Consolas', monospace;">MATRIZ GUT</div>
          <div style="font-size: 22px; font-weight: 600; margin-bottom: 3px; color: #fff;">${criticalityScore}</div>
          <div style="font-size: 12px; margin-bottom: 6px;color: #fff; font-family: 'Consolas', monospace;">${scoreLabel}</div>
          <div style="display: flex; justify-content: center; color: #fff; gap: 8px; font-size: 10px; font-family: 'Courier New', monospace; padding: 4px; border-radius: 3px; width: 100%;">
            <span>G:${formData.impact}</span>
            <span>U:${formData.criticality}</span>
            <span>T:${formData.frequency}</span>
          </div>
        </div>
      </div>
      
      <!-- Description section -->
      <div style="margin-bottom: 20px; background-color: #fff; border-radius: 6px; box-shadow: 0 1px 4px rgba(0,0,0,0.08);">
        <h3 style="font-size: 14px; font-weight: 600; color: #fff; background-color: #3A3A3A; padding: 8px 12px; border-radius: 6px 6px 0 0; margin: 0; letter-spacing: 0.3px; font-family: 'Arial', sans-serif;">
          DESCRIÇÃO DO PROBLEMA
        </h3>
        <div style="background-color: #fff; padding: 10px; border-radius: 0 0 6px 6px; font-size: 13px; white-space: pre-wrap; line-height: 1.6; text-align: left; min-height: ${Math.min(160, 70 + formData.details.length / 5)}px; border: 1px solid #eaecef; border-top: none; font-family: 'Courier New', monospace;">
          ${formData.details}
        </div>
      </div>
      
      <!-- Technical Information -->
      <div style="margin-bottom: 30px;">
        <h3 style="font-size: 14px; font-weight: 600; color: #fff; background-color: #3A3A3A; padding: 8px 12px; border-radius: 6px 6px 0 0; margin: 0 0 -1px 0; letter-spacing: 0.3px; font-family: 'Arial', sans-serif;">
          INFORMAÇÕES TÉCNICAS
        </h3>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; background-color: #fff; border: 1px solid #eaecef; border-radius: 0 0 6px 6px; padding: 10px;">
          <div style="background-color: #f8f9fa; padding: 12px; border-radius: 5px; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
            <div style="font-size: 12px; font-weight: 600; color: #555; margin-bottom: 6px;">Versão</div>
            <div style="font-size: 13px;">${formData.moduleVersion || 'Não especificada'}</div>
          </div>
          
          <div style="background-color: #f8f9fa; padding: 12px; border-radius: 5px; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
            <div style="font-size: 12px; font-weight: 600; color: #555; margin-bottom: 6px;">Tela</div>
            <div style="font-size: 13px;">${formData.screenName || 'Não especificada'}</div>
          </div>
          
          <div style="background-color: #f8f9fa; padding: 12px; border-radius: 5px; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
            <div style="font-size: 12px; font-weight: 600; color: #555; margin-bottom: 6px;">Código/Programa</div>
            <div style="font-size: 13px;">${formData.programCodes || 'Não especificado'}</div>
          </div>
          
          <div style="background-color: #f8f9fa; padding: 12px; border-radius: 5px; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
            <div style="font-size: 12px; font-weight: 600; color: #555; margin-bottom: 6px;">Sistema Operacional</div>
            <div style="font-size: 13px;">${formData.operatingSystem || 'Não especificado'}</div>
          </div>
          
          <div style="background-color: #f8f9fa; padding: 12px; border-radius: 5px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); grid-column: span 2;">
            <div style="font-size: 12px; font-weight: 600; color: #555; margin-bottom: 6px;">Afeta outros usuários</div>
            <div style="font-size: 13px;">${affectsOthersText}</div>
          </div>
        </div>
      </div>
    </div>
  `;

    document.body.appendChild(pdfContent);

    // Generate the PDF
    const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true,
        margins: { top: 18, right: 18, bottom: 25, left: 18 } // Increased bottom margin
    });

    // Add metadata to the PDF
    pdf.setProperties({
        title: `${requestType.title}: ${formData.title}`,
        subject: `${requestType.title}: ${formData.title}`,
        author: userName,
        creator: 'COLET System'
    });

    const canvas = await html2canvas(pdfContent, {
        scale: 2.5, // Higher scale for better quality
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
    });

    const imgData = canvas.toDataURL('image/png');
    const imgWidth = 210; // A4 width in mm
    const pageHeight = 287; // Reduced height to provide bottom margin (A4 is 297mm)
    const imgHeight = canvas.height * imgWidth / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    // Add multiple pages if content is long
    while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
    }

    // Add attached files as images if they are images
    if (formData.attachments.length > 0) {
        pdf.addPage();

        // Simplified attachments header - more professional
        pdf.setFillColor(parseInt(accentColor.substring(1, 3), 16), parseInt(accentColor.substring(3, 5), 16), parseInt(accentColor.substring(5, 7), 16));
        pdf.rect(0, 0, 210, 12, 'F');
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(12);
        pdf.text('Anexos', 15, 8);

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
                await new Promise((resolve, reject) => {
                    reader.onload = function (event) {
                        try {
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
                                pdf.rect(0, 0, 210, 12, 'F');
                                pdf.setTextColor(255, 255, 255);
                                pdf.setFontSize(12);
                                pdf.text('Visualização dos Anexos (continuação)', 15, 8);
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
                            resolve(null);
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
                            resolve(null);
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
                        resolve(null);
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
                pdf.rect(0, 0, 210, 12, 'F');
                pdf.setTextColor(255, 255, 255);
                pdf.setFontSize(12);
                pdf.text('Visualização dos Anexos (continuação)', 15, 8);
                yPosition = 25;
            }
        }
    }

    // Add minimalist page numbers
    const totalPages = pdf.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8); // Smaller font
        pdf.setTextColor(160, 160, 160); // Lighter color for subtlety

        // Page numbers at bottom right with good margin
        pdf.text(`${i} / ${totalPages}`, 190, 287, { align: 'right' });
    }

    // Remove the temporary div
    document.body.removeChild(pdfContent);

    // Generate a structured filename for developers - without bug ID
    const date = new Date();
    const dateString = `${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}`;
    const timeString = `${date.getHours().toString().padStart(2, '0')}${date.getMinutes().toString().padStart(2, '0')}`;
    const filename = `${requestType.title.replace(/\s+/g, '_')}_${dateString}_${formData.title.substring(0, 20).replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;

    // Save the PDF
    pdf.save(filename);
};
