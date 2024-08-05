import { SvgIcon } from "@mui/material";

const LifeSkillsIcon = ({ fillColor = "#318d43", sx }) => (
  <SvgIcon viewBox="0 0 360 360" sx={{ ...sx }}>
    <style type="text/css">
      {`
        .c{fill:${fillColor};stroke-width:0px}
      `}
    </style>
    <path
      className="c"
      d="M328.03,243.14h-34.2v-88.91h19.57v31.6h14.76v-80.52h-14.76v31.59h-19.57v-4.32c0-12.67-5.43-24.77-14.9-33.2-7.3-6.49-16.48-10.34-26.06-11.1v-28.09c0-3.88-3.53-7.04-7.87-7.04s-7.87,3.16-7.87,7.04v29.06l-110.42,12.85c-14.77,1.72-28.78-6.24-34.88-19.8l-2.36-5.25c-1.89-4.19-6.07-6.89-10.66-6.89h-20.01c-6.4,0-11.6,5.2-11.6,11.6v103.92c0,6.4,5.2,11.6,11.6,11.6h2.86l7.15,31.43,6.25-31.43h3.34c5.15,0,9.61-3.31,11.11-8.24l5.26-17.31c4.63-15.25,19.5-25.32,35.38-23.95l39.1,3.37c9.65.83,18.36,5.87,23.89,13.83,5.53,7.95,7.22,17.87,4.64,27.22l-14.09,50.94H45.87c-7.54,0-13.67,6.13-13.67,13.67v36.38c0,7.54,6.13,13.67,13.67,13.67h282.17c7.54,0,13.67-6.13,13.67-13.67v-36.38c0-7.54-6.13-13.67-13.67-13.67ZM204.12,157.36c-7.81-11.22-20.1-18.34-33.71-19.51l-39.09-3.37c-22.12-1.92-42.87,12.12-49.31,33.38l-4.89,16.07h-16.54v-100.41h17.18l1.92,4.26c8.49,18.89,28.02,29.97,48.6,27.58l117.52-13.67c8.8-1.03,17.65,1.77,24.28,7.66,6.62,5.9,10.42,14.37,10.42,23.23v110.55h-82.91l13.11-47.38c3.64-13.18,1.25-27.18-6.55-38.4ZM328.03,256.49c.17,0,.31.14.31.31v36.38c0,.17-.14.31-.31.31H45.87c-.17,0-.31-.14-.31-.31v-36.38c0-.17.14-.31.31-.31h282.17Z"
    />
  </SvgIcon>
);

export default LifeSkillsIcon;
