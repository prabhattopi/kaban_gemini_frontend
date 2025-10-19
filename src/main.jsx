import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'

import App from './App.jsx'
import ProjectsPage from './pages/ProjectsPage.jsx'
import ProjectBoardPage from './pages/ProjectBoardPage.jsx'
import './index.css'

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <ProjectsPage /> },
      { path: 'project/:projectId', element: <ProjectBoardPage /> },
    ]
  }
])

// v5 defaults: gcTime replaces cacheTime
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      refetchOnMount: false,
      retry: 1,
      staleTime: 60_000, // 1 minute
      gcTime: 5 * 60_000 // 5 minutes
    }
  }
})

ReactDOM.createRoot(document.getElementById('root')).render(

  <QueryClientProvider client={queryClient}>
    <RouterProvider router={router} />
    <Toaster richColors position="top-right" />
  </QueryClientProvider>

)