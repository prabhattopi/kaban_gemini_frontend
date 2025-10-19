import { Outlet, Link } from 'react-router-dom'
import Layout from './components/Layout.jsx'

export default function App() {
  return (
    <Layout>
      <header className="border-b bg-white">
        <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
          <Link to="/" className="text-xl font-bold text-blue-600">
             Kanban + Gemini AI
          </Link>
          <nav className="text-sm text-gray-600">
            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer" 
              className="hover:underline" 
            >
              GitHub 
            </a>
          </nav>
        </div> 
      </header> 
      <main className="mx-auto max-w-6xl px-4 py-6">
        <Outlet />
      </main>
    </Layout>
  )
}