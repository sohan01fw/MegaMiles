import { Compass, Settings } from "lucide-react"

export function SidebarPrimary() {
  return (
    <aside className="w-[72px] bg-white border-r border-slate-200 flex flex-col items-center py-6 shrink-0 z-20 shadow-[4px_0_24px_-12px_rgba(0,0,0,0.05)]">
      {/* Brand Logo */}
      <div className="mb-8 cursor-pointer hover:opacity-80 transition-opacity">
        <img src="/favicon.svg" alt="Logo" className="h-10 w-10 p-0.5" />
      </div>

      {/* Nav Icons */}
      <div className="flex flex-col gap-6 w-full items-center">
        <button className="h-10 w-10 flex items-center justify-center rounded-xl bg-purple-100/50 text-purple-600 transition-colors">
          <Compass className="h-5 w-5" />
        </button>
      </div>

      {/* Bottom Avatar / Settings */}
      <div className="mt-auto flex flex-col gap-4 items-center">
        <button className="h-10 w-10 flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors">
          <Settings className="h-5 w-5" />
        </button>
        <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-xs ring-2 ring-white shadow-sm">
          TX
        </div>
      </div>
    </aside>
  )
}
