'use client'

import { useRouter } from 'next/navigation';
import { Grid, Typography, IconButton, Divider } from '@mui/material';
import useGiveButterScripts from '@/hooks/use-give-butter-scripts';
import { UnrestrictedDonateButton, UnrestrictedDonateForm, WebsiteTestDonateButton, WebsiteTestDonateForm, WebsiteTestDonateGoalBar } from '@/constants/give-butter/constants';
import { UnrestrictedDonateLink, WebsiteTestDonateLink } from '@/components/give-butter/DonateLinks';

function DonatePage() {
  const router = useRouter();

  useGiveButterScripts();

  const handleGoBack = () => {
    router.push('/');
  };

  return (
    <div>
      <IconButton onClick={handleGoBack} sx={{ marginBottom: '1rem' }}>
        {"<-Back"}
      </IconButton>

      <Grid container spacing={2} px={5} pt={2}>
        <Grid item xs={6}>
          <Grid container spacing={2} px={5} direction='column'>
            <Typography variant="h4">Unrestricted Campaign</Typography>

            <Divider style={{ width: '100%', marginTop:'1em' }} />

            <UnrestrictedDonateButton/>

            <UnrestrictedDonateLink 
              sx ={{my:1}}
              target="_blank"
            >
              Donation Link
            </UnrestrictedDonateLink>

            <UnrestrictedDonateForm/>
          


          </Grid>

        </Grid>
        <Grid item xs={6}>
          <Grid container spacing={2} px={5} direction='column'>
            <Typography variant="h4">Website Test Campaign</Typography>

            <Divider style={{ width: '100%', marginTop:'1em' }} />

            <WebsiteTestDonateButton/>

            <WebsiteTestDonateLink 
              sx ={{mt:1}}
              target="_blank"
            >
              Donation Link
            </WebsiteTestDonateLink>

            <WebsiteTestDonateForm/>

            <WebsiteTestDonateGoalBar/>

          </Grid>

        </Grid>

        
      </Grid>
    </div>
  );
}

export default DonatePage;
