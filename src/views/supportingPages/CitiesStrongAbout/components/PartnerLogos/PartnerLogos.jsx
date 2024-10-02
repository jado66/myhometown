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
          "/images/partners/Alta Bank TR.png",
          "/images/partners/Arbor pro.png",
          "/images/partners/Briskley TR.png",
          "/images/partners/Diamond TR.png",
          "/images/partners/Durham TR.png",
          "/images/partners/england TR.png",
          "/images/partners/HD TR.png",
          "/images/partners/Key TR.png",
          "/images/partners/Knapp TR.png",
          "/images/partners/Lowes TR.png",
          "/images/partners/Morin TR.png",
          "/images/partners/ogden TR.png",
          "/images/partners/Orem TR.png",
          // "/images/partners/Petersen TR.png",
          "/images/partners/Peterson TR.png",
          "/images/partners/Provo TR.png",
          "/images/partners/Simple TR.png",
          "/images/partners/simplified TR.png",
          "/images/partners/SLC TR.png",
          "/images/partners/Utah bank TR.png",
          "/images/partners/Wheeler TR.png",
          "/images/partners/WVC TR.png",
          "/images/partners/Zion TR.png",
        ]}
        noDots
        speed={0}
      />
    </>
  );
};

export default PartnerLogos;
