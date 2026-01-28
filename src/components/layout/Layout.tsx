// Placeholder - Layout component
// This component will provide the common layout for authenticated pages

import { Outlet } from 'react-router-dom'

export default function Layout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-900">API Docs Platform</h1>
          <nav className="flex gap-4">
            <a href="/" className="text-gray-700 hover:text-gray-900">Dashboard</a>
            <a href="/projects/new" className="text-gray-700 hover:text-gray-900">New Project</a>
          </nav>
        </div>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  )
}
