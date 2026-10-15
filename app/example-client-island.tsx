import ClientButton from '@/components/ClientButton'

export default function ExampleClientIsland() {
	// This file is a Server Component (no "use client")—that's fine.
	// We render a tiny client island where the handler is defined in the client.
	return (
		<div className="space-y-3">
			<p>This is a Server Component that renders a Client island button:</p>
			<ClientButton
				className="px-3 py-2 rounded bg-emerald-600 text-white"
				onClick={() => alert('Client handler executed')}
			>
				Click me (client)
			</ClientButton>
		</div>
	)
}
