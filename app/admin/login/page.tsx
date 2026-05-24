import { Suspense } from 'react'
import { AdminLoginForm } from './admin-login-form'

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <AdminLoginForm />
    </Suspense>
  )
}

function LoadingFallback() {
  return <div className="min-h-screen bg-[#050505]" />
}
