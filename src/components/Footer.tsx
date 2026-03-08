export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white py-8">
      <div className="mx-auto max-w-7xl px-6 text-center text-sm text-slate-600">
        © {new Date().getFullYear()} Coordenada Geo. Plataforma de gestão geoespacial.
      </div>
    </footer>
  )
}
