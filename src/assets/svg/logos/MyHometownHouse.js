import { SvgIcon } from "@mui/material";

export const MyHometownHouse = ({fill = '#ffffff', sx}) => {
    return (
        <SvgIcon
            sx={sx}
            viewBox="0 0 245 300"
        >
           <polygon points="122.47 0 0 100.64 0 300 245 300 245 100.64 122.47 0" fill={fill} stroke-width="0"/>
        </SvgIcon>
    );
}