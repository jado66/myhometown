import { SvgIcon } from "@mui/material";

const BikeIcon = ({ fillColor = "#318d43", sx }) => (
  <SvgIcon viewBox="0 0 360 360" sx={{ ...sx }}>
    <style type="text/css">
      {`
        .bike-c{fill:${fillColor};}
      `}
    </style>
    <path
      className="bike-c"
      d="M182.6,351.7c-11.4,0-20.6-9.2-20.6-20.6v-167.1c0-11.4,9.2-20.6,20.6-20.6s20.6,9.2,20.6,20.6v167.1c0,11.4-9.2,20.6-20.6,20.6ZM182.6,157.5c-3.6,0-6.6,3-6.6,6.6v167.1c0,3.6,3,6.6,6.6,6.6s6.6-3,6.6-6.6v-167.1c0-3.6-3-6.6-6.6-6.6Z"
    />
    <path
      className="bike-c"
      d="M220.4,251c-3.9,0-7-3.1-7-7v-77.2c0-19.6-13.8-35.5-30.7-35.5s-30.7,15.9-30.7,35.5v77.2c0,3.9-3.1,7-7,7s-7-3.1-7-7v-77.2c0-27.3,20.1-49.5,44.7-49.5s44.7,22.2,44.7,49.5v77.2c0,3.9-3.1,7-7,7Z"
    />
    <path
      className="bike-c"
      d="M182.6,129.3c-15.8,0-28.6-12.8-28.6-28.6s12.8-28.6,28.6-28.6,28.6,12.8,28.6,28.6-12.8,28.6-28.6,28.6ZM182.6,86c-8.1,0-14.6,6.6-14.6,14.6s6.6,14.6,14.6,14.6,14.6-6.6,14.6-14.6-6.6-14.6-14.6-14.6Z"
    />
    <path
      className="bike-c"
      d="M182.6,83c-3.9,0-7-3.1-7-7v-32.2c0-3.9,3.1-7,7-7s7,3.1,7,7v32.2c0,3.9-3.1,7-7,7Z"
    />
    <g>
      <path
        className="bike-c"
        d="M153.9,59.8c-4.5,0-11.3-2.1-27.3-17.6-5.5-5.4-10.4-10.7-13.1-13.6h-38.1c-3.9,0-7-3.1-7-7s3.1-7,7-7h41.3c2,0,3.9.9,5.3,2.4,12.7,14.6,27.7,28,32.1,28.8,9.1,0,24.2-3.8,24.3-3.8,3.7-.9,7.5,1.3,8.5,5.1.9,3.8-1.3,7.5-5.1,8.5-.7.2-17.1,4.2-27.9,4.2Z"
      />
      <path
        className="bike-c"
        d="M211.3,59.8c-10.8,0-27.2-4.1-27.9-4.2-3.8-.9-6-4.7-5.1-8.5s4.7-6,8.5-5.1c.2,0,15.3,3.8,24.3,3.8,4.4-.8,19.4-14.2,32.1-28.8,1.3-1.5,3.3-2.4,5.3-2.4h41.3c3.9,0,7,3.1,7,7s-3.1,7-7,7h-38.1c-2.7,3-7.6,8.3-13.1,13.6-16,15.5-22.8,17.6-27.3,17.6Z"
      />
    </g>
    <g>
      <path
        className="bike-c"
        d="M123.3,273.1h-31.2c-3.9,0-7-3.1-7-7s3.1-7,7-7h31.2c3.9,0,7,3.1,7,7s-3.1,7-7,7Z"
      />
      <path
        className="bike-c"
        d="M280.4,209.4h-31.2c-3.9,0-7-3.1-7-7s3.1-7,7-7h31.2c3.9,0,7,3.1,7,7s-3.1,7-7,7Z"
      />
    </g>
  </SvgIcon>
);

export default BikeIcon;
