import NextLink  from "next/link";
import {
    unrestrictedCampaignUrl,
    websiteTestUrl
} from '@/constants/give-butter/constants.js'
import { Link } from "@mui/material";

const DonateLink = ({ children, ...props }) => {
    return (
        <Link component={NextLink} {...props}>
            {children}
        </Link>
    );
}

const UnrestrictedDonateLink  = (props) => DonateLink({href: unrestrictedCampaignUrl, ...props});
const WebsiteTestDonateLink = (props) => DonateLink({href: websiteTestUrl, ...props});

export {UnrestrictedDonateLink, WebsiteTestDonateLink, DonateLink};