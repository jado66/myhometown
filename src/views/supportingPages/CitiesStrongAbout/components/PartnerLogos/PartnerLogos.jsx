import LogoCarouselComponent from "@/components/ui/LogoCarousel";
import { Box, Divider, Typography } from "@mui/material";

const PartnerLogos = () => {
  return (
    <>
      <Divider
        sx={{ width: "100%", borderWidth: 3, my: 4, borderColor: "black" }}
      />
      <Box marginBottom={4}>
        <Typography
          fontWeight={700}
          sx={{ mt: 4, mb: 1 }}
          variant={"h3"}
          align={"center"}
        >
          Thanks To Our Partners
        </Typography>
        <Box
          component={Typography}
          //   fontWeight={700}
          sx={{ width: "80%", mx: "auto" }}
          variant={"h6"}
          align={"center"}
        >
          We can build strong communities because of partners like these. Their
          generosity helps us revitalize aging neighborhoods, enhance
          educational opportunities, expand mental health programs, and lift
          lives.
        </Box>
      </Box>

      <LogoCarouselComponent
        images={[
          "/images/partners/cat.webp",

          "/images/partners/zion 2.webp", //b

          "/images/partners/Arbor Pro.webp",
          "/images/partners/Bank Ut.webp",
          "/images/partners/BPS.webp",
          "/images/partners/england2.webp", //b
          "/images/partners/alta.webp", //

          "/images/partners/diamond.webp",
          "/images/partners/durham.webp",
          "/images/partners/home depot.webp", //b
          "/images/partners/Kapp.webp",
          "/images/partners/key.webp",
          "/images/partners/slc.webp", //b
          "/images/partners/lowes.webp",
          "/images/partners/Orem.webp",
          "/images/partners/petersen.webp",
          "/images/partners/provo.webp",
          "/images/partners/wvc.webp", //b
        ]}
        noDots
        speed={0}
      />
    </>
  );
};

export default PartnerLogos;
