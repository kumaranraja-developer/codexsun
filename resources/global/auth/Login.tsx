import React from "react"
import { LoginForm } from "../../../resources/UIBlocks/auth/login-form"

export default function Login() {
  return (
    <div className="bg-card-background text-card-foreground flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <LoginForm />
      </div>
    </div>
  )
}
