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
import useCity from '@/hooks/use-city';
import Loading from '@/components/util/Loading';
import { useEdit } from '@/hooks/use-edit';
import PhotoGallery from '@/components/PhotoGallery';

const cityDataContentTemplate = {
    paragraph1Text: faker.lorem.paragraph(),
    paragraph2Text: faker.lorem.paragraph(),
    galleryPhotos: [
        {
            key: '1',
            src: '',
            alt: 'placeholder',
            rows: 2,
            cols: 1,
        },
        {
            key: '2',
            src: '',
            alt: 'placeholder',
            rows: 1,
            cols: 2,
        },
        {
            key: '3',
            src: '',
            alt: 'placeholder',
            rows: 1,
            cols: 1,
        },
        {
            key: '4',
            src: '',
            alt: 'placeholder',
            rows: 1,
            cols: 1,
        },
        {
            key: '5',
            src: '',
            alt: 'placeholder',
            rows: 1,
        cols: 2,
        },
       
    ]
}

const Page = ({ params }) =>{

    const { stateQuery, cityQuery } = params

    const {city, hasLoaded} = useCity(cityQuery, stateQuery)

    const {data: cityData, setData: setCityData, setEntityType} = useEdit()

    useEffect(() => {
        if (city){
            setCityData({
                ...city,
                content:{...cityDataContentTemplate, ...city.content},
            })
            setEntityType('city')
        }
    }, [city])

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

    const handleChangePhoto = (url, key) => {
        setCityData(prevState => {
            
            const newPhotos = prevState.content.galleryPhotos.map(photo => {
                if (photo.key === key){
                    return {
                        ...photo,
                        src: url
                    }
                }
                return photo
            })

            return {
                ...prevState,
                content:{
                    ...prevState.content,
                    galleryPhotos: newPhotos
                }
            }
        })
    }


    const handleParagraphChange = (e, name) => {
        const { value } = e.target

        if(name === 'paragraph1'){
            setCityData({
                ...cityData,
                content:{
                    ...cityData.content,
                    paragraph1Text:value
                }
            })

        }else{
            setCityData({
                ...cityData,
                content:{
                    ...cityData.content,
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

    if (hasLoaded && !city){
        return (
            <div style = {{height:'100vh', padding: '5em', justifyContent:'center', display:'flex'}}>
                <Typography variant="h2" align="center" sx = {{my:3}}>City not found</Typography>
            </div>
            )
    }

    return (
        <>   
               
            <Container  sx = {{paddingTop:3, marginBottom:2}}>
                <Typography variant="h2" align="center" sx = {{textTransform:"capitalize"}}>
                    MyHometown {cityQuery.replaceAll('-',' ')} - {stateQuery.replaceAll('-',' ')}
                </Typography>


                <PhotoGallery 
                    photos ={cityData.content.galleryPhotos} 
                    changePhoto={handleChangePhoto}
                    isEdit
                />
                
                <Grid container spacing={2} paddingY = {3}>
                    <Grid item xs={12} md = {6}>
                        <Typography variant="h4"  align="center">
                            Description
                        </Typography>

                        <ContentEditable
                           innerRef={paragraph1Ref}
                           html={cityData.content.paragraph1Text}
                           disabled={false}
                           onChange={(event) => handleParagraphChange(event, 'paragraph1')}
                           tagName="p"
                           name="paragraph1"
                        />
                        <Divider/>
                        <ContentEditable
                              innerRef={paragraph2Ref}
                              html={cityData.content.paragraph2Text}
                              disabled={false}
                              onChange={(event) => handleParagraphChange(event, 'paragraph2')}
                              tagName="p"
                              name="paragraph2"
                        />
                    </Grid>
                    <Grid item xs={12} md = {6}>
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


                <EventDialog_NewEdit 
                    show = {isCreatingNewEvent || selectedEvent !== null}
                    onClose={closeEventDialog} 
                    event={selectedEvent} 
                    onSave={handleSaveEvent}
                    isEdit={!isCreatingNewEvent}
                />

                <Divider sx = {{my:5}}/>

                <UpcomingEvents 
                    events={events} 
                    maxEvents = {5} 
                    isLoading = {isLoading}
                    onSelect={onSelectEvent}
                    onAdd={startCreatingNewEvent}
                    isEdit
                />

                <Divider sx = {{my:5}}/>

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
