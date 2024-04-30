import { Button, Grid } from "@mui/material";
import { OnwersCell } from "../../components/data-tables/CityOrCommunityOwnersCell";
import DeleteIcon from '@mui/icons-material/Delete';

const createCityColumns = (handleAskDeleteCity, setCityToEdit) => [
    { field: 'id', headerName: 'ID', width: 90, visible: false},
    { field: 'name', headerName: 'City Name', width: 150 },
    { field: 'state', headerName: 'State', width: 150 },
    { field: 'country', headerName: 'Country', width: 150 },
    { 
        field: 'cityOwners', headerName: 'Managers', width: 350,
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
                handleAskDeleteCity(params.row.id);
            };

            const onClickEdit = () => {
                setCityToEdit(params.row);
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

export {createCityColumns};