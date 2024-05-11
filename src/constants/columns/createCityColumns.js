import { Button, Grid, Tooltip } from "@mui/material";
import { OnwersCell } from "../../components/data-tables/CityOrCommunityOwnersCell";
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import Visibility from "@mui/icons-material/Visibility";

const createCityColumns = (handleAskDeleteCity, setCityToEdit, toggleVisibility) => [
    { field: '_id', headerName: 'ID', width: 90, visible: false},
    { field: 'name', headerName: 'City Name', width: 125 },
    { field: 'state', headerName: 'State', width: 100 },
    { field: 'country', headerName: 'Country', width: 150 },
    { field: 'visibility', headerName: 'Status', width: 100,
        renderCell: (params) => params.row.visibility ? 'Published' : 'Draft'
    },
    { 
        field: 'cityOwners', headerName: 'Managers', width: 250,
        renderCell: (params) => <OnwersCell params={params}/>
    },
    { 
        field: 'communities', headerName: 'Communities', width: 250,
        renderCell: (params) => <OnwersCell params={params}/>
    },
    {
        field: "actions",
        headerName: "Actions",
        sortable: false,
        width: 325,
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
                        sx = {{color: "grey", ml: 1, width: 135}}  
                    >
                        {params.row.visibility ? 'Make Draft' : 'Publish'}
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
                            <Tooltip title="Delete City" placement="top" arrow> 
                                <DeleteIcon fontSize="small"  />
                            </Tooltip>
                        </Button>
                    
                </Grid>
            );
        },
    },
]

export {createCityColumns};