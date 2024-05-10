import { Grid, Chip } from "@mui/material";
import { HtmlTooltip } from "./HtmlTooltip";

const CityOrCommunityCell = ({ params, type }) => {
    return (
        <Grid display='flex'>
            {params.value.map((element, index) => (
                <HtmlTooltip title={
                        <Grid display='flex' container direction='column'>
                            <div style={{textTransform:'capitalize'}}>{type} Name: {element.name}</div>
                            {
                                type === 'community' ?
                                <div>City: {element.cityName}</div>
                                :
                                <div>State: {element.state}</div>
                            }
                        </Grid>
                    }
                    placement="top" 
                    key={index} 
                    arrow
                >
                    <Chip sx={{ mr: 2 }} label={element.name} />
                </HtmlTooltip>
            ))}
        </Grid>
    );
}

export {CityOrCommunityCell};