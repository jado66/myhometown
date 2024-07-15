
import React from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import CitiesStrongLogo from '@/assets/svg/logos/CitiesStrong';
import CitiesStrongShield from '@/assets/svg/logos/CititesStrongShield';
import CitiesStrongShieldIcon from '@/assets/svg/logos/CitiesStrongShieldIcon';
import { IconButton, Typography } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';


const Topbar = ({onSidebarOpen, theme}) => {

  const rootUrl = process.env.NEXT_PUBLIC_ENVIRONMENT === 'dev'? '/cs':''

  return (
    <Box
      display={'flex'}
      justifyContent={'space-between'}
      alignItems={'center'}
      width={'100%'}
      position='relative'
    >
      <Box display={'flex'} alignItems={'center'} sx = {{flexGrow:1, justifyContent:'space-between'}}>
        <Box
            display={'flex'}
            alignItems="baseline"
            title="myhometown"
            height={{ xs: 28, md: 32 }}
            width={45}
        >
          <CitiesStrongShield shieldColor='#000000' fontColor='#ffffff'/>
        </Box>
        <Box
          display={'flex'}
          alignItems="baseline"
          underline="none"
          href={rootUrl+"/"}
          title="myhometown"
          sx = {{position:'absolute', width:"100%", textAlign:'center'}}
        >
          <Link    
            underline="none"
            component="a"
            href={rootUrl+"/about"}
            color = {theme.palette.primary.contrastText}
            width = "100%"
          >
            <Typography variant = 'h4' sx = {{textTransform:'uppercase', fontWeight:'bold'}}>Cities Strong</Typography>
          </Link>
        </Box>
        <Box marginRight={{ xs: 1, sm: 2 }} sx = {{display: { xs: 'flex', md: 'none' }}}>
          <IconButton aria-label="Menu" onClick = {onSidebarOpen} sx = {{color:'white'}}>
            <MenuIcon />
          </IconButton>
        </Box>
      </Box>
      
      <Box display="flex" alignItems={'center'}>
      
        <Box sx={{ display: { xs: 'none', md: 'flex' } }} alignItems={'center'}>
         
        
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
              href={rootUrl+"/media"}
              color = {theme.palette.primary.contrastText}
            >
              Media
            </Link>
          </Box>
          <Box marginX={2}>
            <Link
              underline="none"
              component="a"
              href={rootUrl+"/contact"}
              color = {theme.palette.primary.contrastText}
            >
              Contact
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
