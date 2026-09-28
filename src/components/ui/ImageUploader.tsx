import React, { useRef, useState } from 'react';
import { UploadCloud, X, Loader2, Image as ImageIcon } from 'lucide-react';
import { mediaApi } from '../../api/media.api.js';
import { useToast } from '../../context/ToastContext.js';

interface ImageUploaderProps {
  label?: string;
  value?: string;
  onChange: (url: string) => void;
  altText?: string;
  helperText?: string;
  aspectRatio?: '16:9' | '4:3' | '1:1' | '3:4';
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  label,
  value,
  onChange,
  altText = '',
  helperText,
  aspectRatio = '16:9',
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { success, error } = useToast();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (max 8MB)
    if (file.size > 8 * 1024 * 1024) {
      error('File size exceeds the 8MB limit. Please select a smaller image.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    // Validate type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
    if (!validTypes.includes(file.type)) {
      error('Invalid file format. Please upload JPEG, PNG, WebP, or AVIF.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    try {
      setIsUploading(true);
      const res = await mediaApi.uploadImage(file, altText);
      if (res.success && res.data.url) {
        onChange(res.data.url);
        success('Image uploaded and synced to media store.');
      } else {
        error(res.message || 'Upload failed.');
      }
    } catch (err: any) {
      error(err.message || 'An error occurred during file upload.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
  };

  const aspectClass = {
    '16:9': 'aspect-[16/9]',
    '4:3': 'aspect-[4/3]',
    '1:1': 'aspect-square',
    '3:4': 'aspect-[3/4]',
  }[aspectRatio];

  return (
    <div className="space-y-1.5 text-left">
      {label && (
        <label className="block text-xs uppercase tracking-wider text-[#D1CCC0] font-sans">
          {label}
        </label>
      )}

      {/* Hidden native file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/jpeg,image/png,image/webp,image/avif"
        className="hidden"
      />

      {value ? (
        <div className={`relative w-full ${aspectClass} bg-[#16161C] border border-white/15 overflow-hidden group`}>
          <img
            src={value}
            alt={altText || 'Uploaded asset'}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="px-3 py-1.5 text-[11px] font-sans uppercase tracking-widest bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-colors"
            >
              Replace
            </button>
            <button
              type="button"
              onClick={handleRemove}
              disabled={isUploading}
              className="p-1.5 text-rose-300 hover:text-rose-100 bg-rose-950/70 border border-rose-800/50 transition-colors"
              title="Remove image"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          {isUploading && (
            <div className="absolute inset-0 bg-black/75 flex flex-col items-center justify-center gap-2 text-white">
              <Loader2 className="w-6 h-6 animate-spin text-[#C5A880]" />
              <span className="text-xs uppercase tracking-wider text-[#E0CEB5]">Uploading Media...</span>
            </div>
          )}
        </div>
      ) : (
        <div
          onClick={() => !isUploading && fileInputRef.current?.click()}
          className={`w-full ${aspectClass} border-2 border-dashed border-white/15 hover:border-[#C5A880]/50 bg-[#16161C]/50 hover:bg-[#16161C] transition-all cursor-pointer flex flex-col items-center justify-center gap-2 p-6 text-center group`}
        >
          {isUploading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="w-7 h-7 animate-spin text-[#C5A880]" />
              <p className="text-xs uppercase tracking-wider text-[#E0CEB5]">Uploading to Cloud Storage...</p>
            </div>
          ) : (
            <>
              <div className="p-3 bg-white/5 border border-white/10 group-hover:border-[#C5A880]/40 transition-colors">
                <UploadCloud className="w-6 h-6 text-stone-400 group-hover:text-[#C5A880] transition-colors" />
              </div>
              <div>
                <p className="text-xs font-medium text-white tracking-wide">
                  Click to Upload Image
                </p>
                <p className="text-[11px] text-stone-400 mt-0.5">JPEG, PNG, WebP up to 8MB</p>
              </div>
            </>
          )}
        </div>
      )}

      {helperText && <p className="text-[11px] text-stone-400">{helperText}</p>}
    </div>
  );
};
