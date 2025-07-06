/**
 * @file A reusable component for sharing and downloading charts.
 * It uses the Web Share API when available and provides fallback links.
 */
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Download, Share2 } from 'lucide-react';
import * as htmlToImage from 'html-to-image';
import { useToast } from '../../hooks/useToast';

interface ShareButtonsProps {
  chartRef: React.RefObject<HTMLDivElement>;
  title: string;
  filename: string;
}

export const ShareButtons: React.FC<ShareButtonsProps> = ({ chartRef, title, filename }) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = React.useState(false);

  const filter = (node: HTMLElement) => {
    return !node.classList?.contains('exclude-from-capture');
  };

  const handleDownload = async () => {
    if (!chartRef.current) return;
    setIsProcessing(true);
    try {
      const dataUrl = await htmlToImage.toPng(chartRef.current, { filter, backgroundColor: '#1f2937' });
      const link = document.createElement('a');
      link.download = filename;
      link.href = dataUrl;
      link.click();
      toast.success(t('share.download_success'));
    } catch (error) {
      console.error('Download failed:', error);
      toast.error(t('share.download_error'));
    } finally {
        setIsProcessing(false);
    }
  };

  const handleShare = async () => {
    if (!chartRef.current) return;
    setIsProcessing(true);
    try {
      const blob = await htmlToImage.toBlob(chartRef.current, { filter, backgroundColor: '#1f2937' });
      if (!blob) throw new Error('Could not create blob');
      
      const file = new File([blob], filename, { type: 'image/png' });
      const shareData = {
        title,
        text: t('share.text'),
        files: [file],
      };

      if (navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
      } else if (navigator.share) {
        // Fallback for browsers that don't support files
        await navigator.share({ title, text: t('share.text'), url: window.location.href });
      } else {
        toast.info("Web Share API is not supported in this browser.");
      }
    } catch (error) {
      if (!(error instanceof Error && error.name === 'AbortError')) {
          console.error('Share failed:', error);
          toast.error(t('share.share_error'));
      }
    } finally {
        setIsProcessing(false);
    }
  };

  return (
    <div className="exclude-from-capture absolute top-2 right-2 flex items-center gap-1 bg-gray-900/70 p-1 rounded-lg backdrop-blur-sm z-10">
      <button onClick={handleDownload} disabled={isProcessing} className="p-1.5 text-gray-300 hover:text-white transition-colors disabled:opacity-50" title={t('share.download')}>
        <Download size={16} />
      </button>

      {navigator.share && (
         <button onClick={handleShare} disabled={isProcessing} className="p-1.5 text-gray-300 hover:text-white transition-colors disabled:opacity-50" title={t('share.share_generic')}>
            <Share2 size={16} />
        </button>
      )}
    </div>
  );
};