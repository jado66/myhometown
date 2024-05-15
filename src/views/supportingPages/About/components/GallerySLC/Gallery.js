import React from 'react';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import Box from '@mui/material/Box';
import ImageList from '@mui/material/ImageList';
import ImageListItem from '@mui/material/ImageListItem';
import Button from '@mui/material/Button';
import UploadImage from '@/components/util/UploadImage';

const GallerySLC = ({isEdit}) => {
  const theme = useTheme();

  const isMd = useMediaQuery(theme.breakpoints.up('md'), {
    defaultMatches: true,
  });

  const photos = [
    {
      src: '/cities/salt-lake-city/2.jpg',
      rows: 2,
      cols: 1,
    },
    {
      src: '/cities/salt-lake-city/1.jpg',
      rows: 1,
      cols: 2,
    },
    {
      src: '/cities/salt-lake-city/3.jpg',
      rows: 1,
      cols: 1,
    },
    {
      src: '/cities/salt-lake-city/4.jpg',
      rows: 1,
      cols: 1,
    },
    {
      src: '/cities/salt-lake-city/5.webp',
      rows: 1,
      cols: 2,
    },
  ];

  const photosToShow = isMd ? photos : photos.slice(0, photos.length - 1);

  return (
    <Box>
      <Box>
        <ImageList
          variant="quilted"
          cols={4}
          rowHeight={isMd ? 300 : 220}
          gap={isMd ? 16 : 8}
        >
          {photosToShow.map((item, i) => (
            <ImageListItem
              key={i}
              cols={isMd ? item.cols || 1 : 2}
              rows={isMd ? item.rows || 1 : 1}
              sx = {{position: 'relative'}}
            >
              {isEdit && (
                <UploadImage setUrl = {(url)=>{alert(url)}}/>
              )}
              <img
                height={'100%'}
                width={'100%'}
                src={item.src}
                alt="..."
                loading="lazy"
                style={{
                  objectFit: 'cover',
                  cursor: 'poiner',
                  borderRadius: 4,
                }}
              />
             
            </ImageListItem>
          ))}
        </ImageList>
      </Box>
    </Box>
  );
};

export default GallerySLC;
