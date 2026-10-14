import { redirect } from 'next/navigation'

export default function TestOAuthPage() {
  redirect('/auth/sign-in')
}
