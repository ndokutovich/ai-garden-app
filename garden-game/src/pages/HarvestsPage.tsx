import { useEffect, useMemo, useState } from 'react'
import { db, type Harvest, type Planting, type Seed } from '../db'

export function HarvestsPage() {
	const [plantings, setPlantings] = useState<Planting[]>([])
	const [seeds, setSeeds] = useState<Seed[]>([])
	const [harvests, setHarvests] = useState<Harvest[]>([])

	const seedMap = useMemo(() => new Map(seeds.map(s => [s.id!, `${s.cropName}${s.variety ? ' — ' + s.variety : ''}`])), [seeds])
	const plantingLabel = (p: Planting) => `${seedMap.get(p.seedId)} • ${p.plantedAt}`

	const [form, setForm] = useState<Harvest>({ harvestedAt: new Date().toISOString().slice(0,10), amount: undefined, unit: 'кг', notes: '' })
	const [plantingId, setPlantingId] = useState<number>(0)

	async function refresh() {
		const [ps, ss, hs] = await Promise.all([
			db.plantings.orderBy('plantedAt').reverse().toArray(),
			db.seeds.orderBy('cropName').toArray(),
			db.harvests.orderBy('harvestedAt').reverse().toArray(),
		])
		setPlantings(ps); setSeeds(ss); setHarvests(hs)
		if (ps[0]) setPlantingId(ps[0].id!)
	}
	useEffect(() => { refresh() }, [])

	function update<K extends keyof Harvest>(key: K, value: Harvest[K]) {
		setForm(prev => ({ ...prev, [key]: value }))
	}

	async function add(e: React.FormEvent) {
		e.preventDefault()
		if (!plantingId || !form.harvestedAt) return
		await db.harvests.add({
			plantingId,
			harvestedAt: form.harvestedAt,
			amount: form.amount,
			unit: form.unit,
			notes: form.notes || undefined,
		})
		setForm({ harvestedAt: new Date().toISOString().slice(0,10), amount: undefined, unit: 'кг', notes: '' })
		refresh()
	}

	async function remove(id?: number) {
		if (!id) return
		await db.harvests.delete(id)
		refresh()
	}

	return (
		<div className="grid gap-6">
			<section className="card p-4">
				<h2 className="mb-2 text-lg font-semibold">Новый сбор урожая</h2>
				<form onSubmit={add} className="grid gap-3 sm:grid-cols-5">
					<div className="sm:col-span-2">
						<label className="label">Посадка</label>
						<select className="input" value={plantingId} onChange={e => setPlantingId(Number(e.target.value))}>
							{plantings.map(p => <option key={p.id} value={p.id}>{plantingLabel(p)}</option>)}
						</select>
					</div>
					<div>
						<label className="label">Дата</label>
						<input type="date" className="input" value={form.harvestedAt} onChange={e => update('harvestedAt', e.target.value)} />
					</div>
					<div>
						<label className="label">Кол-во</label>
						<input type="number" min={0} step={0.01} className="input" value={form.amount ?? ''} onChange={e => update('amount', e.target.value ? Number(e.target.value) : undefined)} />
					</div>
					<div>
						<label className="label">Ед.</label>
						<input className="input" value={form.unit || ''} onChange={e => update('unit', e.target.value)} />
					</div>
					<div className="sm:col-span-5">
						<label className="label">Заметки</label>
						<textarea className="input" rows={2} value={form.notes || ''} onChange={e => update('notes', e.target.value)} />
					</div>
					<div className="sm:col-span-5">
						<button className="btn" type="submit">Добавить</button>
					</div>
				</form>
			</section>

			<section className="card p-4">
				<h2 className="mb-2 text-lg font-semibold">Урожай</h2>
				{harvests.length === 0 ? (
					<p className="text-sm text-neutral-600">Пока нет</p>
				) : (
					<ul className="divide-y">
						{harvests.map(h => (
							<li key={h.id} className="flex items-center justify-between gap-4 py-3">
								<div className="text-sm">
									<div className="font-medium">{h.harvestedAt} — {h.amount ?? '—'} {h.unit ?? ''}</div>
									{h.notes && <div className="text-neutral-600">{h.notes}</div>}
								</div>
								<button className="btn" onClick={() => remove(h.id)}>Удалить</button>
							</li>
						))}
					</ul>
				)}
			</section>
		</div>
	)
}