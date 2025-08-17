import { useEffect, useState } from 'react'
import { db, type Seed } from '../db'

export function SeedsPage() {
	const [seeds, setSeeds] = useState<Seed[]>([])
	const [form, setForm] = useState<Seed>({ cropName: '', variety: '', vendor: '', lot: '', sowBy: '', notes: '' })

	async function refresh() {
		const list = await db.seeds.orderBy('cropName').toArray()
		setSeeds(list)
	}
	useEffect(() => { refresh() }, [])

	function update<K extends keyof Seed>(key: K, value: Seed[K]) {
		setForm(prev => ({ ...prev, [key]: value }))
	}

	async function add(e: React.FormEvent) {
		e.preventDefault()
		if (!form.cropName?.trim()) return
		await db.seeds.add({
			cropName: form.cropName.trim(),
			variety: form.variety || undefined,
			vendor: form.vendor || undefined,
			lot: form.lot || undefined,
			sowBy: form.sowBy || undefined,
			notes: form.notes || undefined,
		})
		setForm({ cropName: '', variety: '', vendor: '', lot: '', sowBy: '', notes: '' })
		refresh()
	}

	async function remove(id?: number) {
		if (!id) return
		await db.seeds.delete(id)
		refresh()
	}

	return (
		<div className="grid gap-6">
			<section className="card p-4">
				<h2 className="mb-2 text-lg font-semibold">Добавить семена</h2>
				<form onSubmit={add} className="grid gap-3 sm:grid-cols-3">
					<div>
						<label className="label">Культура</label>
						<input className="input" value={form.cropName} onChange={e => update('cropName', e.target.value)} placeholder="Томат" />
					</div>
					<div>
						<label className="label">Сорт</label>
						<input className="input" value={form.variety || ''} onChange={e => update('variety', e.target.value)} placeholder="Черри" />
					</div>
					<div>
						<label className="label">Производитель</label>
						<input className="input" value={form.vendor || ''} onChange={e => update('vendor', e.target.value)} placeholder="Гавриш" />
					</div>
					<div>
						<label className="label">Партия</label>
						<input className="input" value={form.lot || ''} onChange={e => update('lot', e.target.value)} />
					</div>
					<div>
						<label className="label">Исп. до</label>
						<input type="date" className="input" value={form.sowBy || ''} onChange={e => update('sowBy', e.target.value)} />
					</div>
					<div className="sm:col-span-3">
						<label className="label">Заметки</label>
						<textarea className="input" rows={2} value={form.notes || ''} onChange={e => update('notes', e.target.value)} />
					</div>
					<div className="sm:col-span-3">
						<button className="btn" type="submit">Сохранить</button>
					</div>
				</form>
			</section>

			<section className="card p-4">
				<h2 className="mb-2 text-lg font-semibold">База семян</h2>
				{seeds.length === 0 ? (
					<p className="text-sm text-neutral-600">Пока пусто</p>
				) : (
					<div className="overflow-x-auto">
						<table className="w-full text-left text-sm">
							<thead>
								<tr className="border-b text-neutral-600">
									<th className="py-2 pr-3">Культура</th>
									<th className="py-2 pr-3">Сорт</th>
									<th className="py-2 pr-3">Производитель</th>
									<th className="py-2 pr-3">Исп. до</th>
									<th className="py-2 pr-3"></th>
								</tr>
							</thead>
							<tbody>
								{seeds.map(s => (
									<tr key={s.id} className="border-b">
										<td className="py-2 pr-3 font-medium">{s.cropName}</td>
										<td className="py-2 pr-3">{s.variety}</td>
										<td className="py-2 pr-3">{s.vendor}</td>
										<td className="py-2 pr-3">{s.sowBy || '—'}</td>
										<td className="py-2 pr-3 text-right">
											<button className="btn" onClick={() => remove(s.id)}>Удалить</button>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				)}
			</section>
		</div>
	)
}