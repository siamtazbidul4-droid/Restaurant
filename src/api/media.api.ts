import { apiFetch } from './client.js';

export interface MediaDto {
  _id: string;
  publicId: string;
  secureUrl: string;
  width?: number;
  height?: number;
  format?: string;
  altText: string;
  caption?: string;
  bytes?: number;
  createdAt: string;
}

export const mediaApi = {
  uploadImage: async (file: File, altText?: string, caption?: string) => {
    const formData = new FormData();
    formData.append('file', file);
    if (altText) formData.append('altText', altText);
    if (caption) formData.append('caption', caption);

    return apiFetch<{
      success: boolean;
      message: string;
      data: {
        id: string;
        url: string;
        publicId: string;
        altText: string;
        format: string;
      };
    }>('/api/media/upload', {
      method: 'POST',
      body: formData,
    });
  },

  getMediaLibrary: () =>
    apiFetch<{ success: boolean; data: MediaDto[] }>('/api/media'),

  deleteMedia: (id: string) =>
    apiFetch<{ success: boolean; message: string }>(`/api/media/${id}`, {
      method: 'DELETE',
    }),
};
