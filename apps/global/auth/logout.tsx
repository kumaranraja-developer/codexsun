// logoutUser.ts
import { logoutFrappe } from "../../../resources/global/api/frappeApi";

export async function logoutUser(API_URL: string, API_METHOD: string, setUser: (user: any) => void) {
  if (API_METHOD === "FAST_API") {
    const token = localStorage.getItem("token");
    if (!token) {
      setUser(null);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/logout`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("editor-draft");
        setUser(null);
        // If you use react-router's navigate, call it here:
        // navigate("/");
      } else {
        throw new Error("Logout failed");
      }
    } catch (err) {
      setUser(null);
      throw err;
    }
  } else if (API_METHOD === "FRAPPE") {
    await logoutFrappe();
    setUser(null);
  }
}
