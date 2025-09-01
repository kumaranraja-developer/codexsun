// Login to Frappe (session-based)
import apiClient from "./apiClients";

export const loginFrappe = async (usr: string, pwd: string) => {
  try {
    const response = await apiClient.post("/api/method/login", { usr, pwd });
    
    if (response.data.message === "Logged In") {
          localStorage.setItem("name", response.data.full_name);

      // success
      return;
    } else {
      throw new Error("Invalid credentials");
    }
  } catch (error: any) {
    // Bubble up error to component
    throw error.response?.data?.message
      ? new Error(error.response.data.message)
      : new Error("Invalid credentials");
  }
};

// Logout user
export const logoutFrappe = async () => {
  try {
    const response = await apiClient.post("/api/method/logout");
    if (response.data.message === "No Docs") {
      // success
      return;
    } else {
      throw new Error("Logout failed");
    }
  } catch (error) {
    throw error;
  }
};

// Get currently logged-in user
export const getLoggedInUser = async (): Promise<string | null> => {
  const response = await apiClient.get(
    "/api/method/frappe.auth.get_logged_user"
  );
  const user = response.data.message;
  localStorage.setItem("email", user);
  return user === "No Docs" ? null : user;
};
