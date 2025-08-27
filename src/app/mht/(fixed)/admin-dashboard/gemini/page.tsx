"use client";

import type React from "react";

import { useState, useRef, useEffect } from "react";
import {
  Box,
  Container,
  Paper,
  TextField,
  IconButton,
  Typography,
  List,
  ListItem,
  Avatar,
  Chip,
  CircularProgress,
  ThemeProvider,
  createTheme,
  CssBaseline,
  AppBar,
  Toolbar,
} from "@mui/material";
import {
  Send as SendIcon,
  Person as PersonIcon,
  SmartToy as BotIcon,
  Clear as ClearIcon,
} from "@mui/icons-material";

interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content:
        "Hello! I'm your AI assistant powered by Gemini. How can I help you today?",
      role: "assistant",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input.trim(),
      role: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: input.trim(),
          history: messages,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      const data = await response.json();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.message,
        role: "assistant",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content:
          "Sorry, I encountered an error. Please make sure your GEMINI_API_KEY is set in your environment variables.",
        role: "assistant",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: "1",
        content:
          "Hello! I'm your AI assistant powered by Gemini. How can I help you today?",
        role: "assistant",
        timestamp: new Date(),
      },
    ]);
  };

  return (
    <Box sx={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      <AppBar position="static" elevation={1}>
        <Toolbar>
          <BotIcon sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            AI Chat Assistant
          </Typography>
          <Chip
            label="Powered by Gemini"
            size="small"
            variant="outlined"
            sx={{ color: "white", borderColor: "rgba(255,255,255,0.3)" }}
          />
          <IconButton color="inherit" onClick={clearChat} sx={{ ml: 1 }}>
            <ClearIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Container
        maxWidth="md"
        sx={{ flex: 1, display: "flex", flexDirection: "column", py: 2 }}
      >
        <Paper
          elevation={2}
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            mb: 2,
          }}
        >
          <Box sx={{ flex: 1, overflow: "auto", p: 1 }}>
            <List sx={{ py: 0 }}>
              {messages.map((message) => (
                <ListItem
                  key={message.id}
                  sx={{
                    display: "flex",
                    flexDirection:
                      message.role === "user" ? "row-reverse" : "row",
                    alignItems: "flex-start",
                    py: 1,
                  }}
                >
                  <Avatar
                    sx={{
                      bgcolor:
                        message.role === "user"
                          ? "primary.main"
                          : "secondary.main",
                      mx: 1,
                      width: 32,
                      height: 32,
                    }}
                  >
                    {message.role === "user" ? (
                      <PersonIcon fontSize="small" />
                    ) : (
                      <BotIcon fontSize="small" />
                    )}
                  </Avatar>
                  <Paper
                    elevation={1}
                    sx={{
                      p: 2,
                      maxWidth: "70%",
                      bgcolor:
                        message.role === "user" ? "primary.main" : "grey.100",
                      color:
                        message.role === "user"
                          ? "primary.contrastText"
                          : "text.primary",
                      borderRadius: 2,
                      borderTopLeftRadius: message.role === "user" ? 2 : 0.5,
                      borderTopRightRadius: message.role === "user" ? 0.5 : 2,
                    }}
                  >
                    <Typography variant="body1" sx={{ whiteSpace: "pre-wrap" }}>
                      {message.content}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        display: "block",
                        mt: 0.5,
                        opacity: 0.7,
                      }}
                    >
                      {message.timestamp.toLocaleTimeString()}
                    </Typography>
                  </Paper>
                </ListItem>
              ))}
              {isLoading && (
                <ListItem sx={{ justifyContent: "flex-start" }}>
                  <Avatar
                    sx={{
                      bgcolor: "secondary.main",
                      mx: 1,
                      width: 32,
                      height: 32,
                    }}
                  >
                    <BotIcon fontSize="small" />
                  </Avatar>
                  <Paper
                    elevation={1}
                    sx={{
                      p: 2,
                      bgcolor: "grey.100",
                      borderRadius: 2,
                      borderTopLeftRadius: 0.5,
                    }}
                  >
                    <CircularProgress size={20} />
                    <Typography
                      variant="body2"
                      sx={{ ml: 1, display: "inline" }}
                    >
                      Thinking...
                    </Typography>
                  </Paper>
                </ListItem>
              )}
            </List>
            <div ref={messagesEndRef} />
          </Box>
        </Paper>

        <Paper elevation={2} sx={{ p: 2 }}>
          <Box sx={{ display: "flex", gap: 1, alignItems: "flex-end" }}>
            <TextField
              fullWidth
              multiline
              maxRows={4}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message here..."
              variant="outlined"
              size="small"
              disabled={isLoading}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                },
              }}
            />
            <IconButton
              color="primary"
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              sx={{
                bgcolor: "primary.main",
                color: "white",
                "&:hover": {
                  bgcolor: "primary.dark",
                },
                "&:disabled": {
                  bgcolor: "grey.300",
                },
              }}
            >
              <SendIcon />
            </IconButton>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}
