import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  Image as ImageIcon,
  Send,
  Trash2,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  UploadCloud,
  Layers,
  Sparkles,
  Share2,
  Heart,
  MessageCircle,
  Repeat2,
  Bookmark,
  ThumbsUp,
  MoreHorizontal,
  Globe,
  Edit3,
  X,
  Zap,
  Filter
} from 'lucide-react';

// Platform Brand Icons
const TwitterIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const LinkedinIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
  </svg>
);

const InstagramIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const FacebookIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M9.198 21.5h4v-8.01h3.604l.396-3.98h-4V7.5a1 1 0 0 1 1-1h3v-4h-3.99c-3.32 0-6.01 2.69-6.01 6.01v1.01H4v3.98h3.198v8z" />
  </svg>
);

const YoutubeIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
);

interface Post {
  id: string;
  content: string;
  mediaUrls: string[];
  platforms: string[];
  scheduledFor: string;
  status: 'draft' | 'scheduled' | 'published' | 'failed';
  createdAt: string;
  updatedAt: string;
}

const PLATFORMS = [
  { id: 'twitter', name: 'Twitter / X', icon: TwitterIcon, limit: 280, color: 'text-sky-400 bg-sky-950/40 border-sky-800' },
  { id: 'linkedin', name: 'LinkedIn', icon: LinkedinIcon, limit: 3000, color: 'text-blue-400 bg-blue-950/40 border-blue-800' },
  { id: 'instagram', name: 'Instagram', icon: InstagramIcon, limit: 2200, color: 'text-pink-400 bg-pink-950/40 border-pink-800' },
  { id: 'facebook', name: 'Facebook', icon: FacebookIcon, limit: 63206, color: 'text-indigo-400 bg-indigo-950/40 border-indigo-800' },
  { id: 'youtube', name: 'YouTube', icon: YoutubeIcon, limit: 10000, color: 'text-red-400 bg-red-950/40 border-red-800' },
];

