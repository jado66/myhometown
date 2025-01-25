import { SvgIcon } from "@mui/material";

const LearningTreeIcon = ({ fillColor = "#318d43", sx }) => (
  <SvgIcon viewBox="0 0 360 360" sx={{ ...sx }}>
    <style type="text/css">
      {`
        .c{fill:${fillColor};}
      `}
    </style>
    <path
      className="c"
      d="M330.56,316.77h-8.15v-7.77c0-3.96-3.21-7.18-7.18-7.18-23.05,0-42.04-5.71-58.8-10.75-17.96-5.4-34.5-10.38-50.09-5.64-2.02-14.1-8.72-61.15-14.51-106.82,3.3-4.02,8.67-7.38,15.82-11.84.22-.14.45-.28.68-.42,7.23,2.3,20.19,3.24,27.55,3.24,1.15,0,2.16-.02,2.99-.07,3.96-.21,7-3.59,6.79-7.55s-3.59-7.01-7.55-6.79c-2.88.16-7.75-.02-12.61-.45,6.09-4.64,12.53-10.28,19.09-17.55,2.66-2.94,2.42-7.48-.52-10.13-2.94-2.65-7.48-2.42-10.13.52-12.15,13.47-24.2,20.98-33.88,27.02-3.68,2.29-7.18,4.48-10.37,6.8-1.15-9.36-2.22-18.47-3.17-27.02,1.06-.92,2.29-1.95,3.67-3.1,10.39-8.69,27.79-23.23,41.15-48.79,1.84-3.51.48-7.85-3.03-9.68-3.51-1.84-7.85-.48-9.68,3.03-2.96,5.66-6.16,10.73-9.44,15.28-.84-2.63-1.51-5.32-1.98-8.06-.67-3.91-4.37-6.53-8.29-5.86-3.91.67-6.53,4.38-5.86,8.29,1.07,6.23,2.94,12.29,5.55,18.01.05.1.11.2.16.3-5.06,5.44-9.93,9.81-14.07,13.34-.99-9.97-1.71-18.57-2.04-25.1-.03-.57-.13-1.13-.29-1.66-.26-8.41-.81-15.56-1.72-20.98-.65-3.91-4.35-6.55-8.26-5.9-3.91.65-6.55,4.35-5.9,8.26,1.41,8.44,1.88,21.64,1.71,37.5-5.38-6.1-13.19-16.08-24.64-32.75-2.24-3.27-6.71-4.1-9.98-1.85-3.27,2.24-4.09,6.71-1.85,9.98,2.06,2.99,3.99,5.76,5.84,8.37-4.67-1.05-9.45-2.59-12.69-4.97-3.19-2.35-7.68-1.67-10.03,1.52s-1.67,7.68,1.52,10.03c8.56,6.3,21.23,8.2,28.81,9.33,1.37.21,3.02.45,3.86.63.38.19.77.34,1.17.46,8.79,11.15,14.09,16.16,17.53,18.83-.35,10.07-.87,20.75-1.49,31.63-2.25-1.59-4.61-3.17-7.04-4.81-11.01-7.4-23.5-15.78-35.08-29.84-2.52-3.06-7.04-3.49-10.1-.97-3.06,2.52-3.49,7.04-.97,10.1,3.09,3.75,6.24,7.13,9.41,10.23-3.94,1.03-7.93,1.86-10.85,1.88-3.96.03-7.15,3.27-7.12,7.23.03,3.95,3.24,7.12,7.17,7.12h.05c7.23-.05,16.93-2.94,23.62-5.06,5.6,4.33,10.99,7.95,15.87,11.23,5.49,3.69,10.35,6.95,13.96,10.22-3.01,45.38-7.41,90.76-9.2,108.51-16.36-6.19-33.75-.97-52.72,4.74-16.76,5.04-35.75,10.75-58.8,10.75-3.96,0-7.18,3.21-7.18,7.18v7.77h-8.15c-3.96,0-7.18,3.21-7.18,7.18v20.08c0,3.96,3.21,7.18,7.18,7.18h301.45c3.96,0,7.18-3.21,7.18-7.18v-20.08c0-3.96-3.21-7.18-7.18-7.18ZM252.3,304.82c15.2,4.57,33.76,10.16,55.76,11.19v.76h-118.61c17.8-25.5,34.3-20.54,62.85-11.95ZM178.64,191.28c.11,0,.21-.01.32-.02,6.38,49.36,13.28,96.99,13.79,100.47.03.21.07.41.12.61-4.41,3.28-8.75,7.63-13.03,13.28-3.39-4.47-6.82-8.13-10.29-11.09.87-8.32,5.59-54.13,9.1-103.25ZM51.62,316.01c22-1.04,40.56-6.62,55.76-11.19,28.54-8.59,45.05-13.55,62.85,11.95H51.62v-.76ZM323.39,336.85H36.29v-5.72h287.09v5.72Z"
    />
    <path
      className="c"
      d="M69.8,157.03c.9.77,1.85,1.5,2.86,2.2-3.31,12.73-1,26.23,6.6,37.17,14.27,20.57,42.62,25.69,63.19,11.43,3.33-2.31,6.29-5.14,9.34-8.92,2.61-3.23,2.1-7.97-1.14-10.57-3.23-2.61-7.97-2.1-10.57,1.14-2.12,2.63-4.09,4.53-6.2,6-13.76,9.54-32.72,6.12-42.26-7.64-5.91-8.52-7.02-19.38-2.97-29.04,1.52-3.63-.02-7.82-3.52-9.6-2.23-1.13-4.05-2.32-5.57-3.61-5.79-4.93-9.32-11.82-9.93-19.4-.61-7.58,1.76-14.95,6.69-20.74,3.85-4.53,9.03-7.69,14.97-9.13,2.04-.49,3.78-1.82,4.8-3.65,1.02-1.83,1.23-4.01.58-6-3.45-10.55-1.34-21.9,5.65-30.35,8.82-10.66,23.47-14.34,36.46-9.15,1.92.77,4.08.71,5.95-.16,1.88-.87,3.31-2.48,3.97-4.44,4.68-14.02,17.59-23.16,32.26-22.79,15.61.42,28.99,11.86,31.81,27.21.44,2.37,1.98,4.39,4.16,5.43,2.18,1.04,4.72.96,6.84-.19,10.48-5.73,23.5-4.34,32.4,3.46,10.21,8.95,12.68,23.96,5.86,35.7-1.26,2.17-1.36,4.84-.25,7.09s3.27,3.81,5.77,4.14c11.45,1.51,20.76,9.67,23.72,20.81,1.95,7.32.93,14.97-2.87,21.52-3.8,6.56-9.92,11.24-17.24,13.19-2.4.64-5.02.89-8.25.77-2.63-.11-5.13,1.21-6.57,3.43-1.43,2.22-1.6,5.03-.44,7.4,3.21,6.55,3.46,14.04.68,20.57-5.35,12.56-19.93,18.42-32.48,13.07-3.37-1.44-6.39-3.7-8.98-6.72-2.7-3.15-7.45-3.52-10.6-.82s-3.52,7.45-.82,10.6c4.11,4.79,8.99,8.41,14.5,10.76,5.07,2.16,10.35,3.18,15.55,3.18,15.48,0,30.22-9.08,36.67-24.19,3.11-7.29,3.89-15.3,2.38-23.01.76-.15,1.5-.32,2.23-.52,11.2-2.98,20.57-10.15,26.39-20.18,5.81-10.03,7.37-21.73,4.39-32.93-3.69-13.85-13.8-24.71-26.86-29.52,5.01-16.12.26-34.16-12.86-45.66-11.3-9.9-26.9-13.07-41.02-8.88-6.96-17.75-24.12-30.22-43.7-30.74-18.78-.48-35.71,9.81-44.07,26.25-17.14-3.93-35.15,1.94-46.56,15.74-8.7,10.52-12.28,24.06-10.12,37.34-6.08,2.62-11.44,6.56-15.74,11.62-7.53,8.85-11.16,20.11-10.22,31.69.94,11.58,6.33,22.11,15.18,29.64Z"
    />
  </SvgIcon>
);

export default LearningTreeIcon;
