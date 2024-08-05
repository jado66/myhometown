import React, { useState } from "react";
import {
  Button,
  Grid,
  Card,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  TextField,
  IconButton,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  styled,
  Divider,
} from "@mui/material";
import { SimpleTreeView } from "@mui/x-tree-view/SimpleTreeView";
import { TreeItem } from "@mui/x-tree-view/TreeItem";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  Add,
  Brush,
  BrushOutlined,
  Carpenter,
  Delete,
  LocalHospital,
  Plumbing,
  Translate,
} from "@mui/icons-material";
import InputAdornment from "@mui/material/InputAdornment";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import { IframeHelpDialog } from "./IframeHelpDialog";
import BearIcon from "@/assets/svg/icons/BearIcon";
import CookingIcon from "@/assets/svg/icons/CookingIcon";
import ArtsIcon from "@/assets/svg/icons/ArtsIcon";
import LanguageIcon from "@/assets/svg/icons/LanguageIcon";
import CommunityService1Icon from "@/assets/svg/icons/CommunityService1Icon";
import CommunityService2Icon from "@/assets/svg/icons/CommunityService2Icon";
import LifeSkillsIcon from "@/assets/svg/icons/LifeSkillsIcon";
import MusicIcon from "@/assets/svg/icons/MusicIcon";
import GuitarIcon from "@/assets/svg/icons/GuitarIcon";
import UkeIcon from "@/assets/svg/icons/UkeIcon";
import LegalIcon from "@/assets/svg/icons/LegalIcon";
import PianoIcon from "@/assets/svg/icons/PianoIcon";

const StyledTreeItem = styled(TreeItem)(({ theme }) => ({
  "& .MuiTreeItem-content": {
    paddingTop: "12px",
    paddingBottom: "12px",
    flexDirection: "row-reverse",
  },
}));

export const ClassesTreeView = ({
  classes,
  onCreateClassCategory,
  onCreateSubclass,
  onDeleteClassCategory,
  onDeleteSubclass,
  shiftDownClassCategory,
  shiftUpClassCategory,
  shiftUpSubclass,
  shiftDownSubclass,
  isEdit,
}) => {
  const [isAddNewCategory, setAddNewCategory] = useState(false);

  const [isShowIframeHelpDialog, setShowIframeHelpDialog] = useState(false);
  const showIframeHelpDialog = () => setShowIframeHelpDialog(true);
  const hideIframeHelpDialog = () => setShowIframeHelpDialog(false);

  if (!classes) {
    return null;
  }

  const renderTreeItems = (category) => {
    return (
      <ClassesCategory
        isEdit={isEdit}
        onDeleteSubclass={onDeleteSubclass}
        onDeleteClassCategory={onDeleteClassCategory}
        onCreateSubclass={onCreateSubclass}
        category={category}
        showIframeHelpDialog={showIframeHelpDialog}
      />
    );
  };

  return (
    <>
      <IframeHelpDialog
        open={isShowIframeHelpDialog}
        handleClose={hideIframeHelpDialog}
      />
      <Typography
        variant="h4"
        component="h2"
        color="primary"
        textAlign="center"
        gutterBottom
      >
        Community Resource Center Classes
      </Typography>

      <Card sx={{ padding: 2, marginTop: 2 }}>
        <Grid item xs={12}>
          <SimpleTreeView
            aria-label="classes tree view"
            disabledItemsFocusable={true}
          >
            {classes.map((classItem) => renderTreeItems(classItem))}
            {isAddNewCategory && (
              <CreateCategoryForm
                onClose={() => setAddNewCategory(false)}
                onCreate={onCreateClassCategory}
              />
            )}
            {isEdit && !isAddNewCategory && (
              <Grid>
                <Divider />
                <Button
                  startIcon={<Add />}
                  onClick={() => setAddNewCategory(true)}
                  sx={{ my: 1 }}
                  fullWidth
                >
                  Add New Category
                </Button>
              </Grid>
            )}
          </SimpleTreeView>
        </Grid>
      </Card>
    </>
  );
};

