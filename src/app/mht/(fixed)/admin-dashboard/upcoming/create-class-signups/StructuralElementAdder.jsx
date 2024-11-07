import { Button, Stack, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import TitleIcon from "@mui/icons-material/Title";
import TextFieldsIcon from "@mui/icons-material/TextFields";
import HorizontalRuleIcon from "@mui/icons-material/HorizontalRule";
import { STRUCTURAL_ELEMENTS } from "./AvailableFields";

export const StructuralElementAdder = ({ onAddElement, existingFields }) => {
  const handleAdd = (type) => {
    const newId = generateUniqueId(type, existingFields);
    let newElement;

    switch (type) {
      case "header":
        newElement = {
          ...STRUCTURAL_ELEMENTS.header1,
          content: "New Section",
        };
        break;
      case "text":
        newElement = {
          ...STRUCTURAL_ELEMENTS.textBlock1,
          content: "Enter your text here...",
        };
        break;
      case "divider":
        newElement = { ...STRUCTURAL_ELEMENTS.divider1 };
        break;
    }

    onAddElement(newId, newElement);
  };

  return (
    <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
      <Typography variant="subtitle2" sx={{ mr: 2, alignSelf: "center" }}>
        Add Element:
      </Typography>

      <Button
        startIcon={<TitleIcon />}
        variant="outlined"
        size="small"
        onClick={() => handleAdd("header")}
      >
        Header
      </Button>

      <Button
        startIcon={<TextFieldsIcon />}
        variant="outlined"
        size="small"
        onClick={() => handleAdd("text")}
      >
        Text Block
      </Button>

      <Button
        startIcon={<HorizontalRuleIcon />}
        variant="outlined"
        size="small"
        onClick={() => handleAdd("divider")}
      >
        Divider
      </Button>
    </Stack>
  );
};

export const generateUniqueId = (type, existingFields) => {
  let counter = 1;
  let baseId = type.toLowerCase();
  let newId = `${baseId}${counter}`;

  while (existingFields.includes(newId)) {
    counter++;
    newId = `${baseId}${counter}`;
  }

  return newId;
};
