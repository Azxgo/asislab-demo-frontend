import './App.css'
import { lazy } from 'react'
import { Route, Routes } from 'react-router-dom'
import { MainLayout } from './layouts/MainLayout'
import AccessDenied from './pages/errors/AccessDenied'
import { ProtectRoutesAdmin } from './components/protect/ProtectRoutesAdmin'
import { ProtectRoutesQuestionary } from './components/protect/ProtectRoutesQuestionary'
import StartGuest from './pages/auth/StartGuest'

const IndexPage = lazy(() => import('./pages/IndexPage'))
const QuestionaryPage = lazy(() => import('./pages/QuestionaryPage'))
const QuestionaryIndexPage = lazy(() => import('./pages/QuestionaryIndexPage'))
const QuestionaryAnalyticsPage = lazy(() => import('./pages/QuestionaryAnalyticsPage'))
const ShareQuestionary = lazy(() => import("./pages/QuestionaryShare"))
const AreaIndexPage = lazy(() => import('./pages/AreaIndexPage'))
const WorkersIndexPage = lazy(() => import("./pages/WorkersIndexPage"))
const NotFound = lazy(() => import('./pages/errors/NotFound'))


function App() {
  return (
    <div className='m-0 p-0 min-h-screen bg-white dark:bg-zinc-800'>
      <Routes>
        <Route element={<ProtectRoutesAdmin />}>
          <Route element={<MainLayout />}>
            <Route path="/" element={<IndexPage />} />
            <Route path="/questionary/" element={<QuestionaryIndexPage  />} />
            <Route path="/questionary/area/:id?" element={<QuestionaryIndexPage  />} />
            <Route path="/questionary/analytics/:id" element={<QuestionaryAnalyticsPage />} />
            <Route path="/area" element={<AreaIndexPage/>} />
            <Route path="/workers" element={<WorkersIndexPage />} />
            <Route path="/share/:id" element={<ShareQuestionary />} />
          </Route>
        </Route>

        <Route element={<ProtectRoutesQuestionary />}>
          <Route element={<MainLayout />}>
            <Route path="/questionary/view/:id" element={<QuestionaryPage />} />
          </Route>
        </Route>

        <Route path="/start" element={<StartGuest />} />
        <Route element={<MainLayout />}>
          <Route path="/access-denied" element={<AccessDenied />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </div>
  )
}

export default App
