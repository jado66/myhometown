import React, { useState } from "react";
import {
  Button,
  Grid,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Divider,
  TextField,
} from "@mui/material";

import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { Add, Delete, Edit, Save, Cancel } from "@mui/icons-material";
import { CreateClassForm } from "./CreateClassForm";
import { ExampleIcons, IconSelect } from "./IconSelect";
import { StyledTreeItem } from "./StyledTreeItem";

export const ClassesCategory = ({
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
  onEditClass,
  onUpdateCategory,
}) => {
  const [isAddNewClass, setAddNewClass] = useState(false);
  const [editTitle, setEditTitle] = useState(category.title);
  const [editIcon, setEditIcon] = useState(category.icon);

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
  };

  return (
    <StyledTreeItem
      key={category.id}
      itemId={category.id.toString()}
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
                onChange={(e) => setEditTitle(e.target.value)}
                size="small"
              />
            </Grid>
            <Grid item>
              <Button
                startIcon={<Save />}
                onClick={handleSaveCategory}
                size="small"
              >
                Save
              </Button>
              <Button
                startIcon={<Cancel />}
                onClick={handleCancelEdit}
                size="small"
              >
                Cancel
              </Button>
            </Grid>
          </Grid>
        ) : (
          <div style={{ display: "flex", alignItems: "center" }}>
            {IconWithProps}
            <Typography sx={{ marginLeft: "1em" }} variant="h5">
              {category.title}
            </Typography>
          </div>
        )
      }
    >
      {Array.isArray(category.classes) && category.classes.length > 0
        ? category.classes.map((classObj) => (
            <Accordion key={`accordion-${classObj.id}`} elevation={0}>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                onClick={(event) => event.stopPropagation()}
              >
                {ExampleIcons[classObj.icon]}
                <Typography sx={{ marginLeft: "1em" }}>
                  {classObj.title}
                </Typography>
              </AccordionSummary>
              <AccordionDetails onClick={(event) => event.stopPropagation()}>
                {editingClassId === classObj.id ? (
                  <CreateClassForm
                    category={category}
                    initialData={classObj}
                    onClose={() => onEditClass(null)}
                    onCreateSubclass={(categoryId, icon, title, googleFormId) =>
                      onUpdateSubclass(
                        categoryId,
                        classObj.id,
                        icon,
                        title,
                        googleFormId
                      )
                    }
                    showIframeHelpDialog={showIframeHelpDialog}
                  />
                ) : (
                  <>
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
                      <>
                        <Button
                          startIcon={<Edit />}
                          onClick={() => onEditClass(category.id, classObj.id)}
                          sx={{ my: 1, mx: "auto" }}
                          fullWidth
                        >
                          Edit Class
                        </Button>
                        <Button
                          startIcon={<Delete />}
                          onClick={() =>
                            onDeleteSubclass(category.id, classObj.id)
                          }
                          sx={{ my: 1, mx: "auto" }}
                          fullWidth
                        >
                          Delete Class
                        </Button>
                      </>
                    )}
                  </>
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
                startIcon={<Edit />}
                onClick={() => onEditCategory(category.id)}
                sx={{ my: 1, mx: 1 }}
              >
                Edit Category
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
