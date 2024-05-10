import { OnwersCell } from "../../components/data-tables/CityOrCommunityOwnersCell";
import { Button, Grid } from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';

const createCommunityColumns = (handleAskDeleteCommunity, setCommunityToEdit) => {
return(
    [
        { field: 'id', headerName: 'ID', width: 90},
        { field: 'name', headerName: 'Community Name', width: 150 },
        { field: 'city', headerName: 'City', width: 150 },
        { field: 'state', headerName: 'State', width: 150 },
        {
            field: 'googleCalendarId',
            headerName: 'Google Calendar ID',
            width: 150,
        },
        { 
            field: 'communityOwners', headerName: 'Managers', width: 350,
            renderCell: (params) => <OnwersCell params={params}/>
        },
        {
            field: "actions",
            headerName: "Actions",
            sortable: false,
            width: 200,
            disableClickEventBubbling: true,
            renderCell: (params) => {
                const onClickDelete = () => {
                    handleAskDeleteCommunity(params.row.id);
                };

                const onClickEdit = () => {
                    setCommunityToEdit(params.row);
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
                            Delete
                            <DeleteIcon fontSize="small" sx = {{ml:'5px'}} />
                        </Button>
                    </Grid>
                );
            },
        },
    ]
)}

export {createCommunityColumns};