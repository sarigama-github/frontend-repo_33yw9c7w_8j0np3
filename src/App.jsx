import Header from "./components/Header"
import ProjectTaskPanel from "./components/ProjectTaskPanel"

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,rgba(59,130,246,0.05),transparent_40%),radial-gradient(circle_at_100%_100%,rgba(16,185,129,0.06),transparent_40%)]" />
      <div className="relative max-w-5xl mx-auto p-6">
        <Header />
        <ProjectTaskPanel />
        <div className="mt-10 text-center text-blue-300/60 text-sm">Tip: set VITE_BACKEND_URL to your API for persistence</div>
      </div>
    </div>
  )
}

export default App
