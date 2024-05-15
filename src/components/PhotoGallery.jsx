import React from 'react';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import Box from '@mui/material/Box';
import ImageList from '@mui/material/ImageList';
import ImageListItem from '@mui/material/ImageListItem';
import Button from '@mui/material/Button';
import UploadImage from '@/components/util/UploadImage';
import { Image } from '@mui/icons-material';

const PhotoGallery = ({isEdit, photos, changePhoto}) => {
  const theme = useTheme();

  const isMd = useMediaQuery(theme.breakpoints.up('md'), {
    defaultMatches: true,
  });

  if (!photos) {
    return null
    }

  const photosToShow = isMd ? photos : photos.slice(0, photos.length - 1);

  const handlePhotoChange = (url, index) => {
    changePhoto(url, index)
  }

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
              key={item.key}
              cols={isMd ? item.cols || 1 : 2}
              rows={isMd ? item.rows || 1 : 1}
              sx = {{position: 'relative'}}
            >
              {isEdit && (
                <UploadImage setUrl = {(url)=>handlePhotoChange(url,item.key)}/>
              )}
              {
                item.src !== "" ?
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
                :
                // TODO: Add a placeholder image
                <div style={{ height: '100%', width: '100%', display:'flex', justifyContent:'center', alignItems:'center', backgroundColor: 'lightgrey', fontSize: '48px' }}>
                  <Image fontSize='inherit' />
                </div>
                  
              }
            </ImageListItem>
          ))}
        </ImageList>
      </Box>
    </Box>
  );
};

export default PhotoGallery;
