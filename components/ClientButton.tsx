// 'use client'
'use client'

import * as React from 'react'

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
	asChild?: boolean
}

/**
 * ClientButton:
 * Use inside Server Components when you need a small client island.
 * DO NOT pass server functions as onClick. Define the handler here or call a server action via <form action={...}>.
 */
export default function ClientButton({ children, ...rest }: Props) {
	return (
		<button {...rest}>
			{children}
		</button>
	)
}
