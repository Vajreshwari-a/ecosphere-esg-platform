import { NavLink } from 'react-router-dom'

const links = [
  { to: '/', label: 'Environmental' },
  { to: '/social', label: 'Social' },
  { to: '/governance', label: 'Governance' },
  { to: '/gamification', label: 'Gamification' },
  { to: '/reports', label: 'Reports' },
  { to: '/settings', label: 'Settings' },
]

export default function Sidebar() {
  return (
    <nav className="w-56 min-h-screen bg-gray-900 text-white p-4">
      <h2 className="text-lg font-bold mb-6">EcoSphere</h2>
      <ul className="space-y-2">
        {links.map((link) => (
          <li key={link.to}>
            <NavLink
              to={link.to}
              className={({ isActive }) =>
                `block px-3 py-2 rounded ${isActive ? 'bg-green-600' : 'hover:bg-gray-700'}`
              }
            >
              {link.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}