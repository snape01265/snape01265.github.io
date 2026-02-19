
import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Calendar, FileText, Film, Image as ImageIcon, X, Send } from 'lucide-react';
import { Post } from '../../types';

const INITIAL_POSTS: Post[] = [
  {
    id: '1',
    title: 'Cyberpunk Aesthetic Study',
    content: 'Exploring the neon-lit corridors of future Tokyo. The juxtaposition of high tech and low life creates a unique atmosphere.',
    type: 'image',
    url: 'https://picsum.photos/id/10/800/450',
    date: '2024-03-20'
  },
  {
    id: '2',
    title: 'Midnight Coding Session',
    content: 'Building the foundation of DreamOS. The challenge of creating a windowing system from scratch in React is surprisingly satisfying.',
    type: 'text',
    date: '2024-03-18'
  }
];

const NoteApp: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>(() => {
    const saved = localStorage.getItem('dreamos_posts');
    return saved ? JSON.parse(saved) : INITIAL_POSTS;
  });
  const [activeTab, setActiveTab] = useState<'all' | 'text' | 'media'>('all');
  const [showForm, setShowForm] = useState(false);
  
  // New Post State
  const [newPost, setNewPost] = useState<Partial<Post>>({
    title: '',
    content: '',
    type: 'text',
    url: ''
  });

  useEffect(() => {
    localStorage.setItem('dreamos_posts', JSON.stringify(posts));
  }, [posts]);

  const filteredPosts = posts.filter(p => {
    if (activeTab === 'text') return p.type === 'text';
    if (activeTab === 'media') return p.type !== 'text';
    return true;
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const handleAddPost = () => {
    if (!newPost.title || !newPost.content) return;
    
    const post: Post = {
      id: Math.random().toString(36).substr(2, 9),
      title: newPost.title,
      content: newPost.content,
      type: newPost.type as any,
      url: newPost.url,
      date: new Date().toISOString().split('T')[0]
    };

    setPosts(prev => [post, ...prev]);
    setShowForm(false);
    setNewPost({ title: '', content: '', type: 'text', url: '' });
  };

  const deletePost = (id: string) => {
    setPosts(prev => prev.filter(p => p.id !== id));
  };

  return (
    <div className="flex h-full text-slate-800 bg-white relative">
      {/* Sidebar */}
      <div className="w-56 border-r-2 border-slate-100 bg-slate-50/50 p-4 flex flex-col gap-6">
        <div>
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Vault Categories</h3>
          <div className="flex flex-col gap-1">
            <button onClick={() => setActiveTab('all')} className={`text-left px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'all' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-500 hover:bg-white hover:text-indigo-600'}`}>All Logs</button>
            <button onClick={() => setActiveTab('text')} className={`text-left px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'text' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-500 hover:bg-white hover:text-indigo-600'}`}>Reflections</button>
            <button onClick={() => setActiveTab('media')} className={`text-left px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'media' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-500 hover:bg-white hover:text-indigo-600'}`}>Visual Files</button>
          </div>
        </div>

        <button 
          onClick={() => setShowForm(true)}
          className="mt-auto w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl flex items-center justify-center gap-2 transition-all shadow-xl shadow-indigo-600/20 font-bold text-sm active:scale-95"
        >
          <Plus size={18} strokeWidth={3} />
          <span>Write Entry</span>
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 overflow-y-auto bg-white">
        <div className="max-w-2xl mx-auto flex flex-col gap-12 py-4">
          {filteredPosts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 opacity-20">
              <FileText size={64} className="mb-4" />
              <p className="font-bold pixel-font uppercase">Empty Archive</p>
            </div>
          ) : (
            filteredPosts.map(post => (
              <article key={post.id} className="group flex flex-col gap-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <header className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-slate-400">
                    <Calendar size={14} />
                    <span className="text-[10px] font-black font-mono uppercase tracking-widest">{post.date}</span>
                    <span className="text-[10px] font-black uppercase bg-slate-100 px-2 py-0.5 rounded text-slate-500">{post.type}</span>
                  </div>
                  <button 
                    onClick={() => deletePost(post.id)}
                    className="opacity-0 group-hover:opacity-100 p-2 hover:bg-red-50 hover:text-red-500 rounded-xl transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                </header>

                <div className="space-y-3">
                  <h2 className="text-3xl font-black tracking-tight text-slate-900 group-hover:text-indigo-600 transition-colors leading-tight uppercase pixel-font">{post.title}</h2>
                  <p className="text-slate-500 leading-relaxed font-medium text-lg italic border-l-4 border-slate-100 pl-4">
                    {post.content}
                  </p>
                </div>

                {post.type === 'image' && post.url && (
                  <div className="rounded-3xl overflow-hidden border-4 border-slate-50 shadow-2xl">
                    <img src={post.url} alt={post.title} className="w-full h-auto" />
                  </div>
                )}

                {post.type === 'video' && post.url && (
                  <div className="rounded-3xl overflow-hidden border-4 border-slate-50 shadow-2xl bg-black aspect-video">
                    <video controls className="w-full h-full object-cover">
                      <source src={post.url} type="video/mp4" />
                      Your browser does not support video.
                    </video>
                  </div>
                )}

                <div className="pt-8 border-b-2 border-slate-50" />
              </article>
            ))
          )}
        </div>
      </div>

      {/* Entry Modal */}
      {showForm && (
        <div className="absolute inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-[2rem] shadow-2xl overflow-hidden border-4 border-white flex flex-col max-h-[90%]">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="pixel-font text-xl font-bold uppercase text-indigo-600">New Log Entry</h3>
              <button onClick={() => setShowForm(false)} className="p-2 hover:bg-white rounded-full transition-colors text-slate-400">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Title</label>
                <input 
                  type="text" 
                  className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-600 rounded-2xl px-5 py-3 outline-none transition-all font-bold"
                  placeholder="The name of this entry..."
                  value={newPost.title}
                  onChange={e => setNewPost({...newPost, title: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                {(['text', 'image', 'video'] as const).map(t => (
                  <button 
                    key={t}
                    onClick={() => setNewPost({...newPost, type: t})}
                    className={`py-3 rounded-2xl text-[10px] font-black uppercase border-2 transition-all flex flex-col items-center gap-2 ${newPost.type === t ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg' : 'bg-slate-50 border-transparent text-slate-400 hover:bg-slate-100'}`}
                  >
                    {t === 'text' && <FileText size={18} />}
                    {t === 'image' && <ImageIcon size={18} />}
                    {t === 'video' && <Film size={18} />}
                    {t}
                  </button>
                ))}
              </div>

              {(newPost.type === 'image' || newPost.type === 'video') && (
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Media URL</label>
                  <input 
                    type="text" 
                    className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-600 rounded-2xl px-5 py-3 outline-none transition-all font-mono text-xs"
                    placeholder="https://example.com/image.jpg"
                    value={newPost.url}
                    onChange={e => setNewPost({...newPost, url: e.target.value})}
                  />
                </div>
              )}

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Content</label>
                <textarea 
                  className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-600 rounded-2xl px-5 py-4 outline-none transition-all h-32 resize-none font-medium leading-relaxed"
                  placeholder="Share your thoughts..."
                  value={newPost.content}
                  onChange={e => setNewPost({...newPost, content: e.target.value})}
                />
              </div>
            </div>

            <div className="p-6 bg-slate-50/50 border-t border-slate-100">
              <button 
                onClick={handleAddPost}
                disabled={!newPost.title || !newPost.content}
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 disabled:pointer-events-none text-white rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all shadow-xl shadow-indigo-600/20 active:scale-[0.98]"
              >
                <Send size={18} />
                Publish to Archive
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NoteApp;
