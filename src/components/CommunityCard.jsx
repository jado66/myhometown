import { Grid, Link, Card, CardHeader, Typography, CardContent, CardActions, Button } from "@mui/material"
import NextLink from "next/link"
import UploadImage from "./util/UploadImage"
import { useRouter } from "next/navigation"

export const CommunityCard = ({city, community, gridProps, index, isEdit, setPhotoUrl = ()=>{}}) => {
    // community has id, name, and href for picture
    // TODO add hover

    const router = useRouter()

    const goToCommunity = () => {
        router.push(`/${city}/${community.name.toLowerCase().replace(' ','-')}`)
    }

    const placeholderUrl = `/images/placeholder.svg`

    const {name, _id, photoUrl} = community

    const href = `${city}/${name.toLowerCase().replace(' ','-')}`

    const setPhotoUrlHandler = (url) => {
        setPhotoUrl(_id, url)
    }

    const CardContents = (
        <Card
            sx = {{
                position:'relative',

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
                sx = {{
                    flexGrow:1, 
                    display: 'flex', 
                    flexDirection:'column', 
                    justifyContent:'center'
                }}
            >
            
                <Grid sx = {{position:'relative'}}> 
                {
                    isEdit &&
                    <UploadImage setUrl = {setPhotoUrlHandler} />
                }
                    <img  src = {photoUrl || placeholderUrl} style={{width:'100%', height:'auto', maxHeight:'300px', objectFit:'cover'}}/>
                </Grid>
            </CardContent>
            <CardActions>
                <Button
                    sx = {{mx:'auto',mb:2}}
                    variant='outlined'
                    color='primary'
                    size='large'
                    onClick = {goToCommunity}
                >
                    {isEdit?"Edit ":"Enter "} Community Page
                </Button>
            </CardActions>
        </Card>
    )


    return(
        <Grid 
            item
            sm = {gridProps.sm}
            xs = {gridProps.xs}
        >    
            {
                !isEdit ? (
                    <Link
                        component={NextLink}
                        href={href}
                        // To prop is not required here, Next.js uses href
                        sx={{ textDecoration: 'none' }}
                    >
                        {CardContents}
                    </Link>
                ) : (
                    CardContents
                )
            }
        </Grid>
    )

}