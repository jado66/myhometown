import React from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Link from '@mui/material/Link';
import { useTheme } from '@mui/material/styles';
import { colors } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import MyHometownLogo from '@/assets/svg/logos/MyHometown';

const Topbar = ({
  themeMode,
  themeToggler,
  setThemePalette,
  onSidebarOpen,
  paletteType,
}) => {
  const rootUrl = process.env.NEXT_PUBLIC_ENVIRONMENT === 'dev'? '/mht':''

  const theme = useTheme();
  return (
    <Box
      display={'flex'}
      justifyContent={'space-between'}
      alignItems={'center'}
      width={'100%'}
    >
      <Box display={'flex'} alignItems={'center'}>
        <Box marginRight={{ xs: 1, sm: 2 }} sx={{ display: { md: 'none', sm: 'block' } }}>
          <IconButton onClick={onSidebarOpen} aria-label="Menu">
            <MenuIcon />
          </IconButton>
        </Box>
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
          <MyHometownLogo height={'100%'} width={'100%'} />
        </Box>
      </Box>
      <Box display="flex" alignItems={'center'} justifyContent='end'>
        <Box marginRight={2}>
          <Link underline="none" component="a" href={rootUrl+"/admin-dashboard"} color="textPrimary">
            Admin Dashboard
          </Link>
        </Box>
        <Box marginRight={2}>
          <Link underline="none" component="a" href="/" color="textPrimary">
            Home
          </Link>
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
