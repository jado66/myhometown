
'use client'

import { useEffect, useState } from 'react';
import Card from '@mui/material/Card';
import useManageCities from '@/hooks/use-manage-cities';
import AskYesNoDialog from '@/components/util/AskYesNoDialog';
import AddEditCityDialog from '@/components/data-tables/AddEditCityDialog';
import { DataTable } from '@/components/data-tables/DataTable';
import { createCityColumns } from '@/constants/columns';
import { Grid, CardContent, Box, Typography, Link, Divider, CardMedia, CardActions, Button } from '@mui/material';
import BackButton from '@/components/BackButton';
import Loading from '@/components/util/Loading';
import { faker } from '@faker-js/faker';
import { useTheme } from '@mui/material/styles';
import { useUser } from '@/hooks/use-user';
import RoleGuard from '@/guards/role-guard';

export default function Management() {

    const theme = useTheme();

    const { user, isLoading } = useUser();

    // Initial state for cityToEdit is null.
    const [cityToEdit, setCityToEdit] = useState(null);

    const { cities, handleAddCity, handleEditCity, handleDeleteCity, hasLoaded } = useManageCities(user);
    const [showAddCityForm, setShowAddCityForm] = useState(false);
    const [showConfirmDeleteCity, setShowConfirmDeleteCity] = useState(false);
    const [confirmDeleteCityProps, setConfirmDeleteCityProps] = useState({});
    
    const fakeCityImages = Array.from({ length: 3 }, () => faker.image.urlLoremFlickr({ category: 'city' }));

    const handleAskDeleteCity = (cityId) => {
        
        const city = cities.find((c) => c._id === cityId);
        
        setConfirmDeleteCityProps({
            title: "Delete City",
            description: `Are you sure you want to delete ${city.name}?`,
            onConfirm: () => {
                handleDeleteCity(city)
                setShowConfirmDeleteCity(false);
            },
            onCancel: () => setShowConfirmDeleteCity(false),
            onClose: () => setShowConfirmDeleteCity(false),
        });
        setShowConfirmDeleteCity(true);
    }

    const handleEditCitySubmit = (city) => {
        handleEditCity(cityToEdit,city);
        setCityToEdit(null);
    }

    const handleCloseCityForm = () => {
        setShowAddCityForm(false);
        setCityToEdit(null);
    }

    const toggleVisibility = (cityId) => {
        const city = cities.find((c) => c._id === cityId);

        // Call the function to toggle the visibility of the city.
        const updatedCity = { ...city, visibility: !city.visibility };

        setConfirmDeleteCityProps({
            title: "Update City Visibility",
            description: `Are you sure you want to make ${city.name} ${updatedCity.visibility ? 'public' : 'hidden'}?`,
            onConfirm: () => {
                handleEditCity(city, updatedCity);
                setShowConfirmDeleteCity(false);
            },
            onCancel: () => setShowConfirmDeleteCity(false),
            onClose: () => setShowConfirmDeleteCity(false),
        });
        setShowConfirmDeleteCity(true);

        // Call the function to update the city.
        
    }

    useEffect(() => {
        if (cityToEdit) {   
            setShowAddCityForm(true);
        }
    }, [cityToEdit]);

    const cityColumns = createCityColumns(handleAskDeleteCity, setCityToEdit, toggleVisibility);

    if (!hasLoaded){
        return (
            <Box display = 'flex' justifyContent = 'center'
                sx = {{height:'100vh', padding: '5em',}}
            >
            <Loading size = {50}/>
        </Box>)   
    }

    return (
        <Grid container item sm = {12} display = 'flex' sx = {{position:"relative"}}>
           
            <BackButton />

            <AskYesNoDialog 
                {...confirmDeleteCityProps}
                open={showConfirmDeleteCity}
            />
            <AddEditCityDialog
                open={showAddCityForm}
                handleClose={handleCloseCityForm}
                onSubmitForm={cityToEdit? handleEditCitySubmit : handleAddCity}
                initialCityState = {cityToEdit}
            />
        
            <Card sx={{width: '100%', m:3, p: 3, display:'flex', flexDirection:'column', boxShadow:'none', overflowX:'auto'}} >
                <Box marginBottom={4}>
                    <Typography
                        sx={{
                        textTransform: 'uppercase',
                        fontWeight: 'medium',
                        }}
                        gutterBottom
                        color={'primary'}
                        align={'center'}
                    >
                        Admin City Management
                    </Typography>
                    <Box
                        component={Typography}
                        fontWeight={700}
                        variant={'h3'}
                        align={'center'}
                        gutterBottom
                    >
                        Manage your cities. 
                    </Box>
                   
                </Box>

                {
                    cities.length === 0 && hasLoaded &&
                    <>
                        <Divider width = '50%' sx = {{mx:'auto', mb:3}}/>
                        <Typography
                            variant={'subtitle1'} 
                            component={'p'}
                            color={'textSecondary'}
                            align={'center'}
                            gutterBottom
                        >
                            You don&apos;t have any cities assigned to your account.
                        </Typography>
                        <Typography variant={'subtitle2'} align={'center'}>
                            Expected something different?{' '}
                            <Link
                                component={'a'}
                                color={'primary'}
                                href={"mailto:admin-representative@myhometown.org"}
                                underline={'none'}
                            >
                                Contact a MyHometown Admin.
                            </Link>
                        </Typography>
                    </>
                    
                }

                {
                    (cities.length < 3 && user.role !== 'Admin') && cities.length > 0 && hasLoaded &&
                    <Box display = 'flex' justifyContent = 'center' width='100%'>

                        {cities.map((city, i) =>
                            <Grid item xs={12} sm={6} md={4} key={i} mx = {2}>
                                <Box
                                    display={'block'}
                                    width={'100%'}
                                    height={'100%'}
                                    sx={{
                                        textDecoration: 'none',
                                        transition: 'all .2s ease-in-out',
                                        '&:hover': {
                                        transform: `translateY(-${theme.spacing(1 / 2)})`,
                                        },

                                    }}
                                >
                                    <Box
                                        component={Card}
                                        width={'100%'}
                                        height={'100%'}
                                        data-aos={'fade-up'}
                                        borderRadius={3}
                                    >
                                        <CardMedia
                                            image={fakeCityImages[i]}
                                            title={city.name}
                                            sx={{
                                                height: 140,
                                            }}
                                        />
                                        <Box component={CardContent}>
                                            <Box
                                                component={Typography}
                                                variant={'h6'}
                                                gutterBottom
                                                fontWeight={500}
                                                align={'left'}
                                            >
                                                {city.name}
                                            </Box>
                                            <Typography
                                                align={'left'}
                                                variant={'body2'}
                                                color="textSecondary"
                                            >
                                                Description
                                            </Typography>
                                        </Box>
                                        <Box component={CardActions} justifyContent={'flex-end'}>
                                            <Button size="small" 
                                                href=''
                                            >
                                                Edit
                                            </Button>
                                        </Box>
                                    </Box>
                                </Box>
                            </Grid>
                        )}
                    </Box>

                }

                {
                     hasLoaded && (cities.length >= 3 || user.role === 'Admin') &&
                    <DataTable
                        id = "city"
                        rows={cities}
                        columns={cityColumns}
                        hiddenColumns = {['_id', 'country', 'state']}
                    />
                }

                <RoleGuard requiredRole = 'admin' user = {user}>
                    <Grid sx = {{mt:3}}>
                        <Box display = 'flex' justifyContent = 'center' width='100%'>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={() => setShowAddCityForm(true)}
                            >
                                Add a City
                            </Button>
                        </Box>
                    </Grid>
                </RoleGuard>
            </Card>
        </Grid>
    );
}