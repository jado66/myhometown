import { Button, Grid } from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';

const createUserColumns = (handleAskDeleteUser, setUserToEdit) => [
    { field: 'id', headerName: 'ID', width: 90, visible: false},
    { field: 'name', headerName: 'Name', width: 250 },
    { field: 'email', headerName: 'Email', width: 250 },
    { field: 'role', headerName: 'Role', width: 150 },
    { field: 'contactNumber', headerName: 'Contact Number', width: 250 },
    {
        field: "actions",
        headerName: "Actions",
        sortable: false,
        width: 200,
        disableClickEventBubbling: true,
        renderCell: (params) => {
            const onClickDelete = () => {
                handleAskDeleteUser(params.row.id);
            };

            const onClickEdit = () => {
                setUserToEdit(params.row);
            };

            return (
                <Grid>
                    <Button 
                        variant="outlined" 
                        size="small" 
                        color="secondary"
                        sx = {{color: "grey"}}
                        onClick={onClickEdit}
                    >
                        Edit
                    </Button>
                    <Button 
                        variant="outlined" 
                        color="error" 
                        size="small"  
                        onClick={onClickDelete}
                        sx = {{marginLeft: 1}}
                    >
                        <DeleteIcon fontSize="small" sx = {{ml:'5px'}} />
                        Delete
                    </Button>
                </Grid>
            );
        },
    },
]

export {createUserColumns};