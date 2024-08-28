import React, { useState } from "react";
import { Button, Grid, Card, Typography, Divider } from "@mui/material";
import { SimpleTreeView } from "@mui/x-tree-view/SimpleTreeView";
import { Add } from "@mui/icons-material";

import { IframeHelpDialog } from "../IframeHelpDialog";
import { ClassCategory } from "./ClassCategory";
import { CreateCategoryForm } from "./CreateCategoryForm";

export const ClassesTreeView = ({
  classes,
  onCreateClassCategory,
  onCreateSubclass,
  onDeleteClassCategory,
  onDeleteSubclass,
  onUpdateClassCategory,
  onUpdateSubclass,
  shiftDownClassCategory,
  shiftUpClassCategory,
  shiftDownSubclass,
  shiftUpSubclass,
  isEdit,
}) => {
  const [isAddNewCategory, setAddNewCategory] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [editingClassId, setEditingClassId] = useState(null);
  const [isShowIframeHelpDialog, setShowIframeHelpDialog] = useState(false);
  const [expandedItems, setExpandedItems] = useState([]);

  const showIframeHelpDialog = () => setShowIframeHelpDialog(true);
  const hideIframeHelpDialog = () => setShowIframeHelpDialog(false);

  const handleEditCategory = (categoryId) => {
    setEditingCategoryId(categoryId);
  };

  const handleEditClass = (categoryId, classId) => {
    setEditingClassId(classId);
  };

  const handleUpdateCategory = (categoryId, newTitle, newIcon) => {
    onUpdateClassCategory(categoryId, newTitle, newIcon);
    setEditingCategoryId(null);
  };

  const handleUpdateClass = (
    categoryId,
    classId,
    newTitle,
    newIcon,
    newGoogleFormId
  ) => {
    onUpdateSubclass(categoryId, classId, newTitle, newIcon, newGoogleFormId);
    setEditingClassId(null);
  };

  const toggleExpandCategory = (e, categoryId, forceOpen = false) => {
    if (expandedItems === categoryId && !forceOpen) {
      setExpandedItems(null); // Collapse if already expanded
    } else {
      setExpandedItems(categoryId); // Expand otherwise
    }
  };

  if (!classes) {
    return null;
  }

  const renderTreeItems = (category, index) => {
    return (
      <ClassCategory
        key={category.id}
        isEdit={isEdit}
        onToggleExpand={(e, category, forceOpen) =>
          toggleExpandCategory(e, category, forceOpen)
        }
        onDeleteSubclass={onDeleteSubclass}
        onDeleteClassCategory={onDeleteClassCategory}
        onCreateSubclass={onCreateSubclass}
        onUpdateSubclass={handleUpdateClass}
        category={category}
        showIframeHelpDialog={showIframeHelpDialog}
        editingCategoryId={editingCategoryId}
        editingClassId={editingClassId}
        onEditCategory={handleEditCategory}
        onEditClass={handleEditClass}
        onUpdateCategory={handleUpdateCategory}
        shiftUpClassCategory={shiftUpClassCategory}
        shiftDownClassCategory={shiftDownClassCategory}
        shiftUpSubclass={shiftUpSubclass}
        shiftDownSubclass={shiftDownSubclass}
        isFirstCategory={index === 0}
        isLastCategory={index === classes.length - 1}
      />
    );
  };

  return (
    <div id="sign-ups">
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
            expandedItems={expandedItems ? [expandedItems] : []}
          >
            {classes.map((classItem, index) =>
              renderTreeItems(classItem, index)
            )}
            {isAddNewCategory && (
              <CreateCategoryForm
                onClose={() => setAddNewCategory(false)}
                onCreate={onCreateClassCategory}
              />
            )}
            {isEdit && !isAddNewCategory && (
              <>
                <Grid>
                  <Divider sx={{ my: 1 }} />
                </Grid>
                <Grid item xs={12} display="flex" justifyContent="center">
                  <Button
                    startIcon={<Add />}
                    onClick={() => setAddNewCategory(true)}
                    sx={{ my: 1 }}
                    variant="outlined"
                  >
                    Add New Category
                  </Button>
                </Grid>
              </>
            )}
          </SimpleTreeView>
        </Grid>
      </Card>
    </div>
  );
};