import {
  TextField,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  OutlinedInput,
  Typography,
  FormControlLabel,
  Checkbox,
  Box,
  Button,
  Dialog,
  DialogTitle,
  IconButton,
  DialogContent,
  Divider,
  Grid,
} from "@mui/material";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { useClassSignup } from "./ClassSignupContext";
import { FieldEditor } from "./FieldEditor";
import { StructuralElementAdder } from "./StructuralElementAdder";
import { AddCircleOutline, Upload } from "@mui/icons-material";
import Close from "@mui/icons-material/Close";
import { ClassMeetings } from "./ClassMeetings";
import { IconSelect } from "@/components/events/ClassesTreeView/IconSelect";
import { useImageUpload } from "@/hooks/use-upload-image";

export function EditClassSignupForm({
  isOpen,
  isNew,
  handleClose,
  showFieldSelector,
}) {
  const {
    classConfig,
    handleClassConfigChange,
    errors,
    fieldOrder,
    formConfig,
    handleFieldUpdate,
    handleRemoveField,
    onDragEnd,
    DAYS_OF_WEEK,
    handleSaveClass,
    handleAddElement,
  } = useClassSignup();

  const { handleFileUpload, loading } = useImageUpload((classBannerUrl) => {
    handleClassConfigChange("classBannerUrl", classBannerUrl);
  });

  return (
    <Dialog
      open={isOpen}
      sx={{ maxWidth: "100%" }}
      PaperProps={{ sx: { maxWidth: 1000, width: "100%" } }}
    >
      <DialogTitle>
        Edit Class Signup Form
        <Stack
          direction="row"
          spacing={2}
          sx={{ position: "absolute", right: 16, top: 16 }}
        >
          <Button aria-label="close" onClick={handleClose} variant="outlined">
            Preview Form
          </Button>
          {isNew && (
            <Button
              aria-label="close"
              onClick={() => {
                handleSaveClass();
                handleClose();
              }}
              variant="contained"
            >
              Create Class
            </Button>
          )}
        </Stack>
      </DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ py: 2 }}>
          <Typography variant="h6">Class Description</Typography>

          <Grid container>
            <Grid item xs={3} sx={{ pr: 1 }}>
              <IconSelect
                onSelect={(e) =>
                  handleClassConfigChange("icon", e.target.value)
                }
                icon={classConfig.icon}
                height="56px"
              />
            </Grid>
            <Grid item xs={9} sx={{ pl: 1 }}>
              <TextField
                fullWidth
                label="Class Name"
                value={classConfig.className}
                onChange={(e) =>
                  handleClassConfigChange("className", e.target.value)
                }
                error={!!errors.className}
                helperText={errors.className}
              />
            </Grid>
          </Grid>

          <Stack direction="row" spacing={2} alignItems="center">
            <Button
              component="label"
              variant="outlined"
              startIcon={<Upload />}
              disabled={loading}
            >
              {loading
                ? "Uploading..."
                : classConfig.classBannerUrl
                ? "Change Image"
                : "Upload Banner Image"}
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={handleFileUpload}
              />
            </Button>
            {classConfig.classBannerUrl && (
              <Button
                variant="outlined"
                color="error"
                onClick={() => handleClassConfigChange("classBannerUrl", null)}
              >
                Remove Image
              </Button>
            )}
          </Stack>
          {/* Helper text for the image saying it should be a banner image with a wide aspect ratio */}
          <Typography variant="subtitle2" color="text.secondary">
            Banner images should have a wide aspect ratio.
          </Typography>

          <TextField
            fullWidth
            multiline
            rows={3}
            label="Class Introduction"
            value={classConfig.description}
            onChange={(e) =>
              handleClassConfigChange("description", e.target.value)
            }
            placeholder="Enter class description here..."
          />

          <Grid container>
            <Grid item xs={6} sx={{ pr: 1 }}>
              <TextField
                fullWidth
                label="Start Date"
                type="date"
                value={classConfig.startDate}
                onChange={(e) =>
                  handleClassConfigChange("startDate", e.target.value)
                }
                InputLabelProps={{ shrink: true }}
                error={!!errors.startDate}
                helperText={errors.startDate}
              />
            </Grid>
            <Grid item xs={6} sx={{ pl: 1 }}>
              <TextField
                fullWidth
                label="End Date"
                type="date"
                value={classConfig.endDate}
                onChange={(e) =>
                  handleClassConfigChange("endDate", e.target.value)
                }
                InputLabelProps={{ shrink: true }}
                error={!!errors.endDate}
                helperText={errors.endDate}
              />
            </Grid>
          </Grid>

          <ClassMeetings
            meetings={classConfig.meetings || []}
            onChange={(meetings) =>
              handleClassConfigChange("meetings", meetings)
            }
          />

          <TextField
            fullWidth
            label="Location"
            value={classConfig.location}
            onChange={(e) =>
              handleClassConfigChange("location", e.target.value)
            }
            error={!!errors.location}
            helperText={errors.location}
          />

          <TextField
            fullWidth
            label="Class Capacity"
            type="number"
            value={classConfig.capacity}
            onChange={(e) =>
              handleClassConfigChange("capacity", e.target.value)
            }
            error={!!errors.capacity}
            helperText={
              errors.capacity || "Optional: Maximum number of students"
            }
          />

          {classConfig.capacity && (
            <FormControlLabel
              control={
                <Checkbox
                  checked={classConfig.showCapacity}
                  onChange={(e) =>
                    handleClassConfigChange("showCapacity", e.target.checked)
                  }
                />
              }
              label="Show Class Capacity"
            />
          )}

          <Divider sx={{ my: 3 }} />

          <Typography variant="h6">Class Signup Form Builder</Typography>
          <Typography variant="subtitle1" fontWeight="bold">
            Drag and drop fields to reorder them. You can change the label on
            the field, mark it as required, and add help text.
          </Typography>

          <DragDropContext onDragEnd={onDragEnd}>
            <Stack
              spacing={2}
              sx={{ p: 2, backgroundColor: "lightgrey", borderRadius: 3 }}
            >
              <Stack direction="row" spacing={2} justifyContent="space-between">
                <Button
                  variant="outlined"
                  startIcon={<AddCircleOutline />}
                  onClick={showFieldSelector}
                  sx={{ backgroundColor: "white" }}
                >
                  Manage Form Fields
                </Button>
                <StructuralElementAdder
                  onAddElement={handleAddElement}
                  existingFields={fieldOrder}
                />
              </Stack>

              <Divider sx={{ my: 3, border: "1px solid white" }} />

              <Droppable droppableId="fields">
                {(provided) => (
                  <Box {...provided.droppableProps} ref={provided.innerRef}>
                    {fieldOrder.map((field, index) => (
                      <Draggable key={field} draggableId={field} index={index}>
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                          >
                            <FieldEditor
                              field={field}
                              config={formConfig[field]}
                              onUpdate={handleFieldUpdate}
                              onRemove={handleRemoveField}
                            />
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </Box>
                )}
              </Droppable>
            </Stack>
          </DragDropContext>
        </Stack>
        <Stack direction="row" justifyContent="flex-end" sx={{ mt: 3 }}>
          {!isNew && (
            <Button
              variant="contained"
              color="error"
              onClick={() => {
                // Add your delete logic here
                handleClose();
              }}
            >
              Delete Class
            </Button>
          )}
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
