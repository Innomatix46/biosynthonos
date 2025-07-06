

/**
 * @file A modal for importing lab reports via file upload or camera.
 */
import React, { useState, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { getAiLabAnalysis } from '../../services/geminiService';
import { BloodWork } from '../../shared/types';
import { X, UploadCloud, Camera, Check, AlertTriangle } from 'lucide-react';
import { useToast } from '../../hooks/useToast';

interface LabReportImporterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (markers: BloodWork, fileName: string) => void;
}

type ExtractedMarker = {
    marker: string;
    value: string;
    unit: string;
    appKey: keyof BloodWork | null;
};

const TESTOSTERONE_CONVERSION = 0.03467; // ng/dL to nmol/L
const GLUCOSE_CONVERSION = 0.0555; // mg/dL to mmol/L

export const LabReportImporterModal: React.FC<LabReportImporterModalProps> = ({ isOpen, onClose, onApply }) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [extractedMarkers, setExtractedMarkers] = useState<ExtractedMarker[]>([]);
  const [fileName, setFileName] = useState('scanned_report.png');
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetState = useCallback(() => {
    setIsLoading(false);
    setError(null);
    setExtractedMarkers([]);
    setFileName('scanned_report.png');
    if (isCameraActive) {
        stopCamera();
    }
  }, [isCameraActive]);

  const handleClose = useCallback(() => {
    resetState();
    onClose();
  }, [resetState, onClose]);

  const processFile = async (file: File) => {
    if (!file) return;
    if (file.size > 4 * 1024 * 1024) { // 4MB limit
        setError(t('lab_import.error_file_size'));
        return;
    }
    setError(null);
    setIsLoading(true);
    setFileName(file.name);

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
        try {
            const base64String = (reader.result as string).split(',')[1];
            const results = await getAiLabAnalysis(base64String, file.type);
            if (results && results.length > 0) {
                setExtractedMarkers(results);
            } else {
                setError(t('lab_import.error_no_markers'));
            }
        } catch (err: any) {
            setError(err.message || t('lab_import.error_generic'));
            toast.error(err.message || t('lab_import.error_generic'));
        } finally {
            setIsLoading(false);
        }
    };
    reader.onerror = () => {
        setError(t('lab_import.error_file_read'));
        setIsLoading(false);
    };
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };
  
  const handleMarkerValueChange = (index: number, newValue: string) => {
    const updatedMarkers = [...extractedMarkers];
    updatedMarkers[index].value = newValue;
    setExtractedMarkers(updatedMarkers);
  };
  
  const handleApply = () => {
    const bloodWork: BloodWork = {};
    for (const marker of extractedMarkers) {
        if(marker.appKey) {
            let value = parseFloat(marker.value.replace(/,/g, '.')); // Allow for comma decimal separators
            if(isNaN(value)) continue;

            // Normalize units to internal standard (ng/dL, mg/dL)
            const unit = marker.unit.toLowerCase();
            if (marker.appKey === 'totalTestosterone' && unit.includes('nmol')) {
                value /= TESTOSTERONE_CONVERSION;
            }
            if (marker.appKey === 'glucose' && unit.includes('mmol')) {
                value /= GLUCOSE_CONVERSION;
            }
            bloodWork[marker.appKey] = parseFloat(value.toFixed(2));
        }
    }
    onApply(bloodWork, fileName);
    handleClose();
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
        videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };
  
  const startCamera = async () => {
      try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }});
          if (videoRef.current) {
              videoRef.current.srcObject = stream;
          }
          setIsCameraActive(true);
      } catch (err) {
          setError(t('lab_import.error_camera'));
          toast.error(t('lab_import.error_camera'));
      }
  };

  const handleCapture = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    stopCamera();
    canvas.toBlob(blob => {
        if(blob) {
            processFile(new File([blob], "camera_capture.png", {type: "image/png"}));
        }
    }, 'image/png');
  };
  
  React.useEffect(() => {
      return () => {
          stopCamera();
      }
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={handleClose}>
        <div className="bg-brand-dark border border-gray-700 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center p-4 border-b border-gray-700">
                <h2 className="text-lg font-semibold text-white">{t('lab_import.modal_title')}</h2>
                <button onClick={handleClose} className="text-gray-400 hover:text-white"><X size={24}/></button>
            </div>

            <div className="p-6 overflow-y-auto">
                {isLoading ? (
                    <div className="text-center p-8">
                        <div className="w-8 h-8 border-4 border-t-transparent border-brand-blue rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-gray-300">{t('lab_import.loading')}</p>
                    </div>
                ) : error ? (
                    <div className="text-center p-8 bg-red-900/50 border border-red-500 rounded-lg">
                        <AlertTriangle className="mx-auto text-red-400 mb-2" size={32}/>
                        <p className="text-red-200">{error}</p>
                    </div>
                ) : extractedMarkers.length > 0 ? (
                    <div className="space-y-4">
                        <h3 className="text-md font-semibold text-brand-green">{t('lab_import.confirm_title')}</h3>
                        <p className="text-xs text-gray-400">{t('lab_import.confirm_subtitle')}</p>
                        <div className="max-h-64 overflow-y-auto border border-gray-700 rounded-lg">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-900 sticky top-0">
                                    <tr>
                                        <th className="p-2 text-left text-gray-300">{t('lab_import.table_marker')}</th>
                                        <th className="p-2 text-left text-gray-300">{t('lab_import.table_value')}</th>
                                        <th className="p-2 text-left text-gray-300">{t('lab_import.table_unit')}</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-gray-800">
                                {extractedMarkers.map((marker, index) => (
                                    <tr key={index} className={`border-t border-gray-700 ${!marker.appKey ? 'opacity-50' : ''}`}>
                                        <td className="p-2 text-gray-300">{marker.marker} {!marker.appKey && `(${t('lab_import.unmapped')})`}</td>
                                        <td className="p-2">
                                            <input 
                                                type="text" 
                                                value={marker.value}
                                                onChange={(e) => handleMarkerValueChange(index, e.target.value)}
                                                className="w-full bg-gray-700 border border-gray-600 rounded-md p-1 focus:ring-1 focus:ring-brand-blue focus:outline-none"
                                                disabled={!marker.appKey}
                                            />
                                        </td>
                                        <td className="p-2 text-gray-400">{marker.unit}</td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : isCameraActive ? (
                    <div className="space-y-4">
                         <video ref={videoRef} autoPlay playsInline className="w-full h-auto max-h-80 rounded-lg bg-black"></video>
                         <button onClick={handleCapture} className="w-full flex items-center justify-center gap-2 bg-brand-pink hover:bg-pink-600 text-white font-bold py-3 px-4 rounded-lg">
                            <Camera size={20}/> {t('lab_import.capture_button')}
                         </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <button onClick={() => fileInputRef.current?.click()} className="w-full flex items-center justify-center gap-3 bg-brand-blue hover:bg-sky-500 text-white font-bold py-3 px-4 rounded-lg">
                            <UploadCloud size={20}/> {t('lab_import.upload_button')}
                        </button>
                        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="application/pdf,image/*" />
                        
                        <div className="flex items-center text-gray-500">
                            <hr className="flex-grow border-gray-600"/>
                            <span className="px-2 text-xs">OR</span>
                            <hr className="flex-grow border-gray-600"/>
                        </div>
                        
                        <button onClick={startCamera} className="w-full flex items-center justify-center gap-3 bg-gray-700 hover:bg-gray-600 text-gray-200 font-bold py-3 px-4 rounded-lg">
                            <Camera size={20}/> {t('lab_import.scan_button')}
                        </button>
                    </div>
                )}
            </div>

            {extractedMarkers.length > 0 && !isLoading && (
                 <div className="p-4 border-t border-gray-700">
                    <button onClick={handleApply} className="w-full flex items-center justify-center gap-2 bg-brand-green hover:bg-emerald-500 text-white font-bold py-3 px-4 rounded-lg">
                        <Check size={20}/> {t('lab_import.apply_button')}
                    </button>
                </div>
            )}
        </div>
    </div>
  );
};