import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { Megaphone, Calendar, Tag } from 'lucide-react'

export default function Community() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPosts()

    // Real-time Listener: Updates instantly when Admin posts!
    const sub = supabase.channel('community-feed')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'community_posts' }, (payload) => {
        setPosts(current => [payload.new, ...current])
      })
      .subscribe()

    return () => supabase.removeChannel(sub)
  }, [])

  const fetchPosts = async () => {
    const { data, error } = await supabase
      .from('community_posts')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) console.error("Error fetching posts:", error)
    else setPosts(data || [])
    
    setLoading(false)
  }

  return (
    <div className="p-4 max-w-2xl mx-auto pb-24">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-teal-100 p-3 rounded-full text-teal-700">
            <Megaphone size={24} />
        </div>
        <div>
            <h1 className="text-2xl font-bold text-slate-800">Community Updates</h1>
            <p className="text-slate-500 text-sm">Official Health News & Tips</p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-10 text-slate-400">Loading updates...</div>
      ) : posts.length === 0 ? (
        <div className="text-center py-10 bg-slate-50 rounded-xl border border-slate-100 text-slate-500">
            No updates posted yet.
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map(post => (
            <div key={post.id} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 animate-fade-in hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-2">
                 <span className={`text-xs font-bold px-2 py-1 rounded uppercase tracking-wide ${
                    post.category === 'Official Update' ? 'bg-blue-100 text-blue-700' :
                    post.category === 'Awareness Message' ? 'bg-orange-100 text-orange-700' :
                    'bg-green-100 text-green-700'
                 }`}>
                    {post.category || 'Update'}
                 </span>
                 <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Calendar size={12}/>
                    {new Date(post.created_at).toLocaleDateString()}
                 </span>
              </div>
              
              <h3 className="text-lg font-bold text-slate-800 mb-2">{post.title}</h3>
              <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">
                {post.content}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}