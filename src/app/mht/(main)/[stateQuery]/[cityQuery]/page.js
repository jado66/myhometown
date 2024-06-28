'use client'
import { Card, CardActions, CardContent, CardHeader, Container, Divider, Grid, Typography, Button, Link } from '@mui/material';
import { faker } from '@faker-js/faker';
import GallerySLC from '@/views/supportingPages/About/components/GallerySLC/Gallery';
import ContentEditable from 'react-contenteditable'
import { useEffect, useState, useRef } from 'react';
import UpcomingEvents from '@/components/events/UpcomingEvents';
import { EventsCalendar } from '@/components/events/EventsCalendar';
import { EventDialog } from '@/components/events/EventDialog';
import useEvents from '@/hooks/use-events';
import useCity from '@/hooks/use-city';
import NextLink from 'next/link';
import Loading from '@/components/util/Loading';
import PhotoGallery from '@/components/PhotoGallery';
import { cityTemplate } from '@/constants/templates/cityTemplate';
import { CommunityCard } from '@/components/CommunityCard';
import CountUp from 'react-countup';
import VisibilitySensor from 'react-visibility-sensor';


const Page = ({ params }) =>{
    const { stateQuery, cityQuery } = params; //TODO change me to stateQuery... VsCode hates renaming folders

    const {city, hasLoaded} = useCity(cityQuery, stateQuery, cityTemplate)

    // Call the useCities function with the city parameter to fetch the data 

    const [selectedEvent, setSelectedEvent] = useState(null)

    const closeEventDialog = () => {
        setSelectedEvent(null)
    }

    const onSelectEvent = (event) => {
        setSelectedEvent(event)
    }

      
    const [viewPortEntered, setViewPortEntered] = useState(false);
    const setViewPortVisibility = (isVisible) => {
        if (viewPortEntered) {
        return;
        }

        setViewPortEntered(isVisible);
    };

    if (!hasLoaded){
        return (<>
            <div style = {{height:'100vh', padding: '5em', justifyContent:'center', display:'flex'}}>
                <Loading size = {100}/>
            </div>
        </>)
    }

    if (hasLoaded && !city){
        return (
            <div style = {{height:'calc(100%-200px)', padding: '5em', justifyContent:'center', display:'flex'}}>
                <Typography variant="h2" align="center" sx = {{my:3}}>City not found</Typography>
            </div>
        )
    }

    const cityName = cityQuery.replaceAll('-',' ')

    const communityCardSize = city?.communities?.length ? 
        12 / city.communities.length : 12

    console.log(city)



    

    return (
        <>
            <EventDialog open={selectedEvent} onClose={closeEventDialog} event={selectedEvent} />

            <Container  sx = {{paddingTop:3, marginBottom:2}}>
                <Typography variant="h2" align="center" sx = {{textTransform:"capitalize"}}>
                    MyHometown {cityName} - {stateQuery.replaceAll('-',' ')}
                </Typography>

                <PhotoGallery photos={city.content.galleryPhotos} />

                <Grid container spacing={2} paddingY = {3}>
                    <Grid item xs={12} sm = {6} >
                        <Typography variant="h4"  align="center" color='primary' sx = {{textTransform:"capitalize"}}>
                            What is MyHometown {cityName}?
                        </Typography>

                        <MultiLineTypography text={city.content.paragraph1Text} /> 
                       
                        <Divider/>
                        
                        <MultiLineTypography text={city.content.paragraph2Text} />

                    </Grid>
                    <Grid item xs={12} sm = {6}>
                        <Card sx = {{height:"569px", alignContent:"center", justifyContent:"center"}}>
                            {
                                city.content?.mapUrl ?
                                <img 
                                    src={city.content?.mapUrl} 
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
                        </Card>

                    </Grid>
                </Grid>

                <Divider sx = {{my:5}}/>

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
                        />
                    )
                }
                </Grid> 

                <Divider sx = {{my:5}}/>

                {
                    city.stats &&
                    <Grid container spacing={2} paddingY = {3} >
                        <Grid item md={4}>
                            <Typography
                                variant="h3"
                                align={'center'}
                                gutterBottom
                                sx={{
                                    fontWeight: 'medium',
                                }}
                            >
                                <VisibilitySensor
                                    onChange={(isVisible) => setViewPortVisibility(isVisible)}
                                    delayedCall
                                    >
                                    <CountUp
                                        redraw={false}
                                        end={viewPortEntered ? city.stats.volunteerHours : 0}
                                        start={0}
                                    />
                                </VisibilitySensor>
                            </Typography>
                        
                            <Typography color="text.secondary" align={'center'} component="p">
                                Volunteer Hours
                            </Typography>
                        </Grid>
                        <Grid item md={4}>
                            <Typography
                                variant="h3"
                                align={'center'}
                                gutterBottom
                                sx={{
                                    fontWeight: 'medium',
                                }}
                            >
                                <VisibilitySensor
                                    onChange={(isVisible) => setViewPortVisibility(isVisible)}
                                    delayedCall
                                    >
                                    <CountUp
                                        redraw={false}
                                        end={viewPortEntered ? city.stats.numTeachersVolunteers : 0}
                                        start={0}
                                       
                                    />
                                </VisibilitySensor>
                            </Typography>
                        
                            <Typography color="text.secondary" align={'center'} component="p">
                                Volunteers
                            </Typography>
                        </Grid>
                        <Grid item md={4}>
                            <Typography
                                variant="h3"
                                align={'center'}
                                gutterBottom
                                sx={{
                                    fontWeight: 'medium',
                                }}
                            >
                                <VisibilitySensor
                                    onChange={(isVisible) => setViewPortVisibility(isVisible)}
                                    delayedCall
                                    >
                                    <CountUp
                                        redraw={false}
                                        end={viewPortEntered ? city.stats.serviceProjects : 0}
                                        start={0}
                                    />
                                </VisibilitySensor>
                            </Typography>
                        
                            <Typography color="text.secondary" align={'center'} component="p">
                                Projects Completed
                            </Typography>
                        </Grid>

                        <Grid item md={12}>

                        <Divider sx = {{my:5}}/>
                        </Grid>

                    </Grid>
                }

                
                <UpcomingEvents events={city.events} maxEvents = {5} />

                {
                    city.events?.length !== 0 &&
                    <>
                    
                        <Divider sx = {{my:5}}/>

                        <EventsCalendar events={city.events} onSelectEvent={onSelectEvent} />

                    </>
                }
              
            </Container>
        </>
        
    );
};

export default Page;

const MultiLineTypography = ({text}) => {
    
    const paragraphs = text.split('\n')
    
    return (
        <div
            style={{padding: '10px 16px'}}
        >
        {paragraphs.map((text, index) => (
            <Typography 
                key={index} 
                variant="body1" 
                paragraph
                sx={{
                    width: 'fit-content',
                    
                    fontSize: 16,
                    lineHeight: '24px',
                }}

            >
            {   text}
            </Typography>
        ))}
        </div>
    )
}