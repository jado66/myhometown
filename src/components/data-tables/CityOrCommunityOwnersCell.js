import { Grid, Chip } from "@mui/material";
import { HtmlTooltip } from "./HtmlTooltip";

const OnwersCell = ({ params }) => {
    return (
        <Grid display='flex'>
            {params.value.map((owner, index) => (
                <HtmlTooltip title={
                        <Grid display='flex' container direction='column'>
                            <div>Name: {owner.name}</div>
                            <div>Email: {owner.email}</div>
                            <div>Phone: {owner.contactNumber}</div>
                        </Grid>
                    }
                    placement="top" 
                    key={index} 
                    arrow
                >
                    <Chip sx={{ mr: 2 }} label={owner.name} />
                </HtmlTooltip>
            ))}
        </Grid>
    );
}

export {OnwersCell};