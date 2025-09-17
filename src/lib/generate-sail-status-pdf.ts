
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import type { RowInput } from 'jspdf-autotable';
import { format } from 'date-fns';
import type { EnrichedWorkItem } from '@/components/status/sail-status-card';
import { defectCategories } from '@/lib/qc-data';

interface jsPDFWithAutoTable extends jsPDF {
  autoTable: (options: any) => jsPDFWithAutoTable;
}

const readFileAsDataURL = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
};

export async function generateSailStatusPdf(item: EnrichedWorkItem) {
    const doc = new jsPDF() as jsPDFWithAutoTable;
    let yPos = 20;
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 14;

    const checkNewPage = (spaceNeeded: number) => {
        if (yPos + spaceNeeded > pageHeight - margin) {
            doc.addPage();
            yPos = margin;
        }
    };

    const addSection = (title: string, content: () => void | Promise<void>) => {
        checkNewPage(20);
        doc.setFontSize(14);
        doc.setFont(undefined, 'bold');
        doc.text(title, margin, yPos);
        yPos += 8;
        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        return Promise.resolve(content());
    };
    
    // --- PDF Content ---

    // 1. Header Section
    doc.setFontSize(18).setFont(undefined, 'bold').text('Sail Status Report', margin, yPos);
    yPos += 10;
    doc.setFontSize(12).setFont(undefined, 'normal');
    doc.text(`OE: ${item.oeNumber} - Sail: ${item.section}`, margin, yPos);
    yPos += 7;
    doc.text(`Report Generated: ${format(new Date(), 'PPP')}`, margin, yPos);
    yPos += 10;

    // 2. Tapeheads Department
    await addSection('Tapeheads Department', () => {
        const tableBody: RowInput[] = [
            ['Date of Entry:', format(new Date(item.report.date), 'PPP')],
            ['Operator:', item.report.operatorName || 'N/A'],
            ['Work Type:', item.nestedPanels && item.nestedPanels.length > 0 ? 'Nested' : 'Individual'],
            ['Material Type:', item.materialType],
            ['Shift Status:', item.endOfShiftStatus],
            ['Layer:', item.endOfShiftStatus === 'In Progress' ? item.layer || 'N/A' : 'N/A'],
            ['Meters Produced:', `${item.total_meters}m`],
            ['Tapes Used:', `${item.total_tapes}`],
            ['Spinouts:', item.had_spin_out ? `Yes (${item.spin_out_duration_minutes || 0} min)` : 'No'],
            ['Problems:', item.issues?.map(i => i.problem_reason).join(', ') || 'None'],
        ];

        doc.autoTable({
            body: tableBody,
            startY: yPos,
            theme: 'plain',
            styles: { cellPadding: 1.5, fontSize: 9 },
            columnStyles: { 0: { fontStyle: 'bold', cellWidth: 40 } },
        });
        yPos = doc.autoTable.previous.finalY + 10;
    });

    // 3. Films Department
    if (item.filmsInfo.status !== 'No Entry') {
        await addSection('Films Department', () => {
            doc.autoTable({
                body: [
                    ['Status:', item.filmsInfo.status],
                    ['Work Date:', item.filmsInfo.workDate ? format(new Date(item.filmsInfo.workDate), 'PPP') : 'N/A'],
                    ['Gantry Assigned:', `Gantry ${item.filmsInfo.gantry || 'N/A'}`],
                    ['Notes:', item.filmsInfo.notes || 'None'],
                ],
                startY: yPos,
                theme: 'grid',
                styles: { cellPadding: 2, fontSize: 9 },
                headStyles: { fillColor: [22, 160, 133], textColor: 255 },
                columnStyles: { 0: { fontStyle: 'bold' } },
            });
            yPos = doc.autoTable.previous.finalY + 10;
        });
    }
    
    // 4. Gantry Department
    if (item.gantryHistory.length > 0) {
        await addSection('Gantry Department', async () => {
            for (const entry of item.gantryHistory) {
                checkNewPage(40); // Check space for each entry
                doc.setFontSize(10).setFont(undefined, 'bold');
                doc.text(`Entry Date: ${format(new Date(entry.date), 'PPP')}`, margin + 2, yPos);
                yPos += 6;

                doc.autoTable({
                    body: [
                        ['Gantry / Mold:', entry.moldNumber],
                        ['Stage of Process:', entry.stage],
                        ['Issues:', entry.issues || 'None'],
                        ['Downtime:', entry.downtimeCaused ? 'Yes' : 'No'],
                    ],
                    startY: yPos,
                    theme: 'striped',
                    styles: { cellPadding: 1.5, fontSize: 9 },
                    columnStyles: { 0: { fontStyle: 'bold', cellWidth: 35 } },
                });
                yPos = doc.autoTable.previous.finalY + 5;
                
                if (entry.images && entry.images.length > 0) {
                     doc.setFontSize(9).setFont(undefined, 'bold').text('Visual Log:', margin + 2, yPos);
                     yPos += 5;
                     for (const file of entry.images) {
                        if (file instanceof File) {
                            try {
                                const dataUrl = await readFileAsDataURL(file);
                                checkNewPage(60); 
                                doc.addImage(dataUrl, 'JPEG', margin + 4, yPos, 80, 50);
                                yPos += 55;
                            } catch (error) {
                                console.error("Error adding image:", error);
                            }
                        }
                     }
                }
                yPos += 5;
            }
        });
    }

    // 5. QC Inspection
    if (item.qcInspection) {
         await addSection('Quality Control Inspection', () => {
            doc.autoTable({
                 head: [['QC Summary']],
                 body: [
                    [`Date: ${format(new Date(item.qcInspection!.inspectionDate), 'PPP')}`],
                    [`Inspector: ${item.qcInspection!.inspectorName}`],
                    [`Final Score: ${item.qcInspection!.totalScore}`],
                    [`Status: ${item.qcInspection!.status}`],
                    [`Reinspection: ${item.qcInspection!.reinspection?.finalOutcome || 'N/A'}`],
                    [`Reinspection Notes: ${item.qcInspection!.reinspection?.comments || 'N/A'}`]
                 ],
                 startY: yPos,
                 theme: 'grid',
            });
            yPos = doc.autoTable.previous.finalY + 10;
        });
    }

    // --- Save PDF ---
    const dateStr = format(new Date(), 'yyyyMMdd');
    doc.save(`SailStatus_${item.oeNumber}-${item.section}_${dateStr}.pdf`);
}
