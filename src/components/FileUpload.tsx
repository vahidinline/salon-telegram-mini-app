import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Upload, Camera, FileText, X, Check } from 'lucide-react';
import api from '../utils/api';
import { showTelegramAlert } from '../utils/telegram';

interface FileUploadProps {
  onUploadComplete?: (fileUrl: string) => void;
  onUploadError?: (error: string) => void;
  maxSizeMB?: number;
  acceptedTypes?: string[];
  label?: string;
}

interface UploadedFile {
  file: File;
  preview?: string;
  progress: number;
  status: 'uploading' | 'success' | 'error';
  url?: string;
  error?: string;
}

const FileUpload: React.FC<FileUploadProps> = ({
  onUploadComplete,
  onUploadError,
  maxSizeMB = 10,
  acceptedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'],
  label,
}) => {
  const { t } = useTranslation();
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    if (!acceptedTypes.includes(file.type)) {
      return t('invalidFileType');
    }

    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return t('fileTooLarge', { size: maxSizeMB });
    }

    return null;
  };

  const createPreview = (file: File): string | undefined => {
    if (file.type.startsWith('image/')) {
      return URL.createObjectURL(file);
    }
    return undefined;
  };

  const uploadFile = async (file: File) => {
    const validation = validateFile(file);
    if (validation) {
      showTelegramAlert(validation);
      onUploadError?.(validation);
      return;
    }

    const preview = createPreview(file);
    const uploadedFile: UploadedFile = {
      file,
      preview,
      progress: 0,
      status: 'uploading',
    };

    setUploadedFiles((prev) => [...prev, uploadedFile]);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await api.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const progress = progressEvent.total
            ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
            : 0;

          setUploadedFiles((prev) =>
            prev.map((f) => (f.file === file ? { ...f, progress } : f))
          );
        },
      });

      const fileUrl = response.data.url || response.data.fileUrl;

      setUploadedFiles((prev) =>
        prev.map((f) =>
          f.file === file
            ? { ...f, status: 'success', progress: 100, url: fileUrl }
            : f
        )
      );

      onUploadComplete?.(fileUrl);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || t('uploadError');

      setUploadedFiles((prev) =>
        prev.map((f) =>
          f.file === file ? { ...f, status: 'error', error: errorMessage } : f
        )
      );

      showTelegramAlert(errorMessage);
      onUploadError?.(errorMessage);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      Array.from(files).forEach((file) => uploadFile(file));
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCameraCapture = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files[0]) {
      uploadFile(files[0]);
    }
    if (cameraInputRef.current) {
      cameraInputRef.current.value = '';
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => {
      const file = prev[index];
      if (file.preview) {
        URL.revokeObjectURL(file.preview);
      }
      return prev.filter((_, i) => i !== index);
    });
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return null;
    }
    if (file.type === 'application/pdf') {
      return <FileText size={48} className="text-red-500" />;
    }
    return <FileText size={48} className="text-gray-500" />;
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="space-y-4">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex-1 flex flex-col items-center justify-center gap-2 p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 active:scale-98">
          <Upload size={32} className="text-gray-400" />
          <span className="text-sm font-medium text-gray-600">انتخاب فایل</span>
          <span className="text-xs text-gray-500">آپلود رسید</span>
        </button>

        <button
          type="button"
          onClick={() => cameraInputRef.current?.click()}
          className="flex-1 flex flex-col items-center justify-center gap-2 p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 active:scale-98">
          <Camera size={32} className="text-gray-400" />
          <span className="text-sm font-medium text-gray-600">دوربین</span>
          <span className="text-xs text-gray-500">
            از رسید پرداخت عکس بگیرید
          </span>
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedTypes.join(',')}
        onChange={handleFileSelect}
        className="hidden"
        multiple
      />

      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleCameraCapture}
        className="hidden"
      />

      {uploadedFiles.length > 0 && (
        <div className="space-y-3">
          {uploadedFiles.map((uploadedFile, index) => (
            <div
              key={index}
              className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100 flex items-center justify-center">
                  {uploadedFile.preview ? (
                    <img
                      src={uploadedFile.preview}
                      alt={uploadedFile.file.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    getFileIcon(uploadedFile.file)
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">
                        {uploadedFile.file.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatFileSize(uploadedFile.file.size)}
                      </p>
                    </div>

                    {uploadedFile.status === 'success' && (
                      <div className="flex items-center gap-1 text-green-600">
                        <Check size={16} />
                        <span className="text-xs font-medium">
                          {t('uploaded')}
                        </span>
                      </div>
                    )}

                    {uploadedFile.status === 'error' && (
                      <div className="flex items-center gap-1 text-red-600">
                        <X size={16} />
                        <span className="text-xs font-medium">
                          {t('failed')}
                        </span>
                      </div>
                    )}

                    <button
                      onClick={() => removeFile(index)}
                      className="p-1 hover:bg-gray-100 rounded transition-colors">
                      <X size={16} className="text-gray-400" />
                    </button>
                  </div>

                  {uploadedFile.status === 'uploading' && (
                    <div className="space-y-1">
                      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                        <div
                          className="h-full bg-blue-500 transition-all duration-300 ease-out"
                          style={{ width: `${uploadedFile.progress}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-500">
                        {t('uploading')} {uploadedFile.progress}%
                      </p>
                    </div>
                  )}

                  {uploadedFile.status === 'error' && uploadedFile.error && (
                    <p className="text-xs text-red-600">{uploadedFile.error}</p>
                  )}

                  {uploadedFile.status === 'success' && uploadedFile.url && (
                    <p className="text-xs text-gray-500 truncate">
                      {uploadedFile.url}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="text-xs text-gray-500">
        فرمت های مجاز : JPG, PNG, PDF حداکثر حجم : {maxSizeMB}MB)
      </p>
    </div>
  );
};

export default FileUpload;
