import { SvgIcon } from "@mui/material";
import React from "react";

const MyHometownLogo = ({ type, sx }) => {
  if (type === "h") {
    return (
      <SvgIcon
        sx={{
          height: { xs: 28, md: 32 },
          width: 50,
          marginRight: "auto", // Ensures the SVG aligns to the left
        }}
        viewBox="0 0 1300 165"
      >
        <svg id="a" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400.64 400">
          <path
            d="M273.34,262.46h126.98v137.22h-126.98v-137.22ZM127.3.32l.1,136.66h145.94l-115.86,124.87h-30.46v138.47H.32v-140.78l127.08-122.55H.32V.32h126.98ZM400.32.32v262.56l-126.98-125.9V.32h126.98Z"
            fill="#308d43"
            stroke-width="0"
          />
        </svg>
      </SvgIcon>
    );
  }

  if (type === "wordmark") {
    return (
      <SvgIcon
        sx={{
          height: { xs: 28, md: 32 },
          width: 200,
          marginRight: "auto", // Ensures the SVG aligns to the left
        }}
        viewBox="0 0 1300 165"
      >
        <svg
          id="a"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1098.58 153.69"
        >
          <path
            d="M0,44.66v-14.29h34.67l.97,11.61c2.81-4.22,6.34-7.48,10.59-9.78,4.25-2.3,9.16-3.45,14.74-3.45s10.45,1.24,14.45,3.74c4.01,2.49,7.04,6.25,9.09,11.28,2.71-4.71,6.22-8.39,10.55-11.04,4.33-2.65,9.42-3.98,15.27-3.98,8.66,0,15.49,2.99,20.5,8.97,5.01,5.98,7.51,15.09,7.51,27.32v36.54l11.45,2.43v14.21h-45.39v-14.21l10.23-2.43v-36.62c0-6.66-1.08-11.29-3.25-13.89-2.17-2.6-5.39-3.9-9.66-3.9-3.35,0-6.27.75-8.73,2.23-2.47,1.49-4.43,3.56-5.89,6.21,0,1.03.03,1.91.08,2.64.05.73.08,1.47.08,2.23v41.08l9.58,2.43v14.21h-42.79v-14.21l9.58-2.43v-36.62c0-6.5-1.08-11.08-3.25-13.76s-5.41-4.02-9.74-4.02c-3.19,0-6,.61-8.4,1.83-2.41,1.22-4.4,2.94-5.97,5.15v47.42l10.23,2.43v14.21H1.22v-14.21l11.45-2.43v-54.48l-12.67-2.44Z"
            fill="#000"
            stroke-width="0"
          />
          <path
            d="M243.73,44.66l-8.2,1.22-32.31,85.49c-2.55,6.33-5.94,11.63-10.19,15.91-4.25,4.27-10.65,6.41-19.2,6.41-2,0-3.88-.16-5.64-.49-1.76-.32-3.83-.78-6.21-1.38l2.76-17.29c.76.11,1.54.22,2.35.33.81.11,1.51.16,2.11.16,3.95,0,6.98-.96,9.09-2.88,2.11-1.92,3.74-4.32,4.87-7.18l2.68-6.66-27.85-72.34-8.2-1.3v-14.29h43.03v14.29l-9.83,1.62,12.02,35.08,1.22,6.33.49.08,13.89-41.49-9.91-1.62v-14.29h43.03v14.29Z"
            fill="#000"
            stroke-width="0"
          />
          <polygon
            points="251.16 14.29 251.16 0 300.12 0 300.12 14.29 287.45 16.73 287.45 50.83 335.68 50.83 335.68 16.73 323.01 14.29 323.01 0 335.68 0 359.31 0 371.97 0 371.97 14.29 359.31 16.73 359.31 101.57 371.97 104 371.97 118.21 323.01 118.21 323.01 104 335.68 101.57 335.68 69.1 287.45 69.1 287.45 101.57 300.12 104 300.12 118.21 251.16 118.21 251.16 104 263.75 101.57 263.75 16.73 251.16 14.29"
            fill="#000"
            stroke-width="0"
          />
          <path
            d="M402.1,75.18c0,8.01,1.41,14.44,4.22,19.28,2.81,4.85,7.36,7.27,13.64,7.27s10.6-2.44,13.44-7.31c2.84-4.87,4.26-11.29,4.26-19.24v-1.71c0-7.79-1.43-14.15-4.3-19.08-2.87-4.92-7.39-7.39-13.56-7.39s-10.66,2.46-13.48,7.39c-2.82,4.92-4.22,11.29-4.22,19.08v1.71ZM378.39,73.48c0-13.1,3.67-23.83,11-32.19,7.33-8.36,17.47-12.54,30.41-12.54s23.15,4.17,30.49,12.51c7.33,8.33,11,19.08,11,32.23v1.71c0,13.21-3.67,23.96-11,32.27-7.34,8.31-17.44,12.47-30.33,12.47s-23.23-4.15-30.57-12.47c-7.33-8.31-11-19.07-11-32.27v-1.71Z"
            fill="#000"
            stroke-width="0"
          />
          <path
            d="M470.43,44.66v-14.29h34.67l.97,11.61c2.81-4.22,6.34-7.48,10.59-9.78,4.25-2.3,9.16-3.45,14.74-3.45s10.45,1.24,14.45,3.74c4.01,2.49,7.04,6.25,9.09,11.28,2.71-4.71,6.22-8.39,10.55-11.04,4.33-2.65,9.42-3.98,15.27-3.98,8.66,0,15.49,2.99,20.5,8.97,5.01,5.98,7.51,15.09,7.51,27.32v36.54l11.45,2.43v14.21h-45.39v-14.21l10.23-2.43v-36.62c0-6.66-1.08-11.29-3.25-13.89-2.17-2.6-5.39-3.9-9.66-3.9-3.35,0-6.27.75-8.73,2.23-2.47,1.49-4.43,3.56-5.89,6.21,0,1.03.03,1.91.08,2.64.05.73.08,1.47.08,2.23v41.08l9.58,2.43v14.21h-42.79v-14.21l9.58-2.43v-36.62c0-6.5-1.08-11.08-3.25-13.76-2.17-2.68-5.41-4.02-9.74-4.02-3.19,0-6,.61-8.4,1.83-2.41,1.22-4.4,2.94-5.97,5.15v47.42l10.23,2.43v14.21h-45.3v-14.21l11.45-2.43v-54.48l-12.67-2.44Z"
            fill="#000"
            stroke-width="0"
          />
          <path
            d="M663.12,47.01c-4.38,0-7.85,1.68-10.39,5.03-2.54,3.36-4.11,7.77-4.71,13.24l.24.4h29.07v-2.11c0-5.03-1.18-9.05-3.53-12.06-2.36-3-5.91-4.51-10.68-4.51M665.23,119.92c-12.66,0-22.79-4.06-30.37-12.18-7.58-8.12-11.37-18.43-11.37-30.94v-3.25c0-13.04,3.59-23.79,10.76-32.23,7.17-8.44,16.79-12.64,28.86-12.58,11.85,0,21.06,3.57,27.6,10.72,6.55,7.14,9.82,16.81,9.82,28.98v12.91h-52.45l-.16.49c.44,5.79,2.37,10.56,5.81,14.29,3.44,3.73,8.1,5.6,14,5.6,5.25,0,9.61-.53,13.07-1.58,3.46-1.06,7.26-2.72,11.37-5l6.42,14.62c-3.63,2.87-8.32,5.28-14.09,7.22-5.77,1.95-12.19,2.92-19.29,2.92"
            fill="#000"
            stroke-width="0"
          />
          <path
            d="M747.24,11.19v19.18h15.43v16.64h-15.43v44.74c0,3.41.7,5.84,2.11,7.31,1.41,1.46,3.3,2.19,5.69,2.19,1.62,0,3.04-.07,4.26-.2,1.22-.14,2.58-.37,4.1-.69l2.03,17.13c-2.65.81-5.28,1.42-7.87,1.82-2.6.41-5.41.61-8.45.61-8.17,0-14.46-2.25-18.88-6.74-4.41-4.49-6.62-11.61-6.62-21.35v-44.82h-12.91v-16.64h12.91V11.19h23.63Z"
            fill="#000"
            stroke-width="0"
          />
          <path
            d="M796.05,75.18c0,8.01,1.41,14.44,4.22,19.28,2.81,4.85,7.36,7.27,13.64,7.27s10.6-2.44,13.44-7.31c2.84-4.87,4.26-11.29,4.26-19.24v-1.71c0-7.79-1.43-14.15-4.3-19.08-2.87-4.92-7.39-7.39-13.56-7.39s-10.66,2.46-13.48,7.39c-2.82,4.92-4.22,11.29-4.22,19.08v1.71ZM772.34,73.48c0-13.1,3.67-23.83,11-32.19,7.33-8.36,17.47-12.54,30.41-12.54s23.15,4.17,30.49,12.51c7.33,8.33,11,19.08,11,32.23v1.71c0,13.21-3.67,23.96-11,32.27-7.34,8.31-17.44,12.47-30.33,12.47s-23.23-4.15-30.57-12.47c-7.33-8.31-11-19.07-11-32.27v-1.71Z"
            fill="#000"
            stroke-width="0"
          />
          <polygon
            points="987.6 44.66 978.75 45.79 960.4 118.21 940.59 118.21 924.27 65.93 923.78 65.93 907.46 118.21 887.74 118.21 869.31 45.79 860.46 44.66 860.46 30.37 900.24 30.37 900.24 44.66 890.9 46.44 899.18 86.63 899.67 86.63 916.07 30.37 931.98 30.37 948.55 86.79 949.03 86.79 957.23 46.52 947.82 44.66 947.82 30.37 987.6 30.37 987.6 44.66"
            fill="#000"
            stroke-width="0"
          />
          <path
            d="M999.29,104l11.37-2.43v-54.48l-12.58-2.44v-14.29h34.67l1.06,12.58c2.92-4.49,6.52-7.99,10.8-10.47,4.27-2.49,9.06-3.73,14.37-3.73,8.88,0,15.8,2.79,20.79,8.36,4.98,5.58,7.47,14.32,7.47,26.22v38.24l11.37,2.43v14.21h-45.3v-14.21l10.15-2.43v-38.16c0-5.9-1.19-10.08-3.57-12.54-2.38-2.46-5.98-3.69-10.8-3.69-3.14,0-5.95.64-8.44,1.91-2.49,1.27-4.57,3.07-6.25,5.4v47.09l9.58,2.43v14.21h-44.65v-14.21Z"
            fill="#000"
            stroke-width="0"
          />
        </svg>
      </SvgIcon>
    );
  }

  if (type === "full") {
    return (
      <SvgIcon
        sx={{
          height: 36, //{ xs: 28, md: 32 },
          width: 200,
          marginRight: "auto", // Ensures the SVG aligns to the left
          ...sx,
        }}
        viewBox="0 0 1300 165"
      >
        <path
          d="M-.33,89.42v-14.29h34.67l.97,11.61c2.81-4.22,6.34-7.48,10.59-9.78,4.25-2.3,9.16-3.45,14.74-3.45s10.45,1.24,14.45,3.74c4.01,2.49,7.04,6.25,9.09,11.28,2.71-4.71,6.22-8.39,10.55-11.04,4.33-2.65,9.42-3.98,15.27-3.98,8.66,0,15.49,2.99,20.5,8.97,5.01,5.98,7.51,15.09,7.51,27.32v36.54l11.45,2.43v14.21h-45.39v-14.21l10.23-2.43v-36.62c0-6.66-1.08-11.29-3.25-13.89-2.17-2.6-5.39-3.9-9.66-3.9-3.35,0-6.27.75-8.73,2.23-2.47,1.49-4.43,3.56-5.89,6.21,0,1.03.03,1.91.08,2.64.05.73.08,1.47.08,2.23v41.08l9.58,2.43v14.21h-42.79v-14.21l9.58-2.43v-36.62c0-6.5-1.08-11.08-3.25-13.76s-5.41-4.02-9.74-4.02c-3.19,0-6,.61-8.4,1.83-2.41,1.22-4.4,2.94-5.97,5.15v47.42l10.23,2.43v14.21H.89v-14.21l11.45-2.43v-54.48l-12.67-2.44Z"
          fill="#000"
          stroke-width="0"
        />
        <path
          d="M243.4,89.42l-8.2,1.22-32.31,85.49c-2.55,6.33-5.94,11.63-10.19,15.91-4.25,4.27-10.65,6.41-19.2,6.41-2,0-3.88-.16-5.64-.49-1.76-.32-3.83-.78-6.21-1.38l2.76-17.29c.76.11,1.54.22,2.35.33.81.11,1.51.16,2.11.16,3.95,0,6.98-.96,9.09-2.88,2.11-1.92,3.74-4.32,4.87-7.18l2.68-6.66-27.85-72.34-8.2-1.3v-14.29h43.03v14.29l-9.83,1.62,12.02,35.08,1.22,6.33.49.08,13.89-41.49-9.91-1.62v-14.29h43.03v14.29Z"
          fill="#000"
          stroke-width="0"
        />
        <polygon
          points="250.83 59.06 250.83 44.77 299.79 44.77 299.79 59.06 287.12 61.5 287.12 95.59 335.35 95.59 335.35 61.5 322.69 59.06 322.69 44.77 335.35 44.77 358.98 44.77 371.64 44.77 371.64 59.06 358.98 61.5 358.98 146.34 371.64 148.77 371.64 162.98 322.69 162.98 322.69 148.77 335.35 146.34 335.35 113.86 287.12 113.86 287.12 146.34 299.79 148.77 299.79 162.98 250.83 162.98 250.83 148.77 263.42 146.34 263.42 61.5 250.83 59.06"
          fill="#000"
          stroke-width="0"
        />
        <path
          d="M401.77,119.95c0,8.01,1.41,14.44,4.22,19.28,2.81,4.85,7.36,7.27,13.64,7.27s10.6-2.44,13.44-7.31c2.84-4.87,4.26-11.29,4.26-19.24v-1.71c0-7.79-1.43-14.15-4.3-19.08-2.87-4.92-7.39-7.39-13.56-7.39s-10.66,2.46-13.48,7.39c-2.82,4.92-4.22,11.29-4.22,19.08v1.71ZM378.06,118.25c0-13.1,3.67-23.83,11-32.19,7.33-8.36,17.47-12.54,30.41-12.54s23.15,4.17,30.49,12.51c7.33,8.33,11,19.08,11,32.23v1.71c0,13.21-3.67,23.96-11,32.27-7.34,8.31-17.44,12.47-30.33,12.47s-23.23-4.15-30.57-12.47c-7.33-8.31-11-19.07-11-32.27v-1.71Z"
          fill="#000"
          stroke-width="0"
        />
        <path
          d="M470.1,89.42v-14.29h34.67l.97,11.61c2.81-4.22,6.34-7.48,10.59-9.78,4.25-2.3,9.16-3.45,14.74-3.45s10.45,1.24,14.45,3.74c4.01,2.49,7.04,6.25,9.09,11.28,2.71-4.71,6.22-8.39,10.55-11.04,4.33-2.65,9.42-3.98,15.27-3.98,8.66,0,15.49,2.99,20.5,8.97,5.01,5.98,7.51,15.09,7.51,27.32v36.54l11.45,2.43v14.21h-45.39v-14.21l10.23-2.43v-36.62c0-6.66-1.08-11.29-3.25-13.89-2.17-2.6-5.39-3.9-9.66-3.9-3.35,0-6.27.75-8.73,2.23-2.47,1.49-4.43,3.56-5.89,6.21,0,1.03.03,1.91.08,2.64.05.73.08,1.47.08,2.23v41.08l9.58,2.43v14.21h-42.79v-14.21l9.58-2.43v-36.62c0-6.5-1.08-11.08-3.25-13.76-2.17-2.68-5.41-4.02-9.74-4.02-3.19,0-6,.61-8.4,1.83-2.41,1.22-4.4,2.94-5.97,5.15v47.42l10.23,2.43v14.21h-45.3v-14.21l11.45-2.43v-54.48l-12.67-2.44Z"
          fill="#000"
          stroke-width="0"
        />
        <path
          d="M662.79,91.78c-4.38,0-7.85,1.68-10.39,5.03-2.54,3.36-4.11,7.77-4.71,13.24l.24.4h29.07v-2.11c0-5.03-1.18-9.05-3.53-12.06-2.36-3-5.91-4.51-10.68-4.51M664.9,164.69c-12.66,0-22.79-4.06-30.37-12.18-7.58-8.12-11.37-18.43-11.37-30.94v-3.25c0-13.04,3.59-23.79,10.76-32.23,7.17-8.44,16.79-12.64,28.86-12.58,11.85,0,21.06,3.57,27.6,10.72,6.55,7.14,9.82,16.81,9.82,28.98v12.91h-52.45l-.16.49c.44,5.79,2.37,10.56,5.81,14.29,3.44,3.73,8.1,5.6,14,5.6,5.25,0,9.61-.53,13.07-1.58,3.46-1.06,7.26-2.72,11.37-5l6.42,14.62c-3.63,2.87-8.32,5.28-14.09,7.22-5.77,1.95-12.19,2.92-19.29,2.92"
          fill="#000"
          stroke-width="0"
        />
        <path
          d="M746.91,55.96v19.18h15.43v16.64h-15.43v44.74c0,3.41.7,5.84,2.11,7.31,1.41,1.46,3.3,2.19,5.69,2.19,1.62,0,3.04-.07,4.26-.2,1.22-.14,2.58-.37,4.1-.69l2.03,17.13c-2.65.81-5.28,1.42-7.87,1.82-2.6.41-5.41.61-8.45.61-8.17,0-14.46-2.25-18.88-6.74-4.41-4.49-6.62-11.61-6.62-21.35v-44.82h-12.91v-16.64h12.91v-19.18h23.63Z"
          fill="#000"
          stroke-width="0"
        />
        <path
          d="M795.72,119.95c0,8.01,1.41,14.44,4.22,19.28,2.81,4.85,7.36,7.27,13.64,7.27s10.6-2.44,13.44-7.31c2.84-4.87,4.26-11.29,4.26-19.24v-1.71c0-7.79-1.43-14.15-4.3-19.08-2.87-4.92-7.39-7.39-13.56-7.39s-10.66,2.46-13.48,7.39c-2.82,4.92-4.22,11.29-4.22,19.08v1.71ZM772.01,118.25c0-13.1,3.67-23.83,11-32.19,7.33-8.36,17.47-12.54,30.41-12.54s23.15,4.17,30.49,12.51c7.33,8.33,11,19.08,11,32.23v1.71c0,13.21-3.67,23.96-11,32.27-7.34,8.31-17.44,12.47-30.33,12.47s-23.23-4.15-30.57-12.47c-7.33-8.31-11-19.07-11-32.27v-1.71Z"
          fill="#000"
          stroke-width="0"
        />
        <polygon
          points="987.27 89.42 978.42 90.56 960.07 162.98 940.26 162.98 923.94 110.7 923.45 110.7 907.14 162.98 887.41 162.98 868.98 90.56 860.13 89.42 860.13 75.13 899.91 75.13 899.91 89.42 890.57 91.21 898.85 131.4 899.34 131.4 915.74 75.13 931.65 75.13 948.22 131.56 948.71 131.56 956.91 91.29 947.49 89.42 947.49 75.13 987.27 75.13 987.27 89.42"
          fill="#000"
          stroke-width="0"
        />
        <path
          d="M998.96,148.77l11.37-2.43v-54.48l-12.58-2.44v-14.29h34.67l1.06,12.58c2.92-4.49,6.52-7.99,10.8-10.47,4.27-2.49,9.06-3.73,14.37-3.73,8.88,0,15.8,2.79,20.79,8.36,4.98,5.58,7.47,14.32,7.47,26.22v38.24l11.37,2.43v14.21h-45.3v-14.21l10.15-2.43v-38.16c0-5.9-1.19-10.08-3.57-12.54-2.38-2.46-5.98-3.69-10.8-3.69-3.14,0-5.95.64-8.44,1.91-2.49,1.27-4.57,3.07-6.25,5.4v47.09l9.58,2.43v14.21h-44.65v-14.21Z"
          fill="#000"
          stroke-width="0"
        />
        <path
          d="M1249.17,106.74h51.16v55.07h-51.16v-55.07ZM1190.33,1.54l.04,54.84h58.8l-46.68,50.11h-12.27v55.57h-51.05v-56.5l51.2-49.18-51.2.04V1.54h51.16ZM1300.33,1.54v105.37l-51.16-50.53V1.54h51.16Z"
          fill="#ffffff"
          stroke-width="0"
        />
      </SvgIcon>
    );
  }

  return <span>Wrong Type {type}</span>;
};

export default MyHometownLogo;
