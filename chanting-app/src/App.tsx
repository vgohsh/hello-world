import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Layout } from './components/Layout'
import Home from './pages/Home'
import { NotFound } from './pages/NotFound'
import Reader from './pages/Reader'
import TextLayout from './pages/TextLayout'
import { useReminder } from './lib/reminder'

const ScriptTab = lazy(() => import('./pages/ScriptTab'))
const Memorize = lazy(() => import('./pages/Memorize'))
const Record = lazy(() => import('./pages/Record'))
const Alphabet = lazy(() => import('./pages/Alphabet'))
const Anatomy = lazy(() => import('./pages/Anatomy'))
const Review = lazy(() => import('./pages/Review'))
const Practice = lazy(() => import('./pages/Practice'))
const Mala = lazy(() => import('./pages/Mala'))
const Session = lazy(() => import('./pages/Session'))
const Tracker = lazy(() => import('./pages/Tracker'))
const SettingsPage = lazy(() => import('./pages/SettingsPage'))
const Align = lazy(() => import('./pages/Align'))

export default function App() {
  const { t } = useTranslation()
  useReminder()
  return (
    <Suspense fallback={<p className="p-6 text-muted">{t('common.loading')}</p>}>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="text/:id" element={<TextLayout />}>
            <Route index element={<Reader />} />
            <Route path="script" element={<ScriptTab />} />
            <Route path="memorize" element={<Memorize />} />
            <Route path="record" element={<Record />} />
          </Route>
          <Route path="learn/alphabet" element={<Alphabet />} />
          <Route path="learn/anatomy" element={<Anatomy />} />
          <Route path="review" element={<Review />} />
          <Route path="practice" element={<Practice />} />
          <Route path="practice/mala" element={<Mala />} />
          <Route path="practice/session" element={<Session />} />
          <Route path="practice/tracker" element={<Tracker />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="tools/align" element={<Align />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Suspense>
  )
}
