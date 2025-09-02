import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "../../../resources/components/chart/card"
import Button from "../../../resources/components/button/Button"
import apiClient from "../../global/api/apiClients";
import {cn} from "../../global/helpers/utils";
import PasswordInput from "../../../resources/components/input/password-input";
import FloatingInput from "../../../resources/components/input/floating-input";

export default function FrappeSignupForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const navigate = useNavigate()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [passwordConfirm, setPasswordConfirm] = useState("")
  const [error, setError] = useState("")

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (password !== passwordConfirm) {
      setError("Passwords do not match")
      return
    }

    try {
      await apiClient.get("/sanctum/csrf-cookie")

      await apiClient.post("/api/register", {
        name,
        email,
        password,
        password_confirmation: passwordConfirm,
      })

      console.log("Signup successful")
      navigate("/login")
    } catch (err: any) {
      console.error("Signup failed", err)

      if (err.response?.status === 422 && err.response?.data?.errors) {
        const firstError = Object.values(err.response.data.errors)[0] as string[]
        setError(firstError?.[0] || "Signup failed. Please try again.")
      } else {
        setError(err.response?.data?.message || "Signup failed. Please try again.")
      }
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-center py-2 text-xl font-bold text-update">Sign Up</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignup}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-3">
                <FloatingInput
                  id="name"
                  type="text"
                  label="Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  required err={""}                />
              </div>
              <div className="grid gap-3">
                <FloatingInput
                  id="email"
                  type="email"
                  label="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="demo@gmail.com"
                  required err={""}                />
              </div>
              <div className="grid gap-3">
                <PasswordInput
                  id="password"
                  value={password}
                  label="Password"
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div className="grid gap-3">
                <PasswordInput
                  id="confirm-password"
                  value={passwordConfirm}
                  label="Confirm Password"
                  onChange={(e) => setPasswordConfirm(e.target.value)}
                />
              </div>
              {error && <p className="text-red-500 text-sm text-center">{error}</p>}
              <div className="flex flex-col gap-3">
              <Button type="submit" className="w-full bg-update text-update-foreground" label={"Sign Up"}/>
              </div>
              <div className="text-center text-sm">
                Already have an account?{" "}
                <a href="/login" className="underline text-update underline-offset-4">
                  Sign In
                </a>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
