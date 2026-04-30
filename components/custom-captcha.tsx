"use client"

import { useState, useEffect, useCallback } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface CustomCaptchaProps {
  onSuccess: (answer: string) => void
  onReset?: () => void
}

interface CaptchaChallenge {
  question: string
  answer: number
  id: string
}

function generateChallenge(): CaptchaChallenge {
  const num1 = Math.floor(Math.random() * 10) + 1
  const num2 = Math.floor(Math.random() * 10) + 1
  const operators = ["+", "-", "*"]
  const operator = operators[Math.floor(Math.random() * operators.length)]

  let answer: number

  if (operator === "+") {
    answer = num1 + num2
  } else if (operator === "-") {
    answer = num1 - num2
  } else {
    answer = num1 * num2
  }

  return {
    question: `${num1} ${operator} ${num2} = ?`,
    answer,
    id: Math.random().toString(36),
  }
}

export function CustomCaptcha({ onSuccess, onReset }: CustomCaptchaProps) {
  const [challenge, setChallenge] = useState<CaptchaChallenge | null>(null)
  const [userAnswer, setUserAnswer] = useState("")
  const [isVerified, setIsVerified] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setChallenge(generateChallenge())
  }, [])

  const handleVerify = useCallback(() => {
    if (!challenge) return

    setError(null)

    const userNum = parseInt(userAnswer, 10)
    if (isNaN(userNum)) {
      setError("Please enter a valid number")
      return
    }

    if (userNum === challenge.answer) {
      setIsVerified(true)
      onSuccess(challenge.id)
    } else {
      setError("Incorrect answer. Please try again.")
      setUserAnswer("")
    }
  }, [challenge, userAnswer, onSuccess])

  const handleReset = useCallback(() => {
    setChallenge(generateChallenge())
    setUserAnswer("")
    setIsVerified(false)
    setError(null)
    onReset?.()
  }, [onReset])

  if (!challenge) return null

  if (isVerified) {
    return (
      <div className="w-full p-4 rounded-lg bg-green-50 border border-green-200 flex items-center justify-between">
        <span className="text-green-700 font-medium">✓ CAPTCHA verified</span>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleReset}
          className="text-green-600 hover:text-green-700"
        >
          Reset
        </Button>
      </div>
    )
  }

  return (
    <div className="w-full space-y-3 p-4 rounded-lg border border-gray-300 bg-gray-50">
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">
          Verify you&apos;re human: Solve the math problem
        </label>
        <div className="text-lg font-mono font-bold text-gray-900 bg-white p-3 rounded border border-gray-300">
          {challenge.question}
        </div>
      </div>

      <div className="flex gap-2">
        <Input
          type="number"
          placeholder="Enter your answer"
          value={userAnswer}
          onChange={(e) => {
            setUserAnswer(e.target.value)
            setError(null)
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleVerify()
            }
          }}
          className="flex-1"
          disabled={isVerified}
        />
        <Button
          type="button"
          onClick={handleVerify}
          disabled={!userAnswer || isVerified}
          className="px-4"
        >
          Verify
        </Button>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  )
}
