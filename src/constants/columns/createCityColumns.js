import { Button, Grid } from "@mui/material";
import { OnwersCell } from "../../components/data-tables/CityOrCommunityOwnersCell";
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import Visibility from "@mui/icons-material/Visibility";

const createCityColumns = (handleAskDeleteCity, setCityToEdit, toggleVisibility) => [
    { field: 'id', headerName: 'ID', width: 90, visible: false},
    { field: 'name', headerName: 'City Name', width: 150 },
    { field: 'state', headerName: 'State', width: 150 },
    { field: 'country', headerName: 'Country', width: 150 },
    { field: 'visibility', headerName: 'Visibility', width: 75,
        renderCell: (params) => params.row.visibility ? 'Public' : 'Hidden'
    },
    { 
        field: 'cityOwners', headerName: 'Managers', width: 350,
        renderCell: (params) => <OnwersCell params={params}/>
    },
    {
        field: "actions",
        headerName: "Actions",
        sortable: false,
        width: 300,
        disableClickEventBubbling: true,
        renderCell: (params) => {

            const onToggleVisibility = () => {
                toggleVisibility(params.row._id);
            };

            const onClickDelete = () => {
                handleAskDeleteCity(params.row._id);
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
                        color="secondary" 
                        size="small"
                        onClick={onToggleVisibility}
                        sx = {{color: "grey", ml: 1, width: 115}}  
                    >
                        {params.row.visibility ? 'Hide City' : 'Make Public'}
                        {
                            params.row.visibility ? 
                            <VisibilityOff fontSize="small" sx = {{ml:'5px'}} /> : 
                            <Visibility fontSize="small" sx = {{ml:'5px'}} />
                        }
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