import { apiFetch } from './client.js';

export interface ChefDto {
  _id: string;
  name: string;
  position: string;
  experience: string;
  biography: string;
  culinaryPhilosophy: string;
  specialties: string[];
  image: string;
  isPublished: boolean;
}

export interface ExperienceDto {
  _id: string;
  title: string;
  category: string;
  description: string;
  image: string;
  ctaLabel?: string;
  ctaUrl?: string;
  sortOrder: number;
  isPublished: boolean;
}

export interface TestimonialDto {
  _id: string;
  customerName: string;
  roleOrAffiliation?: string;
  review: string;
  rating: number;
  date: string;
  source: string;
  avatar?: string;
  isPublished: boolean;
  sortOrder: number;
}

export interface AnnouncementDto {
  _id: string;
  title: string;
  description: string;
  image?: string;
  priority: 'low' | 'medium' | 'high';
  startDate: string;
  endDate: string;
  ctaLabel?: string;
  ctaUrl?: string;
  isPublished: boolean;
}

export interface GalleryImageDto {
  _id: string;
  title: string;
  altText: string;
  caption?: string;
  category: string;
  imageUrl: string;
  publicId?: string;
  sortOrder: number;
  isFeatured: boolean;
  isPublished: boolean;
}

export const contentApi = {
  // Chef
  getChef: () => apiFetch<{ success: boolean; data: ChefDto }>('/api/content/chef'),
  updateChef: (data: Partial<ChefDto>) =>
    apiFetch<{ success: boolean; data: ChefDto }>('/api/content/chef', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // Experiences
  getExperiences: (all = false) =>
    apiFetch<{ success: boolean; data: ExperienceDto[] }>(`/api/content/experiences${all ? '?all=true' : ''}`),
  createExperience: (data: Partial<ExperienceDto>) =>
    apiFetch<{ success: boolean; data: ExperienceDto }>('/api/content/experiences', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateExperience: (id: string, data: Partial<ExperienceDto>) =>
    apiFetch<{ success: boolean; data: ExperienceDto }>(`/api/content/experiences/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteExperience: (id: string) =>
    apiFetch<{ success: boolean; message: string }>(`/api/content/experiences/${id}`, {
      method: 'DELETE',
    }),

  // Testimonials
  getTestimonials: (all = false) =>
    apiFetch<{ success: boolean; data: TestimonialDto[] }>(`/api/content/testimonials${all ? '?all=true' : ''}`),
  createTestimonial: (data: Partial<TestimonialDto>) =>
    apiFetch<{ success: boolean; data: TestimonialDto }>('/api/content/testimonials', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateTestimonial: (id: string, data: Partial<TestimonialDto>) =>
    apiFetch<{ success: boolean; data: TestimonialDto }>(`/api/content/testimonials/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteTestimonial: (id: string) =>
    apiFetch<{ success: boolean; message: string }>(`/api/content/testimonials/${id}`, {
      method: 'DELETE',
    }),

  // Announcements
  getAnnouncements: () =>
    apiFetch<{ success: boolean; data: AnnouncementDto[] }>('/api/content/announcements'),
  getAllAnnouncementsAdmin: () =>
    apiFetch<{ success: boolean; data: AnnouncementDto[] }>('/api/content/announcements/all'),
  createAnnouncement: (data: Partial<AnnouncementDto>) =>
    apiFetch<{ success: boolean; data: AnnouncementDto }>('/api/content/announcements', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateAnnouncement: (id: string, data: Partial<AnnouncementDto>) =>
    apiFetch<{ success: boolean; data: AnnouncementDto }>(`/api/content/announcements/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteAnnouncement: (id: string) =>
    apiFetch<{ success: boolean; message: string }>(`/api/content/announcements/${id}`, {
      method: 'DELETE',
    }),

  // Gallery
  getGallery: (category?: string, all = false) => {
    const q = new URLSearchParams();
    if (category) q.set('category', category);
    if (all) q.set('all', 'true');
    return apiFetch<{ success: boolean; data: GalleryImageDto[] }>(`/api/content/gallery?${q.toString()}`);
  },
  createGalleryImage: (data: Partial<GalleryImageDto>) =>
    apiFetch<{ success: boolean; data: GalleryImageDto }>('/api/content/gallery', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateGalleryImage: (id: string, data: Partial<GalleryImageDto>) =>
    apiFetch<{ success: boolean; data: GalleryImageDto }>(`/api/content/gallery/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteGalleryImage: (id: string) =>
    apiFetch<{ success: boolean; message: string }>(`/api/content/gallery/${id}`, {
      method: 'DELETE',
    }),
};
