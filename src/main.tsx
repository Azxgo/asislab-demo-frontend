import './index.css'
import App from './App.tsx'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import { AuthProvider } from './context/AuthContext.tsx'
import { HeadProvider } from 'react-head'
import { ThemeProvider } from './context/ThemeContext.tsx'

createRoot(document.getElementById('root')!).render(
  <ThemeProvider>
    <HeadProvider>
      <BrowserRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    </HeadProvider>
  </ThemeProvider>
)
