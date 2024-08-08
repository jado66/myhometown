import React, { useState } from "react";
import {
  Button,
  Grid,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  TextField,
  Box,
  ClickAwayListener,
} from "@mui/material";

import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  Add,
  Delete,
  Edit,
  Save,
  Cancel,
  ArrowUpward,
  ArrowDownward,
} from "@mui/icons-material";
import { CreateClassForm } from "./CreateClassForm";
import { ExampleIcons, IconSelect } from "./IconSelect";
import { StyledTreeItem } from "./StyledTreeItem";
import { CategoryDropdownActions } from "./CategoryDropdownActions";
import { ClassSignup } from "./ClassSignup";

export const ClassCategory = ({
  category,
  isEdit,
  onDeleteClassCategory,
  onDeleteSubclass,
  showIframeHelpDialog,
  onCreateSubclass,
  onUpdateSubclass,

  editingCategoryId,
  editingClassId,
  onEditCategory,
  onUpdateCategory,
  shiftUpClassCategory,
  shiftDownClassCategory,
  shiftUpSubclass,
  shiftDownSubclass,
  isFirstCategory,
  isLastCategory,
  onToggleExpand,
}) => {
  const [isAddNewClass, setAddNewClass] = useState(false);
  const [editTitle, setEditTitle] = useState(category.title);
  const [editIcon, setEditIcon] = useState(category.icon);

  const [showOptions, setShowOptions] = useState(false);

  const IconWithProps = React.cloneElement(ExampleIcons[category.icon], {
    sx: { height: 35, width: 35 },
  });

  const isEditing = editingCategoryId === category.id;

  const handleSaveCategory = () => {
    onUpdateCategory(category.id, editTitle, editIcon);
  };

  const handleCancelEdit = () => {
    setEditTitle(category.title);
    setEditIcon(category.icon);
    onEditCategory(null);
    setAddNewClass(false);
    setShowOptions(false);
  };

  const onClickAway = () => {
    handleCancelEdit();
  };

  const forceExpandCategory = () => {
    onToggleExpand(null, category.id.toString(), true);
  };

  return (
    <ClickAwayListener onClickAway={() => {}}>
      <StyledTreeItem
        key={category.id}
        nodeId={category.id.toString()}
        itemId={category.id.toString()}
        onClick={(e) => onToggleExpand(e, category.id.toString(), false)}
        isExpanded={false}
        onMouseEnter={() => setShowOptions(true)}
        onMouseLeave={() => setShowOptions(false)}
        label={
          isEditing ? (
            <Grid container alignItems="center" spacing={2}>
              <Grid item>
                <IconSelect
                  onSelect={(e) => {
                    e.stopPropagation();
                    setEditIcon(e.target.value);
                  }}
                  icon={editIcon}
                />
              </Grid>
              <Grid item xs>
                <TextField
                  fullWidth
                  value={editTitle}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => {
                    setEditTitle(e.target.value);
                    e.stopPropagation(); // Ensure propagation is stopped here
                  }}
                  onKeyDown={(e) => {
                    e.stopPropagation(); // Stop the propagation of the space bar key event
                  }}
                  size="small"
                />
              </Grid>
              <Grid item>
                <Button
                  startIcon={<Cancel />}
                  onClick={handleCancelEdit}
                  size="small"
                >
                  Cancel
                </Button>
                <Button
                  startIcon={<Save />}
                  onClick={handleSaveCategory}
                  size="small"
                >
                  Save
                </Button>
              </Grid>
            </Grid>
          ) : (
            <div style={{ display: "flex", alignItems: "center" }}>
              {IconWithProps}
              <Typography sx={{ marginLeft: "1em" }} variant="h5">
                {category.title}
              </Typography>
              <Box sx={{ flexGrow: 1 }} />
              {isEdit && showOptions && (
                <CategoryDropdownActions
                  category={category}
                  setAddNewClass={setAddNewClass}
                  onEditCategory={onEditCategory}
                  onDeleteClassCategory={onDeleteClassCategory}
                  shiftUpClassCategory={shiftUpClassCategory}
                  shiftDownClassCategory={shiftDownClassCategory}
                  isFirstCategory={isFirstCategory}
                  isLastCategory={isLastCategory}
                  onToggleExpand={forceExpandCategory}
                />
              )}
            </div>
          )
        }
      >
        {Array.isArray(category.classes) &&
          category.classes.length > 0 &&
          category.classes.map((classObj, index) => (
            <ClassSignup
              key={`classname-${classObj.id}`}
              classObj={classObj}
              category={category}
              editingClassId={editingClassId}
              onUpdateSubclass={onUpdateSubclass}
              onDeleteSubclass={onDeleteSubclass}
              shiftUpClass={shiftUpSubclass}
              shiftDownClass={shiftDownSubclass}
              showIframeHelpDialog={showIframeHelpDialog}
              isFirstClass={index === 0}
              isLastClass={index === category.classes.length - 1}
              isEdit={isEdit}
            />
          ))}

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
              <Button
                startIcon={<Add />}
                onClick={() => setAddNewClass(true)}
                variant="outlined"
                sx={{ my: 1, mx: "auto" }}
              >
                Add Class to {category.title}
              </Button>
            </Grid>
          </>
        )}
      </StyledTreeItem>
    </ClickAwayListener>
  );
};
