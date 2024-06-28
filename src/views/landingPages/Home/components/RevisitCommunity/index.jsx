'use client';
import { Close } from "@mui/icons-material";
import { Alert, Button, Grid, IconButton } from "@mui/material";
import { useEffect, useState } from "react"

export const RevisitCommunity = () => {

  const [lastCommunity, setLastCommunity] = useState()

  useEffect(() => {
    const storedCommunity = localStorage.getItem("lastCommunity");
    if (storedCommunity) {
      setLastCommunity(JSON.parse(storedCommunity));
    }
  }, []);

  if (!lastCommunity){
    return null
  }

  const onClose = () => {
    setLastCommunity()
    localStorage.removeItem("lastCommunity");
  }

  const {name:cityName, city, state} = lastCommunity

  const href = `${city.state}/${city.name}/${cityName}`.toLowerCase().replaceAll(/\s/g, "-")

  return(
    <Grid  xs={12} sx = {{p:0}}>
      <Alert
        icon={false}
        severity="info"
        onClose={onClose}
        
        action={
          <>
            <Button color="inherit" size="small" component='a' href={href}>
              Visit
            </Button>
            <Button color="inherit" size="small" onClick={onClose} sx = {{height:'100%', display:'flex'}}> 
              <Close sx={{ fontSize: '15px', mb:'4px'}}/>
            </Button>
          </>
        }
      >
       
        Would you like to revisit {cityName} community?
      </Alert>
    </Grid>
  )
}