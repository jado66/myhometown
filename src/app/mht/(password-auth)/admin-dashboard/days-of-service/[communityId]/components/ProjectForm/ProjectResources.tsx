"use client";

import React, { useState } from "react";
import {
  Typography,
  TextField,
  Chip,
  Box,
  Divider,
  FormHelperText,
  Tooltip,
  Paper,
  SvgIcon,
} from "@mui/material";
import { Info } from "@mui/icons-material";
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
} from "react-beautiful-dnd";

interface ResourceItem {
  name: string;
  isPrepDay?: boolean;
  id: string; // Unique ID for drag and drop
}

type ResourceCategory =
  | "tools"
  | "equipment"
  | "homeownerMaterials"
  | "otherMaterials";

interface FormData {
  volunteerTools: string | ResourceItem[];
  equipment: string | ResourceItem[];
  homeownerMaterials: string | ResourceItem[];
  otherMaterials: string | ResourceItem[];
}

interface ProjectResourcesProps {
  formData: FormData;
  handleInputChange: (fieldName: string, value: any) => void;
  hasPrepDay?: boolean;
  isLocked: boolean;
}

interface ResourceSection {
  title: string;
  items: string | ResourceItem[];
  placeholder: string;
  category: ResourceCategory;
  fieldName: keyof FormData;
}

const DragHandle = () => (
  <SvgIcon
    sx={{
      cursor: "grab",
      "&:hover": {
        color: "primary.main",
      },
    }}
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="32"
      height="32"
      viewBox="0 0 32 32"
    >
      <path
        fill="currentColor"
        d="M4 20h11v6.17l-2.59-2.58L11 25l5 5l5-5l-1.41-1.41L17 26.17V20h11v-2H4zm7-13l1.41 1.41L15 5.83V12H4v2h24v-2H17V5.83l2.59 2.58L21 7l-5-5z"
      />
    </svg>
  </SvgIcon>
);

