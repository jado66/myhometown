import React, { useState } from "react";
import { Button, Grid, Card, Typography, TextField } from "@mui/material";
import { SimpleTreeView } from "@mui/x-tree-view/SimpleTreeView";
import { Add, Edit } from "@mui/icons-material";

import { IframeHelpDialog } from "../IframeHelpDialog";
import { ClassesCategory } from "./ClassCategories";
import { CreateCategoryForm } from "./CreateCategoryForm";

export const ClassesTreeView = ({
  classes,
  onCreateClassCategory,
  onCreateSubclass,
  onDeleteClassCategory,
  onDeleteSubclass,
  onUpdateClassCategory,
  onUpdateSubclass,
  isEdit,
}) => {
  const [isAddNewCategory, setAddNewCategory] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [editingClassId, setEditingClassId] = useState(null);
  const [isShowIframeHelpDialog, setShowIframeHelpDialog] = useState(false);

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

  if (!classes) {
    return null;
  }

  const renderTreeItems = (category) => {
    return (
      <ClassesCategory
        key={category.id}
        isEdit={isEdit}
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
