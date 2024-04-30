import React from 'react';
import CircularProgress from '@mui/material/CircularProgress';

const Loading = ({ color = "secondary", size = 40 }) => {
    return (
        <CircularProgress color={color} size={size} />
    );
};

export default Loading;