const ClassesCategory = ({
  category,
  isEdit,
  onDeleteClassCategory,
  onDeleteSubclass,
  showIframeHelpDialog,
  onCreateSubclass,
}) => {
  const [isAddNewClass, setAddNewClass] = useState(false);

  const IconWithProps = React.cloneElement(ExampleIcons[category.icon], {
    sx: { height: 35, width: 35 },
  });

  return (
    <StyledTreeItem
      key={category.id}
      itemId={category.id.toString()}
      label={
        <div style={{ display: "flex", alignItems: "center" }}>
          {IconWithProps}
          <Typography sx={{ marginLeft: "1em" }} variant="h5">
            {category.title}
          </Typography>
        </div>
      }
    >
      {Array.isArray(category.classes) && category.classes.length > 0
        ? category.classes.map((classObj) => (
            <Accordion key={`accordion-${classObj.id}`} elevation={0}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                {ExampleIcons[classObj.icon]}
                <Typography sx={{ marginLeft: "1em" }}>
                  {category.title}
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <iframe
                  src={`https://docs.google.com/forms/d/e/${classObj.googleFormID}/viewform?embedded=true`}
                  width="100%"
                  height="500px"
                  frameBorder="0"
                  marginHeight="0"
                  marginWidth="0"
                >
                  Loading…
                </iframe>

                {isEdit && (
                  <Button
                    startIcon={<Delete />}
                    onClick={() => onDeleteSubclass(category.id, classObj.id)}
                    sx={{ my: 1, mx: "auto" }}
                    fullWidth
                  >
                    Delete Class
                  </Button>
                )}
              </AccordionDetails>
            </Accordion>
          ))
        : null}

      {isAddNewClass && (
        <CreateClassForm
          category={category}
          onClose={() => setAddNewClass(false)}
          onCreateSubclass={onCreateSubclass}
          showIframeHelpDialog={showIframeHelpDialog}
        />
      )}
      {isEdit && !isAddNewClass && (
        <>
          <Grid display="flex" justifyContent="center" flexDirection="column">
            <Divider sx={{ height: 1, width: "100%" }} />
            <Grid flexDirection="row" display="flex" justifyContent="center">
              <Button
                startIcon={<Add />}
                onClick={() => setAddNewClass(true)}
                sx={{ my: 1, mx: 1 }}
              >
                Add New Class
              </Button>
              <Button
                startIcon={<Delete />}
                onClick={() => onDeleteClassCategory(category.id)}
                sx={{ my: 1, mx: 1 }}
              >
                Delete Category
              </Button>
            </Grid>
          </Grid>
        </>
      )}
    </StyledTreeItem>
  );
};

