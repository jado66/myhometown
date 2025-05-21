// Improved FileInput component to fix multiple file explorer opens
function FileInput({ onChange, accept, "data-test-id": dataTestId, disabled }) {
  const inputRef = useRef(null);

  const handleButtonClick = (e) => {
    // Stop propagation to prevent multiple clicks
    e.stopPropagation();

    if (!disabled && inputRef.current) {
      inputRef.current.click();
    }
  };

  // Prevent the TextField click from triggering if the button was clicked
  const handleTextFieldClick = (e) => {
    // Only proceed if we're not clicking on the button itself
    if (e.target.tagName !== "BUTTON" && !e.target.closest("button")) {
      if (!disabled && inputRef.current) {
        e.stopPropagation();
        inputRef.current.click();
      }
    }
  };

  // Handle the actual file change
  const handleFileChange = (e) => {
    // Stop propagation to prevent the event from bubbling up
    e.stopPropagation();
    onChange(e);
  };

  return (
    <Box sx={{ mb: 2 }}>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        style={{ display: "none" }}
        data-test-id={dataTestId}
        disabled={disabled}
      />
      <TextField
        label="Upload Image"
        variant="outlined"
        fullWidth
        onClick={handleTextFieldClick}
        InputProps={{
          readOnly: true,
          endAdornment: (
            <Button
              variant="contained"
              component="span"
              onClick={handleButtonClick}
              disabled={disabled}
            >
              {disabled ? <CircularProgress size={24} /> : "Browse"}
            </Button>
          ),
        }}
      />
    </Box>
  );
}
