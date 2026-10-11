import { revalidatePath } from 'next/cache'

// This file is a Server Component by default (no "use client").
async function doThingOnServer(formData: FormData) {
	'use server'
	const payload = formData.get('payload')
	// ... perform your server work here (DB, etc.)
	// revalidatePath('/test')
}

export default function ExampleServerAction() {
	return (
		<form action={doThingOnServer} className="space-y-4">
			<input name="payload" className="border p-2" placeholder="Type something" />
			<button className="bg-blue-600 text-white px-3 py-2 rounded">
				Run server action
			</button>
		</form>
	)
}
