import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { HeartPulse, PlayCircle } from 'lucide-react'

export default function FirstAid() {
  const [content, setContent] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchContent()
  }, [])

  const fetchContent = async () => {
    // Fetch data ordered by latest created
    const { data, error } = await supabase
      .from('first_aid_content')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (!error) {
        setContent(data)
    }
    setLoading(false)
  }

  if (loading) return <div className="p-8 text-center text-slate-500">Loading Guide...</div>

  return (
    <div className="max-w-3xl mx-auto animate-fade-in p-4">
      <div className="text-center mb-8">
         <h1 className="text-3xl font-black text-slate-800 flex items-center justify-center gap-2">
            <HeartPulse className="text-red-500"/> First Aid Guide
         </h1>
         <p className="text-slate-500 mt-2">Quick video guides for common emergencies.</p>
      </div>
      
      <div className="space-y-6">
        {content.map(item => (
           <div key={item.id} className="bg-white rounded-2xl overflow-hidden shadow-lg shadow-slate-200/50 border border-slate-100 transition hover:shadow-xl">
              {/* Video Embed Container - Responsive */}
              {item.video_url && (
                  <div className="relative pb-[56.25%] h-0 bg-slate-900">
                      <iframe 
                          className="absolute top-0 left-0 w-full h-full"
                          src={item.video_url} 
                          title={item.title}
                          frameBorder="0" 
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                          allowFullScreen>
                      </iframe>
                  </div>
              )}
              
              <div className="p-6">
                 <div className="flex items-center gap-2 mb-2">
                    <PlayCircle size={20} className="text-blue-600"/>
                    <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-full uppercase">{item.category || 'General'}</span>
                 </div>
                 <h2 className="text-xl font-bold text-slate-800 mb-2">{item.title}</h2>
                 <p className="text-slate-600 leading-relaxed">{item.description}</p>
              </div>
           </div>
        ))}

        {content.length === 0 && !loading && (
            <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                <p className="text-slate-500">No content available yet. Check back later!</p>
            </div>
        )}
      </div>
    </div>
  )
}