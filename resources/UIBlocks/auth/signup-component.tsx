import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { cn } from "../../global/helpers/utils"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/chart/card"
import PasswordInput from "../../components/input/password-input"
import { useAppContext } from "../../global/AppContaxt"
import FloatingInput from "../../components/input/floating-input";
import Button from "../../components/button/Button";

export function SignupComponent({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const navigate = useNavigate()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [passwordConfirm, setPasswordConfirm] = useState("")
  const [error, setError] = useState("")
  const {API_URL}=useAppContext();
  const handleSignup = async (e: React.FormEvent) => {
  e.preventDefault();
  setError("");

  if (password !== passwordConfirm) {
    setError("Passwords do not match");
    return;
  }

  try {
    const response = await fetch(`${API_URL}/api/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: name,
        email: email,
        password: password,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      const firstError = errorData.detail || "Signup failed. Please try again.";
      setError(firstError);
      return;
    }

    console.log("Signup successful");
    navigate("/");
  } catch (err) {
    console.error("Signup failed", err);
    setError("Signup failed. Please try again.");
  }
};


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
