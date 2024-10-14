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

export const ExampleIcons = {
  None: <div style={{ height: "30px", width: "35px" }}> </div>,
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
  // Music: <MusicIcon />,
  Guitar: <GuitarIcon />,
  Uke: <UkeIcon />,
  Legal: <LegalIcon />,
  Piano: <PianoIcon />,

  // Add other icons here...
};

export const IconSelect = ({ icon, onSelect, disabled }) => (
  <FormControl
    fullWidth
    sx={{ my: "auto", height: "40px !important" }}
    variant="outlined"
    size="small"
  >
    <InputLabel id="icon-select-label">Icon</InputLabel>
    <Select
      labelId="icon-select-label"
      label="Icon"
      onChange={onSelect}
      value={icon}
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
