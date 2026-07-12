import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Environmental from './pages/Environmental'
import Social from './pages/Social'
import Governance from './pages/Governance'
import Gamification from './pages/Gamification'
import Reports from './pages/Reports'
import Settings from './pages/Settings'

function App() {
  return (
    <BrowserRouter>
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <Routes>
            <Route path="/" element={<Environmental />} />
            <Route path="/social" element={<Social />} />
            <Route path="/governance" element={<Governance />} />
            <Route path="/gamification" element={<Gamification />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

export default App