'use client'
import { Card, Container, Divider, Grid, Typography } from '@mui/material';
import { fa, faker } from '@faker-js/faker';
import GallerySLC from '@/views/supportingPages/About/components/GallerySLC/Gallery';
import ContentEditable from 'react-contenteditable'
import { useEffect, createRef, useState, useRef } from 'react';
import UpcomingEvents from '@/components/events/UpcomingEvents';
import { EventsCalendar } from '@/components/events/EventsCalendar';
import createFakeEvents from '@/util/events/create-fake-events';
import { EventDialog } from '@/components/events/EventDialog';
import useEvents from '@/hooks/use-events';

const Page = ({ params }) =>{
    const { state, city } = params;

    // Call the useCities function with the city parameter to fetch the data
    const fakeCityImage = faker.image.urlLoremFlickr({ category: 'city' })

 
    const paragraph1Ref = useRef()
    const paragraph2Ref = useRef()

    const [paragraph1Text, setParagraph1Text] = useState(faker.lorem.paragraph())
    const [paragraph2Text, setParagraph2Text] = useState(faker.lorem.paragraph())

    const randomInt = Math.floor(Math.random() * 50)+10

    const {events, isLoading, error, deleteEvent, modifyEvent, updateEvent} = useEvents()


    const [selectedEvent, setSelectedEvent] = useState(null)

    const closeEventDialog = () => {
        setSelectedEvent(null)
    }

    const onSelectEvent = (event) => {
        setSelectedEvent(event)
    }

    useEffect(() => {
        const storedParagraph1 = localStorage.getItem('paragraph1')
        const storedParagraph2 = localStorage.getItem('paragraph2')

        if(storedParagraph1){
            setParagraph1Text(storedParagraph1)
        }

        if(storedParagraph2){
            setParagraph2Text(storedParagraph2)
        }
    }, [])

    const handleParagraphChange = (e, name) => {
        const { value } = e.target

        if(name === 'paragraph1'){
            setParagraph1Text(value)
        }else{
            setParagraph2Text(value)
        }

        localStorage.setItem(name, value)
    }

    return (
        <>
            
            <Container  sx = {{paddingTop:3, marginBottom:2}}>
                <Typography variant="h2" align="center" sx = {{textTransform:"capitalize"}}>
                    MyHometown {city.replaceAll('-',' ')} - {state}
                </Typography>
                <GallerySLC />
                
                <Grid container spacing={2} paddingY = {3}>
                    <Grid item xs={6}>
                        <Typography variant="h4"  align="center">
                            Description
                        </Typography>

                        <ContentEditable
                           innerRef={paragraph1Ref}
                           html={paragraph1Text}
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
                        />
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

                <EventDialog open={selectedEvent} onClose={closeEventDialog} event={selectedEvent} />

                <UpcomingEvents events={events} maxEvents = {5} isLoading = {isLoading}/>

                <EventsCalendar events={events} onSelectEvent={onSelectEvent} isLoading = {isLoading}/>
               
              
            </Container>
        </>
        
    );
};

export default Page;
