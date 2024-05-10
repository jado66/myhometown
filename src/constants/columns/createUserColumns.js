import { Button, Grid } from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';
import { CityOrCommunityCell } from "@/components/data-tables/CityOrCommunityCell";

const createUserColumns = (handleAskDeleteUser, setUserToEdit) => [
    { field: 'id', headerName: 'ID', width: 300, visible: false},
    { field: 'name', headerName: 'Name', width: 200 },
    { field: 'email', headerName: 'Email', width: 225 },
    { field: 'role', headerName: 'Role', width: 175 },
    { field: 'contactNumber', headerName: 'Contact Number', width: 200 },
    { 
        field: 'cities', headerName: 'Cities', width: 350,visible: false,
        renderCell: (params) => <CityOrCommunityCell params={params} type='city'/>
    },
    { 
        field: 'communities', headerName: 'Communities', width: 350,visible: false,
        renderCell: (params) => <CityOrCommunityCell params={params}  type='community'/>
    },
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