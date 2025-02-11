"use client";
import { useEffect, useState } from "react";

const useTranslation = () => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Only add if the element doesn't exist
    if (!document.getElementById("google_translate_element")) {
      const div = document.createElement("div");
      div.id = "google_translate_element";
      // Position it in the top-right corner
      div.style.position = "fixed";
      div.style.right = "20px";
      div.style.top = "70px"; // Adjust based on your header height
      div.style.zIndex = "9999";
      document.body.appendChild(div);
    }

    // Define the callback function
    if (!window.googleTranslateElementInit) {
      window.googleTranslateElementInit = () => {
        new window.google.translate.TranslateElement(
          {
            pageLanguage: "en",
            autoDisplay: true,
            layout:
              window.google.translate.TranslateElement.InlineLayout.HORIZONTAL,
          },
          "google_translate_element"
        );
        setIsLoaded(true);
      };
    }

    // Add the script if it hasn't been added
    if (!document.querySelector('script[src*="translate.google.com"]')) {
      const script = document.createElement("script");
      script.src =
        "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      script.async = true;
      document.head.appendChild(script);
    }

    return () => {
      const element = document.getElementById("google_translate_element");
      if (element) {
        element.remove();
      }
    };
  }, []);

  return { isLoaded };
};

export default useTranslation;
