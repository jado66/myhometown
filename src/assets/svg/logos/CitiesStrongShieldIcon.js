import { SvgIcon } from '@mui/material';
import React from 'react';

const CitiesStrongShieldIcon = ({ fillColor = '#2D903C', size = 36, sx }) => (
    <SvgIcon sx={{ width: size, height: size, ...sx }} viewBox="10 10 16 16" >
        {/* Inline styles have been converted to JavaScript object notation */}
        <style type="text/css">
        {`
            .st0{fill:${fillColor};}
            .st1{display:none;}
            .st2{display:inline;fill:none;stroke:#00AEEF;stroke-width:8.195235e-02;stroke-miterlimit:10;}
            .st3{display:inline;fill:none;stroke:#00AEEF;stroke-width:8.195235e-02;stroke-miterlimit:10;stroke-dasharray:1.639,1.639;}
        `}
        </style>
        <g id="Artwork">
            <path
                className="st0"
                d="M11.9,11.9v7.9c0,1.6,0.7,3.1,2.2,4.2c1.1,0.9,2.4,1.4,3.3,1.7L18,26l0.6-0.2c0.7-0.2,2.1-0.7,3.3-1.7 c1.4-1.1,2.2-2.6,2.2-4.1v-8.1H11.9z"
            />
        </g>
        <g id="Guides" className="st1">
            <rect x="0" y="0" className="st2" width="36" height="36" />
            <line className="st3" x1="24.1" y1="0" x2="24.1" y2="36" />
            <line className="st3" x1="11.9" y1="0" x2="11.9" y2="36" />
            <line className="st3" x1="0" y1="11.9" x2="35.8" y2="11.9" />
            <line className="st3" x1="0" y1="24.1" x2="35.8" y2="24.1" />
        </g>
    </SvgIcon>
);

export default CitiesStrongShieldIcon;
