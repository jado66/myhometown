import React from 'react';
import { useRouter } from 'next/navigation';
import Button from '@mui/material/Button';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
const BackButton = (props) => {
    const router = useRouter();
    
    return (
        <Button
            variant="standard"
            
            onClick={() => router.back()}
            sx={{ 
                backgroundColor: "#ffffff", 
                marginBottom: '1rem', 
                position:"absolute", 
                top:0, 
                left:0, 
                marginLeft: 6 ,
                marginTop: 2
            }}
            {...props}
        >
           <ArrowBackIcon mr = {2} fontSize = 'small'/>Back
        </Button>
    );
}

export default BackButton;