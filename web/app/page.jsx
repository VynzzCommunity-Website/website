export default function Home() {
  return (
    <main className="min-h-screen text-white">

      {/* NAV */}
      <nav className="p-5 border-b border-gray-800 flex justify-between">
        <h1 className="text-xl font-bold">MyTools</h1>
      </nav>

      {/* HERO */}
      <section className="text-center py-20">
        <h2 className="text-4xl font-bold mb-4">Selamat Datang di MyTools</h2>
        <p className="text-gray-400 mb-7">
          Website tools sederhana — tampilan modern dan clean.
        </p>
        <a href="#tools" className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg">
          Lihat Tools
        </a>
      </section>

      {/* TOOLS */}
      <section id="tools" className="px-6 pb-20 grid grid-cols-1 md:grid-cols-3 gap-6">

        <ToolCard 
          title="Text Formatter"
          desc="Rapiin teks otomatis."
        />

        <ToolCard 
          title="URL Shortener"
          desc="Shortlink tanpa iklan dan aman."
        />

        <ToolCard 
          title="QR Code Generator"
          desc="Buat QR Code dari teks atau link."
        />

      </section>

      {/* FOOTER */}
      <footer className="text-center py-6 border-t border-gray-800 text-gray-500">
        © 2025 MyTools — Dibuat dengan Next.js & Tailwind
      </footer>
    </main>
  );
}

function ToolCard({ title, desc }) {
  return (
    <div className="bg-gray-900 p-5 rounded-xl border border-gray-800">
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-400 mb-4">{desc}</p>
      <button className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 text-sm">
        Gunakan
      </button>
    </div>
  );
}
