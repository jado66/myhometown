import React, { useState, useEffect } from "react";

const useAddressValidation = (address) => {
  const [isValid, setIsValid] = useState(false);
  const [error, setError] = useState("");
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    const validateAddress = async () => {
      if (!address || address.length < 5) {
        setIsValid(false);
        setError("Address must be at least 5 characters long");
        return;
      }

      setIsChecking(true);
      try {
        const response = await fetch("/api/validate-address", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ address }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to validate address");
        }

        if (data.valid) {
          setIsValid(true);
          setError("");
          // Optionally update the address with the standardized version
          if (data.standardized && onChange) {
            onChange(data.standardized);
          }
        } else {
          setIsValid(false);
          setError(data.error || "Invalid address");
        }
      } catch (err) {
        setError(err.message || "Error validating address");
        setIsValid(false);
      } finally {
        setIsChecking(false);
      }
    };

    const debounceTimeout = setTimeout(validateAddress, 500);
    return () => clearTimeout(debounceTimeout);
  }, [address]);

  return { isValid, error, isChecking };
};

export default useAddressValidation;
