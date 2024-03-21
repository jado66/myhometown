import { Button, Grid } from "@mui/material";

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
                        variant="contained" 
                        size="small" 
                        color="info"
                        onClick={onClickEdit}
                    >
                        Edit
                    </Button>
                    <Button 
                        variant="contained" 
                        color="error" 
                        size="small"  
                        onClick={onClickDelete}
                        sx = {{marginLeft: 1}}
                    >
                        Delete
                    </Button>
                </Grid>
            );
        },
    },
]

export {createUserColumns};