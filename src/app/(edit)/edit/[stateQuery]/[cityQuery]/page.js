'use client'
import { Box, Card, Container, Divider, Grid, IconButton, TextField, Tooltip, Typography } from '@mui/material';
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
import { cityTemplate } from '@/constants/templates/cityTemplate';
import { useHandleEvents } from '@/hooks/use-handle-events';
import RoleGuard from '@/guards/role-guard';
import { useUser } from '@/hooks/use-user';
import { Info } from '@mui/icons-material';
import UploadImage from '@/components/util/UploadImage';
import { CommunityCard } from '@/components/CommunityCard';


const Page = ({ params }) =>{

    const { user } = useUser()

    const { stateQuery, cityQuery } = params

    const {city, hasLoaded} = useCity(cityQuery, stateQuery, cityTemplate)

    const {data: cityData, setData: setCityData, setEntityType} = useEdit()

    let events, content; 

    if(cityData) {
        ({events, content} = cityData);
    }

    useEffect(() => {
        if (city){
            setCityData(city)
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
    
    const setEvents = (events) => {
        // this is cityData.events
        setCityData({
            ...cityData,
            events
        })
    }

    const {deleteEvent, modifyEvent, addEvent} = useHandleEvents(setEvents)

    const closeEventDialog = () => {
        setSelectedEvent(null)
        setIsCreatingNewEvent(false)
    }

    const onSelectEvent = (event) => {
        setSelectedEvent(event)
    }

    const handleSaveEvent = (event) => {
        if (isCreatingNewEvent) {
            addEvent(event)
        }
        else{
            modifyEvent(event)
        }
        setSelectedEvent(null)
        setIsCreatingNewEvent(false)
    }

    const handleChangeMap = (url) => {
        setCityData({
            ...cityData,
            content:{
                ...cityData.content,
                mapUrl:url
            }
        })
    }

    const handleChangePhoto = (url, key) => {
        setCityData((prevState) => {
            const newPhotos = { ...prevState.content.galleryPhotos };
            if (newPhotos[key]) {
                newPhotos[key] = { 
                ...newPhotos[key], 
                src: url 
                }
            }
        
            return {
                ...prevState,
                    content: {
                        ...prevState.content,
                        galleryPhotos: newPhotos,
                },
            };
        });
    };
      
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

    const setCommunityPhotoUrl = (communityId, url) => {
        setCityData((prevState) => {
            const newCommunities = [...prevState.communities];
            const index = newCommunities.findIndex((community) => community._id === communityId);
            newCommunities[index].photoUrl = url;
            return {
                ...prevState,
                communities: newCommunities,
            };
        });
    };

    const communityCardSize = city?.communities?.length ? 
    12 / city.communities.length : 12

    const cityName = cityQuery.replaceAll('-',' ')

    return (
        <>                 
            <Container  sx = {{paddingTop:3, marginBottom:2}}>

                <Typography variant="h2" align="center" sx = {{textTransform:"capitalize"}} color = 'primary'>
                    MyHometown {cityName} - {stateQuery.replaceAll('-',' ')}
                </Typography>


                <PhotoGallery 
                    photos ={content?.galleryPhotos} 
                    changePhoto={handleChangePhoto}
                    isEdit
                />
                
                <Grid container spacing={2} paddingY = {3} >
                    <Grid item xs={12} md = {6}>
                        <Typography variant="h4"  align="center" color='primary' sx = {{textTransform:"capitalize"}}>
                            What is MyHometown {cityName}?
                        </Typography>

                        <TextField
                            variant='standard'
                            defaultValue={content?.paragraph1Text}
                            onChange={(event) => handleParagraphChange(event, 'paragraph1')}
                            multiline
                            InputProps={{
                                disableUnderline: true,
                                sx: {fontSize: '1rem'}
                                
                            }}
                            fullWidth
                            sx={{
                                fontFamily: 'inherit',
                                fontSize: '1rem',
                                border: 'none',
                                margin: 0,
                                padding: '10px 16px',
                                '& .MuiInput-underline:before': {
                                  borderBottom: 'none',
                                },
                                '& .MuiInput-underline:hover:not(.Mui-disabled):before': {
                                  borderBottom: 'none',
                                },
                                '& .MuiInput-underline:after': {
                                  borderBottom: 'none',
                                }
                            }}
                        />
                        <Divider />
                        <TextField
                            variant='standard'
                            defaultValue={cityData.content?.paragraph2Text}
                            onChange={(event) => handleParagraphChange(event, 'paragraph2')}
                            multiline
                            InputProps={{
                                disableUnderline: true,
                            }}
                            fullWidth
                            sx={{
                                fontFamily: 'inherit',
                                fontSize: '1rem',
                                border: 'none',
                                margin: 0,
                                padding: '10px 16px',
                                '& .MuiInput-underline:before': {
                                  borderBottom: 'none',
                                },
                                '& .MuiInput-underline:hover:not(.Mui-disabled):before': {
                                  borderBottom: 'none',
                                },
                                '& .MuiInput-underline:after': {
                                  borderBottom: 'none',
                                }
                            }}
                        />
                    </Grid>
                    <Grid item xs={12} md = {6}>
                        <Card 
                            sx = {{
                                height:"569px", 
                                alignContent:"center", 
                                justifyContent:"center",
                                position:'relative'
                            }}
                        >
                        
                            <RoleGuard 
                                roles={['admin']} 
                                user = {user}
                                alternateContent={
                                    <Tooltip title="Only an Admin can modify this." placement='top' arrow>
                                        <Info                                         
                                            style = {{position:'absolute', top:0, right:0, margin: '0.5em'}}
                                        />
                                    </Tooltip>
                                }
                            >
                                <Box 
                                    display="flex"
                                    justifyContent="center"
                                    alignItems="center"
                                    position='relative'
                                    sx = {{width: '100%', height:"100%", backgroundColor:'transparent'}}
                                >
                                    <UploadImage setUrl={handleChangeMap}/>
                                    {
                                        cityData.content?.mapUrl ?
                                        <img 
                                            src={cityData.content.mapUrl} 
                                            style={{width:'100%', height:'auto', objectFit:'cover'}}
                                        />
                                        :
                                        <Typography 
                                            variant="h4" 
                                            component="h2" 
                                            align="center"
                                        >
                                            Community map
                                        </Typography> 
                                    }
                                </Box>
                            </RoleGuard>
                        </Card>
                    </Grid>
                </Grid>

                <Typography 
                    variant="h4" 
                    component="h2" 
                    textAlign="center"
                    color = 'primary'
                    gutterBottom
                    sx = {{textTransform:'capitalize'}}
                >
                    {cityName}&apos;s Communities
                </Typography>


                <Grid container spacing={2} paddingY = {3} >
                {
                    city.communities && city.communities.map((community, index) => 
                        <CommunityCard
                            key = {community.name}
                            community={community}
                            city = {cityQuery}
                            gridProps = {{xs: 12, sm:communityCardSize}}
                            index = {index}
                            setPhotoUrl={setCommunityPhotoUrl}
                            isEdit
                        />
                    )
                }
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
                    events={cityData.events} 
                    maxEvents = {5} 
                    isLoading = {false}
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

function onPasteAsPlainText(event) {
    event.preventDefault();
    var text = event.clipboardData.getData('text/plain');
    document.execCommand("insertHTML", false, text);
  }