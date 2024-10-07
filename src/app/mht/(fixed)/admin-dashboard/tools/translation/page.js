"use client";

import { useState, useEffect, useCallback } from "react";
import {
  TextField,
  Card,
  CardContent,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import { styled } from "@mui/system";

const StyledCard = styled(Card)(({ theme }) => ({
  width: "100%",
  maxWidth: "600px",
  margin: "0 auto",
  padding: theme.spacing(3),
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  marginBottom: theme.spacing(2),
}));

const StyledFormControl = styled(FormControl)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  minWidth: 120,
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
  const [translatedText, setTranslatedText] = useState("");
  const [displayedText, setDisplayedText] = useState("");
  const [targetLanguage, setTargetLanguage] = useState("es");
  const debouncedInputText = useDebounce(inputText, 500);

  const typeText = useCallback((text) => {
    if (!text) {
      setDisplayedText("");
      return;
    }

    let i = 0;
    setDisplayedText("");
    const typing = setInterval(() => {
      if (i < text.length) {
        setDisplayedText((prev) => prev + text[i]);
        i++;
      } else {
        clearInterval(typing);
      }
    }, 25);

    return () => clearInterval(typing);
  }, []);

  useEffect(() => {
    const translate = async () => {
      if (debouncedInputText) {
        try {
          const response = await fetch("/api/ai/translate", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ text: debouncedInputText, targetLanguage }),
          });
          const data = await response.json();
          setTranslatedText(data.translatedText);
          typeText(data.translatedText);
        } catch (error) {
          console.error("Translation error:", error);
          setTranslatedText("Error in translation");
          setDisplayedText("Error in translation");
        }
      } else {
        setTranslatedText("");
        setDisplayedText("");
      }
    };
    translate();
  }, [debouncedInputText, targetLanguage, typeText]);

  return (
    <StyledCard>
      <CardContent>
        <StyledFormControl fullWidth>
          <InputLabel id="language-select-label">Target Language</InputLabel>
          <Select
            labelId="language-select-label"
            id="language-select"
            value={targetLanguage}
            label="Target Language"
            onChange={(e) => setTargetLanguage(e.target.value)}
          >
            <MenuItem value="es">Spanish</MenuItem>
            <MenuItem value="fr">French</MenuItem>
            <MenuItem value="de">German</MenuItem>
            <MenuItem value="it">Italian</MenuItem>
            <MenuItem value="pt">Portuguese</MenuItem>
            <MenuItem value="ch">Chinese</MenuItem>
          </Select>
        </StyledFormControl>
        <StyledTextField
          fullWidth
          multiline
          rows={4}
          variant="outlined"
          placeholder="Enter text to translate..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          inputProps={{ "aria-label": "Text to translate" }}
        />
        <StyledTextField
          fullWidth
          multiline
          rows={4}
          variant="outlined"
          value={displayedText}
          InputProps={{
            readOnly: true,
          }}
          inputProps={{ "aria-label": "Translated text" }}
        />
      </CardContent>
    </StyledCard>
  );
}
