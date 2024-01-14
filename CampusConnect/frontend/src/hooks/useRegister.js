import { useState } from "react";
import { useAuthContext } from "./useAuthContext";
import { useNavigate } from "react-router-dom";

export const useRegister = () => {
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(null);
  const { dispatch } = useAuthContext();
  const navigate = useNavigate();

  const register = async (
    email,
    password,
    firstName,
    lastName,
    memberType,
    department
  ) => {
    setIsLoading(true);
    setError(null);
    setMessage(null);

    const response = await fetch("https://campusconnectbackend-67br.onrender.com/api/user/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        password,
        firstName,
        lastName,
        memberType,
        department,
      }),
    });
    
    const json = await response.json();

    // TODO: Change this so that it does not expect to have token in
    if (!response.ok) {
      setIsLoading(false);
      setError(json.error);
    }
    if (response.ok) {
      // update the auth context
      dispatch({ type: "LOGOUT" });
      setMessage(json.message);

      // navigate to /login after 3 seconds delay
      setTimeout(() => {
        navigate("/login");
      }, 3000);

      // update loading state
      setIsLoading(false);
    }
  };

  return { register, isLoading, error, message };
};
