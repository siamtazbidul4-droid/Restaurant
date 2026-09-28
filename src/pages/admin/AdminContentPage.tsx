import React, { useEffect, useState, useCallback } from 'react';
import {
  contentApi,
  ChefDto,
  ExperienceDto,
  TestimonialDto,
  AnnouncementDto,
  GalleryImageDto,
} from '../../api/content.api.js';
import { Modal } from '../../components/ui/Modal.js';
import { ConfirmModal } from '../../components/ui/ConfirmModal.js';
import { Input } from '../../components/ui/Input.js';
import { Select } from '../../components/ui/Select.js';
import { Textarea } from '../../components/ui/Textarea.js';
import { Button } from '../../components/ui/Button.js';
import { ImageUploader } from '../../components/ui/ImageUploader.js';
import { useToast } from '../../context/ToastContext.js';
import { Plus, Edit2, Trash2, Loader2, Star, ChefHat, Sparkles, Image as ImageIcon } from 'lucide-react';

export const AdminContentPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'chef' | 'experiences' | 'testimonials' | 'announcements' | 'gallery'>('chef');

  // Chef state
  const [chef, setChef] = useState<ChefDto | null>(null);
  const [chefForm, setChefForm] = useState<any>({});
  const [isSavingChef, setIsSavingChef] = useState(false);

  // Experiences state
  const [experiences, setExperiences] = useState<ExperienceDto[]>([]);
  const [isExpModalOpen, setIsExpModalOpen] = useState(false);
  const [editingExp, setEditingExp] = useState<ExperienceDto | null>(null);
  const [expForm, setExpForm] = useState<any>({});
  const [deleteExpId, setDeleteExpId] = useState<string | null>(null);

  // Testimonials state
  const [testimonials, setTestimonials] = useState<TestimonialDto[]>([]);
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [editingTest, setEditingTest] = useState<TestimonialDto | null>(null);
  const [testForm, setTestForm] = useState<any>({});
  const [deleteTestId, setDeleteTestId] = useState<string | null>(null);

  // Announcements state
  const [announcements, setAnnouncements] = useState<AnnouncementDto[]>([]);
  const [isAnnModalOpen, setIsAnnModalOpen] = useState(false);
  const [editingAnn, setEditingAnn] = useState<AnnouncementDto | null>(null);
  const [annForm, setAnnForm] = useState<any>({});
  const [deleteAnnId, setDeleteAnnId] = useState<string | null>(null);

  // Gallery state
  const [gallery, setGallery] = useState<GalleryImageDto[]>([]);
  const [isGalModalOpen, setIsGalModalOpen] = useState(false);
  const [editingGal, setEditingGal] = useState<GalleryImageDto | null>(null);
  const [galForm, setGalForm] = useState<any>({});
  const [deleteGalId, setDeleteGalId] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const { success, error } = useToast();

  const loadAll = useCallback(() => {
    setLoading(true);
    Promise.all([
      contentApi.getChef().then((r) => {
        if (r.success && r.data) {
          setChef(r.data);
          setChefForm(r.data);
        }
      }),
      contentApi.getExperiences(true).then((r) => r.success && setExperiences(r.data || [])),
      contentApi.getTestimonials(true).then((r) => r.success && setTestimonials(r.data || [])),
      contentApi.getAllAnnouncementsAdmin().then((r) => r.success && setAnnouncements(r.data || [])),
      contentApi.getGallery(undefined, true).then((r) => r.success && setGallery(r.data || [])),
    ])
      .catch((err) => error(err.message))
      .finally(() => setLoading(false));
  }, [error]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  // Chef Save
  const handleSaveChef = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSavingChef(true);
      const payload = {
        ...chefForm,
        specialties: typeof chefForm.specialties === 'string'
          ? chefForm.specialties.split(',').map((s: string) => s.trim())
          : chefForm.specialties,
      };
      await contentApi.updateChef(payload);
      success('Chef profile updated.');
      loadAll();
    } catch (err: any) {
      error(err.message || 'Failed to update chef profile.');
    } finally {
      setIsSavingChef(false);
    }
  };

  // Experience Save
  const handleSaveExp = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingExp) {
        await contentApi.updateExperience(editingExp._id, expForm);
        success('Experience updated.');
      } else {
        await contentApi.createExperience(expForm);
        success('Experience created.');
      }
      setIsExpModalOpen(false);
      loadAll();
    } catch (err: any) {
      error(err.message || 'Operation failed.');
    }
  };

  // Testimonial Save
  const handleSaveTest = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingTest) {
        await contentApi.updateTestimonial(editingTest._id, testForm);
        success('Testimonial updated.');
      } else {
        await contentApi.createTestimonial(testForm);
        success('Testimonial created.');
      }
      setIsTestModalOpen(false);
      loadAll();
    } catch (err: any) {
      error(err.message || 'Operation failed.');
    }
  };

  // Announcement Save
  const handleSaveAnn = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingAnn) {
        await contentApi.updateAnnouncement(editingAnn._id, annForm);
        success('Announcement updated.');
      } else {
        await contentApi.createAnnouncement(annForm);
        success('Announcement created.');
      }
      setIsAnnModalOpen(false);
      loadAll();
    } catch (err: any) {
      error(err.message || 'Operation failed.');
    }
  };

  // Gallery Save
  const handleSaveGal = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingGal) {
        await contentApi.updateGalleryImage(editingGal._id, galForm);
        success('Gallery image updated.');
      } else {
        await contentApi.createGalleryImage(galForm);
        success('Gallery image added.');
      }
      setIsGalModalOpen(false);
      loadAll();
    } catch (err: any) {
      error(err.message || 'Operation failed.');
    }
  };

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-white/10 gap-4">
        <div>
          <span className="text-[11px] uppercase tracking-[0.25em] text-[#C5A880] font-sans font-medium">
            Editorial CMS
          </span>
          <h1 className="font-serif text-3xl text-white">Content & Story Management</h1>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/10 gap-4 sm:gap-6 overflow-x-auto text-xs font-sans uppercase tracking-[0.2em]">
        <button
          onClick={() => setActiveTab('chef')}
          className={`py-2 whitespace-nowrap transition-colors ${
            activeTab === 'chef'
              ? 'text-[#C5A880] border-b-2 border-[#C5A880] font-semibold'
              : 'text-stone-400 hover:text-white'
          }`}
        >
          Executive Chef
        </button>
        <button
          onClick={() => setActiveTab('experiences')}
          className={`py-2 whitespace-nowrap transition-colors ${
            activeTab === 'experiences'
              ? 'text-[#C5A880] border-b-2 border-[#C5A880] font-semibold'
              : 'text-stone-400 hover:text-white'
          }`}
        >
          Experiences ({experiences.length})
        </button>
        <button
          onClick={() => setActiveTab('testimonials')}
          className={`py-2 whitespace-nowrap transition-colors ${
            activeTab === 'testimonials'
              ? 'text-[#C5A880] border-b-2 border-[#C5A880] font-semibold'
              : 'text-stone-400 hover:text-white'
          }`}
        >
          Testimonials ({testimonials.length})
        </button>
        <button
          onClick={() => setActiveTab('announcements')}
          className={`py-2 whitespace-nowrap transition-colors ${
            activeTab === 'announcements'
              ? 'text-[#C5A880] border-b-2 border-[#C5A880] font-semibold'
              : 'text-stone-400 hover:text-white'
          }`}
        >
          Announcements ({announcements.length})
        </button>
        <button
          onClick={() => setActiveTab('gallery')}
          className={`py-2 whitespace-nowrap transition-colors ${
            activeTab === 'gallery'
              ? 'text-[#C5A880] border-b-2 border-[#C5A880] font-semibold'
              : 'text-stone-400 hover:text-white'
          }`}
        >
          Gallery Photos ({gallery.length})
        </button>
      </div>

      {loading ? (
        <div className="py-24 flex justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#C5A880]" />
        </div>
      ) : (
        <>
          {/* TAB 1: CHEF PROFILE */}
          {activeTab === 'chef' && (
            <form onSubmit={handleSaveChef} className="bg-[#141419] border border-white/10 p-6 sm:p-8 space-y-6 max-w-4xl">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Executive Chef Name"
                  required
                  value={chefForm.name || ''}
                  onChange={(e) => setChefForm({ ...chefForm, name: e.target.value })}
                />
                <Input
                  label="Title / Position"
                  required
                  value={chefForm.position || ''}
                  onChange={(e) => setChefForm({ ...chefForm, position: e.target.value })}
                />
              </div>

              <Input
                label="Experience Summary"
                value={chefForm.experience || ''}
                onChange={(e) => setChefForm({ ...chefForm, experience: e.target.value })}
                placeholder="e.g. 18+ Years in Paris & New York"
              />

              <Textarea
                label="Culinary Philosophy (Quote)"
                rows={2}
                value={chefForm.culinaryPhilosophy || ''}
                onChange={(e) => setChefForm({ ...chefForm, culinaryPhilosophy: e.target.value })}
              />

              <Textarea
                label="Detailed Biography"
                rows={5}
                value={chefForm.biography || ''}
                onChange={(e) => setChefForm({ ...chefForm, biography: e.target.value })}
              />

              <Input
                label="Specialties / Focus (comma separated)"
                value={
                  Array.isArray(chefForm.specialties)
                    ? chefForm.specialties.join(', ')
                    : chefForm.specialties || ''
                }
                onChange={(e) => setChefForm({ ...chefForm, specialties: e.target.value })}
                placeholder="e.g. Binchotan Grilling, Modern French Sauces, Hyper-Seasonal Terroir"
              />

              <div className="py-2">
                <ImageUploader
                  label="Chef Portrait Asset"
                  value={chefForm.image || ''}
                  onChange={(url) => setChefForm({ ...chefForm, image: url })}
                  altText={chefForm.name}
                  aspectRatio="3:4"
                />
              </div>

              <div className="pt-4 border-t border-white/10 flex justify-end">
                <Button type="submit" isLoading={isSavingChef}>
                  Save Chef Profile
                </Button>
              </div>
            </form>
          )}

          {/* TAB 2: EXPERIENCES */}
          {activeTab === 'experiences' && (
            <div className="space-y-4">
              <div className="flex justify-end">
                <Button
                  size="sm"
                  onClick={() => {
                    setEditingExp(null);
                    setExpForm({
                      title: '',
                      category: 'Fine Dining',
                      description: '',
                      image: '/images/hero_dining.jpg',
                      ctaLabel: 'Reserve Table',
                      ctaUrl: '/reservations',
                      sortOrder: experiences.length + 1,
                    });
                    setIsExpModalOpen(true);
                  }}
                >
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  <span>Add Experience</span>
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {experiences.map((exp) => (
                  <div key={exp._id} className="p-4 bg-[#141419] border border-white/10 space-y-3">
                    <div className="aspect-[16/9] bg-[#16161C] overflow-hidden">
                      <img src={exp.image} alt="" className="w-full h-full object-cover" />
                    </div>
                    <span className="text-[10px] text-[#C5A880] uppercase tracking-wider block">
                      {exp.category}
                    </span>
                    <h4 className="font-serif text-lg text-white">{exp.title}</h4>
                    <p className="text-xs text-stone-400 line-clamp-2">{exp.description}</p>
                    <div className="pt-3 border-t border-white/5 flex justify-end gap-2">
                      <button
                        onClick={() => {
                          setEditingExp(exp);
                          setExpForm(exp);
                          setIsExpModalOpen(true);
                        }}
                        className="p-1 text-stone-400 hover:text-white"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteExpId(exp._id)}
                        className="p-1 text-rose-400 hover:text-rose-200"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: TESTIMONIALS */}
          {activeTab === 'testimonials' && (
            <div className="space-y-4">
              <div className="flex justify-end">
                <Button
                  size="sm"
                  onClick={() => {
                    setEditingTest(null);
                    setTestForm({
                      customerName: '',
                      roleOrAffiliation: 'Guest Review',
                      review: '',
                      rating: 5,
                      source: 'Verified Patron',
                      date: new Date().toISOString().split('T')[0],
                      sortOrder: testimonials.length + 1,
                    });
                    setIsTestModalOpen(true);
                  }}
                >
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  <span>Add Review</span>
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {testimonials.map((t) => (
                  <div key={t._id} className="p-5 bg-[#141419] border border-white/10 space-y-3 flex flex-col justify-between">
                    <div>
                      <div className="flex text-[#C5A880] gap-1 mb-2">
                        {Array.from({ length: t.rating || 5 }).map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-current" />
                        ))}
                      </div>
                      <p className="text-xs text-stone-300 italic line-clamp-3">"{t.review}"</p>
                    </div>
                    <div className="pt-3 border-t border-white/5 flex justify-between items-center text-xs">
                      <div>
                        <p className="font-medium text-white">{t.customerName}</p>
                        <p className="text-[10px] text-stone-400">{t.roleOrAffiliation}</p>
                      </div>
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => {
                            setEditingTest(t);
                            setTestForm(t);
                            setIsTestModalOpen(true);
                          }}
                          className="p-1 text-stone-400 hover:text-white"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteTestId(t._id)}
                          className="p-1 text-rose-400 hover:text-rose-200"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: ANNOUNCEMENTS */}
          {activeTab === 'announcements' && (
            <div className="space-y-4">
              <div className="flex justify-end">
                <Button
                  size="sm"
                  onClick={() => {
                    const today = new Date().toISOString().split('T')[0];
                    setEditingAnn(null);
                    setAnnForm({
                      title: '',
                      description: '',
                      startDate: today,
                      endDate: today,
                      priority: 'medium',
                      ctaLabel: 'Reserve Now',
                      ctaUrl: '/reservations',
                      isPublished: true,
                    });
                    setIsAnnModalOpen(true);
                  }}
                >
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  <span>Create Announcement</span>
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {announcements.map((ann) => (
                  <div key={ann._id} className="p-5 bg-[#141419] border border-white/10 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-[#C5A880] uppercase tracking-wider font-mono">
                        {ann.priority} Priority · {ann.isPublished ? 'Published' : 'Draft'}
                      </span>
                      <div className="flex gap-1">
                        <button
                          onClick={() => {
                            setEditingAnn(ann);
                            setAnnForm(ann);
                            setIsAnnModalOpen(true);
                          }}
                          className="p-1 text-stone-400 hover:text-white"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteAnnId(ann._id)}
                          className="p-1 text-rose-400 hover:text-rose-200"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <h4 className="font-serif text-lg text-white">{ann.title}</h4>
                    <p className="text-xs text-stone-300">{ann.description}</p>
                    <p className="text-[10px] text-stone-500 font-mono pt-1">
                      Active: {ann.startDate} to {ann.endDate}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: GALLERY */}
          {activeTab === 'gallery' && (
            <div className="space-y-4">
              <div className="flex justify-end">
                <Button
                  size="sm"
                  onClick={() => {
                    setEditingGal(null);
                    setGalForm({
                      title: '',
                      altText: '',
                      caption: '',
                      category: 'Food',
                      imageUrl: '/images/hero_dining.jpg',
                      sortOrder: gallery.length + 1,
                      isFeatured: true,
                      isPublished: true,
                    });
                    setIsGalModalOpen(true);
                  }}
                >
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  <span>Add Gallery Photo</span>
                </Button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {gallery.map((g) => (
                  <div key={g._id} className="bg-[#141419] border border-white/10 overflow-hidden group">
                    <div className="aspect-[4/3] bg-stone-900 overflow-hidden">
                      <img src={g.imageUrl} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="p-3 space-y-1">
                      <span className="text-[10px] text-[#C5A880] uppercase tracking-wider block">
                        {g.category}
                      </span>
                      <h5 className="font-serif text-sm text-white truncate">{g.title}</h5>
                      <div className="pt-2 flex justify-end gap-1">
                        <button
                          onClick={() => {
                            setEditingGal(g);
                            setGalForm(g);
                            setIsGalModalOpen(true);
                          }}
                          className="p-1 text-stone-400 hover:text-white"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => setDeleteGalId(g._id)}
                          className="p-1 text-rose-400 hover:text-rose-200"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Experience Modal */}
      <Modal
        isOpen={isExpModalOpen}
        onClose={() => setIsExpModalOpen(false)}
        title={editingExp ? 'Edit Experience' : 'Create Experience'}
        maxWidth="md"
      >
        <form onSubmit={handleSaveExp} className="space-y-4">
          <Input
            label="Title"
            required
            value={expForm.title || ''}
            onChange={(e) => setExpForm({ ...expForm, title: e.target.value })}
          />
          <Select
            label="Category"
            value={expForm.category || 'Fine Dining'}
            onChange={(e) => setExpForm({ ...expForm, category: e.target.value })}
          >
            <option value="Fine Dining">Fine Dining</option>
            <option value="Romantic Dinner">Romantic Dinner</option>
            <option value="Family Dining">Family Dining</option>
            <option value="Business Dinner">Business Dinner</option>
            <option value="Private Dining">Private Dining</option>
            <option value="Celebration">Celebration</option>
          </Select>
          <Textarea
            label="Description"
            required
            rows={3}
            value={expForm.description || ''}
            onChange={(e) => setExpForm({ ...expForm, description: e.target.value })}
          />
          <ImageUploader
            label="Experience Image"
            value={expForm.image || ''}
            onChange={(url) => setExpForm({ ...expForm, image: url })}
            aspectRatio="16:9"
          />
          <div className="pt-3 flex justify-end gap-2 border-t border-white/10">
            <Button variant="ghost" onClick={() => setIsExpModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Save Experience</Button>
          </div>
        </form>
      </Modal>

      {/* Testimonial Modal */}
      <Modal
        isOpen={isTestModalOpen}
        onClose={() => setIsTestModalOpen(false)}
        title={editingTest ? 'Edit Review' : 'Add Guest Review'}
        maxWidth="md"
      >
        <form onSubmit={handleSaveTest} className="space-y-4">
          <Input
            label="Customer Name"
            required
            value={testForm.customerName || ''}
            onChange={(e) => setTestForm({ ...testForm, customerName: e.target.value })}
          />
          <Input
            label="Affiliation / Role"
            value={testForm.roleOrAffiliation || ''}
            onChange={(e) => setTestForm({ ...testForm, roleOrAffiliation: e.target.value })}
          />
          <Textarea
            label="Review Text"
            required
            rows={3}
            value={testForm.review || ''}
            onChange={(e) => setTestForm({ ...testForm, review: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Rating (1-5)"
              type="number"
              min="1"
              max="5"
              value={testForm.rating || 5}
              onChange={(e) => setTestForm({ ...testForm, rating: Number(e.target.value) })}
            />
            <Input
              label="Source / Publication"
              value={testForm.source || ''}
              onChange={(e) => setTestForm({ ...testForm, source: e.target.value })}
            />
          </div>
          <div className="pt-3 flex justify-end gap-2 border-t border-white/10">
            <Button variant="ghost" onClick={() => setIsTestModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Save Review</Button>
          </div>
        </form>
      </Modal>

      {/* Announcement Modal */}
      <Modal
        isOpen={isAnnModalOpen}
        onClose={() => setIsAnnModalOpen(false)}
        title={editingAnn ? 'Edit Announcement' : 'New Announcement'}
        maxWidth="md"
      >
        <form onSubmit={handleSaveAnn} className="space-y-4">
          <Input
            label="Headline"
            required
            value={annForm.title || ''}
            onChange={(e) => setAnnForm({ ...annForm, title: e.target.value })}
          />
          <Textarea
            label="Description"
            required
            rows={2}
            value={annForm.description || ''}
            onChange={(e) => setAnnForm({ ...annForm, description: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Start Date"
              type="date"
              required
              value={annForm.startDate || ''}
              onChange={(e) => setAnnForm({ ...annForm, startDate: e.target.value })}
            />
            <Input
              label="End Date"
              type="date"
              required
              value={annForm.endDate || ''}
              onChange={(e) => setAnnForm({ ...annForm, endDate: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Button Text"
              value={annForm.ctaLabel || ''}
              onChange={(e) => setAnnForm({ ...annForm, ctaLabel: e.target.value })}
            />
            <Input
              label="Button Link URL"
              value={annForm.ctaUrl || ''}
              onChange={(e) => setAnnForm({ ...annForm, ctaUrl: e.target.value })}
            />
          </div>
          <div className="pt-3 flex justify-end gap-2 border-t border-white/10">
            <Button variant="ghost" onClick={() => setIsAnnModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Save Announcement</Button>
          </div>
        </form>
      </Modal>

      {/* Gallery Modal */}
      <Modal
        isOpen={isGalModalOpen}
        onClose={() => setIsGalModalOpen(false)}
        title={editingGal ? 'Edit Photo Metadata' : 'Add Photo to Gallery'}
        maxWidth="md"
      >
        <form onSubmit={handleSaveGal} className="space-y-4">
          <Input
            label="Title"
            required
            value={galForm.title || ''}
            onChange={(e) => setGalForm({ ...galForm, title: e.target.value })}
          />
          <Select
            label="Category"
            value={galForm.category || 'Food'}
            onChange={(e) => setGalForm({ ...galForm, category: e.target.value })}
          >
            <option value="Food">Food & Plating</option>
            <option value="Atmosphere">Atmosphere & Space</option>
            <option value="Interior">Interior Architecture</option>
            <option value="Chef">Chef & Atelier</option>
            <option value="Private Dining">Private Dining & Cellar</option>
            <option value="Events">Milestone Events</option>
          </Select>
          <Input
            label="Alt Text"
            value={galForm.altText || ''}
            onChange={(e) => setGalForm({ ...galForm, altText: e.target.value })}
          />
          <Input
            label="Caption"
            value={galForm.caption || ''}
            onChange={(e) => setGalForm({ ...galForm, caption: e.target.value })}
          />
          <ImageUploader
            label="Gallery Photograph"
            value={galForm.imageUrl || ''}
            onChange={(url) => setGalForm({ ...galForm, imageUrl: url })}
            aspectRatio="4:3"
          />
          <div className="pt-3 flex justify-end gap-2 border-t border-white/10">
            <Button variant="ghost" onClick={() => setIsGalModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Save Photo</Button>
          </div>
        </form>
      </Modal>

      {/* Confirm Modals */}
      <ConfirmModal
        isOpen={Boolean(deleteExpId)}
        onClose={() => setDeleteExpId(null)}
        onConfirm={async () => {
          if (!deleteExpId) return;
          await contentApi.deleteExperience(deleteExpId);
          setDeleteExpId(null);
          loadAll();
        }}
        title="Delete Experience"
        message="Remove this dining ritual from the public experience catalog?"
      />

      <ConfirmModal
        isOpen={Boolean(deleteTestId)}
        onClose={() => setDeleteTestId(null)}
        onConfirm={async () => {
          if (!deleteTestId) return;
          await contentApi.deleteTestimonial(deleteTestId);
          setDeleteTestId(null);
          loadAll();
        }}
        title="Delete Testimonial"
        message="Are you sure you want to remove this review?"
      />

      <ConfirmModal
        isOpen={Boolean(deleteAnnId)}
        onClose={() => setDeleteAnnId(null)}
        onConfirm={async () => {
          if (!deleteAnnId) return;
          await contentApi.deleteAnnouncement(deleteAnnId);
          setDeleteAnnId(null);
          loadAll();
        }}
        title="Delete Announcement"
        message="Remove this broadcast notification?"
      />

      <ConfirmModal
        isOpen={Boolean(deleteGalId)}
        onClose={() => setDeleteGalId(null)}
        onConfirm={async () => {
          if (!deleteGalId) return;
          await contentApi.deleteGalleryImage(deleteGalId);
          setDeleteGalId(null);
          loadAll();
        }}
        title="Delete Photo"
        message="Remove this image from the gallery anthology?"
      />
    </div>
  );
};