export function ProjectResources({
  formData,
  handleInputChange,
  hasPrepDay = false,
  isLocked,
}: ProjectResourcesProps) {
  // State to manage the current input values for both regular and prep day inputs
  const [inputValues, setInputValues] = useState<Record<string, string>>({
    // Regular inputs
    tools: "",
    equipment: "",
    homeownerMaterials: "",
    otherMaterials: "",
    // Prep day inputs
    "tools-prepDay": "",
    "equipment-prepDay": "",
    "homeownerMaterials-prepDay": "",
    "otherMaterials-prepDay": "",
  });

  const sections: ResourceSection[] = [
    {
      title: "Volunteer Tools",
      items: formData.volunteerTools,
      placeholder: "Enter tools",
      category: "tools",
      fieldName: "volunteerTools",
    },
    {
      title: "Equipment",
      items: formData.equipment,
      placeholder: "Enter equipment",
      category: "equipment",
      fieldName: "equipment",
    },
    {
      title: "Materials provided by Homeowner",
      items: formData.homeownerMaterials,
      placeholder: "Enter materials",
      category: "homeownerMaterials",
      fieldName: "homeownerMaterials",
    },
    {
      title: "Other Materials provided",
      items: formData.otherMaterials,
      placeholder: "Enter materials",
      category: "otherMaterials",
      fieldName: "otherMaterials",
    },
  ];

  // Helper function to normalize items to an array of ResourceItem objects with IDs
  const normalizeItems = (items: string | ResourceItem[]): ResourceItem[] => {
    if (Array.isArray(items)) {
      return items.map((item, index) => {
        if (typeof item === "string") {
          return { name: item, isPrepDay: false, id: `item-${index}-${item}` };
        }
        // Ensure each item has an ID
        return { ...item, id: item.id || `item-${index}-${item.name}` };
      });
    }
    if (typeof items === "string") {
      try {
        const parsed = JSON.parse(items);
        if (Array.isArray(parsed)) {
          return parsed.map((item, index) => {
            if (typeof item === "string") {
              return {
                name: item,
                isPrepDay: false,
                id: `item-${index}-${item}`,
              };
            }
            return { ...item, id: item.id || `item-${index}-${item.name}` };
          });
        }
        return [];
      } catch (e) {
        return [];
      }
    }
    return [];
  };

  const handleDelete = (category: ResourceCategory, itemId: string) => {
    const categoryMap: Record<ResourceCategory, keyof FormData> = {
      tools: "volunteerTools",
      equipment: "equipment",
      homeownerMaterials: "homeownerMaterials",
      otherMaterials: "otherMaterials",
    };

    const fieldName = categoryMap[category];
    const currentItems = normalizeItems(formData[fieldName]);
    const newItems = currentItems.filter((item) => item.id !== itemId);
    handleInputChange(fieldName, newItems);
  };

  // Handle input change for text fields
  const handleInputValueChange = (inputKey: string, value: string) => {
    setInputValues((prev) => ({
      ...prev,
      [inputKey]: value,
    }));
  };

  // Process comma-separated input and add items
  const handleCommaInput = (
    e: any,
    category: ResourceCategory,
    isPrepDay: boolean
  ) => {
    if (e.key !== "Enter") return;

    e.preventDefault();
    const value = (e.target as HTMLInputElement).value.trim();

    if (!value) return;

    // Split by commas and filter out empty strings
    const newItems = value
      .split(",")
      .map((item) => item.trim())
      .filter((item) => item !== "");

    const categoryMap: Record<ResourceCategory, keyof FormData> = {
      tools: "volunteerTools",
      equipment: "equipment",
      homeownerMaterials: "homeownerMaterials",
      otherMaterials: "otherMaterials",
    };

    const fieldName = categoryMap[category];
    const currentItems = normalizeItems(formData[fieldName]);

    // Generate unique IDs for new items
    const timestamp = Date.now();
    const itemsToAdd = newItems.map((item, index) => ({
      name: item,
      isPrepDay: isPrepDay, // Set isPrepDay based on which input was used
      id: `item-${timestamp}-${index}-${item}`,
    }));

    handleInputChange(fieldName, [...currentItems, ...itemsToAdd]);

    // Clear the input field
    const inputKey = isPrepDay ? `${category}-prepDay` : category;
    setInputValues((prev) => ({
      ...prev,
      [inputKey]: "",
    }));
  };

  // Handle drag end event
  const handleDragEnd = (result: DropResult, category: ResourceCategory) => {
    const { source, destination } = result;

    // If dropped outside a droppable area
    if (!destination) return;

    // If dropped in the same place
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    )
      return;

    const categoryMap: Record<ResourceCategory, keyof FormData> = {
      tools: "volunteerTools",
      equipment: "equipment",
      homeownerMaterials: "homeownerMaterials",
      otherMaterials: "otherMaterials",
    };

    const fieldName = categoryMap[category];
    const currentItems = normalizeItems(formData[fieldName]);

    // Filter items by prep day status
    const regularItems = currentItems.filter((item) => !item.isPrepDay);
    const prepDayItems = currentItems.filter((item) => item.isPrepDay);

    let updatedItems: ResourceItem[];

    // Handle moving between regular and prep day lists
    if (source.droppableId !== destination.droppableId) {
      let movedItem: ResourceItem;

      // Moving from regular to prep day
      if (source.droppableId === `${category}-regular`) {
        movedItem = { ...regularItems[source.index], isPrepDay: true };
        regularItems.splice(source.index, 1);
        prepDayItems.splice(destination.index, 0, movedItem);
      }
      // Moving from prep day to regular
      else {
        movedItem = { ...prepDayItems[source.index], isPrepDay: false };
        prepDayItems.splice(source.index, 1);
        regularItems.splice(destination.index, 0, movedItem);
      }

      updatedItems = [...regularItems, ...prepDayItems];
    }
    // Handle reordering within the same list
    else {
      const items =
        source.droppableId === `${category}-regular`
          ? [...regularItems]
          : [...prepDayItems];
      const [movedItem] = items.splice(source.index, 1);
      items.splice(destination.index, 0, movedItem);

      if (source.droppableId === `${category}-regular`) {
        updatedItems = [...items, ...prepDayItems];
      } else {
        updatedItems = [...regularItems, ...items];
      }
    }

    handleInputChange(fieldName, updatedItems);
  };

  // Filter items by prep day status
  const filterItemsByPrepDay = (
    items: ResourceItem[],
    isPrepDay: boolean
  ): ResourceItem[] => {
    return items.filter((item) => !!item.isPrepDay === isPrepDay);
  };

  return (
    <Paper elevation={0} sx={{ p: 2 }}>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {sections.map((section, sectionIndex) => {
          const items = normalizeItems(section.items);
          const regularItems = hasPrepDay
            ? filterItemsByPrepDay(items, false)
            : items;
          const prepDayItems = hasPrepDay
            ? filterItemsByPrepDay(items, true)
            : [];

          return (
            <React.Fragment key={section.category}>
              {sectionIndex > 0 && <Divider sx={{ my: 1 }} />}
              <Box>
                <Typography variant="subtitle1" sx={{ mb: 1 }}>
                  {section.title}
                </Typography>

                {hasPrepDay ? (
                  <DragDropContext
                    onDragEnd={(result) =>
                      handleDragEnd(result, section.category)
                    }
                  >
                    {/* Regular items droppable area */}
                    <Droppable
                      droppableId={`${section.category}-regular`}
                      direction="horizontal"
                    >
                      {(provided, snapshot) => (
                        <Box
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          sx={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: 1,
                            minHeight: 40,
                            p: 1,
                            mb: 2,
                            backgroundColor: snapshot.isDraggingOver
                              ? "rgba(144, 249, 153, 0.2)"
                              : "transparent",
                            borderRadius: 1,
                            border:
                              !isLocked && "1px dashed rgba(0, 0, 0, 0.12)",
                          }}
                        >
                          {regularItems.length > 0
                            ? items.map((item, index) => (
                                <Draggable
                                  key={item.id}
                                  draggableId={item.id}
                                  index={index}
                                >
                                  {(provided, snapshot) => (
                                    <Box
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      sx={{
                                        display: "inline-flex",
                                        transform: snapshot.isDragging
                                          ? "rotate(5deg)"
                                          : "none !important",
                                        zIndex: snapshot.isDragging ? 9999 : 1,
                                      }}
                                    >
                                      <Chip
                                        label={
                                          <Box
                                            sx={{
                                              display: "flex",
                                              alignItems: "center",
                                            }}
                                          >
                                            {!isLocked && (
                                              <Box
                                                {...provided.dragHandleProps}
                                                sx={{
                                                  display: "flex",
                                                  mr: 0.5,
                                                  cursor: "grab",
                                                  color: "text.secondary",
                                                  "&:hover": {
                                                    color: "text.primary",
                                                  },
                                                }}
                                              >
                                                <DragHandle />
                                              </Box>
                                            )}
                                            {item.name}
                                          </Box>
                                        }
                                        onDelete={
                                          isLocked
                                            ? undefined
                                            : () =>
                                                handleDelete(
                                                  section.category,
                                                  item.id
                                                )
                                        }
                                        size="small"
                                        sx={{
                                          height: "auto",
                                          py: 0.5,
                                          backgroundColor: snapshot.isDragging
                                            ? "rgba(144, 249, 153, 0.2)"
                                            : undefined,
                                        }}
                                      />
                                    </Box>
                                  )}
                                </Draggable>
                              ))
                            : isLocked
                            ? "None"
                            : ""}
                          {provided.placeholder}

                          {/* Input field for regular items */}
                          {!isLocked && (
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                                mt: regularItems.length > 0 ? 1 : 0,
                              }}
                            >
                              <TextField
                                size="small"
                                variant="outlined"
                                placeholder={section.placeholder}
                                value={inputValues[section.category]}
                                onChange={(e) =>
                                  handleInputValueChange(
                                    section.category,
                                    e.target.value
                                  )
                                }
                                onKeyDown={(e) =>
                                  handleCommaInput(e, section.category, false)
                                }
                                sx={{ minWidth: 150 }}
                                inputProps={{
                                  "aria-label": `Add ${section.title.toLowerCase()}`,
                                }}
                              />

                              {inputValues[section.category] && (
                                <FormHelperText
                                  sx={{
                                    m: 0,
                                    color: "error.main",
                                    display: "flex",
                                    alignItems: "center",
                                  }}
                                >
                                  <Info fontSize="small" sx={{ mr: 0.5 }} />
                                  Press Enter to add
                                </FormHelperText>
                              )}
                            </Box>
                          )}
                        </Box>
                      )}
                    </Droppable>

                    {/* Prep day items droppable area */}
                    {(prepDayItems.length > 0 || !isLocked) && (
                      <Droppable
                        droppableId={`${section.category}-prepDay`}
                        direction="horizontal"
                      >
                        {(provided, snapshot) => (
                          <Box
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                            sx={{
                              display: "flex",
                              flexWrap: "wrap",
                              gap: 1,
                              minHeight: 40,
                              p: 1,
                              mb: 2,
                              backgroundColor: snapshot.isDraggingOver
                                ? "rgba(144, 249, 153, 0.3)"
                                : "rgba(144, 249, 153, 0.2)",
                              borderRadius: 1,
                              border:
                                !isLocked &&
                                "1px dashed rgba(144, 202, 249, 0.5)",
                            }}
                          >
                            <Typography
                              variant="caption"
                              sx={{
                                width: "100%",
                                mb: 0.5,
                                color: "text.secondary",
                              }}
                            >
                              Prep Day Items
                            </Typography>

                            {prepDayItems.map((item, index) => (
                              <Draggable
                                key={item.id}
                                draggableId={item.id}
                                index={index}
                              >
                                {(provided, snapshot) => (
                                  <Box
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    sx={{
                                      display: "inline-flex",
                                      transform: snapshot.isDragging
                                        ? "rotate(5deg)"
                                        : "none !important",
                                      zIndex: snapshot.isDragging ? 9999 : 1,
                                    }}
                                  >
                                    <Chip
                                      label={
                                        <Box
                                          sx={{
                                            display: "flex",
                                            alignItems: "center",
                                          }}
                                        >
                                          {!isLocked && (
                                            <Box
                                              {...provided.dragHandleProps}
                                              sx={{
                                                display: "flex",
                                                mr: 0.5,
                                                cursor: "grab",
                                                color: "text.secondary",
                                                "&:hover": {
                                                  color: "text.primary",
                                                },
                                              }}
                                            >
                                              <DragHandle />
                                            </Box>
                                          )}
                                          {item.name}
                                        </Box>
                                      }
                                      onDelete={
                                        isLocked
                                          ? undefined
                                          : () =>
                                              handleDelete(
                                                section.category,
                                                item.id
                                              )
                                      }
                                      size="small"
                                      sx={{
                                        height: "auto",
                                        py: 0.5,
                                        backgroundColor: snapshot.isDragging
                                          ? "rgba(144, 249, 153, 0.2)"
                                          : "rgba(144, 249, 153, 0.3)",
                                      }}
                                    />
                                  </Box>
                                )}
                              </Draggable>
                            ))}
                            {provided.placeholder}

                            {/* Input field for prep day items */}
                            {!isLocked && (
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 1,
                                  mt: prepDayItems.length > 0 ? 1 : 0,
                                }}
                              >
                                <TextField
                                  size="small"
                                  variant="outlined"
                                  placeholder={`Prep day ${section.placeholder.toLowerCase()}`}
                                  value={
                                    inputValues[`${section.category}-prepDay`]
                                  }
                                  onChange={(e) =>
                                    handleInputValueChange(
                                      `${section.category}-prepDay`,
                                      e.target.value
                                    )
                                  }
                                  onKeyDown={(e) =>
                                    handleCommaInput(e, section.category, true)
                                  }
                                  sx={{ minWidth: 150 }}
                                  inputProps={{
                                    "aria-label": `Add prep day ${section.title.toLowerCase()}`,
                                  }}
                                />
                                {inputValues[`${section.category}-prepDay`] && (
                                  <FormHelperText
                                    sx={{
                                      m: 0,
                                      color: "error.main",
                                      display: "flex",
                                      alignItems: "center",
                                    }}
                                  >
                                    <Info fontSize="small" sx={{ mr: 0.5 }} />
                                    Press Enter to add
                                  </FormHelperText>
                                )}
                              </Box>
                            )}
                          </Box>
                        )}
                      </Droppable>
                    )}
                  </DragDropContext>
                ) : (
                  // Non-draggable version when hasPrepDay is false
                  <Box
                    sx={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 1,
                      mb: 2,
                      p: 1,
                      minHeight: 40,
                      borderRadius: 1,
                      border: !isLocked && "1px dashed rgba(0, 0, 0, 0.12)",
                    }}
                  >
                    {items.length > 0
                      ? items.map((item) => (
                          <Chip
                            key={item.id}
                            label={item.name}
                            onDelete={
                              isLocked
                                ? undefined
                                : () => handleDelete(section.category, item.id)
                            }
                            size="small"
                            sx={{
                              height: "auto",
                              py: 0.5,
                            }}
                          />
                        ))
                      : isLocked
                      ? "None"
                      : ""}

                    {/* Input field for non-prep day mode */}
                    {!isLocked && (
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          mt: items.length > 0 ? 1 : 0,
                        }}
                      >
                        <TextField
                          size="small"
                          variant="outlined"
                          placeholder={section.placeholder}
                          value={inputValues[section.category]}
                          onChange={(e) =>
                            handleInputValueChange(
                              section.category,
                              e.target.value
                            )
                          }
                          onKeyDown={(e) =>
                            handleCommaInput(e, section.category, false)
                          }
                          sx={{ minWidth: 150 }}
                          inputProps={{
                            "aria-label": `Add ${section.title.toLowerCase()}`,
                          }}
                        />
                        {inputValues[section.category] && (
                          <FormHelperText
                            sx={{
                              m: 0,
                              color: "error.main",
                              display: "flex",
                              alignItems: "center",
                            }}
                          >
                            <Info fontSize="small" sx={{ mr: 0.5 }} />
                            Press Enter to add
                          </FormHelperText>
                        )}
                      </Box>
                    )}
                  </Box>
                )}
              </Box>
            </React.Fragment>
          );
        })}
      </Box>
    </Paper>
  );
}
