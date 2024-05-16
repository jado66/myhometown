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
    return null;
  }

  const handlePhotoChange = (url, key) => {
    changePhoto(url, key);
  }

  const photoOrder = isMd ? [1, 2, 3, 4, 5] : [2, 1, 3, 4, 5];

  return (
    <Box>
      <Box>
        <ImageList
          variant="quilted"
          cols={isMd ? 4 : 2}
          rowHeight={isMd ? 300 : 220}
          gap={isMd ? 16 : 8}
        >
          {photoOrder.map((key) => {
            let item = photos[key];
            return (
               <ImageListItem
                key={key}
                cols={item?.cols}
                rows={item?.rows}
                sx = {{position: 'relative'}}
              >

                {isEdit && (
                  <UploadImage setUrl={(url)=>handlePhotoChange(url, key)}/>
                )}
                {
                  item?.src !== "" ?
                 
                  <img
                    height={'100%'}
                    width={'100%'}
                    src={item.src}
                    alt="..."
                    loading="lazy"
                    style={{
                      objectFit: 'cover',
                      cursor: 'pointer',
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
            );
          })}
        </ImageList>
      </Box>
    </Box>
  );
};

export default PhotoGallery;

