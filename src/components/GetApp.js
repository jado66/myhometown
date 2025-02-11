import { useEffect, useState } from "react";
import {
  Button,
  Card,
  CardContent,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Box,
} from "@mui/material";
import {
  Apple,
  Smartphone,
  Monitor,
  OpenInNew,
  Share,
  AddBox,
  Launch,
} from "@mui/icons-material";

const getBrowserName = (userAgent) => {
  if (userAgent.match(/chrome|chromium|crios/i)) return "Chrome";
  if (userAgent.match(/firefox|fxios/i)) return "Firefox";
  if (userAgent.match(/safari/i)) return "Safari";
  if (userAgent.match(/opr\//i)) return "Opera";
  if (userAgent.match(/edg/i)) return "Edge";
  return "Unknown";
};

export function GetApp() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showOpenAppDialog, setShowOpenAppDialog] = useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);
  const [appState, setAppState] = useState({
    isIOS: false,
    isAndroid: false,
    isDesktop: false,
    isInstalled: false,
    isInstallable: false,
    isStandalone: false,
    browserName: "Unknown",
  });

  useEffect(() => {
    const detectDeviceAndStatus = () => {
      const ua = window.navigator.userAgent.toLowerCase();
      const isIOS = /iphone|ipad|ipod/.test(ua) && !window.MSStream;
      const isAndroid = /android/.test(ua);
      const isDesktop = !isIOS && !isAndroid;
      const browserName = getBrowserName(ua);

      const isStandalone =
        window.matchMedia("(display-mode: standalone)").matches ||
        window.matchMedia("(display-mode: fullscreen)").matches ||
        window.navigator.standalone === true;

      const isPWA =
        isStandalone || window.matchMedia("(display-mode: minimal-ui)").matches;

      setAppState({
        isIOS,
        isAndroid,
        isDesktop,
        isInstalled: isPWA,
        isInstallable: true,
        isStandalone,
        browserName,
      });
    };

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setAppState((prev) => ({ ...prev, isInstallable: true }));
    };

    const checkInstallationStatus = async () => {
      if ("getInstalledRelatedApps" in navigator) {
        try {
          // @ts-ignore
          const relatedApps = await navigator.getInstalledRelatedApps();
          if (relatedApps.length > 0) {
            setAppState((prev) => ({ ...prev, isInstalled: true }));
          }
        } catch (error) {
          console.warn("Error checking installed apps:", error);
        }
      }
    };

    detectDeviceAndStatus();
    checkInstallationStatus();

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    const mediaQuery = window.matchMedia("(display-mode: standalone)");
    const handleDisplayModeChange = (e) => {
      setAppState((prev) => ({
        ...prev,
        isInstalled: e.matches,
        isStandalone: e.matches,
      }));
    };

    mediaQuery.addListener(handleDisplayModeChange);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
      mediaQuery.removeListener(handleDisplayModeChange);
    };
  }, []);

  const handleInstallClick = async () => {
    if (appState.isIOS) {
      setShowIOSInstructions(true);
      return;
    }

    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === "accepted") {
          setDeferredPrompt(null);
          // Note: You'll need to implement your own toast functionality with MUI Snackbar
          console.log("App installed successfully!");
        } else {
          console.log("Installation cancelled. You can try again anytime.");
        }
      } catch (error) {
        console.error("Installation error:", error);
        console.log("Installation failed. Please try again.");
      }
    } else {
      console.log("Please use your browser's menu to install the app");
    }
  };

  const handleOpenApp = () => {
    const appUrl = window.location.origin;
    window.location.href = appUrl;
  };

  if (appState.isStandalone) return null;

  return (
    <Box sx={{ py: 4, px: 4 }}>
      <Box sx={{ maxWidth: "md", mx: "auto" }}>
        <Card elevation={4}>
          <CardContent>
            <Typography variant="h4" gutterBottom>
              {appState.isInstalled ? "Open App" : "Install App"}
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" gutterBottom>
              Get the best experience with our app
            </Typography>

            {appState.isInstalled ? (
              <Button
                variant="contained"
                fullWidth
                onClick={handleOpenApp}
                startIcon={<OpenInNew />}
              >
                Open App
              </Button>
            ) : appState.isIOS ? (
              <Button
                variant="contained"
                fullWidth
                onClick={() => setShowIOSInstructions(true)}
                startIcon={<Apple />}
              >
                Install on iOS
              </Button>
            ) : (
              <Button
                variant="contained"
                fullWidth
                onClick={handleInstallClick}
                startIcon={appState.isAndroid ? <Smartphone /> : <Monitor />}
              >
                Install App
              </Button>
            )}
          </CardContent>
        </Card>
      </Box>

      <Dialog
        open={showIOSInstructions}
        onClose={() => setShowIOSInstructions(false)}
      >
        <DialogTitle>Install on iOS</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Follow these steps to install our app:
          </DialogContentText>
          <Box sx={{ mt: 2, display: "flex", flexDirection: "column", gap: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Share />
              <Typography>1. Tap the Share button</Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <AddBox />
              <Typography>2. Select "Add to Home Screen"</Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Launch />
              <Typography>3. Tap "Add" to finish</Typography>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowIOSInstructions(false)}>Got it</Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={showOpenAppDialog}
        onClose={() => setShowOpenAppDialog(false)}
      >
        <DialogTitle>Open App</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Would you like to open the installed app?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleOpenApp} startIcon={<OpenInNew />}>
            Open App
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
