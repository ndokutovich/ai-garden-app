import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom'
import './index.css'
import { BedsPage } from './pages/BedsPage'
import { SeedsPage } from './pages/SeedsPage'
import { PlantingsPage } from './pages/PlantingsPage'
import { TreatmentsPage } from './pages/TreatmentsPage'
import { HarvestsPage } from './pages/HarvestsPage'
import { CalendarPage } from './pages/CalendarPage'

function App() {
	return (
		<BrowserRouter>
			<div className="app-bg">
				<header className="border-b bg-white">
					<div className="container flex items-center gap-4 py-3">
						<div className="text-lg font-semibold">Грядки: игра-учёт</div>
						<nav className="flex flex-wrap gap-2 text-sm">
							<NavLink to="/" end className={({ isActive }) => `px-2 py-1 rounded ${isActive ? 'bg-green-100 text-green-800' : 'text-neutral-700 hover:text-neutral-900'}`}>Грядки</NavLink>
							<NavLink to="/seeds" className={({ isActive }) => `px-2 py-1 rounded ${isActive ? 'bg-green-100 text-green-800' : 'text-neutral-700 hover:text-neutral-900'}`}>Семена</NavLink>
							<NavLink to="/plantings" className={({ isActive }) => `px-2 py-1 rounded ${isActive ? 'bg-green-100 text-green-800' : 'text-neutral-700 hover:text-neutral-900'}`}>Посадки</NavLink>
							<NavLink to="/treatments" className={({ isActive }) => `px-2 py-1 rounded ${isActive ? 'bg-green-100 text-green-800' : 'text-neutral-700 hover:text-neutral-900'}`}>Обработки</NavLink>
							<NavLink to="/harvests" className={({ isActive }) => `px-2 py-1 rounded ${isActive ? 'bg-green-100 text-green-800' : 'text-neutral-700 hover:text-neutral-900'}`}>Урожай</NavLink>
							<NavLink to="/calendar" className={({ isActive }) => `px-2 py-1 rounded ${isActive ? 'bg-green-100 text-green-800' : 'text-neutral-700 hover:text-neutral-900'}`}>Календарь</NavLink>
						</nav>
					</div>
				</header>
				<main className="container py-6">
					<Routes>
						<Route path="/" element={<BedsPage />} />
						<Route path="/seeds" element={<SeedsPage />} />
						<Route path="/plantings" element={<PlantingsPage />} />
						<Route path="/treatments" element={<TreatmentsPage />} />
						<Route path="/harvests" element={<HarvestsPage />} />
						<Route path="/calendar" element={<CalendarPage />} />
					</Routes>
				</main>
			</div>
		</BrowserRouter>
	)
}

export default App
