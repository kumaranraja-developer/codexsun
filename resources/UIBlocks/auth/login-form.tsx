// src/components/LoginForm.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Password_Input from "../../../resources/components/secondary_input/password_Input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../resources/components/chart/card";
import { useAuth } from "../../../resources/global/auth/AuthContext";
import { useAppContext } from "../../../resources/global/AppContaxt";
import FloatingInput from "../../components/input/floating-input";
import Button from "../../../resources/components/button/Button";
import React from "react";

export function LoginForm({ className }: { className?: string }) {
  const [usr, setUsr] = useState("");
  const [pwd, setPwd] = useState("");
  const [error, setError] = useState("");
  const [usrError, setUsrError] = useState("");
  const [pwdError, setPwdError] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();
  const { API_URL } = useAppContext();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setUsrError("");
    setPwdError("");

    if (!usr && !pwd) {
      setUsrError("Username Required");
      setPwdError("Password Required");
      return;
    } else if (!usr) {
      setUsrError("Username Required");
      return;
    } else if (!pwd) {
      setPwdError("Password Required");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username: usr, password: pwd }),
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Login failed");
      }

      const data = await response.json();

      const token = data.access_token;
      //   console.log(data.access_token)
      const user = data.user; // ✅ extract user (username + email)

      login(user, token); // ✅ store full user object
      navigate("/dashboard");
    } catch (err) {
      console.error("Login failed:", err);
      setError("Invalid credentials or server error.");
    }
  };

  return (
    <div className={`flex flex-col gap-6 ${className}`}>
      <Card>
        <CardHeader>
          <CardTitle className="text-center py-2 text-xl font-bold text-update">
            Welcome
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin}>
            <div className="flex flex-col gap-6">
              <FloatingInput
                id="usr"
                type="text"
                placeholder="demo@gmail.com"
                required
                value={usr}
                onChange={(e) => setUsr(e.target.value)}
                label="User"
                err={usrError}
              />

              <Password_Input
                id="pwd"
                value={pwd}
                error={pwdError}
                label="Password"
                onChange={(e) => setPwd(e.target.value)}
              />

              {error && (
                <p className="text-red-500 text-sm text-center">{error}</p>
              )}

              <Button
                type="submit"
                className="w-full bg-update text-update-foreground"
                label={"Login"}
              />

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
  );
}
