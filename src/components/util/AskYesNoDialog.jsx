import React from 'react';
import { Dialog, DialogTitle, DialogContentText, DialogContent, DialogActions, Button } from '@mui/material';

export default function AskYesNoDialog(props) {

  const { title, description, onConfirm, onCancel, onClose, open } = props;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="confirm-dialog"
    >
      <DialogTitle id="confirm-dialog">{title}</DialogTitle>
      <DialogContent>
        <DialogContentText>{description}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button 
          variant="contained"
          onClick={onCancel} 
          color="secondary"
        >
          No
        </Button>
        <Button 
          variant="contained"
          onClick={onConfirm} 
          color="primary"
          autoFocus
        >
          Yes
        </Button>
      </DialogActions>
    </Dialog>
  );
}
