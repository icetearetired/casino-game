import { SignUpForm } from "@/components/sign-up-form"
import { getTurnstileSiteKey } from "@/lib/turnstile"

export default function SignUpPage() {
  const siteKey = getTurnstileSiteKey()
  return <SignUpForm turnstileSiteKey={siteKey} />
}
