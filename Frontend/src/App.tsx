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
} from 'lucide-react';

// Custom Crisp Platform Icons
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

interface PostPayload {
  content: string;
  mediaUrls: string[];
  platforms: string[];
  scheduledFor: string;
}

const PLATFORMS = [
  { id: 'twitter', name: 'Twitter / X', icon: TwitterIcon, color: 'text-sky-400 bg-sky-950/40 border-sky-800' },
  { id: 'linkedin', name: 'LinkedIn', icon: LinkedinIcon, color: 'text-blue-400 bg-blue-950/40 border-blue-800' },
  { id: 'instagram', name: 'Instagram', icon: InstagramIcon, color: 'text-pink-400 bg-pink-950/40 border-pink-800' },
  { id: 'facebook', name: 'Facebook', icon: FacebookIcon, color: 'text-indigo-400 bg-indigo-950/40 border-indigo-800' },
  { id: 'youtube', name: 'YouTube', icon: YoutubeIcon, color: 'text-red-400 bg-red-950/40 border-red-800' },
];

export default function App() {
  const [backendStatus, setBackendStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');
  const [posts, setPosts] = useState<Post[]>([]);
  const [content, setContent] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['twitter', 'linkedin']);
  const [scheduledDate, setScheduledDate] = useState(() => {
    const d = new Date();
    d.setHours(d.getHours() + 1);
    return d.toISOString().slice(0, 16);
  });
  const [mediaFiles, setMediaFiles] = useState<{ name: string; url: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [previewPlatform, setPreviewPlatform] = useState('twitter');

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
      console.warn('Failed to fetch posts from backend, running in offline view mode', e);
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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newPreviews = Array.from(files).map((f) => ({
      name: f.name,
      url: URL.createObjectURL(f),
    }));
    setMediaFiles([...mediaFiles, ...newPreviews]);
  };

  const removeMedia = (index: number) => {
    setMediaFiles(mediaFiles.filter((_, i) => i !== index));
  };

  const simulateLocalPost = (payload: PostPayload) => {
    const fallbackPost: Post = {
      id: Math.random().toString(36).substring(2, 9),
      content: payload.content,
      mediaUrls: payload.mediaUrls,
      platforms: payload.platforms,
      scheduledFor: payload.scheduledFor,
      status: 'scheduled',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setPosts([fallbackPost, ...posts]);
    setContent('');
    setMediaFiles([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setLoading(true);

    const postPayload: PostPayload = {
      content,
      mediaUrls: mediaFiles.map((m) => m.url),
      platforms: selectedPlatforms,
      scheduledFor: new Date(scheduledDate).toISOString(),
    };

    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postPayload),
      });

      if (res.ok) {
        const result = await res.json();
        setPosts([result.data, ...posts]);
        setContent('');
        setMediaFiles([]);
      } else {
        simulateLocalPost(postPayload);
      }
    } catch {
      simulateLocalPost(postPayload);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePost = async (id: string) => {
    try {
      await fetch(`/api/posts/${id}`, { method: 'DELETE' });
    } catch {
      // ignore
    }
    setPosts(posts.filter((p) => p.id !== id));
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Navbar */}
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

          <div className="flex items-center gap-4">
            {/* Backend status indicator */}
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
                title="Refresh Status"
                className="hover:text-white transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Post Composer */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-semibold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                Compose Post
              </h2>
              <span className="text-xs text-slate-400">{content.length} characters</span>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Target Platforms */}
              <div>
                <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">
                  Target Platforms
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
                <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">
                  Content / Caption
                </label>
                <textarea
                  rows={4}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="What would you like to share? Write your caption, hashtags (#AI, #Tech), and updates..."
                  className="w-full bg-slate-950/60 border border-slate-800 rounded-xl p-3.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition"
                  required
                />
              </div>

              {/* Media Uploads */}
              <div>
                <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">
                  Media Attachments
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-2">
                  {mediaFiles.map((media, idx) => (
                    <div key={idx} className="relative group rounded-xl overflow-hidden border border-slate-800 bg-slate-950 aspect-video flex items-center justify-center">
                      <img src={media.url} alt="upload" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeMedia(idx)}
                        className="absolute inset-0 bg-rose-950/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-rose-300 cursor-pointer"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  ))}

                  <label className="border-2 border-dashed border-slate-800 hover:border-indigo-500/50 rounded-xl aspect-video flex flex-col items-center justify-center cursor-pointer bg-slate-950/30 hover:bg-slate-900/50 transition">
                    <UploadCloud className="w-6 h-6 text-slate-400 mb-1" />
                    <span className="text-[11px] text-slate-400">Add Media</span>
                    <input
                      type="file"
                      multiple
                      accept="image/*,video/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Schedule Date & Time */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">
                    Schedule Release
                  </label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="datetime-local"
                      value={scheduledDate}
                      onChange={(e) => setScheduledDate(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-950/60 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                    />
                  </div>
                </div>

                <div className="flex items-end">
                  <button
                    type="submit"
                    disabled={loading || !content.trim()}
                    className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-600 text-white rounded-xl font-medium text-xs flex items-center justify-center gap-2 transition shadow-lg shadow-indigo-600/20 cursor-pointer disabled:cursor-not-allowed"
                  >
                    <Send className="w-3.5 h-3.5" />
                    {loading ? 'Queueing...' : 'Schedule Post'}
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Scheduled & Published Queue */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-400" />
                Scheduled Queue ({posts.length})
              </h2>
            </div>

            {posts.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-sm">
                No scheduled posts yet. Compose your first post above!
              </div>
            ) : (
              <div className="divide-y divide-slate-800">
                {posts.map((post) => (
                  <div key={post.id} className="py-4 first:pt-0 last:pb-0 flex items-start justify-between gap-4">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
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

                      <p className="text-sm text-slate-200 line-clamp-2">{post.content}</p>

                      <div className="flex items-center gap-1.5">
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

                    <button
                      onClick={() => handleDeletePost(post.id)}
                      className="p-2 text-slate-500 hover:text-rose-400 transition cursor-pointer"
                      title="Delete Post"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Live Feed Preview */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur sticky top-24">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-white flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-indigo-400" />
                Live Post Preview
              </h2>
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
                        previewPlatform === p ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                      }`}
                      title={item.name}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Social Post Mock Card */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center font-bold text-white text-sm shadow-md">
                  MM
                </div>
                <div>
                  <div className="font-semibold text-sm text-white flex items-center gap-1.5">
                    Multi-Media Channel
                    <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 fill-indigo-400/20" />
                  </div>
                  <div className="text-xs text-slate-400">
                    @{previewPlatform === 'twitter' ? 'scheduler_live' : 'scheduler'} • Live Preview
                  </div>
                </div>
              </div>

              <div className="text-sm text-slate-200 whitespace-pre-wrap leading-relaxed">
                {content || (
                  <span className="text-slate-500 italic">
                    Type something in the composer to see how it renders live on {previewPlatform}...
                  </span>
                )}
              </div>

              {mediaFiles.length > 0 && (
                <div className="rounded-xl overflow-hidden border border-slate-800 aspect-video bg-slate-900">
                  <img
                    src={mediaFiles[0].url}
                    alt="preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Share2 className="w-3.5 h-3.5 text-indigo-400" />
                  Platform: <strong className="capitalize text-slate-300">{previewPlatform}</strong>
                </span>
                <span>Scheduled: {new Date(scheduledDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </div>

            {/* Helper tips */}
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
