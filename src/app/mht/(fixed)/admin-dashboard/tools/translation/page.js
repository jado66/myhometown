"use client";
import React, { useState, useEffect, useCallback } from "react";
import { TextField, Card, CardContent } from "@mui/material";
import { styled } from "@mui/system";

const StyledCard = styled(Card)(({ theme }) => ({
  width: "100%",
  maxWidth: "600px",
  margin: "0 auto",
  padding: theme.spacing(3),
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  textTransform: "capitalize",
}));

const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

export default function TranslationTyper() {
  const [inputText, setInputText] = useState("");
  const [translations, setTranslations] = useState({
    spanish: "",
    portuguese: "",
    filipino: "",
  });
  const [displayedTexts, setDisplayedTexts] = useState({
    spanish: "",
    portuguese: "",
    filipino: "",
  });
  const [typingIndices, setTypingIndices] = useState({
    spanish: 0,
    portuguese: 0,
    filipino: 0,
  });
  const debouncedInputText = useDebounce(inputText, 500);

  useEffect(() => {
    const translate = async () => {
      if (debouncedInputText) {
        try {
          const response = await fetch("/api/ai/translate", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ text: debouncedInputText }),
          });
          const data = await response.json();
          setTranslations(data);
          setDisplayedTexts({ spanish: "", portuguese: "", filipino: "" });
          setTypingIndices({ spanish: 0, portuguese: 0, filipino: 0 });
        } catch (error) {
          console.error("Translation error:", error);
          const errorMessage = "Error in translation";
          setTranslations({
            spanish: errorMessage,
            portuguese: errorMessage,
            filipino: errorMessage,
          });
          setDisplayedTexts({
            spanish: errorMessage,
            portuguese: errorMessage,
            filipino: errorMessage,
          });
        }
      } else {
        setTranslations({ spanish: "", portuguese: "", filipino: "" });
        setDisplayedTexts({ spanish: "", portuguese: "", filipino: "" });
        setTypingIndices({ spanish: 0, portuguese: 0, filipino: 0 });
      }
    };
    translate();
  }, [debouncedInputText]);

  useEffect(() => {
    const typingInterval = setInterval(() => {
      let allCompleted = true;
      setTypingIndices((prevIndices) => {
        const newIndices = { ...prevIndices };
        Object.keys(newIndices).forEach((lang) => {
          if (newIndices[lang] < (translations[lang]?.length || 0)) {
            newIndices[lang]++;
            allCompleted = false;
          }
        });
        return newIndices;
      });

      setDisplayedTexts((prevTexts) => {
        const newTexts = { ...prevTexts };
        Object.keys(newTexts).forEach((lang) => {
          newTexts[lang] =
            translations[lang]?.slice(0, typingIndices[lang]) || "";
        });
        return newTexts;
      });

      if (allCompleted) {
        clearInterval(typingInterval);
      }
    }, 25);

    return () => clearInterval(typingInterval);
  }, [translations, typingIndices]);

  return (
    <StyledCard>
      <CardContent>
        <StyledTextField
          fullWidth
          multiline
          rows={4}
          label="Your Text"
          variant="outlined"
          placeholder="Enter text to translate..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          inputProps={{ "aria-label": "Text to translate" }}
        />
        {Object.entries(displayedTexts).map(([language, text]) => {
          // Substitute "filipino" with "Tagalog"

          const languageLabel = language === "filipino" ? "Tagalog" : language;

          return (
            <StyledTextField
              key={language}
              fullWidth
              multiline
              rows={4}
              variant="outlined"
              value={text}
              InputProps={{
                readOnly: true,
              }}
              label={languageLabel}
              inputProps={{ "aria-label": `${language} translation` }}
            />
          );
        })}
      </CardContent>
    </StyledCard>
  );
}
