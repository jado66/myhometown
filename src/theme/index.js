import { responsiveFontSizes } from '@mui/material';
import { createTheme } from '@mui/material/styles';
import shadows from './shadows';
import { light } from './palatte-myHometown';
import { citiesStrongLight } from './palatte-citiesStrong';

const getTheme = (theme) =>
  responsiveFontSizes(
    createTheme({
      palette: theme === 'default' ? light : citiesStrongLight,
      layout: {
        contentWidth: 1236,
      },
      shadows: shadows(),
      typography: {
        fontFamily: '"Inter", sans-serif',
        button: {
          textTransform: 'none',
          fontWeight: 'medium',
        },
      },
      zIndex: {
        appBar: 1200,
        drawer: 1300,
      },
      components: {
        MuiButton: {
          styleOverrides: {
            label: {
              fontWeight: 600,
            },
            containedSecondary: { color: 'white' }
          },
        },
      },
    }),
  );

export default getTheme;