const ExampleIcons = {
  None: <div style={{ height: "30px" }}>No Icon</div>,
  BrushIcon: <ArtsIcon />,
  TranslateIcon: <LanguageIcon />,
  Bear: <BearIcon />,
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

const IconSelect = ({ icon, onSelect }) => (
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
    >
      {Object.entries(ExampleIcons).map(([name, icon]) => (
        <MenuItem key={name} value={name}>
          {icon}
        </MenuItem>
      ))}
    </Select>
  </FormControl>
);

const MAX_TITLE_LENGTH = 50;

// // Component to create a new class within a category

const CreateCategoryForm = ({ onCreate, onClose }) => {
  const [title, setTitle] = useState("");
  const [icon, setIcon] = useState("None");

  const MAX_TITLE_LENGTH = 50;

  const isFormValid = () => {
    return title.length > 0 && title.length <= MAX_TITLE_LENGTH;
  };

  return (
    <>
      <Divider />
      <Grid
        container
        item
        xs={12}
        display="flex"
        flexDirection="row"
        spacing={1}
        sx={{ px: 2, py: 2 }}
        alignItems="center"
      >
        <Grid item xs={12}>
          <Typography variant="h6" textAlign="center">
            Add New Class Category
          </Typography>
        </Grid>
        <Grid
          container
          xs={12}
          display="flex"
          flexDirection="row"
          spacing={1}
          sx={{ px: 2 }}
          alignItems="center"
        >
          <Grid item xs={3} sm={2}>
            <IconSelect onSelect={(e) => setIcon(e.target.value)} icon={icon} />
          </Grid>
          <Grid item xs={9} sm={4}>
            <TextField
              fullWidth
              size="small"
              value={title}
              label="Category Title"
              onChange={(e) => setTitle(e.target.value)}
              margin="normal"
              InputProps={{
                style: { height: "47px" },
              }}
              error={title.length > MAX_TITLE_LENGTH}
              helperText={
                title.length > MAX_TITLE_LENGTH ? "Title is too long." : ""
              }
            />
          </Grid>
        </Grid>
        <Grid item xs={12} display="flex" flexDirection="row">
          <Grid item xs={4} sm={2}>
            <Button variant="contained" fullWidth onClick={onClose}>
              Cancel
            </Button>
          </Grid>
          <Grid item xs={4} sm={8} />
          <Grid item xs={4} sm={2}>
            <Button
              variant="contained"
              fullWidth
              onClick={() => {
                onCreate(icon, title);
                setTitle(""); // Reset after adding
                onClose();
              }}
              disabled={!isFormValid()}
            >
              Add Category
            </Button>
          </Grid>
        </Grid>
      </Grid>
    </>
  );
};

const CreateClassForm = ({
  category,
  onCreateSubclass,
  onClose,
  showIframeHelpDialog,
}) => {
  const [title, setTitle] = useState("");
  const [googleFormIframe, setGoogleFormIframe] = useState("");
  const [icon, setIcon] = useState("None");

  const MAX_TITLE_LENGTH = 50;

  const extractGoogleFormId = (iframe) => {
    const match = iframe.match(
      /<iframe[^>]*src="https:\/\/docs\.google\.com\/forms\/d\/e\/([^"]+)\/viewform/
    );
    return match ? match[1] : null;
  };

  const googleFormId = extractGoogleFormId(googleFormIframe);

  // Debugging output
  console.log("Title:", title);
  console.log("Google Form Iframe:", googleFormIframe);
  console.log("Google Form ID:", googleFormId);

  const isFormValid = () => {
    const valid =
      title.length > 0 &&
      title.length <= MAX_TITLE_LENGTH &&
      googleFormId !== null;

    // More debugging output
    console.log("Is Form Valid:", valid);

    return valid;
  };

  return (
    <>
      <Divider />
      <Grid
        container
        item
        xs={12}
        display="flex"
        flexDirection="row"
        spacing={1}
        sx={{ p: 2 }}
        alignItems="center"
      >
        <Grid item xs={12}>
          <Typography variant="h6" textAlign="center">
            Add New Class
          </Typography>
        </Grid>
        <Grid
          container
          xs={12}
          display="flex"
          flexDirection="row"
          spacing={1}
          sx={{ px: 2 }}
          alignItems="center"
        >
          <Grid item xs={3} sm={3}>
            <IconSelect onSelect={(e) => setIcon(e.target.value)} icon={icon} />
          </Grid>
          <Grid item xs={9} sm={9}>
            <TextField
              fullWidth
              size="small"
              value={title}
              label="Class Title"
              onChange={(e) => setTitle(e.target.value)}
              margin="normal"
              InputProps={{
                style: { height: "47px" },
              }}
              error={title.length > MAX_TITLE_LENGTH}
              helperText={
                title.length > MAX_TITLE_LENGTH ? "Title is too long." : ""
              }
            />
          </Grid>
          <Grid item xs={12} sm={7}>
            <Divider sx={{ mb: 3 }} />
          </Grid>
          <Grid item xs={12} sm={7} display="flex" flexDirection="column">
            <Grid item xs={12}>
              <Typography variant="body" textAlign="left">
                Copy the link from Google Forms
              </Typography>
              <Button
                variant="outlined"
                onClick={showIframeHelpDialog}
                sx={{ ml: 2 }}
              >
                Get Help <HelpOutlineIcon sx={{ ml: 1 }} />
              </Button>
            </Grid>

            <TextField
              fullWidth
              size="small"
              value={googleFormIframe}
              onChange={(e) => setGoogleFormIframe(e.target.value)}
              placeholder="Google Form iframe code"
              margin="normal"
              error={googleFormId === null && googleFormIframe.length > 0}
              helperText={
                googleFormId === null && googleFormIframe.length > 0
                  ? "Invalid iframe code."
                  : ""
              }
            />
          </Grid>
        </Grid>
        <Grid item xs={12} display="flex" flexDirection="row">
          <Grid item xs={4} sm={2}>
            <Button variant="contained" fullWidth onClick={onClose}>
              Cancel
            </Button>
          </Grid>
          <Grid item xs={4} sm={8} />
          <Grid item xs={4} sm={2}>
            <Button
              variant="contained"
              fullWidth
              onClick={() => {
                onCreateSubclass(category.id, icon, title, googleFormId);
                setTitle(""); // Reset after adding
                setGoogleFormIframe(""); // Reset after adding
              }}
              disabled={!isFormValid()}
            >
              Add Class
            </Button>
          </Grid>
        </Grid>
      </Grid>
    </>
  );
};
