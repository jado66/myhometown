import { Button, Grid } from "@mui/material";
import { OnwersCell } from "../../components/data-tables/CityOrCommunityOwnersCell";

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

export {createCityColumns};