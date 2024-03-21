
'use client'
import { useEffect, useState } from 'react';
import Card from '@mui/material/Card';
import useCities from '@/hooks/use-cities';
import AskYesNoDialog from '@/components/util/AskYesNoDialog';
import AddEditCityDialog from '@/components/data-tables/AddEditCityDialog';
import { DataTable } from '@/components/data-tables/DataTable';
import { createCityColumns } from '@/constants/columns';
import { Grid, TextField } from '@mui/material';
import BackButton from '@/components/BackButton';

export default function Management() {

    const [userEmail, setUserEmail] = useState("");
    const [cityToEdit, setCityToEdit] = useState(null);

    const { cities, handleAddCity, handleEditCity, handleDeleteCity } = useCities(userEmail);

    const [showAddCityForm, setShowAddCityForm] = useState(false);
    const [showConfirmDeleteCity, setShowConfirmDeleteCity] = useState(false);
    const [confirmDeleteCityProps, setConfirmDeleteCityProps] = useState({});
    
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

    useEffect(() => {
        if (cityToEdit) {   
            setShowAddCityForm(true);
        }
    }, [cityToEdit]);

    const cityColumns = createCityColumns(handleAskDeleteCity, setCityToEdit);

    return (
        <Grid container item sm = {12} display = 'flex' sx = {{height:"100%", position:"relative"}}>
           
            <BackButton />

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
        
            <Card sx={{width: '100%', height:'100%', m:3, p: 3, display:'flex', flexDirection:'column'}} >
                <h1>City Management</h1>

                {/* Email input */}
                <TextField 
                    label = "Email"
                    variant = "outlined"
                    margin = "normal"
                    fullWidth
                    value = {userEmail}
                    onChange = {(e) => setUserEmail(e.target.value)}
                />


                <DataTable
                    id = "city"
                    rows={cities}
                    columns={cityColumns}
                    hiddenColumns = {['id', 'country']}
                />
                  
            </Card>
        </Grid>
    );
}


    




  {/* <DataTable
                        id = "city"
                        rows={cities}
                        columns={cityColumns}
                        onEdit={setCityToEdit}
                        hiddenColumns = {['id', 'country']}
                    /> */}