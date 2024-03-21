
'use client'
import { useEffect, useState } from 'react';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import Card from '@mui/material/Card';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import useCommunities from '@/hooks/use-communities';
import useCities from '@/hooks/use-cities';
import AddEditCommunityDialog from '../../../components/data-tables/AddEditCommunityDialog';
import AskYesNoDialog from '@/components/util/AskYesNoDialog';
import AddEditCityDialog from '../../../components/data-tables/AddEditCityDialog';
import Chip from '@mui/material/Chip';
import Tooltip, { tooltipClasses } from '@mui/material/Tooltip';
import { styled } from '@mui/material/styles';
import { createCommunityColumns, createCityColumns } from '../../../constants/columns';
import { DataTable } from '../../../components/data-tables/DataTable';



export default function Management() {
    const [userType, setUserType] = useState("");

    const { communities, handleAddCommunity, handleEditCommunity, handleDeleteCommunity } = useCommunities();
    const { cities, handleAddCity, handleEditCity, handleDeleteCity } = useCities();

    const [cityToEdit, setCityToEdit] = useState(null);
    const [communityToEdit, setCommunityToEdit] = useState(null);

    const [showAddCommunityForm, setShowAddCommunityForm] = useState(false);
    const [showConfirmDeleteCommunity, setShowConfirmDeleteCommunity] = useState(false);
    const [confirmDeleteCommunityProps, setConfirmDeleteCommunityProps] = useState({});

    const [showAddCityForm, setShowAddCityForm] = useState(false);
    const [showConfirmDeleteCity, setShowConfirmDeleteCity] = useState(false);
    const [confirmDeleteCityProps, setConfirmDeleteCityProps] = useState({});

    const handleAskDeleteCommunity = (communityId) => {
        
        const community = communities.find((c) => c.id === communityId);
        
        setConfirmDeleteCommunityProps({
            title: "Delete Community",
            description: `Are you sure you want to delete ${community.name}?`,
            onConfirm: () => {
                handleDeleteCommunity(communityId)
                setShowConfirmDeleteCommunity(false);
            },
            onCancel: () => setShowConfirmDeleteCommunity(false),
            onClose: () => setShowConfirmDeleteCommunity(false),
        });
        setShowConfirmDeleteCommunity(true);
    }

    const handleAskDeleteCity = (cityId) => {
        
        const city = cities.find((c) => c.id === cityId);
        
        setConfirmDeleteCityProps({
            title: "Delete City",
            description: `Are you sure you want to delete ${city.name}?`,
            onConfirm: () => {
                handleDeleteCity(cityId)
                setShowConfirmDeleteCity(false);
            },
            onCancel: () => setShowConfirmDeleteCity(false),
            onClose: () => setShowConfirmDeleteCity(false),
        });
        setShowConfirmDeleteCity(true);
    }

    const handleCloseCityForm = () => {
        setShowAddCityForm(false);
        setCityToEdit(null);
    }


    const handleCloseCommunityForm = () => {
        setShowAddCommunityForm(false);
        setCommunityToEdit(null);
    }

    useEffect(() => {
        if (communityToEdit) {
            setShowAddCommunityForm(true);
        }
    }, [communityToEdit]);

    useEffect(() => {
        if (cityToEdit) {
            setShowAddCityForm(true);
        }
    }, [cityToEdit]);

    const communityColumns = createCommunityColumns(handleAskDeleteCommunity, setCommunityToEdit);
    const cityColumns = createCityColumns(handleAskDeleteCity, setCityToEdit);

    return (
        <>
            {/* Community Dialogs  */}
            <AskYesNoDialog 
                {...confirmDeleteCommunityProps}
                open={showConfirmDeleteCommunity}
            />
            <AddEditCommunityDialog
                open={showAddCommunityForm}
                handleClose={handleCloseCommunityForm}
                onSubmitForm={communityToEdit? handleEditCommunity : handleAddCommunity}
                initialCommunityState = {communityToEdit}
            />

            {/* City Dialogs */}
            <AskYesNoDialog 
                {...confirmDeleteCityProps}
                open={showConfirmDeleteCity}
            />
            <AddEditCityDialog
                open={showAddCityForm}
                handleClose={handleCloseCityForm}
                onSubmitForm={cityToEdit? handleEditCity : handleAddCity}
                initialCityState = {cityToEdit}
            />

            Show Edit Community Form
            {JSON.stringify(showAddCommunityForm)}
        
            <Card sx={{mx:10, mt:5, p:3}}>
                <h1>City & Community Management</h1>

                <FormControl component="fieldset" sx = {{mb:3}}>
                    <FormLabel component="legend">User Type</FormLabel>
                    <RadioGroup 
                        aria-label="User Type"
                        defaultValue=""
                        onChange={(event) => setUserType(event.target.value)}
                        row // This will set radios inline
                    >
                        <FormControlLabel value="Community Owner" control={<Radio />} label="Community Owner" />
                        <FormControlLabel value="City Owner" control={<Radio />} label="City Owner" />
                        <FormControlLabel value="Admin" control={<Radio />} label="Admin" />
                    </RadioGroup>
                </FormControl>

                { userType === 'Admin' && 
                <>
                    <Box sx={{ height: 400, width: '100%', pb:5 }}>
                        <Typography variant="h5" gutterBottom>
                            Manage Cities
                        </Typography>
                        <DataTable
                            id = "city"
                            rows={cities}
                            columns={cityColumns}
                            onEdit={setCityToEdit}
                            hiddenColumns = {['id', 'country']}
                        />
                    </Box>
                </>
                }
                
                { userType === 'City Owner' && 
                <>
                    <Box sx={{ height: 400, width: '100%' }}>
                        <Typography variant="h5" gutterBottom>
                            Manage Communities
                        </Typography>
                        <DataGrid 
                            rows={communities} 
                            initialState={{
                                columns: {
                                  columnVisibilityModel: {
                                    // Hide columns status and traderName, the other columns will remain visible
                                    id: false,
                                    country: false,
                                    googleCalendarId: false

                                  },
                                },
                                pagination: { paginationModel: { pageSize: 5 } },
                              }}
                            columns={communityColumns} 
                            disableDensitySelector
                            pageSizeOptions={[5, 10, 20,50,100]} // Sets options for rows per page
                            slots={{ toolbar: GridToolbar }}
                            slotProps={{
                                toolbar: {
                                    showQuickFilter: true,
                                },
                            }}
                        />

                        <button onClick={handleAddCommunity}>Add Community</button>

                    </Box>

                    
                    <form>
                    {/* Replace it with actual form controls */}
                    {/* Community Editing Form for City Owner */}
                    </form>
                </>
                }

                { userType === 'Community Owner' && 
                // Community Owner should be able to only edit their city
                <form>
                    {/* Replace it with actual form controls */}
                    City Editing Form for Community Owner
                </form>
                }
            </Card>
        </>
    );
}


    




