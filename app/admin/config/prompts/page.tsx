'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { isAdmin } from '@/lib/adminAuth'
import { Save, RefreshCw, Edit3 } from '@/lib/icons'

type Template = {
  id: string
  key: string
  system_preamble?: string | null
  template: string
  tokens_schema?: any
  model?: string | null
  temperature?: number | null
  max_tokens?: number | null
  version: number
  is_active: boolean
  updated_at?: string
}

const TOKEN_GROUPS: Array<{ name: string; tokens: string[] }> = [
  { name: 'Essentials', tokens: ['{{course.title}}','{{course.description}}','{{course.knowledge_level}}','{{course.target_audience}}','{{essentials.learning_outcomes}}','{{essentials.methodology}}'] },
  { name: 'Instructional', tokens: ['{{instructional.model}}','{{instructional.description}}','{{instructional.principles}}'] },
  { name: 'Blueprint', tokens: ['{{blueprint.type}}','{{blueprint.columns}}'] },
  { name: 'Multimedia', tokens: ['{{multimedia.course_type}}','{{multimedia.voice_tone}}','{{multimedia.knowledge_assessments}}','{{multimedia.assessments_text}}','{{multimedia.audio_narration}}','{{multimedia.image_generation}}','{{multimedia.video_content}}','{{multimedia.animation_motion}}','{{multimedia.engagement_percentage}}'] },
  { name: 'Structure', tokens: ['{{modules.summary}}','{{lessons.summary}}','{{module.title}}','{{module.description}}','{{lesson.title}}','{{lesson.description}}'] },
]

