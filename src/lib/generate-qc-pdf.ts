
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import type { RowInput } from 'jspdf-autotable';
import { format } from 'date-fns';
import type { InspectionFormValues } from '@/components/qc/3di-inspection-form';
import { defectCategories } from '@/lib/qc-data';

interface ReportInfo {
    totalScore: number;
    statusText: string;
}

// Extend jsPDF with the autoTable plugin
interface jsPDFWithAutoTable extends jsPDF {
  autoTable: (options: any) => jsPDFWithAutoTable;
}

// Helper to read file as a data URL
const readFileAsDataURL = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
};


export async function generatePdf(data: InspectionFormValues, info: ReportInfo) {
    const doc = new jsPDF() as jsPDFWithAutoTable;
    let yPos = 20;

    // Helper to add sections with reduced spacing
    const addSection = (title: string, content: () => void, newPage = false) => {
        if (newPage) {
            doc.addPage();
            yPos = 20;
        } else if (yPos > 250) { // Check if new page is needed
             doc.addPage();
             yPos = 20;
        }
        doc.setFontSize(14);
        doc.text(title, 14, yPos);
        yPos += 8; // Reduced space after section title
        doc.setFontSize(10);
        content();
    };

    // --- PDF Content ---

    // Title
    doc.setFontSize(18).text('3Di QC Inspection Report', 14, yPos);
    yPos += 12;

    // Section 1: Inspection Metadata
    addSection('Inspection Metadata', () => {
        const metadata = [
            ['Inspection Date:', format(data.inspectionDate, 'PPP')],
            ['OE Number:', data.oeNumber || 'N/A'],
            ['Inspector Name:', data.inspectorName || 'N/A'],
        ];
        doc.autoTable({
            body: metadata,
            startY: yPos,
            theme: 'plain',
            styles: { cellPadding: 1, fontSize: 10 },
            columnStyles: { 0: { fontStyle: 'bold' } },
        });
        yPos = doc.autoTable.previous.finalY + 8;
    });

    // Section 2: DPI & Lamination
    addSection('DPI and Lamination Parameters', () => {
        doc.setFontSize(10).text(`DPI Type: ${data.dpiType}`, 14, yPos);
        yPos += 7;
        
        doc.setFontSize(11).text('Lamination Temperatures:', 14, yPos);
        yPos += 6;

        const tempTable = (side: 'single' | 'port' | 'starboard') => {
            const tempData = data.laminationTemp?.[side];
            
            if (side !== 'single') {
                 doc.setFontSize(10).setFont(undefined, 'bold').text(side === 'port' ? 'Port Side' : 'Starboard Side', 16, yPos);
                 yPos += 5;
            }
            doc.autoTable({
                body: [
                    ['Head:', `${tempData?.head || 'N/A'} °C`],
                    ['Tack:', `${tempData?.tack || 'N/A'} °C`],
                    ['Clew:', `${tempData?.clew || 'N/A'} °C`],
                    ['Belly:', `${tempData?.belly_min || 'N/A'} °C – ${tempData?.belly_max || 'N/A'} °C`],
                ],
                startY: yPos,
                theme: 'grid',
                styles: { fontSize: 9, cellPadding: 1.5 },
                head: [['Parameter', 'Value']],
                margin: { left: 16 }
            });
            yPos = doc.autoTable.previous.finalY + 6;
        }

        if (data.dpiType === '<50000') {
            tempTable('single');
        } else {
            tempTable('port');
            tempTable('starboard');
        }
        
        doc.setFontSize(11).text('Vacuum Gauge Readings:', 14, yPos);
        yPos += 6;
        const vacuumRows: RowInput[] = [];
        for (let i = 0; i < 10; i++) {
            vacuumRows.push([
                `${i + 1}`,
                data.vacuumReadings.before[i] || 'N/A',
                data.vacuumReadings.after[i] || 'N/A'
            ]);
        }
        doc.autoTable({
            head: [['Position', 'Before Lamination', 'After Lamination']],
            body: vacuumRows,
            startY: yPos,
            theme: 'grid',
            styles: { fontSize: 9, cellPadding: 1.5 },
            headStyles: { fillColor: [44, 62, 80], fontSize: 10 }
        });
        yPos = doc.autoTable.previous.finalY + 8;
        
        doc.setFontSize(11).text('QC Comments:', 14, yPos);
        yPos += 5;
        doc.setFontSize(10).text(data.qcComments || 'None', 14, yPos, { maxWidth: 180 });
        yPos = doc.autoTable.previous.finalY + 15;
    });


    // Section 3: Defect Scoring
    addSection('Defect Scoring Summary', () => {
         doc.autoTable({
            body: [
                ['Total Score:', `${info.totalScore}`],
                ['Status:', info.statusText]
            ],
            startY: yPos,
            theme: 'plain',
            styles: { cellPadding: 1, fontSize: 10 },
            columnStyles: { 0: { fontStyle: 'bold' } },
        });
        yPos = doc.autoTable.previous.finalY + 8;
        
        defectCategories.forEach(category => {
            if (yPos > 250) { doc.addPage(); yPos = 20; }
            doc.setFontSize(11).text(category.title, 14, yPos);
            yPos += 6;
            const defectRows: RowInput[] = [];
            category.defects.forEach(defectInfo => {
                 const defectData = (data.defects as any)[category.id][defectInfo.key];
                 if(defectData && defectData.present) { // Lamination
                    defectRows.push([defectInfo.label, `Score: ${defectData.severity || 0}`, defectData.description || 'N/A']);
                 } else if (defectData && Array.isArray(defectData) && defectData.length > 0) { // Structural / Cosmetic
                     const scores = defectData.map((d: any) => d.severity).join(', ');
                     defectRows.push([defectInfo.label, `Scores: [${scores}]`, '']);
                 }
            });

            if (defectRows.length > 0) {
                 doc.autoTable({
                    head: [['Defect', 'Score/s', 'Description']],
                    body: defectRows,
                    startY: yPos,
                    theme: 'striped',
                    styles: { fontSize: 9 },
                    headStyles: { fillColor: [52, 73, 94] }
                });
                yPos = doc.autoTable.previous.finalY + 8;
            } else {
                 doc.setFontSize(9).text('No defects recorded in this category.', 16, yPos);
                 yPos += 7;
            }
        });
    }, true);
    
    // Section 4: Reinspection
    if (info.totalScore >= 61 && info.totalScore < 100) {
        addSection('Reinspection Outcome', () => {
             doc.autoTable({
                body: [
                    ['Final Decision:', data.reinspection?.finalOutcome || 'N/A'],
                    ['Notes:', data.reinspection?.comments || 'None'],
                ],
                startY: yPos,
                theme: 'plain',
                styles: { cellPadding: 1, fontSize: 10 },
                columnStyles: { 0: { fontStyle: 'bold' } },
            });
            yPos = doc.autoTable.previous.finalY + 8;
        });
    }
    
    // New Found Defects
    if (data.newFoundDefects && data.newFoundDefects.length > 0) {
         addSection('New Found Defects', () => {
            data.newFoundDefects?.forEach(defect => {
                doc.autoTable({
                    body: [
                         ['Panel Number:', defect.panelNumber || 'N/A'],
                         ['Scarf Joint:', defect.scarfJoint || 'N/A'],
                         ['Number of Defects:', `${defect.numberOfDefects || 0}`],
                         ['Defect Score:', `${defect.defectScore || 0}`],
                         ['Comments:', defect.comments || 'None'],
                    ],
                    startY: yPos,
                    theme: 'grid',
                    styles: { fontSize: 9, cellPadding: 1.5 },
                    margin: { left: 14 }
                });
                yPos = doc.autoTable.previous.finalY + 4;
            });
        }, yPos > 200); // Start on new page if not enough space
    }
    
    // --- Image Evidence ---
    const allImages = [
        { title: 'General Attachments', files: data.attachments || [] },
        { title: 'Port Side Pictures', files: data.defectPictures?.port || [] },
        { title: 'Starboard Side Pictures', files: data.defectPictures?.starboard || [] },
        { title: 'Structural Defect Pictures', files: data.defectPictures?.structural || [] },
    ].filter(section => section.files.length > 0);

    if (allImages.length > 0) {
        doc.addPage();
        yPos = 20;
        doc.setFontSize(14).text('Image Evidence', 14, yPos);
        yPos += 10;

        for (const imageSection of allImages) {
            if (yPos > 260) { doc.addPage(); yPos = 20; }
            doc.setFontSize(11).text(imageSection.title, 14, yPos);
            yPos += 7;

            for (const file of imageSection.files) {
                if(file instanceof File) {
                    try {
                        const dataUrl = await readFileAsDataURL(file);
                        const img = new Image();
                        img.src = dataUrl;
                        await new Promise(resolve => img.onload = resolve);
                        
                        const imgProps = doc.getImageProperties(dataUrl);
                        const pdfWidth = doc.internal.pageSize.getWidth();
                        const aspect = imgProps.height / imgProps.width;
                        const imgWidth = pdfWidth - 30; // with margin
                        const imgHeight = imgWidth * aspect;

                        if (yPos + imgHeight > 280) {
                            doc.addPage();
                            yPos = 20;
                        }
                        
                        doc.addImage(dataUrl, 'JPEG', 15, yPos, imgWidth, imgHeight);
                        yPos += imgHeight + 8;

                    } catch (error) {
                        console.error("Error adding image to PDF:", error);
                        if (yPos > 260) { doc.addPage(); yPos = 20; }
                        doc.setFontSize(10).text(`Could not render image: ${file.name}`, 16, yPos);
                        yPos += 7;
                    }
                }
            }
             yPos += 4; // Extra space after an image section
        }
    }

    // --- Save PDF ---
    const dateStr = format(new Date(), 'yyyy-MM-dd');
    doc.save(`QC_Report_OE_${data.oeNumber || 'UNTITLED'}_${dateStr}.pdf`);
}
