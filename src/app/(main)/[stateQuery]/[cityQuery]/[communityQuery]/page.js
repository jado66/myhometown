'use client'
import { Card, CardActions, CardContent, CardHeader, Container, Divider, Grid, Typography, Button, Link } from '@mui/material';
import GallerySLC from '@/views/supportingPages/About/components/GallerySLC/Gallery';
import ContentEditable from 'react-contenteditable'
import { useEffect, useState, useRef } from 'react';
import UpcomingEvents from '@/components/events/UpcomingEvents';
import { EventsCalendar } from '@/components/events/EventsCalendar';
import { EventDialog } from '@/components/events/EventDialog';
import useEvents from '@/hooks/use-events';

import Loading from '@/components/util/Loading';
import useCommunity from '@/hooks/use-community';
import BackButton from '@/components/BackButton';

const Page = ({ params }) =>{
    const { stateQuery, cityQuery, communityQuery } = params; //TODO change me to stateQuery... VsCode hates renaming folders

    const {community, hasLoaded} = useCommunity(communityQuery, cityQuery, stateQuery, )

    // Call the useCities function with the community parameter to fetch the data 
    const paragraph1Ref = useRef()
    const paragraph2Ref = useRef()

    const {events, isLoading, error, deleteEvent, modifyEvent, updateEvent} = useEvents()


    const [selectedEvent, setSelectedEvent] = useState(null)

    const closeEventDialog = () => {
        setSelectedEvent(null)
    }

    const onSelectEvent = (event) => {
        setSelectedEvent(event)
    }

    const handleParagraphChange = (e, name) => {
        const { value } = e.target

        if(name === 'paragraph1'){
            setParagraph1Text(value)
        }else{
            setParagraph2Text(value)
        }

        localStorage.setItem(name, value)
    }

    if (!hasLoaded){
        return (<>
            <div style = {{height:'100vh', padding: '5em', justifyContent:'center', display:'flex'}}>
                <Loading size = {100}/>
            </div>
        </>)
    }

    if (hasLoaded && !community){
        return (
            <div style = {{height:'calc(100%-200px)', padding: '5em', justifyContent:'center', display:'flex'}}>
                <Typography variant="h2" align="center" sx = {{my:3}}>Community not found</Typography>
            </div>
        )
    }

    return (
        <>
            <EventDialog open={selectedEvent} onClose={closeEventDialog} event={selectedEvent} />

            <Container  sx = {{paddingTop:3, marginBottom:2, position:'relative'}}>

                <BackButton 
                    text={`Back to ${cityQuery.replaceAll('-',' ')}`}
                    href={`../../../${stateQuery}/${cityQuery}`}
                />

                <Typography variant="h2" align="center" sx = {{textTransform:"capitalize"}}>
                    {communityQuery.replaceAll('-',' ')} Community
                </Typography>
                <GallerySLC />
                
                <Grid container spacing={2} paddingY = {3}>
                    <Grid item xs={6}>
                        <Typography variant="h4"  align="center">
                            Description
                        </Typography>

                        {/* <ContentEditable
                           innerRef={paragraph1Ref}
                           html={}
                           disabled={false}
                           onChange={(event) => handleParagraphChange(event, 'paragraph1')}
                           tagName="p"
                           name="paragraph1"
                        />
                        <Divider/>
                        <ContentEditable
                            innerRef={paragraph2Ref}
                            html={paragraph2Text}
                            disabled={false}
                            onChange={(event) => handleParagraphChange(event, 'paragraph2')}
                            tagName="p"
                            name="paragraph2"
                        /> */}
                    </Grid>
                    <Grid item xs={6}>
                        <Card sx = {{height:"300px", alignContent:"center", justifyContent:"center"}}>
                            <Typography 
                                variant="h4" 
                                component="h2" 
                                align="center"
                            >
                                Community map
                            </Typography>
                        </Card>

                    </Grid>
                </Grid>

                <Divider sx = {{my:5}}/>

                <UpcomingEvents events={events} maxEvents = {5} isLoading = {isLoading}/>

                <Divider sx = {{my:5}}/>

                <EventsCalendar events={events} onSelectEvent={onSelectEvent} isLoading = {isLoading}/>
               
              
            </Container>
        </>
        
    );
};

export default Page;