import LanguageIcon from "@/assets/svg/icons/LanguageIcon";
import BearIcon from "@/assets/svg/icons/BearIcon";
import HomeCareIcon from "@/assets/svg/icons/HomeCare";
import MentalHealthIcon from "@/assets/svg/icons/MentalHealth";
import ComputerIcon from "@/assets/svg/icons/Computer";
import CookingIcon from "@/assets/svg/icons/CookingIcon";
import CommunityService1Icon from "@/assets/svg/icons/CommunityService1Icon";
import CommunityService2Icon from "@/assets/svg/icons/CommunityService2Icon";
import LifeSkillsIcon from "@/assets/svg/icons/LifeSkillsIcon";
import GuitarIcon from "@/assets/svg/icons/GuitarIcon";
import UkeIcon from "@/assets/svg/icons/UkeIcon";
import LegalIcon from "@/assets/svg/icons/LegalIcon";
import PianoIcon from "@/assets/svg/icons/PianoIcon";

import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  Paper,
  IconButton,
  Grid,
  Button,
} from "@mui/material";
import ArtsIcon from "@/assets/svg/icons/ArtsIcon";
import TutoringIcon from "@/assets/svg/icons/TutoringIcon";
import FinanceIcon from "@/assets/svg/icons/FinanceIcon";
import RecreationIcon from "@/assets/svg/icons/RecreationIcon";
import HulaIcon from "@/assets/svg/icons/HulaIcon";
import EmergencyPrepIcon from "@/assets/svg/icons/EmergencyPrep";
import HomeworkIcon from "@/assets/svg/icons/HomeworkIcon";
import YogaIcon from "@/assets/svg/icons/YogaIcon";
import YouthInActionIcon from "@/assets/svg/icons/YouthInActionIcon";
import CraftsIcon from "@/assets/svg/icons/CraftsIcon";
import BeeIcon from "@/assets/svg/icons/BeeIcon";
import SingleClassIcon from "@/assets/svg/icons/SingleClassIcon";
import SpanishIcon from "@/assets/svg/icons/SpanishIcon";
import JuniorLeadersIcon from "@/assets/svg/icons/JuniorLeadersIcon";
import Finance2Icon from "@/assets/svg/icons/Finance2Icon";
import AslIcon from "@/assets/svg/icons/AslIcon";
import LoveAndLogicIcon from "@/assets/svg/icons/LoveandLogicIcon";
import LearningTreeIcon from "@/assets/svg/icons/LearningTreeIcon";
import EverydayStrongIcon from "@/assets/svg/icons/EverydayStrongIcon";
import { useState } from "react";

export const ExampleIcons = {
  None: <div style={{ height: "30px", width: "35px" }}> </div>,
  Crafts: <CraftsIcon />,
  Bee: <BeeIcon />,
  SingleClass: <SingleClassIcon />,
  Finance: <FinanceIcon />,
  Recreation: <RecreationIcon />,
  EmergencyPrep: <EmergencyPrepIcon />,
  Homework: <HomeworkIcon />,
  Hula: <HulaIcon />,
  BrushIcon: <ArtsIcon />,
  TranslateIcon: <LanguageIcon />,
  Bear: <BearIcon />,
  HomeCare: <HomeCareIcon />,
  MentalHealth: <MentalHealthIcon />,
  Computer: <ComputerIcon />,
  Cooking: <CookingIcon />,
  Community1: <CommunityService1Icon />,
  Community2: <CommunityService2Icon />,
  LifeSkills: <LifeSkillsIcon />,
  YogaIcon: <YogaIcon />,
  YouthInIcon: <YouthInActionIcon />,
  SpanishIcon: <SpanishIcon />,
  JuniorLeadersIcon: <JuniorLeadersIcon />,
  Finance2Icon: <Finance2Icon />,
  AslIcon: <AslIcon />,
  LoveAndLogicIcon: <LoveAndLogicIcon />,
  LearningTreeIcon: <LearningTreeIcon />,
  EverydayStrongIcon: <EverydayStrongIcon />,
  // Tutoring: <TutoringIcon />,
  // Music: <MusicIcon />,

  Guitar: <GuitarIcon />,
  Uke: <UkeIcon />,
  Legal: <LegalIcon />,
  Piano: <PianoIcon />,

  // Add other icons here...
};

export const IconSelect = ({ icon, onSelect, disabled, height }) => {
  const [open, setOpen] = useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleSelect = (e, iconName) => {
    e.stopPropagation();
    // Create a synthetic event object that matches what your code expects
    const syntheticEvent = {
      target: { value: iconName },
      stopPropagation: () => {},
      preventDefault: () => {},
    };
    onSelect(syntheticEvent);
    handleClose();
  };

  // Get the current icon component
  const SelectedIcon = icon ? ExampleIcons[icon] : null;
  const IconWrapper = ({ children, scale = 2 }) => (
    <div
      style={{
        transform: `scale(${scale})`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        height: "100%",
      }}
    >
      {children}
    </div>
  );

  return (
    <>
      <Button
        variant="outlined"
        onClick={handleOpen}
        disabled={disabled}
        sx={{
          width: "100%",
          height: height || "40px",
          minHeight: "40px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: 1,
        }}
      >
        {SelectedIcon ? (
          <IconWrapper scale={1.5}>{SelectedIcon}</IconWrapper>
        ) : (
          "Select Icon"
        )}
      </Button>

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>Choose an Icon</DialogTitle>
        <DialogContent>
          <Grid
            container
            spacing={2}
            sx={{
              mt: 1,
              maxHeight: "70vh",
              overflowY: "auto",
            }}
          >
            {Object.entries(ExampleIcons).map(([name, icon]) => (
              <Grid item xs={4} sm={4} md={3} key={name}>
                <Paper
                  elevation={0}
                  sx={{
                    border: "1px solid",
                    borderColor: "divider",
                    "&:hover": {
                      bgcolor: "action.hover",
                      cursor: "pointer",
                    },
                  }}
                >
                  <IconButton
                    onClick={(e) => handleSelect(e, name)}
                    sx={{
                      width: "100%",
                      height: "80px",
                      borderRadius: 1,
                      p: 1,
                    }}
                  >
                    <IconWrapper>{icon}</IconWrapper>
                  </IconButton>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default IconSelect;
