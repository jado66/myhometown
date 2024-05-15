'use client';
import React, { useState, useRef } from 'react';
import { Grid, IconButton } from '@mui/material';
import { useUploadFile } from '@/hooks/use-upload-file';
import { AddPhotoAlternateTwoTone } from '@mui/icons-material';
import Loading from './Loading';

function UploadImage({ setUrl }) {
    const { uploadToS3, loading, error } = useUploadFile();
    const fileInput = useRef();

    const [isVisible , setIsVisible] = useState(false);

    // Handle file upload
    const handleFileUpload = async (event) => {
        if(event.target.files.length > 0){
            const file = event.target.files[0];
            const result = await uploadToS3(file);
    
            if (result) {
                console.log("Successfully uploaded file.");
                alert("Successfully uploaded file.+" + result.url)
                setUrl(result.url); // Assuming setUrl is a function passed as prop to update the URL
            }
        } else {
            console.log("No file selected.");
        }
    };

    const handleClick = () => {
        fileInput.current.click();
    }

    return (
        <Grid 
            container 
            alignItems="center" 
            justifyContent="center" 
            sx={{ 
                position: 
                'absolute', 
                zIndex:2, 
                width: '100%', 
                height: '100%'
            }}
            onMouseEnter={() => setIsVisible(true)}
            onMouseLeave={() => setIsVisible(false)}
        >
            <input 
                type="file" 
                onChange={handleFileUpload} 
                style={{ display: 'none' }} 
                ref={fileInput}
                multiple={false}
                accept="image/*" 
            />
            {
                !loading ?
                <IconButton
                    sx={{ 
                        position: 'absolute', 
                        top: '0%', 
                        right: '0%', 
                        color:'black', 
                        backgroundColor:'lightgrey',
                        margin: '0.5em',
                        display: { xs: 'flex', md: isVisible  ? 'flex' : 'none'},
                        '&:hover': {
                            backgroundColor: 'white',
                        }
                    }}
                    onClick={handleClick}
                > 
                    <AddPhotoAlternateTwoTone fontSize='12px' />
                </IconButton>
                :
                <IconButton
                    sx={{ 
                        position: 'absolute', 
                        top: '0%', 
                        right: '0%', 
                        color:'black', 
                        backgroundColor:'lightgrey',
                        margin: '0.5em',
                        '&:hover': {
                            backgroundColor: 'white',
                        }
                    }}
                > 
                    <Loading size={25} />
                </IconButton>
            }
               
            
            
            {loading && <p>Loading...</p>}
            {error && <p>Error: {error}</p>}
        </Grid>
    );
}

export default UploadImage;
