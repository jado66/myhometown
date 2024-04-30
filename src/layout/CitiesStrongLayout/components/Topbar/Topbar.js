'use client'

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Menu from '@mui/material/Menu';
import Link from '@mui/material/Link';
import { useTheme } from '@mui/material/styles';
import { MenuItem, TextField, Typography, colors } from '@mui/material';
import Divider from '@mui/material/Divider';
import useCities from '@/hooks/use-cities';
import CitiesStrongLogo from '@/assets/svg/logos/CitiesStrong';

const Topbar = () => {

  const { groupedCityStrings } = useCities();

  const [anchorEl, setAnchorEl] = useState(null);
  const [search, setSearch] = useState("");

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

   
  const handleSearch = (event) => {
    setSearch(event.target.value);
    event.stopPropagation();
  };

  let filteredGroupedCityStrings = Object.fromEntries(
    Object.entries(groupedCityStrings).map(([state, cities]) => {
      return [
        state,
        cities
          .filter(city => city.toLowerCase().includes(search.toLowerCase()))
          .sort()  
      ];
    }).filter(([state, cities]) => cities.length > 0)
  );  

  const theme = useTheme();
  return (
    <Box
      display={'flex'}
      justifyContent={'space-between'}
      alignItems={'center'}
      width={'100%'}
    >
      <Box display={'flex'} alignItems={'center'}>
        
        <Box
          display={'flex'}
          alignItems="baseline"
          title="myhometown"
          height={{ xs: 28, md: 32 }}
          width={45}
        >
          <CitiesStrongLogo height='100%' width='100%' />
        </Box>
      </Box>
      <Box display="flex" alignItems={'center'}>
      
        <Box sx={{ display: { xs: 'none', md: 'flex' } }} alignItems={'center'}>
          <Box>
            <Link underline="none" component="a" href="/" color="textPrimary">
              Home
            </Link>
          </Box>
        
          <Box marginX={2}>
            <Link
              underline="none"
              component="a"
              href="/about"
              color="textPrimary"
            >
              About
            </Link>
          </Box>
          <Box marginX={2}>
            <Link
              underline="none"
              component="a"
              href="/donate"
              color="textPrimary"
            >
              Donate
            </Link>
          </Box>
          
        </Box>
      </Box>
    </Box>
  );
};

Topbar.propTypes = {
  onSidebarOpen: PropTypes.func,
  themeToggler: PropTypes.func.isRequired,
  themeMode: PropTypes.string.isRequired,
  setThemePalette: PropTypes.func.isRequired,
  paletteType: PropTypes.string.isRequired,
};

export default Topbar;
