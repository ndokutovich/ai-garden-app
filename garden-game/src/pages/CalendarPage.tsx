import { Calendar, dateFnsLocalizer } from 'react-big-calendar'
import { format, parse, startOfWeek, getDay } from 'date-fns'
import { ru } from 'date-fns/locale'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import { useEffect, useMemo, useState } from 'react'
import { db, type Planting, type Treatment, type Harvest, type Seed, type Bed } from '../db'
import { createEvents } from 'ics'

const locales: Record<string, Locale> = {
	'ru': ru as any,
}

const localizer = dateFnsLocalizer({
	format,
	parse,
	startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
	getDay,
	locales,
})

export function CalendarPage() {
	const [beds, setBeds] = useState<Bed[]>([])
	const [seeds, setSeeds] = useState<Seed[]>([])
	const [plantings, setPlantings] = useState<Planting[]>([])
	const [treatments, setTreatments] = useState<Treatment[]>([])
	const [harvests, setHarvests] = useState<Harvest[]>([])

	useEffect(() => {
		Promise.all([
			db.beds.toArray(),
			db.seeds.toArray(),
			db.plantings.toArray(),
			db.treatments.toArray(),
			db.harvests.toArray(),
		]).then(([bs, ss, ps, ts, hs]) => {
			setBeds(bs); setSeeds(ss); setPlantings(ps); setTreatments(ts); setHarvests(hs)
		})
	}, [])

	const bedMap = useMemo(() => new Map(beds.map(b => [b.id!, b.name])), [beds])
	const seedMap = useMemo(() => new Map(seeds.map(s => [s.id!, `${s.cropName}${s.variety ? ' — ' + s.variety : ''}`])), [seeds])

	const events = useMemo(() => {
		const toDate = (iso: string) => {
			const d = new Date(iso)
			return new Date(d.getFullYear(), d.getMonth(), d.getDate())
		}
		return [
			...plantings.map(p => ({
				title: `Посадка: ${seedMap.get(p.seedId)} • ${bedMap.get(p.bedId)}`,
				start: toDate(p.plantedAt),
				end: toDate(p.plantedAt),
				allDay: true,
				resource: { type: 'planting', id: p.id },
			})),
			...treatments.map(t => ({
				title: `Обработка: ${t.type}`,
				start: toDate(t.performedAt),
				end: toDate(t.performedAt),
				allDay: true,
				resource: { type: 'treatment', id: t.id },
			})),
			...harvests.map(h => ({
				title: `Урожай: ${h.amount ?? ''} ${h.unit ?? ''}`.trim(),
				start: toDate(h.harvestedAt),
				end: toDate(h.harvestedAt),
				allDay: true,
				resource: { type: 'harvest', id: h.id },
			})),
		]
	}, [plantings, treatments, harvests, seedMap, bedMap])

	function exportIcs() {
		const toArray = (d: Date) => [d.getFullYear(), d.getMonth() + 1, d.getDate()] as [number, number, number]
		const icsEvents = (events as any[]).map(ev => ({
			title: ev.title,
			start: toArray(ev.start),
			end: toArray(ev.end),
			allDay: true,
		}))
		const { error, value } = createEvents(icsEvents)
		if (error || !value) return
		const blob = new Blob([value], { type: 'text/calendar;charset=utf-8' })
		const url = URL.createObjectURL(blob)
		const a = document.createElement('a')
		a.href = url
		a.download = 'garden-calendar.ics'
		a.click()
		URL.revokeObjectURL(url)
	}

	return (
		<div className="grid gap-3">
			<div className="flex justify-end">
				<button className="btn" onClick={exportIcs}>Экспорт .ics</button>
			</div>
			<div className="card p-2">
				<Calendar
					localizer={localizer}
					defaultView="month"
					popup
					style={{ height: 700 }}
					events={events as any}
				/>
			</div>
		</div>
	)
}