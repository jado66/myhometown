// ClassDetailTable.jsx
import React, { useState, useCallback, useEffect, useMemo } from "react";
import { DataGrid, GridToolbar, GridActionsCellItem } from "@mui/x-data-grid";
import {
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Tabs,
  Tab,
  Alert,
  Tooltip,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import { toast } from "react-toastify";

// Import utility functions
import {
  formatDate,
  getStudentAttendance,
  getFieldConfig,
  isStructuralElement,
  validateField,
} from "./ClassDetailTable.utils";

// Import dialog components
import TransferDialog from "./TransferDialog";
import StudentFormDialog from "./StudentFormDialog";

const ClassDetailTable = ({
  classData,
  onClose,
  signupLoading,
  onUpdate,
  onAddStudent,
  onRemoveSignup,
  removeSignupLoading,
  cleanedSemesters,
  refetchCommunityData,
}) => {
  // State management
  const [rows, setRows] = useState([]);
  const [waitlistedRows, setWaitlistedRows] = useState([]);
  const [showDialog, setShowDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState("add");
  const [editingStudent, setEditingStudent] = useState(null);
  const [studentData, setStudentData] = useState({});
  const [formErrors, setFormErrors] = useState({});
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [promoteDialogOpen, setPromoteDialogOpen] = useState(false);
  const [studentToPromote, setStudentToPromote] = useState(null);
  const [promoteLoading, setPromoteLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);

  // Transfer-related state
  const [transferDialogOpen, setTransferDialogOpen] = useState(false);
  const [studentToTransfer, setStudentToTransfer] = useState(null);
  const [selectedTargetClass, setSelectedTargetClass] = useState("");
  const [transferLoading, setTransferLoading] = useState(false);
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [classesForTransfer, setClassesForTransfer] = useState([]);
  const [sendTextNotification, setSendTextNotification] = useState(true);

  // Load available classes for transfer
  useEffect(() => {
    const fetchClasses = async () => {
      if (!classData?.communityId) return;

      setLoadingClasses(true);
      try {
        const response = await fetch(
          `/api/database/classes/by-community/${classData.communityId}`
        );
        if (response.ok) {
          const data = await response.json();
          const filteredClasses =
            data.results?.filter((c) => c.id !== classData.id) || [];
          setClassesForTransfer(filteredClasses);
        }
      } catch (error) {
        console.error("Error fetching classes:", error);
      } finally {
        setLoadingClasses(false);
      }
    };

    fetchClasses();
  }, [classData?.communityId, classData?.id]);

  // Update rows when classData changes
  useEffect(() => {
    if (classData?.signups) {
      const enrolled = classData.signups.filter(
        (signup) => !signup.isWaitlisted
      );
      const waitlisted = classData.signups.filter(
        (signup) => signup.isWaitlisted
      );
      setRows(enrolled);
      setWaitlistedRows(waitlisted);
    }
  }, [classData]);

  // Calculate attendance statistics
  const attendanceStats = useMemo(() => {
    if (!classData?.attendance || !Array.isArray(classData.attendance)) {
      return { uniqueCount: 0, totalSessions: 0, attendanceRate: 0 };
    }

    const uniqueStudentIds = new Set(
      classData.attendance
        .filter((record) => record.present === true)
        .map((record) => record.studentId)
    );

    const uniqueDates = new Set(
      classData.attendance.map((record) => record.date)
    );

    return {
      uniqueCount: uniqueStudentIds.size,
      totalSessions: uniqueDates.size,
      attendanceRate:
        rows.length > 0
          ? Math.round((uniqueStudentIds.size / rows.length) * 100)
          : 0,
    };
  }, [classData?.attendance, rows.length]);

  if (!classData || !classData.signupForm || !classData.signups) {
    return null;
  }

  // Calculate enrollment status
  const enrolledCount = rows.length;
  const waitlistedCount = waitlistedRows.length;
  const totalCapacity = parseInt(classData.capacity) || 0;
  const isMainCapacityFull = enrolledCount >= totalCapacity;
  const isWaitlistEnabled = classData.isWaitlistEnabled === true;
  const waitlistCapacity = parseInt(classData.waitlistCapacity) || 0;
  const isWaitlistFull = waitlistedCount >= waitlistCapacity;
  const isCompletelyFull =
    isMainCapacityFull && (!isWaitlistEnabled || isWaitlistFull);
  const hasAvailableCapacity = enrolledCount < totalCapacity;

  // Form validation
  const validateForm = () => {
    const errors = {};
    let isValid = true;

    classData.signupForm.fieldOrder.forEach((fieldKey) => {
      const error = validateField(
        fieldKey,
        studentData[fieldKey],
        classData.signupForm.formConfig
      );
      if (error) {
        errors[fieldKey] = error;
        isValid = false;
      }
    });

    setFormErrors(errors);
    return isValid;
  };

  // Event handlers
  const handleDeleteClick = useCallback(
    (params) => () => {
      const id = params.row.id;
      const studentAttendance = getStudentAttendance(classData, id);

      if (studentAttendance && studentAttendance.count > 0) {
        toast.error("Cannot remove student with attendance records.");
        return;
      }

      setStudentToDelete(id);
      setDeleteConfirmOpen(true);
    },
    [classData]
  );

  const handleConfirmedDelete = async () => {
    if (onRemoveSignup && studentToDelete) {
      const success = await onRemoveSignup(studentToDelete);
      if (success) {
        setRows((prevRows) =>
          prevRows.filter((row) => row.id !== studentToDelete)
        );
        setWaitlistedRows((prevRows) =>
          prevRows.filter((row) => row.id !== studentToDelete)
        );
      }
      setDeleteConfirmOpen(false);
      setStudentToDelete(null);
    }
  };

  const handlePromoteClick = useCallback(
    (id) => () => {
      const student = waitlistedRows.find((row) => row.id === id);
      if (student) {
        setStudentToPromote(student);
        setPromoteDialogOpen(true);
      }
    },
    [waitlistedRows]
  );

  const handleTransferClick = useCallback(
    (id) => () => {
      const student = [...rows, ...waitlistedRows].find((row) => row.id === id);
      if (student) {
        setStudentToTransfer(student);
        setSelectedTargetClass("");
        setSendTextNotification(true); // Reset to default
        setTransferDialogOpen(true);
      }
    },
    [rows, waitlistedRows]
  );

  const handleConfirmedTransfer = async () => {
    if (!studentToTransfer || !selectedTargetClass) return;

    setTransferLoading(true);
    try {
      const response = await fetch(
        `/api/database/classes/${classData.id}/transfer`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            studentId: studentToTransfer.id,
            targetClassId: selectedTargetClass,
            sendTextNotification: sendTextNotification,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Failed to transfer student");
        return;
      }

      // Refetch class data after transfer
      if (typeof onUpdate === "function") {
        await onUpdate();
      }
      refetchCommunityData();

      const targetClassName =
        classesForTransfer.find((c) => c.id === selectedTargetClass)?.title ||
        "the selected class";

      let baseMessage = data.targetClass?.isWaitlisted
        ? `${studentToTransfer.firstName} ${studentToTransfer.lastName} has been transferred to the waitlist of ${targetClassName}.`
        : `${studentToTransfer.firstName} ${studentToTransfer.lastName} has been transferred to ${targetClassName}.`;

      // Add text notification status to the message
      if (sendTextNotification && data.textNotificationSent) {
        baseMessage += " Text notification sent.";
      } else if (sendTextNotification && !data.textNotificationSent) {
        baseMessage += " Text notification failed to send.";
      } else {
        baseMessage += " No text notification sent.";
      }

      toast.success(baseMessage);
    } catch (error) {
      console.error("Error transferring student:", error);
      toast.error("Failed to transfer student. Please try again.");
    } finally {
      setTransferLoading(false);
      setTransferDialogOpen(false);
      setStudentToTransfer(null);
      setSelectedTargetClass("");
      setSendTextNotification(true);
    }
  };

  const handleConfirmedPromote = async () => {
    if (!studentToPromote) return;

    setPromoteLoading(true);
    try {
      const response = await fetch(
        `/api/database/classes/${classData.id}/promote`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ studentId: studentToPromote.id }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to promote student");
      }

      const promotedStudent = { ...studentToPromote, isWaitlisted: false };
      setWaitlistedRows((prev) =>
        prev.filter((row) => row.id !== studentToPromote.id)
      );
      setRows((prev) => [...prev, promotedStudent]);

      toast.success(
        `${studentToPromote.firstName} ${studentToPromote.lastName} has been promoted from the waitlist.`
      );
    } catch (error) {
      console.error("Error promoting student:", error);
      toast.error("Failed to promote student. Please try again.");
    } finally {
      setPromoteLoading(false);
      setPromoteDialogOpen(false);
      setStudentToPromote(null);
    }
  };

  const handleEditClick = useCallback(
    (id) => () => {
      const student =
        rows.find((row) => row.id === id) ||
        waitlistedRows.find((row) => row.id === id);

      if (student) {
        setDialogMode("edit");
        setEditingStudent(student);
        setStudentData({ ...student });
        setShowDialog(true);
      }
    },
    [rows, waitlistedRows]
  );

  const handleAddClick = () => {
    setDialogMode("add");
    setEditingStudent(null);
    setStudentData({});
    setShowDialog(true);
  };

  const handleDialogSubmit = async () => {
    if (validateForm()) {
      if (dialogMode === "add" && onAddStudent) {
        await onAddStudent(studentData);
        setStudentData({});
        setFormErrors({});
        setShowDialog(false);
      } else if (dialogMode === "edit") {
        setEditLoading(true);
        try {
          const response = await fetch(
            `/api/database/classes/${classData.id}/signup/${editingStudent.id}`,
            {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(studentData),
            }
          );

          if (!response.ok) {
            throw new Error("Failed to update student information");
          }

          if (editingStudent.isWaitlisted) {
            setWaitlistedRows((prev) =>
              prev.map((row) =>
                row.id === editingStudent.id
                  ? { ...studentData, id: editingStudent.id }
                  : row
              )
            );
          } else {
            setRows((prev) =>
              prev.map((row) =>
                row.id === editingStudent.id
                  ? { ...studentData, id: editingStudent.id }
                  : row
              )
            );
          }

          toast.success("Student information updated successfully");
        } catch (error) {
          console.error("Error updating student:", error);
          toast.error(
            "Failed to update student information. Please try again."
          );
        } finally {
          setEditLoading(false);
          setShowDialog(false);
          setEditingStudent(null);
          setStudentData({});
          setFormErrors({});
        }
      }
    }
  };

  const handleFieldChange = (fieldKey, value) => {
    setStudentData((prev) => ({ ...prev, [fieldKey]: value }));
    if (formErrors[fieldKey]) {
      setFormErrors((prev) => ({ ...prev, [fieldKey]: null }));
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  const baseColumns = useMemo(
    () =>
      classData.signupForm.fieldOrder
        .filter((fieldKey) => {
          const field = getFieldConfig(
            fieldKey,
            classData.signupForm.formConfig
          );
          return !isStructuralElement(field.type);
        })
        .map((fieldKey) => {
          const field = getFieldConfig(
            fieldKey,
            classData.signupForm.formConfig
          );
          return {
            field: fieldKey,
            headerName: field.label,
            width: 180,
            flex: 1,
            sortable: true,
            valueFormatter:
              field.type === "checkbox"
                ? ({ value }) => (value ? "Yes" : "No")
                : undefined,
          };
        }),
    [classData.signupForm]
  );

  // Add actions column for enrolled students
  const enrolledColumns = useMemo(
    () => [
      ...baseColumns,
      {
        field: "attendance",
        headerName: "Attendance",
        width: 130,
        flex: 1,
        renderCell: (params) => {
          const studentAttendance = getStudentAttendance(
            classData,
            params.row.id
          );
          return (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography variant="body2">
                {studentAttendance.count}{" "}
                {studentAttendance.count === 1 ? "session" : "sessions"}
              </Typography>
              {studentAttendance.count > 0 && (
                <Tooltip
                  title={`Last attended: ${formatDate(
                    studentAttendance.lastAttended
                  )}`}
                >
                  <EventAvailableIcon fontSize="small" color="primary" />
                </Tooltip>
              )}
            </Box>
          );
        },
        sortable: true,
        valueGetter: (params) => {
          return getStudentAttendance(classData, params.row.id).count;
        },
      },
      {
        field: "createdAt",
        headerName: "Sign Up Date",
        width: 220,
        flex: 1,
        valueFormatter: ({ value }) => {
          const date = new Date(value);
          const day = String(date.getUTCDate()).padStart(2, "0");
          const month = String(date.getUTCMonth() + 1).padStart(2, "0");
          const year = date.getUTCFullYear();
          return `${month}/${day}/${year} `;
        },
      },
      {
        field: "actions",
        type: "actions",
        headerName: "Actions",
        width: 140,
        getActions: (params) => [
          <GridActionsCellItem
            key="edit"
            icon={<EditIcon />}
            label="Edit Student"
            onClick={handleEditClick(params.id)}
            disabled={editLoading}
          />,
          <GridActionsCellItem
            key="transfer"
            icon={<SwapHorizIcon />}
            label="Transfer to Another Class"
            onClick={handleTransferClick(params.id)}
            disabled={transferLoading}
          />,
          <GridActionsCellItem
            key="delete"
            icon={<DeleteIcon />}
            label="Remove Student"
            onClick={handleDeleteClick(params)}
            disabled={removeSignupLoading}
          />,
        ],
      },
    ],
    [
      baseColumns,
      handleEditClick,
      handleDeleteClick,
      handleTransferClick,
      removeSignupLoading,
      editLoading,
      transferLoading,
      classData,
    ]
  );

  // Add actions column for waitlisted students with promote option
  const waitlistColumns = useMemo(
    () => [
      ...baseColumns,
      {
        field: "attendance",
        headerName: "Attendance",
        width: 130,
        flex: 1,
        renderCell: (params) => {
          const studentAttendance = getStudentAttendance(
            classData,
            params.row.id
          );
          return (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography variant="body2">
                {studentAttendance.count}{" "}
                {studentAttendance.count === 1 ? "session" : "sessions"}
              </Typography>
              {studentAttendance.count > 0 && (
                <Tooltip
                  title={`Last attended: ${formatDate(
                    studentAttendance.lastAttended
                  )}`}
                >
                  <EventAvailableIcon fontSize="small" color="primary" />
                </Tooltip>
              )}
            </Box>
          );
        },
        sortable: true,
        valueGetter: (params) => {
          return getStudentAttendance(classData, params.row.id).count;
        },
      },
      {
        field: "createdAt",
        headerName: "Sign Up Date",
        width: 220,
        flex: 1,
        valueFormatter: ({ value }) => {
          const date = new Date(value);
          const day = String(date.getUTCDate()).padStart(2, "0");
          const month = String(date.getUTCMonth() + 1).padStart(2, "0");
          const year = date.getUTCFullYear();
          return `${month}/${day}/${year} `;
        },
      },
      {
        field: "actions",
        type: "actions",
        headerName: "Actions",
        width: 180,
        getActions: (params) => [
          <GridActionsCellItem
            key="promote"
            icon={<PersonAddIcon />}
            label="Promote to Class"
            onClick={handlePromoteClick(params.id)}
            disabled={promoteLoading || !hasAvailableCapacity}
            showInMenu={false}
          />,
          <GridActionsCellItem
            key="transfer"
            icon={<SwapHorizIcon />}
            label="Transfer to Another Class"
            onClick={handleTransferClick(params.id)}
            disabled={transferLoading}
            showInMenu={false}
          />,
          <GridActionsCellItem
            key="edit"
            icon={<EditIcon />}
            label="Edit Student"
            onClick={handleEditClick(params.id)}
            disabled={editLoading}
            showInMenu={false}
          />,
          <GridActionsCellItem
            key="delete"
            icon={<DeleteIcon />}
            label="Remove Student"
            onClick={handleDeleteClick(params)}
            disabled={removeSignupLoading}
            showInMenu={false}
          />,
        ],
      },
    ],
    [
      baseColumns,
      handlePromoteClick,
      handleEditClick,
      handleDeleteClick,
      handleTransferClick,
      removeSignupLoading,
      promoteLoading,
      editLoading,
      transferLoading,
      hasAvailableCapacity,
      classData,
    ]
  );

  return (
    <>
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={() => {
          setDeleteConfirmOpen(false);
          setStudentToDelete(null);
        }}
      >
        <DialogTitle>Confirm Removal</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to remove this student from the class?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setDeleteConfirmOpen(false);
              setStudentToDelete(null);
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmedDelete}
            color="error"
            variant="contained"
            disabled={removeSignupLoading}
          >
            {removeSignupLoading ? "Removing..." : "Remove Student"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Transfer Student Dialog */}
      <TransferDialog
        open={transferDialogOpen}
        onClose={() => {
          setTransferDialogOpen(false);
          setStudentToTransfer(null);
          setSelectedTargetClass("");
          setSendTextNotification(true);
        }}
        studentToTransfer={studentToTransfer}
        classData={classData}
        classesForTransfer={classesForTransfer}
        selectedTargetClass={selectedTargetClass}
        setSelectedTargetClass={setSelectedTargetClass}
        onConfirm={handleConfirmedTransfer}
        transferLoading={transferLoading}
        loadingClasses={loadingClasses}
        cleanedSemesters={cleanedSemesters}
        sendTextNotification={sendTextNotification}
        setSendTextNotification={setSendTextNotification}
      />

      {/* Promote Confirmation Dialog */}
      <Dialog
        open={promoteDialogOpen}
        onClose={() => {
          setPromoteDialogOpen(false);
          setStudentToPromote(null);
        }}
      >
        <DialogTitle>Promote from Waitlist</DialogTitle>
        <DialogContent>
          {studentToPromote && (
            <>
              <Typography>
                Are you sure you want to promote {studentToPromote.firstName}{" "}
                {studentToPromote.lastName} from the waitlist to the class?
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                This will add the student to the enrolled roster and remove them
                from the waitlist.
              </Typography>

              {!hasAvailableCapacity && (
                <Alert severity="warning" sx={{ mt: 2 }}>
                  Warning: The class is already at full capacity. Promoting this
                  student will exceed the set capacity limit.
                </Alert>
              )}
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setPromoteDialogOpen(false);
              setStudentToPromote(null);
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmedPromote}
            color="primary"
            variant="contained"
            disabled={promoteLoading}
          >
            {promoteLoading ? "Promoting..." : "Promote Student"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Main Content */}
      <Box sx={{ mb: 3 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Typography variant="h6">Class Roster</Typography>

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddClick}
            disabled={signupLoading || isCompletelyFull}
          >
            {isCompletelyFull
              ? "Class is Full"
              : isMainCapacityFull && isWaitlistEnabled
              ? "Add to Waitlist"
              : signupLoading
              ? "Adding..."
              : "Add Student"}
          </Button>
        </Box>

        {/* Class capacity and attendance information */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Enrolled: {enrolledCount}
            {classData.capacity ? `/${totalCapacity}` : ""}{" "}
            {enrolledCount === 1 ? "student" : "students"}
            {isWaitlistEnabled &&
              ` • Waitlist: ${waitlistedCount}/${waitlistCapacity}`}
            {" • "}
            <Tooltip title="Number of unique students who have attended at least one session">
              <Box component="span">
                Attended: {attendanceStats.uniqueCount} students (
                {attendanceStats.attendanceRate}% of enrolled)
              </Box>
            </Tooltip>
            {attendanceStats.totalSessions > 0 &&
              ` • Total sessions: ${attendanceStats.totalSessions}`}
          </Typography>
        </Box>

        {/* Tab navigation */}
        {classData.capacity && (
          <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              aria-label="roster tabs"
            >
              <Tab
                label={`Enrolled Students (${enrolledCount})`}
                id="tab-0"
                aria-controls="tabpanel-0"
              />
              {isWaitlistEnabled && (
                <Tab
                  label={`Waitlist (${waitlistedCount})`}
                  id="tab-1"
                  aria-controls="tabpanel-1"
                />
              )}
            </Tabs>
          </Box>
        )}
      </Box>

      {/* Regular enrollment table */}
      <div
        role="tabpanel"
        hidden={tabValue !== 0}
        id="tabpanel-0"
        aria-labelledby="tab-0"
      >
        {tabValue === 0 && (
          <Paper sx={{ height: 600, width: "100%" }}>
            <DataGrid
              rows={rows}
              columns={enrolledColumns}
              pageSize={10}
              rowsPerPageOptions={[5, 10, 25]}
              checkboxSelection={false}
              disableSelectionOnClick
              components={{
                Toolbar: GridToolbar,
              }}
              componentsProps={{
                toolbar: {
                  showQuickFilter: true,
                  quickFilterProps: { debounceMs: 500 },
                },
              }}
              density="comfortable"
              initialState={{
                sorting: {
                  sortModel: [
                    { field: classData.signupForm.fieldOrder[0], sort: "asc" },
                  ],
                },
              }}
            />
          </Paper>
        )}
      </div>

      {/* Waitlist table */}
      {isWaitlistEnabled && (
        <div
          role="tabpanel"
          hidden={tabValue !== 1}
          id="tabpanel-1"
          aria-labelledby="tab-1"
        >
          {tabValue === 1 && (
            <>
              {!hasAvailableCapacity && waitlistedRows.length > 0 && (
                <Alert severity="info" sx={{ mb: 2 }}>
                  The class is currently at capacity. Free up space by removing
                  students from the enrolled list before promoting from the
                  waitlist.
                </Alert>
              )}
              <Paper sx={{ height: 600, width: "100%" }}>
                <DataGrid
                  rows={waitlistedRows}
                  columns={waitlistColumns}
                  pageSize={10}
                  rowsPerPageOptions={[5, 10, 25]}
                  checkboxSelection={false}
                  disableSelectionOnClick
                  components={{
                    Toolbar: GridToolbar,
                  }}
                  componentsProps={{
                    toolbar: {
                      showQuickFilter: true,
                      quickFilterProps: { debounceMs: 500 },
                    },
                  }}
                  density="comfortable"
                  initialState={{
                    sorting: {
                      sortModel: [
                        {
                          field: classData.signupForm.fieldOrder[0],
                          sort: "asc",
                        },
                      ],
                    },
                  }}
                />
              </Paper>
            </>
          )}
        </div>
      )}

      {/* Student Form Dialog */}
      <StudentFormDialog
        open={showDialog}
        onClose={() => {
          setShowDialog(false);
          setStudentData({});
          setFormErrors({});
          setEditingStudent(null);
        }}
        dialogMode={dialogMode}
        editingStudent={editingStudent}
        studentData={studentData}
        formErrors={formErrors}
        classData={classData}
        isMainCapacityFull={isMainCapacityFull}
        isWaitlistEnabled={isWaitlistEnabled}
        onSubmit={handleDialogSubmit}
        onFieldChange={handleFieldChange}
        signupLoading={signupLoading}
        editLoading={editLoading}
      />
    </>
  );
};

export default ClassDetailTable;
