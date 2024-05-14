'use client'

import React from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import MyHometownLogo from '@/assets/svg/logos/MyHometown';
import { useEdit } from '@/hooks/use-edit';

const Topbar = () => {

  const { saveData: saveCityData, isDirty } = useEdit();

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
          component="a"
          underline="none"
          href="/"
          title="myhometown"
          height={{ xs: 28, md: 32 }}
          width={45}
        >
          <MyHometownLogo height='100%' width='100%' />
        </Box>
      </Box>
      <Box display="flex" alignItems={'center'}>
      
        <Box sx={{ display: { xs: 'none', md: 'flex' } }} alignItems={'center'}>
          <Box>
            <Button
              variant="outlined"
              component="a"
              href="/admin-dashboard"
              
            >
              Admin Dashboard
            </Button>
          </Box>
        
          
          <Box marginX={2}>
            <Button
              variant="contained"
              component="a"
              color="primary"
              onClick={saveCityData}
              disabled={!isDirty}
            >
              Save Changes
            </Button>
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
