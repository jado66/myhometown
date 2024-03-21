'use client'

import { Grid, Typography, Divider } from '@mui/material';
import useGiveButterScripts from '@/hooks/use-give-butter-scripts';
import { UnrestrictedDonateButton, UnrestrictedDonateForm, WebsiteTestDonateButton, WebsiteTestDonateForm, WebsiteTestDonateGoalBar } from '@/constants/give-butter/constants';
import { UnrestrictedDonateLink, WebsiteTestDonateLink } from '@/components/give-butter/DonateLinks';
import BackButton from '@/components/BackButton';

function DonatePage() {

  useGiveButterScripts();

  return (
    <div>
      <BackButton />

      <Grid container spacing={2} px={5} pt={8}>
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
