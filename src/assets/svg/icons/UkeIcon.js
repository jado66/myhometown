import { SvgIcon } from "@mui/material";

const UkeIcon = ({ fillColor = "#318d43" }) => (
  <SvgIcon viewBox="0 0 360 360">
    <style type="text/css">
      {`
        .c{fill:${fillColor};stroke-width:0px}
      `}
    </style>
    <path
      className="c"
      d="M341.11,72.74l-5.87-5.87,1.76-1.76c1.2-1.19,1.82-2.85,1.7-4.55-1.36-19.03-16.73-34.39-35.74-35.75-1.7-.13-3.35.49-4.56,1.69l-4.15,4.15-5.88-5.88c-1.1-1.1-2.57-1.71-4.13-1.71h0c-1.56,0-3.02.61-4.12,1.71-1.1,1.1-1.71,2.57-1.71,4.12,0,1.56.61,3.03,1.71,4.13l5.88,5.88-6.36,6.36-5.11-5.11c-1.1-1.1-2.57-1.71-4.13-1.71h0c-1.56,0-3.02.61-4.12,1.71-1.1,1.1-1.71,2.56-1.71,4.12,0,1.56.61,3.03,1.71,4.13l5.11,5.11-2.03,2.03c-.49.48-.89,1.05-1.17,1.67l-9.49,20.31-52.75,50.03c-24.38-16.61-48.88-17.26-64.75-1.39-4.92,4.92-8.54,10.87-10.75,17.7-4.76,14.67-18.13,25.09-34.08,26.55-18.24,1.67-34.54,9.22-47.15,21.83-29.27,29.27-24.44,73.43,12.02,109.88,20,20,43.07,31.02,64.96,31.02,16.95,0,32.48-6.57,44.92-19.01,12.61-12.61,20.16-28.92,21.82-47.15,1.46-15.95,11.89-29.33,26.56-34.08,6.83-2.21,12.78-5.83,17.7-10.75,15.87-15.87,15.22-40.37-1.39-64.76l49.66-52.36,20.83-9.73c.63-.29,1.19-.69,1.66-1.16l5.41-5.41,5.6,5.6c1.1,1.1,2.57,1.71,4.13,1.71s3.02-.61,4.13-1.71c2.27-2.27,2.27-5.97,0-8.25l-5.6-5.6,5.38-5.38,5.87,5.87c1.1,1.1,2.57,1.71,4.13,1.71s3.02-.61,4.13-1.71c2.27-2.27,2.27-5.97,0-8.25ZM165.51,178.15c.55,0,1.09.04,1.63.08.3.02.6.06.9.1.3.04.6.08.89.13.34.06.68.13,1.01.21.24.06.48.12.72.18.37.1.73.21,1.1.33.2.07.39.14.59.21.38.14.76.29,1.13.45.18.08.35.16.52.25.37.18.74.36,1.1.56.18.1.35.21.53.32.34.2.68.41,1,.63.22.15.42.31.63.47.05.04.1.07.14.11.23.17.46.33.68.52.29.24.57.51.85.77.17.16.34.3.51.46.11.11.21.24.33.36.32.34.64.68.93,1.03.18.22.35.46.52.69.2.27.41.54.6.81.17.25.33.52.49.78.16.27.33.54.48.82.14.26.27.53.41.8.14.3.28.59.41.89.11.25.21.51.31.77.13.33.24.67.35,1.01.07.23.14.47.21.7.1.38.2.76.28,1.14.05.21.09.42.13.63.07.41.13.83.18,1.24.02.19.05.39.06.58.48,5.6-1.41,11.36-5.68,15.63-7.69,7.68-20.19,7.68-27.88,0-3.72-3.72-5.76-8.67-5.76-13.94s2.05-10.22,5.76-13.94c3.72-3.72,8.67-5.76,13.94-5.76ZM182.32,149.98l-17.41,16.51c-8.17.15-15.82,3.39-21.59,9.17-12.23,12.23-12.23,32.14,0,44.38,5.92,5.92,13.8,9.18,22.19,9.18s16.27-3.26,22.19-9.18c5.96-5.96,9.01-13.75,9.16-21.58l30.69-32.36c12.26,19.05,12.79,36.39,1.37,47.82-3.6,3.6-7.99,6.26-13.04,7.9-19.12,6.2-32.69,23.52-34.57,44.12-1.42,15.49-7.8,29.31-18.46,39.97-10.29,10.29-22.48,15.51-36.22,15.51-18.83,0-39.67-10.03-57.16-27.53-14.03-14.03-23.43-30.46-26.46-46.26-3.44-17.93,1.55-34.22,14.45-47.12,10.65-10.65,24.47-17.03,39.97-18.46,20.6-1.89,37.92-15.46,44.12-34.57,1.64-5.06,4.3-9.44,7.9-13.04,5.41-5.42,12.16-8.16,20.04-8.16,8.5,0,18.06,3.29,27.78,9.53l-14.94,14.17ZM224.04,152.84s-.03.02-.04.04l-30.06,31.69s-.01-.02-.02-.03c-.37-.8-.78-1.58-1.23-2.35-.01-.02-.02-.04-.03-.05-.43-.74-.89-1.47-1.39-2.18-.02-.04-.05-.07-.07-.11-.02-.03-.05-.06-.07-.09-.47-.67-.97-1.32-1.5-1.96-.09-.11-.18-.21-.27-.32-.48-.57-.99-1.12-1.52-1.66-.05-.05-.09-.11-.14-.16-.05-.05-.1-.09-.15-.14-.56-.55-1.14-1.08-1.74-1.59-.07-.06-.13-.12-.2-.17-2.09-1.75-4.38-3.21-6.82-4.35l31.68-30.05s.02-.02.03-.03l52.9-50.17,10.79,10.79-50.16,52.88ZM283.73,92.98l-8.59-8.58-4.61-4.61,7.79-16.69,26.34-26.33c11.29,1.9,20.19,10.8,22.09,22.09l-26.33,26.34-16.69,7.79Z"
    />
    <path
      className="c"
      d="M87.57,229.52c-1.1-1.1-2.56-1.71-4.12-1.71h0c-1.56,0-3.03.61-4.13,1.71-1.1,1.1-1.71,2.56-1.71,4.12,0,1.56.61,3.03,1.71,4.13l46.27,46.27c1.1,1.1,2.57,1.71,4.13,1.71s3.02-.61,4.12-1.71c1.1-1.1,1.71-2.56,1.71-4.12,0-1.56-.61-3.03-1.71-4.13l-46.26-46.26Z"
    />
  </SvgIcon>
);

export default UkeIcon;