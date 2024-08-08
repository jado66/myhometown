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

import { CreateClassForm } from "./CreateClassForm";
import { ExampleIcons, IconSelect } from "./IconSelect";
import { ClassDropdownActions } from "./ClassDropdownActions";

export const ClassSignup = ({
  classObj,
  category,
  onDeleteSubclass,
  onUpdateSubclass,
  shiftUpClass,
  shiftDownClass,
  showIframeHelpDialog,
  isFirstClass,
  isLastClass,
  isEdit,
}) => {
  const [showOptions, setShowOptions] = useState(false);
  const [editingClassId, setEditingClassId] = useState(null);

  const handleEditClass = (id) => {
    setEditingClassId(id);
  };

  const handleCloseEdit = () => {
    setEditingClassId(null);
  };

  const handleUpdateSubclass = (
    categoryId,
    classId,
    icon,
    title,
    googleFormId
  ) => {
    // Implement your subclass update logic here
    handleCloseEdit();
  };

  const content = (
    <>
      {editingClassId === classObj.id ? (
        <CreateClassForm
          category={category}
          initialData={classObj}
          onClose={handleCloseEdit}
          onCreateSubclass={handleUpdateSubclass}
          showIframeHelpDialog={showIframeHelpDialog}
          onUpdateSubclass={onUpdateSubclass}
        />
      ) : (
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
      )}
    </>
  );

  const accordionSummaryContent = (
    <>
      {ExampleIcons[classObj.icon]}
      <Typography sx={{ marginLeft: "1em" }}>{classObj.title}</Typography>

      <Box sx={{ flexGrow: 1 }} />
      {isEdit && showOptions && (
        <ClassDropdownActions
          classObj={classObj}
          categoryId={category.id}
          onEditClass={() => handleEditClass(classObj.id)}
          onDeleteClass={onDeleteSubclass}
          shiftUpClass={shiftUpClass}
          shiftDownClass={shiftDownClass}
          isFirstClass={isFirstClass}
          isLastClass={isLastClass}
        />
      )}
    </>
  );

  return isFirstClass && isLastClass ? (
    <Box
      key={`class-content-${classObj.id}`}
      elevation={0}
      onMouseEnter={() => setShowOptions(true)}
      onMouseLeave={() => setShowOptions(false)}
      sx={{
        display: "flex",
        alignItems: "center",
        mb: 2,
        flexDirection: "column",
      }}
    >
      {isEdit && (
        <Box
          sx={{
            display: "flex",
            mt: 2,
            mr: 4,
            width: "100%",
            justifyContent: "flex-end",
          }}
        >
          <ClassDropdownActions
            classObj={classObj}
            onEditClass={() => handleEditClass(classObj.id)}
            onDeleteClass={onDeleteSubclass}
            shiftUpClass={shiftUpClass}
            shiftDownClass={shiftDownClass}
            isFirstClass={isFirstClass}
            isLastClass={isLastClass}
          />
        </Box>
      )}
      {content}
    </Box>
  ) : (
    <Accordion
      key={`accordion-${classObj.id}`}
      elevation={0}
      onMouseEnter={() => setShowOptions(true)}
      onMouseLeave={() => setShowOptions(false)}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        onClick={(event) => event.stopPropagation()}
        sx={{ display: "flex", alignItems: "center" }}
      >
        {accordionSummaryContent}
      </AccordionSummary>
      <AccordionDetails onClick={(event) => event.stopPropagation()}>
        {content}
      </AccordionDetails>
    </Accordion>
  );
};
