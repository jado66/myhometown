import React, { useState, useEffect } from 'react';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import Box from '@mui/material/Box';
import ImageList from '@mui/material/ImageList';
import ImageListItem from '@mui/material/ImageListItem';
import Button from '@mui/material/Button';
import UploadImage from '@/components/util/UploadImage';
import { Image as ImageIcon } from '@mui/icons-material';
import { Dialog } from '@mui/material';


const PhotoGallery = ({isEdit, photos, changePhoto}) => {

  const theme = useTheme();
  const [selectedImage, setSelectedImage] = useState();

  const isMd = useMediaQuery(theme.breakpoints.up('md'), {
    defaultMatches: true,
  });

  if (!photos) {
    return null;
  }


  const openImageDialog = image => () => {
    setSelectedImage(image);
  };

  const closeImageDialog = () => {
    setSelectedImage(null);
  };


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
                onClick={openImageDialog(item?.src)}

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
                    <ImageIcon fontSize='inherit' />
                  </div>
                }
              </ImageListItem>
            );
          })}
        </ImageList>
        <LightBox closeImageDialog={closeImageDialog} image={selectedImage} />


      </Box>
    </Box>
  );
};

export default PhotoGallery;

const LightBox = ({closeImageDialog, image}) => {
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [hasCalculated, setHasCalculated] = useState(false);

  const getImageDimensions = (src) => {
    return new Promise((resolve) => {
      let img = new Image();
      img.onload = () => resolve({ width: img.width, height: img.height });
      img.src = src;
    });
  };

  useEffect(() => {
    if (image) {
      setHasCalculated(false);
      getImageDimensions(image).then((dims) => {
        setImageSize(dims);
        setHasCalculated(true);
      });
    }
  }, [image]);

  const isPortrait = imageSize.height > imageSize.width;

  return (
    <Dialog
      open={!!image}
      onClose={closeImageDialog}
      fullScreen
      sx = {{
        display:'flex',
        justifyContent:'center',
        alignItems:'center',
      }}
      PaperProps={{
        style: {
          backgroundColor: 'transparent',
          boxShadow: 'none',
        },
      }}
      onClick={closeImageDialog}
    >
      <div 
        style={{
          backgroundColor: 'transparent',
          margin: 'auto',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: isPortrait?'90vh':"auto", 
          width: isPortrait?'auto':"90vw",
        }}
      >

        {hasCalculated &&
          <img 
            src={image} 
            alt="dialog" 
            style={{
              maxHeight: isPortrait ? '100%' : '90vh',
              maxWidth: isPortrait ? 'auto' : '100%',
              objectFit: 'contain'
            }}
          />
        }
      </div>
    </Dialog>
  );
};