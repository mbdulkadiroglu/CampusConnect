import { useState } from "react";
import { useAuthContext } from "./useAuthContext";

export const useResetPassword = () => {
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(null);
  const { dispatch } = useAuthContext();

  const resetPassword = async (email) => {
    setIsLoading(true);
    setError(null);

    const response = await fetch("https://campusconnectbackend-67br.onrender.com/api/user/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const json = await response.json();
    console.log("response:", json);

    if (!response.ok) {
      setIsLoading(false);
      setError(json.error);
    }
    if (response.ok) {
      // update the auth context
      dispatch({ type: "LOGOUT"});

      // update loading state
      setIsLoading(false);
    }
  };

  return { resetPassword, isLoading, error };
};
