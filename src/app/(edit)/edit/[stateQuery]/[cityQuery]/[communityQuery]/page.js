'use client'
import { Card, Container, Divider, Grid, Typography } from '@mui/material';
import { fa, faker } from '@faker-js/faker';
import GallerySLC from '@/views/supportingPages/About/components/GallerySLC/Gallery';
import ContentEditable from 'react-contenteditable'
import { useEffect, createRef, useState, useRef } from 'react';
import createFakeEvents from '@/util/events/create-fake-events';
import UpcomingEvents from '@/components/events/UpcomingEvents';
import { EventsCalendar } from '@/components/events/EventsCalendar';
import { EventDialog } from '@/components/events/EventDialog';
import { EventDialog_NewEdit } from '@/components/events/EventDialog_NewEdit';
import useEvents from '@/hooks/use-events';
import useCommunity from '@/hooks/use-community';
import Loading from '@/components/util/Loading';
import { useEditCommunity } from '@/hooks/use-edit-community';

const communityDataContentTemplate = {
    paragraph1Text: faker.lorem.paragraph(),
    paragraph2Text: faker.lorem.paragraph()
}

const Page = ({ params }) =>{

    const { stateQuery, communityQuery } = params

    const {community, hasLoaded} = useCommunity(communityQuery, stateQuery)

    const {communityData, setCommunityData} = useEditCommunity()

    useEffect(() => {
        if (community){
            setCommunityData({
                content:{...communityDataContentTemplate},
                ...community
            })
        }
    }, [community])

    const paragraph1Ref = useRef()
    const paragraph2Ref = useRef()

    const [selectedEvent, setSelectedEvent] = useState(null)

    const [isCreatingNewEvent, setIsCreatingNewEvent] = useState(false)

    const startCreatingNewEvent = () => {
        setIsCreatingNewEvent(true)
    }

    const {events, isLoading, error, deleteEvent, modifyEvent, updateEvent} = useEvents()

    const closeEventDialog = () => {
        setSelectedEvent(null)
        setIsCreatingNewEvent(false)
    }

    const onSelectEvent = (event) => {
        setSelectedEvent(event)
    }

    const handleSaveEvent = (event) => {
        if (isCreatingNewEvent) {
            setEvents([...events, event])
        }
        else{
            setEvents(events.map(e => e.id === event.id ? event : e))
        }
        setSelectedEvent(null)
        setIsCreatingNewEvent(false)
    }

    const handleParagraphChange = (e, name) => {
        const { value } = e.target

        if(name === 'paragraph1'){
            setCommunityData({
                ...communityData,
                content:{
                    ...communityData.content,
                    paragraph1Text:value
                }
            })

        }else{
            setCommunityData({
                ...communityData,
                content:{
                    ...communityData.content,
                    paragraph2Text:value
                }
            })
        }
    }

    if (!hasLoaded){
        return (
            <div style = {{height:'100vh', padding: '5em', justifyContent:'center', display:'flex'}}>
                <Loading size = {100}/>
            </div>
        )
    }

    if (hasLoaded && !community){
        return (
            <div style = {{height:'100vh', padding: '5em', justifyContent:'center', display:'flex'}}>
                <Typography variant="h2" align="center" sx = {{my:3}}>Community not found</Typography>
            </div>
            )
    }

    return (
        <>
            
            <Container  sx = {{paddingTop:3, marginBottom:2}}>
                <Typography variant="h2" align="center" sx = {{textTransform:"capitalize"}}>
                    MyHometown {communityQuery.replaceAll('-',' ')} - {stateQuery.replaceAll('-',' ')}
                </Typography>
                <GallerySLC />
                
                <Grid container spacing={2} paddingY = {3}>
                    <Grid item xs={6}>
                        <Typography variant="h4"  align="center">
                            Description
                        </Typography>

                        <ContentEditable
                           innerRef={paragraph1Ref}
                           html={communityData.content.paragraph1Text}
                           disabled={false}
                           onChange={(event) => handleParagraphChange(event, 'paragraph1')}
                           tagName="p"
                           name="paragraph1"
                        />
                        <Divider/>
                        <ContentEditable
                              innerRef={paragraph2Ref}
                              html={communityData.content.paragraph2Text}
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

                <Divider/>

                <EventDialog_NewEdit 
                    show = {isCreatingNewEvent || selectedEvent !== null}
                    onClose={closeEventDialog} 
                    event={selectedEvent} 
                    onSave={handleSaveEvent}
                    isEdit={!isCreatingNewEvent}
                />

                <UpcomingEvents events={events} maxEvents={3}/>

                <EventsCalendar 
                    events={events} 
                    onSelectEvent={onSelectEvent}
                    onSelectSlot={(slot)=>setSelectedEvent(slot)}
                />
              
            </Container>
        </>
        
    );
};

export default Page;
