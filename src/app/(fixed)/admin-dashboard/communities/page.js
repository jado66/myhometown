
'use client'
import { useEffect, useState } from 'react';
import Card from '@mui/material/Card';
import useCommunities from '@/hooks/use-communities';
import AskYesNoDialog from '@/components/util/AskYesNoDialog';
import AddEditCommunityDialog from '@/components/data-tables/AddEditCommunityDialog';
import { DataTable } from '@/components/data-tables/DataTable';
import { createCommunityColumns } from '@/constants/columns';
import { Grid, Box, Typography } from '@mui/material';
import BackButton from '@/components/BackButton';

export default function Management() {
    const { communities, handleAddCommunity, handleEditCommunity, handleDeleteCommunity } = useCommunities();

    const [communityToEdit, setCommunityToEdit] = useState(null);

    const [showAddCommunityForm, setShowAddCommunityForm] = useState(false);
    const [showConfirmDeleteCommunity, setShowConfirmDeleteCommunity] = useState(false);
    const [confirmDeleteCommunityProps, setConfirmDeleteCommunityProps] = useState({});
    
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

    const handleCloseCommunityForm = () => {
        setShowAddCommunityForm(false);
        setCommunityToEdit(null);
    }

    useEffect(() => {
        if (communityToEdit) {   
            setShowAddCommunityForm(true);
        }
    }, [communityToEdit]);

    const communityColumns = createCommunityColumns(handleAskDeleteCommunity, setCommunityToEdit);

    return (
           
    <Grid container item sm = {12} display = 'flex' sx = {{position:"relative"}}>           
        <BackButton />

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
    
        <Card sx={{width: '100%', height:'100%', m:3, p: 3, display:'flex', flexDirection:'column', boxShadow:'none', overflowX:'auto'}} >
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
                    Admin Community Management
                </Typography>
                <Box
                    component={Typography}
                    fontWeight={700}
                    variant={'h3'}
                    align={'center'}
                    gutterBottom
                >
                    Manage your communities. 
                </Box>
                <Typography
                    variant={'h6'}
                    component={'p'}
                    color={'textSecondary'}
                    align={'center'}
                >
                    Here you can add, remove, or edit community information.
                </Typography>
            </Box>
            
            <DataTable
                id = "community"
                rows={communities}
                columns={communityColumns}
                hiddenColumns = {['id', 'country']}
            />
              
        </Card>
    </Grid>
    );
}


    




  {/* <DataTable
                        id = "community"
                        rows={communities}
                        columns={communityColumns}
                        onEdit={setCommunityToEdit}
                        hiddenColumns = {['id', 'country']}
                    /> */}