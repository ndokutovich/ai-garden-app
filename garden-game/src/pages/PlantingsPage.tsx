import { useEffect, useMemo, useState } from 'react'
import { db, type Planting, type Seed, type Bed } from '../db'

export function PlantingsPage() {
	const [beds, setBeds] = useState<Bed[]>([])
	const [seeds, setSeeds] = useState<Seed[]>([])
	const [plantings, setPlantings] = useState<Planting[]>([])

	const [form, setForm] = useState<Planting>({ bedId: 0, seedId: 0, plantedAt: new Date().toISOString().slice(0,10), count: undefined, notes: '' })

	const bedMap = useMemo(() => new Map(beds.map(b => [b.id!, b.name])), [beds])
	const seedMap = useMemo(() => new Map(seeds.map(s => [s.id!, `${s.cropName}${s.variety ? ' — ' + s.variety : ''}`])), [seeds])

	async function refresh() {
		const [bs, ss, ps] = await Promise.all([
			db.beds.orderBy('name').toArray(),
			db.seeds.orderBy('cropName').toArray(),
			db.plantings.orderBy('plantedAt').reverse().toArray(),
		])
		setBeds(bs)
		setSeeds(ss)
		setPlantings(ps)
		if (bs[0] && ss[0]) setForm(f => ({ ...f, bedId: bs[0].id!, seedId: ss[0].id! }))
	}
	useEffect(() => { refresh() }, [])

	function update<K extends keyof Planting>(key: K, value: Planting[K]) {
		setForm(prev => ({ ...prev, [key]: value }))
	}

	async function add(e: React.FormEvent) {
		e.preventDefault()
		if (!form.bedId || !form.seedId || !form.plantedAt) return
		await db.plantings.add({
			bedId: form.bedId,
			seedId: form.seedId,
			plantedAt: form.plantedAt,
			count: form.count,
			notes: form.notes || undefined,
		})
		setForm(f => ({ ...f, count: undefined, notes: '' }))
		refresh()
	}

	async function remove(id?: number) {
		if (!id) return
		await db.plantings.delete(id)
		refresh()
	}

	return (
		<div className="grid gap-6">
			<section className="card p-4">
				<h2 className="mb-2 text-lg font-semibold">Новая посадка</h2>
				<form onSubmit={add} className="grid gap-3 sm:grid-cols-5">
					<div>
						<label className="label">Грядка</label>
						<select className="input" value={form.bedId} onChange={e => update('bedId', Number(e.target.value))}>
							{beds.map(b => (
								<option key={b.id} value={b.id}>{b.name}</option>
							))}
						</select>
					</div>
					<div className="sm:col-span-2">
						<label className="label">Семена</label>
						<select className="input" value={form.seedId} onChange={e => update('seedId', Number(e.target.value))}>
							{seeds.map(s => (
								<option key={s.id} value={s.id}>{seedMap.get(s.id!)}</option>
							))}
						</select>
					</div>
					<div>
						<label className="label">Дата</label>
						<input type="date" className="input" value={form.plantedAt} onChange={e => update('plantedAt', e.target.value)} />
					</div>
					<div>
						<label className="label">Количество</label>
						<input type="number" min={0} className="input" value={form.count ?? ''} onChange={e => update('count', e.target.value ? Number(e.target.value) : undefined)} />
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
				<h2 className="mb-2 text-lg font-semibold">Посадки</h2>
				{plantings.length === 0 ? (
					<p className="text-sm text-neutral-600">Нет данных</p>
				) : (
					<ul className="divide-y">
						{plantings.map(p => (
							<li key={p.id} className="flex items-center justify-between gap-4 py-3">
								<div className="text-sm">
									<div className="font-medium">{seedMap.get(p.seedId)} на грядке {bedMap.get(p.bedId)}</div>
									<div className="text-neutral-600">{p.plantedAt}{p.count ? ` • ${p.count} шт.` : ''}</div>
									{p.notes && <div className="text-neutral-600">{p.notes}</div>}
								</div>
								<button className="btn" onClick={() => remove(p.id)}>Удалить</button>
							</li>
						))}
					</ul>
				)}
			</section>
		</div>
	)
}