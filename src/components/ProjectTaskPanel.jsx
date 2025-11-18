import { useEffect, useMemo, useState } from "react"
import { Plus, Timer, Square, PlayCircle, StopCircle } from "lucide-react"

const API_BASE = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000"

export default function ProjectTaskPanel() {
  const [projects, setProjects] = useState([])
  const [tasks, setTasks] = useState([])
  const [entries, setEntries] = useState([])
  const [selectedProject, setSelectedProject] = useState("")
  const [newProject, setNewProject] = useState("")
  const [newTask, setNewTask] = useState("")
  const [activeEntryId, setActiveEntryId] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const filteredTasks = useMemo(() => {
    return tasks.filter(t => !selectedProject || t.project_id === selectedProject)
  }, [tasks, selectedProject])

  async function fetchProjects() {
    const res = await fetch(`${API_BASE}/api/projects`)
    const data = await res.json()
    setProjects(data)
  }
  async function fetchTasks() {
    const url = selectedProject ? `${API_BASE}/api/tasks?project_id=${selectedProject}` : `${API_BASE}/api/tasks`
    const res = await fetch(url)
    const data = await res.json()
    setTasks(data)
  }
  async function fetchEntries() {
    const url = selectedProject ? `${API_BASE}/api/time/entries?project_id=${selectedProject}` : `${API_BASE}/api/time/entries`
    const res = await fetch(url)
    const data = await res.json()
    setEntries(data)
  }

  useEffect(() => {
    fetchProjects()
  }, [])

  useEffect(() => {
    fetchTasks()
    fetchEntries()
  }, [selectedProject])

  async function handleCreateProject(e) {
    e.preventDefault()
    if (!newProject.trim()) return
    setLoading(true)
    setError("")
    try {
      const res = await fetch(`${API_BASE}/api/projects`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newProject })
      })
      if (!res.ok) throw new Error("Failed to create project")
      setNewProject("")
      await fetchProjects()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleCreateTask(e) {
    e.preventDefault()
    if (!newTask.trim() || !selectedProject) return
    setLoading(true)
    setError("")
    try {
      const res = await fetch(`${API_BASE}/api/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newTask, project_id: selectedProject })
      })
      if (!res.ok) throw new Error("Failed to create task")
      setNewTask("")
      await fetchTasks()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function startTimer(taskId) {
    setLoading(true)
    setError("")
    try {
      const res = await fetch(`${API_BASE}/api/time/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task_id: taskId })
      })
      if (!res.ok) throw new Error("Failed to start timer")
      const data = await res.json()
      setActiveEntryId(data.id)
      await fetchEntries()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function stopTimer(entryId) {
    setLoading(true)
    setError("")
    try {
      const res = await fetch(`${API_BASE}/api/time/stop`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entry_id: entryId })
      })
      if (!res.ok) throw new Error("Failed to stop timer")
      setActiveEntryId(null)
      await fetchEntries()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  function totalSecondsForTask(taskId) {
    return entries
      .filter(e => e.task_id === taskId && e.duration_sec != null)
      .reduce((acc, e) => acc + (e.duration_sec || 0), 0)
  }

  function fmt(sec) {
    const h = Math.floor(sec / 3600)
    const m = Math.floor((sec % 3600) / 60)
    const s = sec % 60
    return `${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-3">
        <select value={selectedProject} onChange={e=>setSelectedProject(e.target.value)} className="flex-1 bg-slate-900/40 border border-blue-400/20 rounded-lg px-3 py-2 text-blue-100">
          <option value="">All Projects</option>
          {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <form onSubmit={handleCreateProject} className="flex gap-2">
          <input value={newProject} onChange={e=>setNewProject(e.target.value)} placeholder="New project name" className="bg-slate-900/40 border border-blue-400/20 rounded-lg px-3 py-2 text-blue-100" />
          <button disabled={loading} className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-2 rounded-lg flex items-center gap-2"><Plus className="w-4 h-4"/>Project</button>
        </form>
      </div>

      <div className="bg-slate-800/40 border border-blue-400/20 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-white font-medium">Tasks</h3>
          <form onSubmit={handleCreateTask} className="flex gap-2">
            <input value={newTask} onChange={e=>setNewTask(e.target.value)} placeholder="New task name" className="bg-slate-900/40 border border-blue-400/20 rounded-lg px-3 py-2 text-blue-100" />
            <button disabled={loading || !selectedProject} className="bg-emerald-600 disabled:opacity-50 hover:bg-emerald-500 text-white px-3 py-2 rounded-lg flex items-center gap-2"><Plus className="w-4 h-4"/>Task</button>
          </form>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          {filteredTasks.map(t => {
            const total = totalSecondsForTask(t.id)
            const running = entries.find(e => e.task_id === t.id && e.end_time == null)
            return (
              <div key={t.id} className="bg-slate-900/30 border border-blue-400/10 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">{t.name}</p>
                    <p className="text-blue-200/60 text-xs">Tracked: {fmt(total)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {!running ? (
                      <button onClick={()=>startTimer(t.id)} className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg flex items-center gap-1.5"><PlayCircle className="w-4 h-4"/>Start</button>
                    ) : (
                      <button onClick={()=>stopTimer(running.id)} className="bg-rose-600 hover:bg-rose-500 text-white px-3 py-1.5 rounded-lg flex items-center gap-1.5"><StopCircle className="w-4 h-4"/>Stop</button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="bg-slate-800/40 border border-blue-400/20 rounded-xl p-4">
        <h3 className="text-white font-medium mb-3">Recent Entries</h3>
        <div className="space-y-2">
          {entries.slice(0,10).map(e => (
            <div key={e.id} className="flex items-center justify-between bg-slate-900/30 border border-blue-400/10 rounded-lg p-2">
              <div className="text-blue-100 text-sm">Task <span className="text-white font-medium">{e.task_id.slice(-4)}</span></div>
              <div className="text-blue-200/70 text-xs">{e.duration_sec != null ? fmt(e.duration_sec) : 'running...'}</div>
            </div>
          ))}
        </div>
      </div>

      {error && <div className="text-rose-400 text-sm">{error}</div>}
    </div>
  )
}
