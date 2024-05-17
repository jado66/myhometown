import { Grid, Link, Card, CardHeader, Typography, CardContent, CardActions, Button } from "@mui/material"
import NextLink from "next/link"

export const CommunityCard = ({city, community, gridProps, index, isEdit}) => {
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
                            {isEdit?"Edit ":"Enter "} Community Page
                        </Button>
                    </CardActions>
                </Card>
            </Link>
        </Grid>
    )

}