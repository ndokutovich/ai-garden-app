import { useEffect, useMemo, useState } from 'react'
import { db, type Treatment, type Planting, type Bed, type Seed } from '../db'

export function TreatmentsPage() {
	const [beds, setBeds] = useState<Bed[]>([])
	const [plantings, setPlantings] = useState<Planting[]>([])
	const [seeds, setSeeds] = useState<Seed[]>([])
	const [treatments, setTreatments] = useState<Treatment[]>([])

	const seedMap = useMemo(() => new Map(seeds.map(s => [s.id!, `${s.cropName}${s.variety ? ' — ' + s.variety : ''}`])), [seeds])
	const plantingLabel = (p: Planting) => `${seedMap.get(p.seedId)} • ${p.plantedAt}`

	const [form, setForm] = useState<Treatment>({ type: '', performedAt: new Date().toISOString().slice(0,10), notes: '' })
	const [scope, setScope] = useState<'bed' | 'planting'>('bed')
	const [bedId, setBedId] = useState<number>(0)
	const [plantingId, setPlantingId] = useState<number>(0)

	async function refresh() {
		const [bs, ps, ss, ts] = await Promise.all([
			db.beds.orderBy('name').toArray(),
			db.plantings.orderBy('plantedAt').reverse().toArray(),
			db.seeds.orderBy('cropName').toArray(),
			db.treatments.orderBy('performedAt').reverse().toArray(),
		])
		setBeds(bs); setPlantings(ps); setSeeds(ss); setTreatments(ts)
		if (bs[0]) setBedId(bs[0].id!)
		if (ps[0]) setPlantingId(ps[0].id!)
	}
	useEffect(() => { refresh() }, [])

	function update<K extends keyof Treatment>(key: K, value: Treatment[K]) {
		setForm(prev => ({ ...prev, [key]: value }))
	}

	async function add(e: React.FormEvent) {
		e.preventDefault()
		if (!form.type || !form.performedAt) return
		await db.treatments.add({
			type: form.type,
			performedAt: form.performedAt,
			notes: form.notes || undefined,
			bedId: scope === 'bed' ? bedId : undefined,
			plantingId: scope === 'planting' ? plantingId : undefined,
		})
		setForm({ type: '', performedAt: new Date().toISOString().slice(0,10), notes: '' })
		refresh()
	}

	async function remove(id?: number) {
		if (!id) return
		await db.treatments.delete(id)
		refresh()
	}

	return (
		<div className="grid gap-6">
			<section className="card p-4">
				<h2 className="mb-2 text-lg font-semibold">Новая обработка</h2>
				<form onSubmit={add} className="grid gap-3 sm:grid-cols-5">
					<div>
						<label className="label">Тип</label>
						<input className="input" value={form.type} onChange={e => update('type', e.target.value)} placeholder="Полив / Подкормка / Опрыскивание" />
					</div>
					<div>
						<label className="label">Дата</label>
						<input type="date" className="input" value={form.performedAt} onChange={e => update('performedAt', e.target.value)} />
					</div>
					<div>
						<label className="label">Область</label>
						<select className="input" value={scope} onChange={e => setScope(e.target.value as any)}>
							<option value="bed">Грядка</option>
							<option value="planting">Посадка</option>
						</select>
					</div>
					{scope === 'bed' ? (
						<div className="sm:col-span-2">
							<label className="label">Грядка</label>
							<select className="input" value={bedId} onChange={e => setBedId(Number(e.target.value))}>
								{beds.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
							</select>
						</div>
					) : (
						<div className="sm:col-span-2">
							<label className="label">Посадка</label>
							<select className="input" value={plantingId} onChange={e => setPlantingId(Number(e.target.value))}>
								{plantings.map(p => <option key={p.id} value={p.id}>{plantingLabel(p)}</option>)}
							</select>
						</div>
					)}
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
				<h2 className="mb-2 text-lg font-semibold">Обработки</h2>
				{treatments.length === 0 ? (
					<p className="text-sm text-neutral-600">Пока нет</p>
				) : (
					<ul className="divide-y">
						{treatments.map(t => (
							<li key={t.id} className="flex items-center justify-between gap-4 py-3">
								<div className="text-sm">
									<div className="font-medium">{t.type} — {t.performedAt}</div>
									<div className="text-neutral-600">{t.plantingId ? `Посадка #${t.plantingId}` : t.bedId ? `Грядка #${t.bedId}` : ''}</div>
									{t.notes && <div className="text-neutral-600">{t.notes}</div>}
								</div>
								<button className="btn" onClick={() => db.treatments.delete(t.id! ).then(refresh)}>Удалить</button>
							</li>
						))}
					</ul>
				)}
			</section>
		</div>
	)
}