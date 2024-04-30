
import { Inter } from "next/font/google";
import "./globals.css";
import ProviderWrapper from "@/contexts/ProviderWrapper";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "My Hometown",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}
