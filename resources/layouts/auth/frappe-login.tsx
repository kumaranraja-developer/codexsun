import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "../../../resources/components/chart/card";
import Password_Input from "../../../resources/components/secondary_input/password_Input";
import { useFrappeAuth } from "../../../apps/global/auth/frappeAuthContext";
import { cn } from "../../global/library/utils";
import FloatingInput from "../../../resources/components/input/floating-input";
import Button from "../../../resources/components/button/Button";

interface LoginProps {
  className?: string;
}

export default function FrappeLoginForm({ className }: LoginProps) {
  const [usr, setUsr] = useState("");
  const [pwd, setPwd] = useState("");
  const [error, setError] = useState("");
  const [usrError, setUsrError] = useState("");
  const [pwdError, setPwdError] = useState("");

  const navigate = useNavigate();
  const { login } = useFrappeAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setUsrError("");
    setPwdError("");

    let hasError = false;
    if (!usr.trim()) {
      setUsrError("Username Required");
      hasError = true;
    }
    if (!pwd.trim()) {
      setPwdError("Password Required");
      hasError = true;
    }
    if (hasError) return;

    try {
      await login(usr, pwd); // this will throw if login fails
      navigate("/dashboard");
    } catch (e: any) {
      setError(e.message || "Invalid Credentials");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className={cn("w-full max-w-md", className)}>
        <Card>
          <CardHeader>
            <CardTitle className="text-center py-2 text-xl font-bold text-update">
              Welcome
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin}>
              <div className="flex flex-col gap-6">
                <div className="grid gap-3">
                  <FloatingInput
                    id="usr"
                    type="text"
                    placeholder="demo@gmail.com"
                    value={usr}
                    onChange={(e) => setUsr(e.target.value)}
                    label="User"
                    err={usrError}
                  />
                </div>
                <div className="grid gap-3">
                  <Password_Input
                    id="pwd"
                    value={pwd}
                    error={pwdError}
                    label="Password"
                    onChange={(e) => setPwd(e.target.value)}
                  />
                </div>
                {error && (
                  <p className="text-red-500 text-sm text-center">{error}</p>
                )}
                <div className="flex flex-col gap-3">
                  <Button
                    type="submit"
                    className="w-full bg-update text-update-foreground"
                    label="Login"
                  />
                </div>
                <div className="text-center text-sm">
                  Don&apos;t have an account?{" "}
                  <a
                    href="/signup"
                    className="underline text-update underline-offset-4"
                  >
                    Sign up
                  </a>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
