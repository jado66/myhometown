'use client'

import ProviderWrapper from "@/contexts/ProviderWrapper";
import { CitiesStrongLayout } from "@/layout";
import { styled } from "@mui/material";
import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

export default function Layout({ children }){
  return (
    <ProviderWrapper theme = 'alt'>
      <ToastContainer />

      <CitiesStrongLayout>
        {children}
      </CitiesStrongLayout>
    </ProviderWrapper>
  );
}

const FullHeight = styled('div')({
  minHeight: `calc(100% - 44px)`
});