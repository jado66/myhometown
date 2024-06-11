
import React from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import CitiesStrongLogo from '@/assets/svg/logos/CitiesStrong';
const Topbar = ({theme}) => {

  const rootUrl = process.env.NEXT_PUBLIC_ENVIRONMENT === 'dev'? '/cs':''

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
            <Link underline="none" component="a" href={rootUrl+"/"} color = {theme.palette.primary.contrastText}>
              Home
            </Link>
          </Box>
        
          <Box marginX={2}>
            <Link
              underline="none"
              component="a"
              href={rootUrl+"/about"}
              color = {theme.palette.primary.contrastText}
            >
              About
            </Link>
          </Box>
          <Box marginX={2}>
            <Link
              underline="none"
              component="a"
              href={rootUrl+"/donate"}
              color = {theme.palette.primary.contrastText}
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
