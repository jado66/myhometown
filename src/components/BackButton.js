import React from 'react';
import { useRouter } from 'next/navigation';
import Button from '@mui/material/Button';

const BackButton = () => {
    const router = useRouter();
    
    return (
        <Button
            variant="outlined"
            
            onClick={() => router.back()}
            sx={{ backgroundColor: "#ffffff", marginBottom: '1rem', position:"absolute", top:0, left:0 }}
        >
           {`< Back`}
        </Button>
    );
}

export default BackButton;