export default function AdminPromptsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [templates, setTemplates] = useState<Template[]>([])
  const [activeKey, setActiveKey] = useState<string>('learning_outcomes')
  const active = useMemo(() => templates.find(t => t.key === activeKey), [templates, activeKey])
  const [work, setWork] = useState<Partial<Template>>({})
  const [courseId, setCourseId] = useState('')
  const [moduleId, setModuleId] = useState('')
  const [lessonId, setLessonId] = useState('')
  const [preview, setPreview] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [versions, setVersions] = useState<any[]>([])

  useEffect(() => {
    const init = async () => {
      const ok = await isAdmin()
      if (!ok) { router.push('/admin/login'); return }
      await reload()
    }
    init()
  }, [router])

  const reload = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/prompts')
      const data = await res.json()
      setTemplates(data.templates || [])
      setWork({})
    } finally { setLoading(false) }
  }

  useEffect(() => {
    if (!active) return
    setWork({
      key: active.key,
      system_preamble: active.system_preamble || '',
      template: active.template || '',
      model: active.model || '',
      temperature: active.temperature ?? undefined,
      max_tokens: active.max_tokens ?? undefined,
      is_active: active.is_active,
    })
    // Load versions for this key
    ;(async () => {
      try {
        const res = await fetch(`/api/admin/prompts?key=${active.key}`)
        const data = await res.json()
        setVersions(data.versions || [])
      } catch {}
    })()
  }, [activeKey, active])

  const insertToken = (token: string) => {
    setWork(prev => ({ ...prev, template: `${(prev.template || '')}${(prev.template || '').endsWith('\n') ? '' : '\n'}${token}` }))
  }

  const save = async () => {
    if (!work?.key || !work?.template) return
    setIsSaving(true)
    try {
      const res = await fetch('/api/admin/prompts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ template: work })
      })
      if (!res.ok) throw new Error('Failed to save')
      await reload()
    } catch (e) {
      console.error('save failed', e)
    } finally { setIsSaving(false) }
  }

  const doPreview = async () => {
    if (!work?.template) return
    const res = await fetch('/api/admin/prompts/preview', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ template: work.template, courseId, moduleId, lessonId })
    })
    const data = await res.json()
    if (res.ok) setPreview(data.rendered || '')
    else setPreview(`Preview error: ${data.error || 'unknown'}`)
  }

  const restoreVersion = async (v: any) => {
    const snap = v?.snapshot || {}
    setWork({
      key: snap.key,
      system_preamble: snap.system_preamble || '',
      template: snap.template || '',
      model: snap.model || '',
      temperature: snap.temperature ?? undefined,
      max_tokens: snap.max_tokens ?? undefined,
      is_active: snap.is_active,
    })
  }

  if (loading) return <div className="p-6 text-gray-500">Loading prompts…</div>

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-900">
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-white">Admin • AI Prompts</h1>
          <button onClick={reload} className="text-sm text-gray-300 hover:text-white flex items-center gap-2"><RefreshCw className="w-4 h-4"/> Refresh</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left: Keys */}
          <div className="md:col-span-1 bg-slate-800/60 rounded-xl border border-slate-700 p-4">
            <div className="text-gray-300 text-sm mb-2">Prompt Keys</div>
            <div className="space-y-2">
              {templates.map(t => (
                <button key={t.key} onClick={() => setActiveKey(t.key)} className={`w-full text-left px-3 py-2 rounded-lg ${activeKey===t.key?'bg-slate-700 text-white':'text-gray-300 hover:bg-slate-700/50'}`}>
                  <div className="flex items-center justify-between">
                    <span>{t.key}</span>
                    <span className="text-xs text-gray-400">v{t.version}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Center: Editor */}
          <div className="md:col-span-1 bg-slate-800/60 rounded-xl border border-slate-700 p-4">
            <div className="text-gray-300 text-sm mb-2">Editor</div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-400 mb-1">System Preamble</label>
                <textarea value={work.system_preamble as string || ''} onChange={e=>setWork(prev=>({...prev, system_preamble:e.target.value}))} rows={3} className="w-full rounded-lg bg-slate-900 border border-slate-700 p-2 text-gray-100"/>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Template</label>
                <textarea value={work.template || ''} onChange={e=>setWork(prev=>({...prev, template:e.target.value}))} rows={16} className="w-full rounded-lg bg-slate-900 border border-slate-700 p-2 text-gray-100 font-mono text-sm"/>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Model (optional)</label>
                  <input value={(work.model as string) || ''} onChange={e=>setWork(prev=>({...prev, model:e.target.value}))} className="w-full rounded-lg bg-slate-900 border border-slate-700 p-2 text-gray-100 text-sm"/>
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Temperature</label>
                  <input type="number" step="0.1" min="0" max="2" value={(work.temperature as number) ?? 0.7} onChange={e=>setWork(prev=>({...prev, temperature: Number(e.target.value)}))} className="w-full rounded-lg bg-slate-900 border border-slate-700 p-2 text-gray-100 text-sm"/>
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Max Tokens</label>
                  <input type="number" value={(work.max_tokens as number) ?? 2000} onChange={e=>setWork(prev=>({...prev, max_tokens: Number(e.target.value)}))} className="w-full rounded-lg bg-slate-900 border border-slate-700 p-2 text-gray-100 text-sm"/>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={save} disabled={isSaving} className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm flex items-center gap-2"><Save className="w-4 h-4"/> Save</button>
              </div>
            </div>
          </div>

          {/* Right: Tokens + Preview */}
          <div className="md:col-span-1 bg-slate-800/60 rounded-xl border border-slate-700 p-4">
            <div className="mb-3">
              <div className="text-gray-300 text-sm mb-2">Tokens</div>
              <div className="space-y-3">
                {TOKEN_GROUPS.map(group => (
                  <div key={group.name} className="">
                    <div className="text-xs text-gray-400 mb-1">{group.name}</div>
                    <div className="flex flex-wrap gap-2">
                      {group.tokens.map(tok => (
                        <button key={tok} onClick={()=>insertToken(tok)} className="px-2 py-1 rounded-md bg-slate-900 border border-slate-700 text-xs text-gray-200 hover:bg-slate-700/60">{tok}</button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4">
              <div className="text-gray-300 text-sm mb-2">Preview</div>
              <div className="grid grid-cols-1 gap-2 mb-2">
                <input value={courseId} onChange={e=>setCourseId(e.target.value)} placeholder="Course ID (optional)" className="w-full rounded-md bg-slate-900 border border-slate-700 p-2 text-gray-100 text-xs"/>
                <input value={moduleId} onChange={e=>setModuleId(e.target.value)} placeholder="Module ID (optional)" className="w-full rounded-md bg-slate-900 border border-slate-700 p-2 text-gray-100 text-xs"/>
                <input value={lessonId} onChange={e=>setLessonId(e.target.value)} placeholder="Lesson ID (optional)" className="w-full rounded-md bg-slate-900 border border-slate-700 p-2 text-gray-100 text-xs"/>
                <button onClick={doPreview} className="px-2 py-1 bg-slate-700 hover:bg-slate-600 rounded-md text-xs text-gray-100 flex items-center gap-2"><Edit3 className="w-3 h-3"/> Render Preview</button>
              </div>
              <pre className="whitespace-pre-wrap text-xs text-gray-200 bg-slate-900 border border-slate-700 rounded-md p-3 max-h-64 overflow-auto">{preview || 'Rendered prompt will appear here.'}</pre>
            </div>

            <div className="mt-6">
              <div className="text-gray-300 text-sm mb-2">Versions (last 10)</div>
              <div className="space-y-2 max-h-52 overflow-auto">
                {versions.map(v => (
                  <div key={v.version} className="flex items-center justify-between bg-slate-900 border border-slate-700 rounded-md p-2">
                    <div className="text-xs text-gray-300">v{v.version} • {new Date(v.created_at).toLocaleString()}</div>
                    <button onClick={()=>restoreVersion(v)} className="text-xs text-gray-200 hover:text-white">Load</button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
