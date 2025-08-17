export function PageStub({ title }: { title: string }) {
	return (
		<div className="card p-4">
			<h2 className="text-lg font-semibold">{title}</h2>
			<p className="text-sm text-neutral-600">Страница в разработке</p>
		</div>
	)
}