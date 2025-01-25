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

import { FormControl, InputLabel, Select, MenuItem } from "@mui/material";
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

export const IconSelect = ({ icon, onSelect, disabled, height }) => (
  <FormControl
    fullWidth
    sx={{
      my: "auto",
      height: `${height || "40px"} !important`,
      display: "flex",
    }}
    variant="outlined"
    size="small"
  >
    <InputLabel id="icon-select-label">Icon</InputLabel>
    <Select
      labelId="icon-select-label"
      label="Icon"
      onChange={onSelect}
      value={icon}
      inputProps={{
        sx: {
          flex: 1,
        },
      }}
      sx={{
        height: "100%", // Set the select's height to fill the parent
        "& .MuiInputBase-root": {
          height: "100%", // Ensures the inner input area fills the space
        },
      }}
      MenuProps={{
        PaperProps: {
          style: {
            maxHeight: 250,
          },
        },
      }}
      disabled={disabled}
    >
      {Object.entries(ExampleIcons).map(([name, icon]) => (
        <MenuItem key={name} value={name}>
          {icon}
        </MenuItem>
      ))}
    </Select>
  </FormControl>
);
