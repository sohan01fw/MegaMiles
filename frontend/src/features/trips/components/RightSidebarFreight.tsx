export function RightSidebarFreight() {
  return (
    <aside className="hidden xl:block w-[320px] bg-[#fcfcfc] border-l border-slate-100/60 p-6 overflow-y-auto z-10">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-slate-800 tracking-tight">Active Freight</h3>
        <button className="text-[11px] uppercase tracking-wider font-semibold text-slate-500 border border-slate-200 rounded-lg px-2 py-1 shadow-sm bg-white hover:bg-slate-50 transition-colors">Explore</button>
      </div>
      
      <div className="space-y-4 mb-8">
        <div className="group rounded-2xl overflow-hidden cursor-pointer relative shadow-sm border border-transparent hover:border-slate-200 transition-colors">
          <img src="https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?q=80&w=600&auto=format&fit=crop" alt="Freight" className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-500" />
          <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent"></div>
          <div className="absolute bottom-3 left-3 right-3 text-white">
            <p className="text-[13px] font-semibold">I-80 Midwest Route</p>
            <p className="text-[10px] text-white/80 mt-0.5">High demand, clearing snow.</p>
          </div>
        </div>
        <div className="group rounded-2xl overflow-hidden cursor-pointer relative shadow-sm border border-transparent hover:border-slate-200 transition-colors">
          <img src="https://images.unsplash.com/photo-1519003722824-194d4455a60c?q=80&w=600&auto=format&fit=crop" alt="Freight" className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-500" />
          <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent"></div>
          <div className="absolute bottom-3 left-3 right-3 text-white">
            <p className="text-[13px] font-semibold">Pacific Coast Hwy</p>
            <p className="text-[10px] text-white/80 mt-0.5">Clear weather, standard weight.</p>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-slate-800 tracking-tight">Driver Resources</h3>
        <button className="text-[11px] uppercase tracking-wider font-semibold text-slate-500 border border-slate-200 rounded-lg px-2 py-1 shadow-sm bg-white hover:bg-slate-50 transition-colors">Explore</button>
      </div>

      <div className="space-y-4">
        <div className="group bg-white border border-slate-200 rounded-2xl overflow-hidden cursor-pointer shadow-sm hover:shadow-md transition-shadow">
          <img src="https://images.unsplash.com/photo-1584143431327-77887e07ebbf?q=80&w=600&auto=format&fit=crop" alt="Rest Area" className="w-full h-28 object-cover" />
          <div className="p-3">
            <p className="text-[13px] font-semibold text-slate-800 leading-tight">Best resting spots in Texas</p>
            <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">A list of the top locations for heavy sleepers with great amenities.</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
