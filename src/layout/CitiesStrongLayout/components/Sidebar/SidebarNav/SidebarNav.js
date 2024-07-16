'use client';

import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useTheme } from '@mui/material/styles';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import NextLink from 'next/link';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import ExpandMore from '@mui/icons-material/ExpandMore';
import { ExpandLess } from '@mui/icons-material';
import useManageCities from '@/hooks/use-manage-cities';

const SidebarNav = ({  onClose }) => {

  const theme = useTheme();
  const [activeLink, setActiveLink] = useState('');
  
  useEffect(() => {
    setActiveLink(window && window.location ? window.location.pathname : '');
  }, []);

  const rootUrl = process.env.NEXT_PUBLIC_ENVIRONMENT === 'dev' ? '/cs':''

  return (
    <Box sx ={{position:'relative', textAlign:'center'}}>
      <Box
        display={'flex'}
        justifyContent={'flex-end'}
        onClick={() => onClose()}
      >
        <IconButton sx = {{color:'white', position:'absolute'}}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>
      <Box paddingX={2} paddingBottom={2}>
        <Box>
          <Box marginBottom={4}>
            <NextLink href = {rootUrl+"/"}  style = {{textDecoration:'none', color: '#686868'}}>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 700,
                  marginBottom: 1,
                  display: 'block',
                  textDecoration:'none',
                  color:'white',
                  textTransform:'uppercase',
                  pt:'2px'
                }}
              >
                Cities Strong
              </Typography>
            </NextLink>
          </Box> 
          <Box marginBottom={4}>
            <NextLink href = {rootUrl+"/about"}  style = {{textDecoration:'none', color: '#686868'}}>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 700,
                  marginBottom: 1,
                  display: 'block',
                  textDecoration:'none',
                  color:'white'
                }}
              >
                About
              </Typography>
            </NextLink>
          </Box>
          <Box marginBottom={4}>
            <NextLink href = {rootUrl+"/media"}  style = {{textDecoration:'none', color: '#686868'}}>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 700,
                  marginBottom: 1,
                  display: 'block',
                  textDecoration:'none',
                  color:'white'
                }}
              >
                Media
              </Typography>
            </NextLink>
          </Box>
          <Box marginBottom={4}>
            <NextLink href = {rootUrl+"/contact"} style = {{textDecoration:'none', color: '#686868'}}>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 700,
                  marginBottom: 1,
                  display: 'block',
                  color:'white'
                }}
              >
                Contact
              </Typography>
            </NextLink>
          </Box>
          <Box marginBottom={4}>
            <NextLink href = {rootUrl+"/donate"} style = {{textDecoration:'none', color: '#686868'}}>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 700,
                  marginBottom: 1,
                  display: 'block',
                  color:'white'
                }}
              >
                Donate
              </Typography>
            </NextLink>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

SidebarNav.propTypes = {
  pages: PropTypes.array.isRequired,
  onClose: PropTypes.func,
};

export default SidebarNav;
