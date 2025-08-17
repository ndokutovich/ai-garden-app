import { useEffect, useState } from 'react'
import { db, type Bed } from '../db'

export function BedsPage() {
	const [beds, setBeds] = useState<Bed[]>([])
	const [name, setName] = useState('')
	const [area, setArea] = useState<string>('')
	const [notes, setNotes] = useState('')

	async function refresh() {
		const list = await db.beds.orderBy('name').toArray()
		setBeds(list)
	}

	useEffect(() => {
		refresh()
	}, [])

	async function addBed(e: React.FormEvent) {
		e.preventDefault()
		if (!name.trim()) return
		await db.beds.add({ name: name.trim(), areaSqM: area ? Number(area) : undefined, notes: notes || undefined })
		setName('')
		setArea('')
		setNotes('')
		refresh()
	}

	async function remove(id?: number) {
		if (!id) return
		await db.beds.delete(id)
		refresh()
	}

	return (
		<div className="grid gap-6">
			<section className="card p-4">
				<h2 className="mb-2 text-lg font-semibold">Новая грядка</h2>
				<form onSubmit={addBed} className="grid gap-3 sm:grid-cols-3">
					<div>
						<label className="label">Название</label>
						<input className="input" value={name} onChange={e => setName(e.target.value)} placeholder="Напр. Теплица-1" />
					</div>
					<div>
						<label className="label">Площадь, м²</label>
						<input className="input" value={area} onChange={e => setArea(e.target.value)} type="number" min={0} step={0.1} />
					</div>
					<div className="sm:col-span-3">
						<label className="label">Заметки</label>
						<textarea className="input" value={notes} onChange={e => setNotes(e.target.value)} rows={2} />
					</div>
					<div className="sm:col-span-3">
						<button className="btn" type="submit">Добавить</button>
					</div>
				</form>
			</section>

			<section className="card p-4">
				<h2 className="mb-2 text-lg font-semibold">Список грядок</h2>
				{beds.length === 0 ? (
					<p className="text-sm text-neutral-600">Пока нет грядок</p>
				) : (
					<ul className="divide-y">
						{beds.map(b => (
							<li key={b.id} className="flex items-center justify-between gap-4 py-3">
								<div>
									<div className="font-medium">{b.name}</div>
									<div className="text-xs text-neutral-600">{b.areaSqM ? `${b.areaSqM} м²` : 'Площадь не указана'}</div>
									{b.notes && <div className="text-xs text-neutral-600">{b.notes}</div>}
								</div>
								<button className="btn" onClick={() => remove(b.id)}>Удалить</button>
							</li>
						))}
					</ul>
				)}
			</section>
		</div>
	)
}