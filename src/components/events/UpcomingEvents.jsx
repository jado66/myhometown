import * as React from 'react';
import { Box, Card, CardContent, Typography, List, ListItem, Divider } from '@mui/material';
import Loading from '../util/Loading';

const UpcomingEvents = ({ events, isLoading, maxEvents }) => {
  
  // This function formats the date and time in an easily readable format
  const dateFormatter = (date, allDay) => {
    date = new Date(date);
    let hoursMinutesFormat = { hour: 'numeric', minute: 'numeric' };
    let month = date.toLocaleDateString(undefined, { month: 'short' }); 
    let day = date.getDate();
    let weekday = date.toLocaleDateString(undefined, { weekday: 'short' });


    if(allDay) {
      return `${weekday} ${month} ${day}`;
    } else {
      return `${weekday} ${month} ${day}, ${date.toLocaleTimeString([], hoursMinutesFormat)}`;
    }
  };

  // Sort events by start date, then slice array to contain at most maxEvents items
  const sortedEvents = [...events].sort((a, b) => a.start - b.start).slice(0, maxEvents);

  if (isLoading) {
    return <Loading />;
  }

  if (events.length === 0) {
    return (
      <Typography variant="h5" component="h2" color = 'primary' textAlign='center' gutterBottom>
        No upcoming events
      </Typography>
    );
  }

  return (
   <>
    <Typography variant="h5" component="h2" color = 'primary' textAlign='center' gutterBottom>
      Upcoming Events
    </Typography>
    <List>
      {sortedEvents.map((event, index) => {
        const startDateObj = new Date(event.start);
        const endDateObj = new Date(event.end);
      
        // Check if they are valid date objects
        if (isNaN(startDateObj) || isNaN(endDateObj)) {
          return null; 
        }
        
        const startDate = dateFormatter(startDateObj, event.allDay);
        let endDate;

        if(endDateObj.getDate() != startDateObj.getDate()){
          // If event spans multiple days, show end date
          endDate = dateFormatter(event.end, event.allDay);
        }else{
          // If event is within a single day, show end time only
          endDate = endDateObj.toLocaleTimeString([], { hour: 'numeric', minute: 'numeric' });
        }
        return (
          <Card key={index} sx = {{p:2, mb:1, display:'flex', flexDirection:'row'}} >
            <Box display="flex" sx = {{minWidth:'300px'}} flexDirection='column'>
              <Typography variant="body2" sx={{ color: '#777', minWidth:"275px" }} gutterBottom>
                {`${startDate}`}
                {!event.allDay ? ` - ${endDate}` : ", All Day Event"}
              </Typography>
             
              <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>{event.location.replaceAll('-',' ')}</Typography>

            </Box>

            <Divider orientation="vertical" flexItem sx = {{mx:3}}/>

            <Box display="flex" flexDirection='column'>
              <Typography variant="body1" gutterBottom>{event.title}</Typography>
              <Typography variant="body2">{event.description}</Typography>
            </Box>
          </Card>
        );
      })}
      </List>
    </>
  );
};

export default UpcomingEvents;