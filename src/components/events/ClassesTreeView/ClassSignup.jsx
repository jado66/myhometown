import React, { useState, useEffect } from "react";
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
import { MultiLineTypography } from "@/components/MultiLineTypography";

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
  const [localClassObj, setLocalClassObj] = useState(classObj);

  useEffect(() => {
    setLocalClassObj(classObj);
  }, [classObj]);

  useEffect(() => {
    console.log("localClassObj updated:", localClassObj);
  }, [localClassObj]);

  const handleEditClass = (id) => {
    setEditingClassId(id);
  };

  const handleCloseEdit = () => {
    setEditingClassId(null);
  };

  const handleUpdateSubclass = (categoryId, classId, updatedData) => {
    onUpdateSubclass(categoryId, classId, updatedData);
    setLocalClassObj(updatedData);
    handleCloseEdit();
  };

  const renderHeader = () => {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        position="relative"
        sx={{
          px: 1,
          width: "100%",
          height: "100%",
          minHeight: "100px",
          backgroundColor: "transparent",
          mb: 2,
        }}
      >
        <Box
          component="img"
          src={localClassObj.headerImage}
          sx={{
            width: "100%",
            borderRadius: 4,
            height: "auto",
            objectFit: "cover",
            mt: 1,
          }}
        />
      </Box>
    );
  };

  const renderContent = () => {
    console.log("Rendering content. Current classObj:", localClassObj);

    if (editingClassId === localClassObj.id) {
      return (
        <CreateClassForm
          category={category}
          initialData={localClassObj}
          onClose={handleCloseEdit}
          onCreateSubclass={handleUpdateSubclass}
          showIframeHelpDialog={showIframeHelpDialog}
          onUpdateSubclass={onUpdateSubclass}
        />
      );
    } else if (localClassObj.contentType === "information") {
      return <MultiLineTypography text={localClassObj.information} />;
    } else {
      return (
        <>
          <iframe
            src={`https://docs.google.com/forms/d/e/${localClassObj.googleFormId}/viewform?embedded=true`}
            width="100%"
            height="500px"
            frameBorder="0"
            marginHeight="0"
            marginWidth="0"
          >
            Loading…
          </iframe>
        </>
      );
    }
  };

  const accordionSummaryContent = (
    <>
      {ExampleIcons[localClassObj.icon]}
      <Typography sx={{ marginLeft: "1em" }}>{localClassObj.title}</Typography>

      <Box sx={{ flexGrow: 1 }} />
      {isEdit && showOptions && (
        <ClassDropdownActions
          classObj={localClassObj}
          categoryId={category.id}
          onEditClass={() => handleEditClass(localClassObj.id)}
          onDeleteClass={onDeleteSubclass}
          shiftUpClass={shiftUpClass}
          shiftDownClass={shiftDownClass}
          isFirstClass={isFirstClass}
          isLastClass={isLastClass}
        />
      )}
    </>
  );

  return (
    <>
      {/* <Box sx={{ mb: 2, p: 2, border: "1px solid #ccc", borderRadius: "4px" }}>
        <Typography variant="h6">Debug Information:</Typography>
        <pre>{JSON.stringify(localClassObj, null, 2)}</pre>
      </Box> */}

      {isFirstClass && isLastClass ? (
        <Box
          key={`class-content-${localClassObj.id}`}
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
                classObj={localClassObj}
                onEditClass={() => handleEditClass(localClassObj.id)}
                onDeleteClass={onDeleteSubclass}
                shiftUpClass={shiftUpClass}
                shiftDownClass={shiftDownClass}
                isFirstClass={isFirstClass}
                isLastClass={isLastClass}
              />
            </Box>
          )}
          {editingClassId !== localClassObj.id && renderHeader()}
          {renderContent()}
        </Box>
      ) : (
        <Accordion
          key={`accordion-${localClassObj.id}`}
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
            {editingClassId !== localClassObj.id && renderHeader()}

            {renderContent()}
          </AccordionDetails>
        </Accordion>
      )}
    </>
  );
};
