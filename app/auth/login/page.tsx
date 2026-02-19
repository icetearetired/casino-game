import { LoginForm } from "@/components/login-form"
import { getTurnstileSiteKey } from "@/lib/turnstile"

export default function LoginPage() {
  const siteKey = getTurnstileSiteKey()
  return <LoginForm turnstileSiteKey={siteKey} />
}
