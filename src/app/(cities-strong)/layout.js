'use client'

import ProviderWrapper from "@/contexts/ProviderWrapper";
import { CitiesStrongLayout } from "@/layout";
import { styled } from "@mui/material";

export default function Layout({ children }){
  return (
    <ProviderWrapper theme = 'alt'>
      <CitiesStrongLayout>
        {children}
      </CitiesStrongLayout>
    </ProviderWrapper>
  );
}

const FullHeight = styled('div')({
  minHeight: `calc(100% - 44px)`
});