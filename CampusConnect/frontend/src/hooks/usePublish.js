import { useState } from "react";
import { useAuthContext } from "./useAuthContext";

export const usePublish = (type) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useAuthContext();

  const publishProduct = async (formData) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`https://campusconnectbackend-67br.onrender.com/api/post/create/${type}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
        body: formData,
      });

      const json = await response.json();

      if (!response.ok) {
        throw new Error(json.error || "An error occurred");
      }

      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  };

  return { publishProduct, isLoading, error };
};