export default function App() {
  const [backendStatus, setBackendStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');
  const [posts, setPosts] = useState<Post[]>([]);
  const [filterStatus, setFilterStatus] = useState<'all' | 'scheduled' | 'published'>('all');
  
  // Composer Form State
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [content, setContent] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['twitter', 'linkedin']);
  const [isPublishNow, setIsPublishNow] = useState(false);
  const [scheduledDate, setScheduledDate] = useState(() => {
    const d = new Date();
    d.setHours(d.getHours() + 1);
    return d.toISOString().slice(0, 16);
  });
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Live Preview Target
  const [previewPlatform, setPreviewPlatform] = useState('twitter');

  // Trigger Toast Notification
  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Check backend health
  const checkHealth = async () => {
    try {
      const res = await fetch('/api/health');
      if (res.ok) {
        setBackendStatus('connected');
        fetchPosts();
      } else {
        setBackendStatus('disconnected');
      }
    } catch {
      setBackendStatus('disconnected');
    }
  };

  // Fetch posts from backend
  const fetchPosts = async () => {
    try {
      const res = await fetch('/api/posts');
      if (res.ok) {
        const json = await res.json();
        if (json.data) setPosts(json.data);
      }
    } catch (e) {
      console.warn('Backend unavailable, using current state', e);
    }
  };

  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 15000);
    return () => clearInterval(interval);
  }, []);

  const togglePlatform = (id: string) => {
    if (selectedPlatforms.includes(id)) {
      if (selectedPlatforms.length > 1) {
        setSelectedPlatforms(selectedPlatforms.filter((p) => p !== id));
      }
    } else {
      setSelectedPlatforms([...selectedPlatforms, id]);
    }
  };

  // Real Multi-Media Upload Handler
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingMedia(true);
    const formData = new FormData();
    Array.from(files).forEach((file) => {
      formData.append('files', file);
    });

    try {
      const res = await fetch('/api/media/upload', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const json = await res.json();
        const urls = json.data.map((item: { url: string }) => item.url);
        setMediaUrls((prev) => [...prev, ...urls]);
        showToast(`${urls.length} media file(s) uploaded successfully!`);
      } else {
        // Fallback for offline demo: use local blob URLs
        const localUrls = Array.from(files).map((f) => URL.createObjectURL(f));
        setMediaUrls((prev) => [...prev, ...localUrls]);
        showToast('Media loaded in local preview mode');
      }
    } catch {
      const localUrls = Array.from(files).map((f) => URL.createObjectURL(f));
      setMediaUrls((prev) => [...prev, ...localUrls]);
      showToast('Media loaded in local preview mode');
    } finally {
      setUploadingMedia(false);
      e.target.value = '';
    }
  };

  const removeMedia = (index: number) => {
    setMediaUrls(mediaUrls.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setLoading(true);

    const postDate = isPublishNow ? new Date().toISOString() : new Date(scheduledDate).toISOString();
    const payload = {
      content,
      mediaUrls,
      platforms: selectedPlatforms,
      scheduledFor: postDate,
    };

    try {
      let res: Response;
      if (editingPostId) {
        res = await fetch(`/api/posts/${editingPostId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch('/api/posts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      if (res.ok) {
        const result = await res.json();
        if (editingPostId) {
          setPosts(posts.map((p) => (p.id === editingPostId ? result.data : p)));
          showToast('Post updated successfully!');
        } else {
          setPosts([result.data, ...posts]);
          showToast(isPublishNow ? 'Post published!' : 'Post scheduled successfully!');
        }
        resetForm();
      } else {
        simulateLocalSave(payload);
      }
    } catch {
      simulateLocalSave(payload);
    } finally {
      setLoading(false);
    }
  };

  const simulateLocalSave = (payload: { content: string; mediaUrls: string[]; platforms: string[]; scheduledFor: string }) => {
    if (editingPostId) {
      setPosts(
        posts.map((p) =>
          p.id === editingPostId
            ? { ...p, ...payload, updatedAt: new Date().toISOString() }
            : p
        )
      );
      showToast('Post updated locally');
    } else {
      const fallbackPost: Post = {
        id: Math.random().toString(36).substring(2, 9),
        content: payload.content,
        mediaUrls: payload.mediaUrls,
        platforms: payload.platforms,
        scheduledFor: payload.scheduledFor,
        status: isPublishNow ? 'published' : 'scheduled',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setPosts([fallbackPost, ...posts]);
      showToast(isPublishNow ? 'Post published locally' : 'Post scheduled locally');
    }
    resetForm();
  };

  const resetForm = () => {
    setContent('');
    setMediaUrls([]);
    setEditingPostId(null);
    setIsPublishNow(false);
    const d = new Date();
    d.setHours(d.getHours() + 1);
    setScheduledDate(d.toISOString().slice(0, 16));
  };

  const handleEdit = (post: Post) => {
    setEditingPostId(post.id);
    setContent(post.content);
    setSelectedPlatforms(post.platforms);
    setMediaUrls(post.mediaUrls || []);
    setIsPublishNow(false);
    setScheduledDate(new Date(post.scheduledFor).toISOString().slice(0, 16));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePublishNow = async (id: string) => {
    try {
      const res = await fetch(`/api/posts/${id}/publish`, { method: 'POST' });
      if (res.ok) {
        const json = await res.json();
        setPosts(posts.map((p) => (p.id === id ? json.data : p)));
        showToast('Post published immediately!');
        return;
      }
    } catch {
      // offline fallback
    }
    setPosts(
      posts.map((p) =>
        p.id === id ? { ...p, status: 'published', updatedAt: new Date().toISOString() } : p
      )
    );
    showToast('Post marked as published');
  };

  const handleDeletePost = async (id: string) => {
    try {
      await fetch(`/api/posts/${id}`, { method: 'DELETE' });
    } catch {
      // ignore
    }
    setPosts(posts.filter((p) => p.id !== id));
    showToast('Post deleted');
  };

  const filteredPosts = posts.filter((p) => {
    if (filterStatus === 'all') return true;
    return p.status === filterStatus;
  });

  // Calculate character stats based on the active preview platform
  const currentPlatformLimit = PLATFORMS.find((p) => p.id === previewPlatform)?.limit || 280;
  const isOverLimit = content.length > currentPlatformLimit;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-slate-900 border border-indigo-500/40 text-slate-100 shadow-2xl animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-medium">{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-xl shadow-lg shadow-indigo-500/20">
              <Layers className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
                Multi-Media Post Scheduler
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  Full Stack
                </span>
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-full bg-slate-800/80 border border-slate-700/60">
              <span
                className={`w-2 h-2 rounded-full ${
                  backendStatus === 'connected'
                    ? 'bg-emerald-400 animate-pulse'
                    : backendStatus === 'checking'
                    ? 'bg-amber-400'
                    : 'bg-rose-400'
                }`}
              />
              <span className="text-slate-300">
                Backend API:{' '}
                <strong className={backendStatus === 'connected' ? 'text-emerald-400' : 'text-slate-400'}>
                  {backendStatus === 'connected'
                    ? 'Connected (Port 5000)'
                    : backendStatus === 'checking'
                    ? 'Checking...'
                    : 'Disconnected'}
                </strong>
              </span>
              <button
                onClick={checkHealth}
                title="Refresh Health"
                className="hover:text-white transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Composer & Post Queue */}
        <div className="lg:col-span-7 space-y-6">
          {/* Post Composer Card */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-semibold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                {editingPostId ? 'Edit Scheduled Post' : 'Compose New Post'}
              </h2>
              {editingPostId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" /> Cancel Edit
                </button>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Target Platforms */}
              <div>
                <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">
                  Target Social Platforms
                </label>
                <div className="flex flex-wrap gap-2">
                  {PLATFORMS.map((platform) => {
                    const isSelected = selectedPlatforms.includes(platform.id);
                    const Icon = platform.icon;
                    return (
                      <button
                        key={platform.id}
                        type="button"
                        onClick={() => togglePlatform(platform.id)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
                          isSelected
                            ? `${platform.color} ring-1 ring-indigo-500/50 shadow-sm`
                            : 'bg-slate-800/40 text-slate-400 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        {platform.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Caption Content */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Content & Caption
                  </label>
                  <span
                    className={`text-xs font-medium ${
                      isOverLimit ? 'text-rose-400 font-bold' : 'text-slate-400'
                    }`}
                  >
                    {content.length} / {currentPlatformLimit} chars ({previewPlatform})
                  </span>
                </div>
                <textarea
                  rows={4}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Share news, announce a release, or queue regular media updates across your channels..."
                  className={`w-full bg-slate-950/60 border rounded-xl p-3.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 transition ${
                    isOverLimit
                      ? 'border-rose-500/80 focus:ring-rose-500/50'
                      : 'border-slate-800 focus:ring-indigo-500/50 focus:border-indigo-500'
                  }`}
                  required
                />
              </div>

              {/* Media Attachments */}
              <div>
                <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">
                  Media Files (Images / Videos)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-2">
                  {mediaUrls.map((url, idx) => (
                    <div key={idx} className="relative group rounded-xl overflow-hidden border border-slate-800 bg-slate-950 aspect-video flex items-center justify-center">
                      <img src={url} alt="upload" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeMedia(idx)}
                        className="absolute inset-0 bg-rose-950/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-rose-300 cursor-pointer"
                        title="Remove file"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  ))}

                  <label className="border-2 border-dashed border-slate-800 hover:border-indigo-500/50 rounded-xl aspect-video flex flex-col items-center justify-center cursor-pointer bg-slate-950/30 hover:bg-slate-900/50 transition">
                    <UploadCloud className={`w-6 h-6 ${uploadingMedia ? 'animate-bounce text-indigo-400' : 'text-slate-400'} mb-1`} />
                    <span className="text-[11px] text-slate-400">
                      {uploadingMedia ? 'Uploading...' : 'Add Media'}
                    </span>
                    <input
                      type="file"
                      multiple
                      accept="image/*,video/*"
                      onChange={handleFileUpload}
                      disabled={uploadingMedia}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Scheduling Settings */}
              <div className="bg-slate-950/50 border border-slate-800/80 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-indigo-400" />
                    <span className="text-xs font-medium text-slate-300">Publish Timing</span>
                  </div>
                  <div className="flex gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => setIsPublishNow(false)}
                      className={`px-3 py-1 rounded-lg border transition cursor-pointer ${
                        !isPublishNow
                          ? 'bg-indigo-600 text-white border-indigo-500'
                          : 'bg-slate-900 text-slate-400 border-slate-800'
                      }`}
                    >
                      Schedule Later
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsPublishNow(true)}
                      className={`px-3 py-1 rounded-lg border transition cursor-pointer ${
                        isPublishNow
                          ? 'bg-emerald-600 text-white border-emerald-500'
                          : 'bg-slate-900 text-slate-400 border-slate-800'
                      }`}
                    >
                      Publish Now
                    </button>
                  </div>
                </div>

                {!isPublishNow && (
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">
                      Choose date and time to broadcast:
                    </label>
                    <div className="relative">
                      <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="datetime-local"
                        value={scheduledDate}
                        onChange={(e) => setScheduledDate(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || !content.trim() || isOverLimit}
                className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-600 text-white rounded-xl font-medium text-xs flex items-center justify-center gap-2 transition shadow-lg shadow-indigo-600/20 cursor-pointer disabled:cursor-not-allowed"
              >
                {isPublishNow ? <Zap className="w-4 h-4" /> : <Send className="w-4 h-4" />}
                {loading
                  ? 'Saving Post...'
                  : editingPostId
                  ? 'Update Scheduled Post'
                  : isPublishNow
                  ? 'Publish Post Now'
                  : 'Schedule Post'}
              </button>
            </form>
          </div>

          {/* Queue List Card */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
              <h2 className="text-base font-semibold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-400" />
                Post Queue ({filteredPosts.length})
              </h2>

              {/* Filter Tabs */}
              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
                <button
                  onClick={() => setFilterStatus('all')}
                  className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                    filterStatus === 'all' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  All ({posts.length})
                </button>
                <button
                  onClick={() => setFilterStatus('scheduled')}
                  className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                    filterStatus === 'scheduled' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Scheduled ({posts.filter((p) => p.status === 'scheduled').length})
                </button>
                <button
                  onClick={() => setFilterStatus('published')}
                  className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                    filterStatus === 'published' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Published ({posts.filter((p) => p.status === 'published').length})
                </button>
              </div>
            </div>

            {filteredPosts.length === 0 ? (
              <div className="text-center py-10 text-slate-500 text-sm">
                No posts found in this filter. Compose a post above!
              </div>
            ) : (
              <div className="divide-y divide-slate-800">
                {filteredPosts.map((post) => (
                  <div key={post.id} className="py-4 first:pt-0 last:pb-0 flex items-start justify-between gap-4">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full border ${
                            post.status === 'published'
                              ? 'bg-emerald-950/50 text-emerald-400 border-emerald-800'
                              : post.status === 'scheduled'
                              ? 'bg-amber-950/50 text-amber-400 border-amber-800'
                              : 'bg-slate-800 text-slate-400 border-slate-700'
                          }`}
                        >
                          {post.status}
                        </span>
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(post.scheduledFor).toLocaleString([], {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>

                      <p className="text-sm text-slate-200 line-clamp-2 leading-relaxed">{post.content}</p>

                      {/* Attached Media Thumbnails */}
                      {post.mediaUrls && post.mediaUrls.length > 0 && (
                        <div className="flex gap-2 pt-1">
                          {post.mediaUrls.map((url, i) => (
                            <img
                              key={i}
                              src={url}
                              alt="media"
                              className="w-12 h-12 object-cover rounded-lg border border-slate-800 bg-slate-950"
                            />
                          ))}
                        </div>
                      )}

                      <div className="flex items-center gap-1.5 pt-1">
                        {post.platforms.map((p) => {
                          const config = PLATFORMS.find((item) => item.id === p);
                          if (!config) return null;
                          const Icon = config.icon;
                          return (
                            <span
                              key={p}
                              className="p-1.5 rounded-md bg-slate-800 text-slate-400"
                              title={config.name}
                            >
                              <Icon className="w-3.5 h-3.5" />
                            </span>
                          );
                        })}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 shrink-0">
                      {post.status === 'scheduled' && (
                        <button
                          onClick={() => handlePublishNow(post.id)}
                          className="p-2 text-slate-400 hover:text-emerald-400 transition cursor-pointer"
                          title="Publish Now Immediately"
                        >
                          <Zap className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleEdit(post)}
                        className="p-2 text-slate-400 hover:text-indigo-400 transition cursor-pointer"
                        title="Edit Post"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeletePost(post.id)}
                        className="p-2 text-slate-400 hover:text-rose-400 transition cursor-pointer"
                        title="Delete Post"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Platform-Specific Live Feed Preview */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur sticky top-24">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-white flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-indigo-400" />
                Live Feed Preview
              </h2>
              {/* Platform Switcher */}
              <div className="flex gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                {selectedPlatforms.map((p) => {
                  const item = PLATFORMS.find((pl) => pl.id === p);
                  if (!item) return null;
                  const Icon = item.icon;
                  return (
                    <button
                      key={p}
                      onClick={() => setPreviewPlatform(p)}
                      className={`p-1.5 rounded-lg transition cursor-pointer ${
                        previewPlatform === p ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                      }`}
                      title={`Preview on ${item.name}`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Platform Mock Renderers */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
              
              {/* TWITTER / X PREVIEW */}
              {previewPlatform === 'twitter' && (
                <div className="p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-sky-400 to-blue-600 flex items-center justify-center font-bold text-white text-sm">
                        MM
                      </div>
                      <div>
                        <div className="font-bold text-sm text-white flex items-center gap-1">
                          Brand Name
                          <CheckCircle2 className="w-3.5 h-3.5 text-sky-400 fill-sky-400/20" />
                        </div>
                        <div className="text-xs text-slate-400">@brand_scheduler • Just now</div>
                      </div>
                    </div>
                    <TwitterIcon className="w-4 h-4 text-slate-400" />
                  </div>

                  <p className="text-sm text-slate-100 whitespace-pre-wrap leading-relaxed">
                    {content || <span className="text-slate-600 italic">Type a post to preview on Twitter...</span>}
                  </p>

                  {mediaUrls.length > 0 && (
                    <div className="rounded-xl overflow-hidden border border-slate-800 aspect-video bg-slate-900">
                      <img src={mediaUrls[0]} alt="preview" className="w-full h-full object-cover" />
                    </div>
                  )}

                  <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-slate-400 text-xs px-2">
                    <span className="flex items-center gap-1.5 hover:text-sky-400"><MessageCircle className="w-4 h-4" /> 12</span>
                    <span className="flex items-center gap-1.5 hover:text-emerald-400"><Repeat2 className="w-4 h-4" /> 4</span>
                    <span className="flex items-center gap-1.5 hover:text-pink-400"><Heart className="w-4 h-4" /> 89</span>
                    <span className="flex items-center gap-1.5 hover:text-sky-400"><Bookmark className="w-4 h-4" /></span>
                  </div>
                </div>
              )}

              {/* LINKEDIN PREVIEW */}
              {previewPlatform === 'linkedin' && (
                <div className="p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-700 flex items-center justify-center font-bold text-white text-sm">
                        MM
                      </div>
                      <div>
                        <div className="font-bold text-sm text-white">Your Brand Organization</div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-1">
                          Productivity & Media Tech • 1h • <Globe className="w-3 h-3" />
                        </div>
                      </div>
                    </div>
                    <LinkedinIcon className="w-4 h-4 text-blue-400" />
                  </div>

                  <p className="text-sm text-slate-200 whitespace-pre-wrap leading-relaxed">
                    {content || <span className="text-slate-600 italic">Type a post to preview on LinkedIn...</span>}
                  </p>

                  {mediaUrls.length > 0 && (
                    <div className="rounded-xl overflow-hidden border border-slate-800 aspect-video bg-slate-900">
                      <img src={mediaUrls[0]} alt="preview" className="w-full h-full object-cover" />
                    </div>
                  )}

                  <div className="pt-2 border-t border-slate-800/60 flex items-center justify-around text-slate-400 text-xs">
                    <span className="flex items-center gap-1 hover:text-blue-400 cursor-pointer"><ThumbsUp className="w-3.5 h-3.5" /> Like</span>
                    <span className="flex items-center gap-1 hover:text-blue-400 cursor-pointer"><MessageCircle className="w-3.5 h-3.5" /> Comment</span>
                    <span className="flex items-center gap-1 hover:text-blue-400 cursor-pointer"><Repeat2 className="w-3.5 h-3.5" /> Repost</span>
                    <span className="flex items-center gap-1 hover:text-blue-400 cursor-pointer"><Send className="w-3.5 h-3.5" /> Send</span>
                  </div>
                </div>
              )}

              {/* INSTAGRAM PREVIEW */}
              {previewPlatform === 'instagram' && (
                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="p-0.5 rounded-full bg-gradient-to-tr from-amber-400 via-rose-500 to-purple-600">
                        <div className="w-8 h-8 rounded-full bg-slate-950 flex items-center justify-center font-bold text-white text-xs">
                          MM
                        </div>
                      </div>
                      <span className="font-semibold text-xs text-white">brand_official</span>
                    </div>
                    <MoreHorizontal className="w-4 h-4 text-slate-400" />
                  </div>

                  <div className="rounded-xl overflow-hidden border border-slate-800 aspect-square bg-slate-900 flex items-center justify-center">
                    {mediaUrls.length > 0 ? (
                      <img src={mediaUrls[0]} alt="preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-center p-4 text-slate-500 text-xs">
                        <UploadCloud className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                        Attach an image/video to see the Instagram post card
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-slate-300">
                    <div className="flex items-center gap-3">
                      <Heart className="w-4 h-4 cursor-pointer hover:text-pink-500" />
                      <MessageCircle className="w-4 h-4 cursor-pointer" />
                      <Send className="w-4 h-4 cursor-pointer" />
                    </div>
                    <Bookmark className="w-4 h-4 cursor-pointer" />
                  </div>

                  <div className="text-xs text-slate-300">
                    <strong className="text-white mr-1.5">brand_official</strong>
                    {content || <span className="text-slate-600 italic">Caption preview here...</span>}
                  </div>
                </div>
              )}

              {/* FACEBOOK PREVIEW */}
              {previewPlatform === 'facebook' && (
                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-white text-sm">
                        MM
                      </div>
                      <div>
                        <div className="font-bold text-sm text-white">Official Brand Page</div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-1">
                          Just now • <Globe className="w-3 h-3" />
                        </div>
                      </div>
                    </div>
                    <FacebookIcon className="w-4 h-4 text-indigo-400" />
                  </div>

                  <p className="text-sm text-slate-200 whitespace-pre-wrap leading-relaxed">
                    {content || <span className="text-slate-600 italic">Type a post to preview on Facebook...</span>}
                  </p>

                  {mediaUrls.length > 0 && (
                    <div className="rounded-xl overflow-hidden border border-slate-800 aspect-video bg-slate-900">
                      <img src={mediaUrls[0]} alt="preview" className="w-full h-full object-cover" />
                    </div>
                  )}

                  <div className="pt-2 border-t border-slate-800/60 flex items-center justify-around text-slate-400 text-xs">
                    <span className="flex items-center gap-1.5 hover:text-indigo-400 cursor-pointer"><ThumbsUp className="w-4 h-4" /> Like</span>
                    <span className="flex items-center gap-1.5 hover:text-indigo-400 cursor-pointer"><MessageCircle className="w-4 h-4" /> Comment</span>
                    <span className="flex items-center gap-1.5 hover:text-indigo-400 cursor-pointer"><Share2 className="w-4 h-4" /> Share</span>
                  </div>
                </div>
              )}

              {/* YOUTUBE PREVIEW */}
              {previewPlatform === 'youtube' && (
                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center font-bold text-white text-sm">
                        MM
                      </div>
                      <div>
                        <div className="font-bold text-sm text-white">Creator Channel</div>
                        <div className="text-[11px] text-slate-400">Community Post • Scheduled</div>
                      </div>
                    </div>
                    <YoutubeIcon className="w-4 h-4 text-red-500" />
                  </div>

                  <p className="text-sm text-slate-200 whitespace-pre-wrap leading-relaxed">
                    {content || <span className="text-slate-600 italic">Type a post to preview on YouTube Community...</span>}
                  </p>

                  {mediaUrls.length > 0 && (
                    <div className="rounded-xl overflow-hidden border border-slate-800 aspect-video bg-slate-900">
                      <img src={mediaUrls[0]} alt="preview" className="w-full h-full object-cover" />
                    </div>
                  )}

                  <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-slate-400 text-xs px-2">
                    <span className="flex items-center gap-1.5 hover:text-red-400"><ThumbsUp className="w-4 h-4" /> 45</span>
                    <span className="flex items-center gap-1.5 hover:text-slate-200"><MessageCircle className="w-4 h-4" /> 18 Comments</span>
                  </div>
                </div>
              )}

            </div>

            {/* Schedule Info Box */}
            <div className="mt-4 p-3.5 rounded-xl bg-indigo-950/20 border border-indigo-900/30 text-xs text-indigo-300 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-indigo-400 mt-0.5" />
              <span>
                Backend scheduler service automatically monitors posts every minute and transitions them to published status when due.
              </span>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}
