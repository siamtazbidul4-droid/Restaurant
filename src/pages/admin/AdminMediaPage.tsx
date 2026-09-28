import React, { useEffect, useState, useRef } from 'react';
import { mediaApi, MediaDto } from '../../api/media.api.js';
import { ConfirmModal } from '../../components/ui/ConfirmModal.js';
import { Button } from '../../components/ui/Button.js';
import { useToast } from '../../context/ToastContext.js';
import { UploadCloud, Trash2, Copy, Check, Loader2, Image as ImageIcon } from 'lucide-react';

export const AdminMediaPage: React.FC = () => {
  const [mediaList, setMediaList] = useState<MediaDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { success, error } = useToast();

  const loadMedia = () => {
    setLoading(true);
    mediaApi
      .getMediaLibrary()
      .then((res) => {
        if (res.success) setMediaList(res.data);
      })
      .catch((err) => error(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadMedia();
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      error('File size exceeds the 8MB limit.');
      return;
    }

    try {
      setIsUploading(true);
      const res = await mediaApi.uploadImage(file, file.name);
      if (res.success) {
        success('Asset uploaded to media storage.');
        loadMedia();
      }
    } catch (err: any) {
      error(err.message || 'Media upload failed.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleCopyUrl = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    success('Image URL copied to clipboard.');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      setIsDeleting(true);
      await mediaApi.deleteMedia(deleteId);
      success('Media asset removed.');
      setDeleteId(null);
      loadMedia();
    } catch (err: any) {
      error(err.message || 'Failed to remove media asset.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-white/10 gap-4">
        <div>
          <span className="text-[11px] uppercase tracking-[0.25em] text-[#C5A880] font-sans font-medium">
            Digital Asset Sanctuary
          </span>
          <h1 className="font-serif text-3xl text-white">Cloudinary & Media Library</h1>
        </div>

        {/* Upload Image Button connecting to native file picker */}
        <div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/jpeg,image/png,image/webp,image/avif"
            className="hidden"
          />
          <Button
            onClick={() => fileInputRef.current?.click()}
            size="md"
            isLoading={isUploading}
          >
            <UploadCloud className="w-3.5 h-3.5 mr-1.5" />
            <span>Upload Image</span>
          </Button>
        </div>
      </div>

      <p className="text-xs text-[#D1CCC0] max-w-2xl leading-relaxed">
        Uploaded assets are securely optimized, transformed, and persisted to MongoDB metadata. Use these verified URLs across menu items, private dining, chef profiles, and marketing banners.
      </p>

      {loading ? (
        <div className="py-24 flex justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#C5A880]" />
        </div>
      ) : mediaList.length === 0 ? (
        <div className="py-16 text-center bg-[#141419] border border-white/5 space-y-3">
          <ImageIcon className="w-8 h-8 text-stone-500 mx-auto" />
          <p className="font-serif text-xl text-white">No media uploaded yet.</p>
          <p className="text-xs text-stone-400">Click "Upload Image" to upload your first culinary photo.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {mediaList.map((item) => (
            <div
              key={item._id}
              className="bg-[#141419] border border-white/10 overflow-hidden flex flex-col justify-between group"
            >
              <div className="relative aspect-[4/3] bg-[#181820] overflow-hidden">
                <img
                  src={item.secureUrl}
                  alt={item.altText || 'Media Asset'}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
              </div>

              <div className="p-3 space-y-2">
                <div className="flex items-center justify-between text-[11px] text-stone-400">
                  <span className="uppercase font-mono">{item.format || 'IMG'}</span>
                  <span className="font-mono text-stone-500">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-xs text-white truncate font-medium">{item.altText || item.publicId}</p>

                <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                  <button
                    onClick={() => handleCopyUrl(item.secureUrl, item._id)}
                    className="flex items-center gap-1 text-[11px] text-[#C5A880] hover:text-white transition-colors uppercase tracking-wider"
                  >
                    {copiedId === item._id ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy URL</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => setDeleteId(item._id)}
                    className="p-1 text-rose-400 hover:text-rose-200 transition-colors"
                    title="Delete media"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmModal
        isOpen={Boolean(deleteId)}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Media Asset"
        message="Are you sure you want to remove this image from the media library?"
        isLoading={isDeleting}
      />
    </div>
  );
};
