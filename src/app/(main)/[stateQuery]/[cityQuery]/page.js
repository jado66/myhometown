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
    const { stateQuery, cityQuery } = params; //TODO change me to stateQuery... VsCode hates renaming folders

    const {city, hasLoaded} = useCity(cityQuery, stateQuery)

    // Call the useCities function with the city parameter to fetch the data 
    const paragraph1Ref = useRef()
    const paragraph2Ref = useRef()

    const [paragraph1Text, setParagraph1Text] = useState(faker.lorem.paragraph())
    const [paragraph2Text, setParagraph2Text] = useState(faker.lorem.paragraph())

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

    const communityCardSize = city?.communities?.length ? 
        12 / city.communities.length : 12

    return (
        <>
            <EventDialog open={selectedEvent} onClose={closeEventDialog} event={selectedEvent} />

            <Container  sx = {{paddingTop:3, marginBottom:2}}>
                <Typography variant="h2" align="center" sx = {{textTransform:"capitalize"}}>
                    MyHometown {cityQuery.replaceAll('-',' ')} - {stateQuery.replaceAll('-',' ')}
                </Typography>
                <PhotoGallery photos={city.content.galleryPhotos} />

                <Grid container spacing={2} paddingY = {3}>
                    <Grid item xs={12} sm = {6} >
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
                    <Grid item xs={12} sm = {6}>
                        <Card sx = {{height:"300px", alignContent:"center", justifyContent:"center"}}>
                            <Typography 
                                variant="h4" 
                                component="h2" 
                                align="center"
                            >
                                City map
                            </Typography>
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
                >
                    Communities
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

                <UpcomingEvents events={events} maxEvents = {5} isLoading = {isLoading}/>

                <Divider sx = {{my:5}}/>

                <EventsCalendar events={events} onSelectEvent={onSelectEvent} isLoading = {isLoading}/>
               
              
            </Container>
        </>
        
    );
};

export default Page;

const CommunityCard = ({city, community, gridProps, index}) => {
    // community has id, name, and href for picture
    // TODO add hover

    const url = `/images/community-${index}.jfif`

    const {name, _id, pictureHref} = community

    const href = `${city}/${name.toLowerCase().replace(' ','-')}`

    return(
        <Grid 
            item
            sm = {gridProps.sm}
            xs = {gridProps.xs}
        >    
            <Link
                component={NextLink}
                href = {href}
                to = {href}
                // todo there's a better way to do this
                sx = {{textDecoration:'none'}}
            >
                <Card
                    sx = {{
                        minHeight:'400px',
                        display:'flex',
                        flexDirection:'column',
                        '&:hover':{
                            backgroundColor : '#f8f8f8' //TODO make this a theme pallete color
                        }
                    }}
                >
                    <CardHeader 
                        title={
                        <Typography
                            variant="h5"
                            align="center"
                        >
                            {name}
                        </Typography>
                        } 
                    />
                    <CardContent
                        sx = {{flexGrow:1, display: 'flex', flexDirection:'column', justifyContent:'center'}}
                    >
                        <img src = {url} style = {{borderRadius:'1em', height:'300px'}}/>
                    </CardContent>
                    <CardActions>
                        <Button
                            sx = {{mx:'auto',mb:2}}
                            variant='outlined'
                            color='primary'
                            size='large'

                        >
                            Enter Community Page
                        </Button>
                    </CardActions>
                </Card>
            </Link>
        </Grid>
    )

}