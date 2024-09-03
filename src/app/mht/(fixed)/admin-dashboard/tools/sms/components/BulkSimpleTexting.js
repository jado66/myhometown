import { useState } from "react";
import {
  Box,
  CssBaseline,
  Drawer,
  AppBar,
  Toolbar,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  TextField,
  Button,
  Paper,
  Tab,
  Tabs,
} from "@mui/material";
import { Message, People, Send } from "@mui/icons-material";
import RecipientManager from "./RecipientManager";

const drawerWidth = 240;

export default function BulkSimpleTexting() {
  const [message, setMessage] = useState("");
  const [recipients, setRecipients] = useState([]);
  const [selectedRecipients, setSelectedRecipients] = useState([]);
  const [activeTab, setActiveTab] = useState(0);

  const handleSend = () => {
    // Implement sending logic here
    console.log("Sending message:", message);
    console.log("To recipients:", selectedRecipients);
  };

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
      >
        <Toolbar>
          <Typography variant="h6" noWrap component="div">
            Bulk Simple Texting
          </Typography>
        </Toolbar>
      </AppBar>
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: drawerWidth,
            boxSizing: "border-box",
          },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: "auto" }}>
          <List>
            {["Compose", "Recipients", "Send"].map((text, index) => (
              <ListItem button key={text} onClick={() => setActiveTab(index)}>
                <ListItemIcon>
                  {index === 0 ? (
                    <Message />
                  ) : index === 1 ? (
                    <People />
                  ) : (
                    <Send />
                  )}
                </ListItemIcon>
                <ListItemText primary={text} />
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        <Tabs
          value={activeTab}
          onChange={(_, newValue) => setActiveTab(newValue)}
        >
          <Tab label="Compose" />
          <Tab label="Recipients" />
          <Tab label="Send" />
        </Tabs>
        {activeTab === 0 && (
          <Paper elevation={3} sx={{ p: 2, mt: 2 }}>
            <Typography variant="h6" gutterBottom>
              Compose Message
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={4}
              variant="outlined"
              label="Message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              sx={{ mb: 2 }}
            />
          </Paper>
        )}
        {activeTab === 1 && (
          <RecipientManager
            recipients={recipients}
            setRecipients={setRecipients}
            selectedRecipients={selectedRecipients}
            setSelectedRecipients={setSelectedRecipients}
          />
        )}
        {activeTab === 2 && (
          <Paper elevation={3} sx={{ p: 2, mt: 2 }}>
            <Typography variant="h6" gutterBottom>
              Review and Send
            </Typography>
            <Typography variant="body1" gutterBottom>
              Message:
            </Typography>
            <Paper
              elevation={1}
              sx={{ p: 2, mb: 2, backgroundColor: "grey.100" }}
            >
              <Typography>{message}</Typography>
            </Paper>
            <Typography variant="body1" gutterBottom>
              Selected Recipients:
            </Typography>
            <Paper
              elevation={1}
              sx={{ p: 2, mb: 2, backgroundColor: "grey.100" }}
            >
              {selectedRecipients.map((r) => (
                <Typography key={r.id}>
                  {r.name} ({r.phone})
                </Typography>
              ))}
            </Paper>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSend}
              startIcon={<Send />}
            >
              Send
            </Button>
          </Paper>
        )}
      </Box>
    </Box>
  );
}
