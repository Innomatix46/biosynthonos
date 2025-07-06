/**
 * @file A component for exporting a simulation result card to a multi-page PDF report.
 */
import React from 'react';
import { useTranslation } from 'react-i18next';
import jsPDF from 'jspdf';
import * as htmlToImage from 'html-to-image';
import { SimulationResult } from '../../shared/types';
import { useToast } from '../../hooks/useToast';
import { FileDown } from 'lucide-react';

interface PDFReportExportProps {
  result: SimulationResult;
}

export const PDFReportExport: React.FC<PDFReportExportProps> = ({ result }) => {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const [isExporting, setIsExporting] = React.useState(false);
  
  const targetId = `simulation-card-${result.id}`;
  const filename = `BioSynthonos-Report-${result.profile.age}yo-${result.id.slice(-6)}.pdf`;

  const handleExport = async () => {
    const input = document.getElementById(targetId);
    if (!input) {
      toast.error(t('pdf.export_error'));
      return;
    }
    setIsExporting(true);

    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 15;

      // --- Title Page ---
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(22);
      pdf.text(t('pdf.report_title'), pageWidth / 2, 30, { align: 'center' });
      
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(11);
      pdf.text(new Date().toLocaleDateString(i18n.language), pageWidth - margin, 20, { align: 'right' });
      
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(16);
      pdf.text(t('pdf.profile_title'), margin, 50);
      
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(12);
      const { profile } = result;
      const profileText = [
        `${t('pdf.age')}: ${profile.age}`,
        `${t('pdf.gender')}: ${t(`forms.profile.${profile.gender}`)}`,
        `${t('pdf.weight')}: ${profile.weight} kg`,
        `${t('pdf.bfp')}: ${profile.bfp} %`,
        `${t('pdf.goal')}: ${t(profile.goal)}`
      ];
      pdf.text(profileText, margin, 60);

      pdf.setFontSize(8);
      pdf.setTextColor(150);
      pdf.text(t('disclaimer.text'), margin, pageHeight - 40, { maxWidth: pageWidth - margin * 2 });

      // --- Content Pages ---
      const dataUrl = await htmlToImage.toPng(input, { 
        filter: (node: HTMLElement) => !node.classList?.contains('exclude-from-capture'),
        backgroundColor: '#1f2937', // Match card background
        pixelRatio: 2 // Higher resolution for better quality
      });

      const imgProps = pdf.getImageProperties(dataUrl);
      const pdfWidth = pageWidth - margin * 2;
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      const contentPageHeight = pageHeight - margin * 2;

      let heightLeft = pdfHeight;
      let position = 0;
      let pageCount = 1;

      pdf.addPage();
      pdf.addImage(dataUrl, 'PNG', margin, margin, pdfWidth, pdfHeight);
      heightLeft -= contentPageHeight;

      while (heightLeft > 0) {
        position -= contentPageHeight;
        pdf.addPage();
        pdf.addImage(dataUrl, 'PNG', margin, position + margin, pdfWidth, pdfHeight);
        heightLeft -= contentPageHeight;
        pageCount++;
      }
      
      // Add page numbers
      const totalPages = pageCount + 1; // +1 for title page
      for (let i = 1; i <= totalPages; i++) {
         pdf.setPage(i);
         pdf.setFontSize(9);
         pdf.setTextColor(150);
         pdf.text(t('pdf.page', { pageNumber: i, totalPages }), pageWidth / 2, pageHeight - 10, { align: 'center' });
      }

      pdf.save(filename);
      toast.success(t('pdf.export_success'));

    } catch (error) {
      console.error("PDF export failed:", error);
      toast.error(t('pdf.export_error'));
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={isExporting}
      className="w-full flex items-center justify-center gap-2 bg-red-800 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg shadow-lg transition-all duration-300 disabled:bg-red-900 disabled:cursor-wait"
    >
      {isExporting ? (
        <>
          <div className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
          <span>{t('pdf.exporting')}</span>
        </>
      ) : (
        <>
          <FileDown size={18} />
          <span>{t('pdf.export_button')}</span>
        </>
      )}
    </button>
  );
};