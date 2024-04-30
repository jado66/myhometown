import 'react-big-calendar/lib/css/react-big-calendar.css'
import { Calendar, momentLocalizer, Views } from 'react-big-calendar'
import moment from 'moment'
import { Grid, styled, Typography, Card } from '@mui/material'
import { useMemo, useCallback } from 'react'
import Loading from '../util/Loading'

// Setup the localizer by providing the moment (or globalize, or Luxon) Object
// to the correct localizer.
const localizer = momentLocalizer(moment) // or globalizeLocalizer

const StyledCalendar = styled(Calendar)(({ theme }) => ({
    '.rbc-event': {
        '&.rbc-selected': {
            backgroundColor: theme.palette.secondary.main,
            color: 'black',
          },
        backgroundColor: theme.palette.primary.main,
    },

    '.rbc-today': {
        backgroundColor: theme.palette.secondary.light,
        
    },
    '.rbc-show-more':{
        color: theme.palette.primary.main,
    }
    
    
}))

export const EventsCalendar = ({events, onSelectEvent, onSelectSlot, isLoading}) => {
    
    const { defaultDate, views } = useMemo(() => ({
        defaultDate: new Date(),
        views: Object.keys(Views).map((k) => Views[k]),
    }),[])
  
    const handleSelectSlot = useCallback((slotInfo) => {
        if (!onSelectSlot) {
            return
        }
        onSelectSlot(slotInfo)
    }, [])

    const handleSelectEvent = useCallback((calEvent) => {
        if (!onSelectEvent) {
            return
        }
        onSelectEvent(calEvent)
    }, [])
  
    if (isLoading) {
        return <Loading />;
    }

    return (
       <>
            <Typography variant="h5" component="h2" color = 'primary' textAlign='center' gutterBottom>
                Event Calendar
            </Typography>
         
            <Card sx = {{padding:2, marginTop:2}}>
                <Grid item xs={12} sx = {{height:'600px'}}>
                    <StyledCalendar
                        localizer={localizer}
                        defaultView="month"
                        views={views}
                        defaultDate={defaultDate}
                        events={events}
                        showMultiDayTimes
                        step={60}
                        startAccessor="start"
                        endAccessor="end"
                        onSelectEvent={handleSelectEvent}
                        onSelectSlot={handleSelectSlot}
                        selectable
                    />
                </Grid>
            </Card>
        </>
    )
}