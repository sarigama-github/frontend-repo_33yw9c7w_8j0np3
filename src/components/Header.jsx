import { Clock, FolderKanban, Hammer } from "lucide-react"

export default function Header() {
  return (
    <div className="flex items-center justify-between mb-8">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-400/20 flex items-center justify-center">
          <Hammer className="w-6 h-6 text-blue-400" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-white">ConstructTrack</h1>
          <p className="text-blue-200/70 text-sm">SaaS platform for construction task time tracking</p>
        </div>
      </div>
      <div className="hidden sm:flex items-center gap-3 text-blue-200/70">
        <Clock className="w-4 h-4" />
        <span className="text-sm">Log hours with precision</span>
        <FolderKanban className="w-4 h-4 ml-4" />
        <span className="text-sm">Organize by projects & tasks</span>
      </div>
    </div>
  )
}
