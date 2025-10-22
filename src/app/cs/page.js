"use client";
import React, { useState } from "react";
import {
  useTheme,
  Accordion,
  Alert,
  Typography,
  Button,
  Grid,
  Divider,
  Fade,
  Box,
} from "@mui/material";
import useMediaQuery from "@mui/material/useMediaQuery";
import Link from "next/link";

import { styled } from "@mui/system";
import ProviderWrapper from "@/contexts/ProviderWrapper";
import { CitiesStrongLayout } from "@/layout";
import { ImageAccordion } from "@/components/ImageAccordion";
import { default as VisibilitySensor } from "react-visibility-sensor";
import { ResponsiveVideoBanner } from "@/components/util/ResponsiveVideoBanner";
import LoadingImage from "@/components/util/LoadingImage";
import MyHometownLogo from "@/assets/svg/logos/MyHometown";

const Page = () => {
  const [showInfoAlert, setShowInfoAlert] = useState(true);

  const [isVisible, setIsVisible] = useState({
    0: false,
    1: false,
    2: false,
    3: false,
  });

  const setViewPortVisibility = (index, visibility) => {
    if (!visibility) return;

    setIsVisible((p) => ({ ...p, [index]: visibility }));
  };

  const theme = useTheme();

  return (
    <ProviderWrapper theme="alt">
      <CitiesStrongLayout>
        {/* <ContainerStyled maxWidth = "sm" id = 'main-container' > */}

        <>
          <ResponsiveVideoBanner src="https://myhometown-bucket.s3.us-west-1.amazonaws.com/videos/Banner CSF music 3440X1000 1.webm" />

          <Grid item xs={12}>
            <Typography
              variant="h3"
              sx={{ mt: 6, mb: 2, fontWeight: "bold" }}
              align="center"
            >
              Cities Strong Foundation
            </Typography>
          </Grid>
          <Grid
            item
            xs={12}
            sm={6}
            sx={{ padding: 4, display: "flex", flexDirection: "column" }}
          >
            <Typography variant="h4" sx={{ flexGrow: 1 }}>
              Cities Strong Foundation is a public charity that supports
              community-driven efforts to improve the lives of individuals and
              families. These initiatives strengthen families, enhance community
              engagement, and ultimately contribute to stronger, more resilient
              cities.
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6} sx={{ padding: 4, pt: { xs: 0, sm: 4 } }}>
            <LoadingImage
              src="/cities-strong/homepage/mother-daughter.webp"
              alt="A Mother and Daughter"
            />
          </Grid>

          <Grid
            item
            xs={12}
            sx={{
              px: 4,
              pt: 0,
              display: "flex",
              flexDirection: "column",
              height: { sm: "220px" },
            }}
          >
            <Typography variant="h4" sx={{ flexGrow: 1 }}>
              By supporting grassroots efforts that cultivate a culture of
              strong, neighborly communities, the Cities Strong Foundation
              contributes to making our <strong>Cities Strong</strong>.
            </Typography>
            {/* <ButtonStyled variant='outlined'  sx = {{mr:'auto', mt:3}}
                href = '/about'
              >
                Learn More
              </ButtonStyled> */}
          </Grid>

          <Grid item xs={12} sx={{ px: 8 }}>
            <Button
              component={Link}
              href="/donate"
              variant="contained"
              fullWidth
              size="large"
              sx={{
                fontSize: "2.5rem",
                py: 3,
                mb: 8,

                fontWeight: "bold",
                borderRadius: 0,
              }}
            >
              Make a Donation
            </Button>
          </Grid>

          <Grid
            item
            xs={12}
            sx={{
              m: 4,
              mt: 0,
              position: "relative",
              boxShadow: "0px 2px 8px 0px rgba(0, 0, 0, 0.5)",
            }}
          >
            <Grid
              item
              xs={12}
              sx={{
                backgroundColor: "grey",
                height: { sm: "375px", xs: "300px" },
                overflow: "hidden",
                position: "relative",
              }}
            >
              <Box
                component="img"
                src="/cities-strong/homepage/neighborhood-revitalization.webp"
                alt="Mental Health"
                sx={{
                  width: { sm: "100%", xs: "auto" },
                  minWidth: "100%",
                  height: "auto",
                  position: "absolute",
                  bottom: "-20%",
                  left: "50%",
                  transform: "translateX(-50%)",
                }}
              />
            </Grid>
            <ImageAccordion
              title="Neighborhood Revitalization"
              content={`We support myHometown's efforts to foster neighbor-helping-neighbor programs. This includes the Days of Service program, which provides a variety of neighborhood improvement projects, and Community Resource Centers that provide spaces and facilitators for learning, gathering, and socializing.`}
            />
          </Grid>

          <Grid
            item
            xs={12}
            sx={{
              m: 4,
              mt: 0,
              position: "relative",
              boxShadow: "0px 2px 8px 0px rgba(0, 0, 0, 0.5)",
            }}
          >
            <Grid
              item
              xs={12}
              sx={{
                backgroundColor: "grey",
                height: { sm: "375px", xs: "300px" },
                overflow: "hidden",
                position: "relative",
              }}
            >
              <Box
                component="img"
                src="/cities-strong/homepage/kids-learning.webp"
                alt="Kids Learning"
                sx={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  position: "absolute",
                  bottom: "0%",
                }}
              />
            </Grid>

            <ImageAccordion
              title="Enhancing Public Education"
              content="We support myHometown and their work with schools to improve literacy and learning skills by providing dedicated tutors.  We also support the acclaimed Leader In Me® program, which empowers students by fostering a culture of learning and leadership throughout the school."
              bgColor="#188D4E"
              contentColor="#ffffff"
              right
            />
          </Grid>

          <Grid
            item
            xs={12}
            sx={{
              m: 4,
              mt: 0,
              position: "relative",
              boxShadow: "0px 2px 8px 0px rgba(0, 0, 0, 0.5)",
            }}
          >
            <Grid
              item
              xs={12}
              sx={{
                backgroundColor: "grey",
                height: { sm: "375px", xs: "300px" },
                overflow: "hidden",
                position: "relative",
              }}
            >
              <Box
                component="img"
                src="/cities-strong/homepage/Family-Seated-on-Bench.webp"
                alt="Mental Health"
                sx={{
                  minWidth: "100%",
                  height: "auto",
                  position: "absolute",
                  left: "50%",
                  transform: "translateX(-50%)",
                }}
              />
            </Grid>
            <ImageAccordion
              title="Legal Immigration Assistance"
              content="Partnering with the Good Samaritan Foundation, we provide legal immigration assistance, emergency housing, and case management support to help immigrant families successfully navigate the immigration process and become productive members of the community."
              bgColor="#DC5331"
              contentColor="#ffffff"
            />
          </Grid>

          <Grid
            item
            xs={12}
            sx={{
              m: 4,
              mt: 0,
              position: "relative",
              boxShadow: "0px 2px 8px 0px rgba(0, 0, 0, 0.5)",
            }}
          >
            <Grid
              item
              xs={12}
              sx={{
                backgroundColor: "grey",
                height: { sm: "375px", xs: "300px" },
                overflow: "hidden",
                position: "relative",
              }}
            >
              <Box
                component="img"
                src="/cities-strong/homepage/college-kids-seated.webp"
                alt="Mental Health"
                sx={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  position: "absolute",
                  bottom: "0%",
                }}
              />
            </Grid>

            <ImageAccordion
              title="Mental Health Assistance"
              content="We provide mental health support through programs like EveryDay Strong for parents and School Pulse for students. EveryDay Strong empowers parents to guide their children, while School Pulse delivers inspiring messages directly to students via email and text."
              bgColor="#286AA4"
              contentColor="#ffffff"
              right
            />
          </Grid>

          <Grid item xs={12} sx={{ px: 4 }}>
            <LoadingImage
              src="https://myhometown-bucket.s3.us-west-1.amazonaws.com/uploads/4b2c786d-fbd9-426c-83da-27354aa1984d-wasatch+Front+BEST.webp"
              alt="Mental Health"
              sx={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          </Grid>

          <Grid item xs={12} sx={{ px: 4 }}>
            <Typography variant="h4" sx={{ mt: 4, mb: 2 }} align="center">
              City Strong Foundation focuses on lifting communities along the
              Wasatch Front.
            </Typography>
          </Grid>

          {/* Picture */}
          <Grid item xs={12}>
            <Divider
              sx={{ borderWidth: 3, borderColor: "black", mt: 4, mb: 8, mx: 4 }}
            />
          </Grid>

          <Grid item xs={12} sx={{ px: 4 }}>
            <Typography
              variant="h4"
              sx={{ mt: 4, mb: 2, fontWeight: "bold" }}
              align="center"
            >
              Making a Difference, Cities Strong Foundation Supports These
              Organizations
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Divider
              sx={{ borderWidth: 1, borderColor: "gray", mb: 4, mx: 4 }}
            />
          </Grid>

          <Grid
            item
            xs={12}
            sx={{ display: "flex", justifyContent: "center", flexWrap: "wrap" }}
          >
            <MyHometownLogo size={48} sx={{ mx: "auto" }} type="dark-full" />
          </Grid>
        </>

        <PictureWithText
          src="https://myhometown-bucket.s3.us-west-1.amazonaws.com/uploads/6ac65a2c-c6d1-42e7-a792-7d33582de7f1-MHT DOS.webp"
          title="Days of Service"
          content={`Weekly events throughout the seasons bring renewed life to neighborhoods with house refurbishments, yard landscaping, and other community improvements.`}
        />
        <PictureWithText
          src="https://myhometown-bucket.s3.us-west-1.amazonaws.com/uploads/e5584e47-484e-448b-8e40-af3fc86552bb-MHT crc.webp"
          title="Community Resource Centers"
          content={`A community gathering place offering free classes, fostering a sense of belonging and support among neighbors.`}
          isInverted
        />
        <PictureWithText
          src="https://myhometown-bucket.s3.us-west-1.amazonaws.com/uploads/4791f8a1-3994-414b-bd12-5dd227ec6beb-school mentoring.webp"
          title="School Mentoring"
          content={`We support elementary schools by providing dedicated tutors who work one-on-one with students to improve their reading and math skills and to foster supportive relationships.`}
        />
        <PictureWithText
          src="https://myhometown-bucket.s3.us-west-1.amazonaws.com/uploads/2e7308a4-1301-4cc6-9d9f-f11cdb10264e-mom+son.webp"
          title="EveryDay Strong"
          content={`We support families in enhancing emotional well-being and improving communication within the home by providing valuable communication and family support skills and tools.`}
          isInverted
        />

        <Grid item xs={12}>
          <Divider sx={{ borderWidth: 1, borderColor: "gray", mb: 4, mx: 4 }} />
        </Grid>

        <Grid
          item
          xs={12}
          sx={{
            mx: "auto",
            display: "flex",
            justifyContent: "center",
            flexWrap: "wrap",
            width: "273px",
          }}
        >
          <LoadingImage
            height="100px"
            src="https://myhometown-bucket.s3.us-west-1.amazonaws.com/uploads/4d979d96-c9f0-44f0-808a-8d5543b570a2-GSF.1.webp"
            alt="Mental Health"
            noBoxShadow
          />
        </Grid>

        <PictureWithText
          src="https://myhometown-bucket.s3.us-west-1.amazonaws.com/uploads/bfc4850a-c7c6-4c06-9ee4-563f44c56b69-mex+fam.webp"
          content={`Provides legal support and compassionate case management for legal immigrants and their families. There are 20,000 immigrants in Utah legally that can use assistance navigating the immigration process.`}
        />
        <PictureWithText
          src="https://myhometown-bucket.s3.us-west-1.amazonaws.com/uploads/e5d7a489-0d54-4986-a867-1d4405effafa-up stairs.webp"
          content={`Offers temporary housing assistance to refugee individuals and families while they acquire English skills, find employment, and move towards permanent residency.`}
          isInverted
        />

        <Grid item xs={12}>
          <Divider sx={{ borderWidth: 1, borderColor: "gray", mb: 4, mx: 4 }} />
        </Grid>

        <Grid
          item
          xs={12}
          sx={{
            mx: "auto",
            display: "flex",
            justifyContent: "center",
            flexWrap: "wrap",
            width: "273px",
          }}
        >
          <LoadingImage
            height="50px"
            src="cities-strong/LeaderinMe.png"
            alt="Mental Health"
            noBoxShadow
          />
        </Grid>

        <PictureWithText
          src="https://myhometown-bucket.s3.us-west-1.amazonaws.com/uploads/ffc2f976-4e5b-445e-a934-9f7e099e6762-chalkboard.webp"
          content={`Empowers students to become leaders and enhances the overall learning environment. This proven approach has demonstrated positive outcomes, including increased graduation rates, improved academic performance, and a more positive school environment. It draws upon the principles of “The 7 Habits of Highly Effective People”.`}
        />

        <Grid item xs={12}>
          <Divider sx={{ borderWidth: 1, borderColor: "gray", mb: 4, mx: 4 }} />
        </Grid>

        <Grid
          item
          xs={12}
          sx={{
            mx: "auto",
            display: "flex",
            justifyContent: "center",
            flexWrap: "wrap",
            width: "273px",
          }}
        >
          <LoadingImage
            height="100px"
            src="https://myhometown-bucket.s3.us-west-1.amazonaws.com/uploads/f3458a56-355f-4bc5-b53a-0a92089e07b6-school+pulse.1.webp"
            alt="Mental Health"
            noBoxShadow
          />
        </Grid>

        <PictureWithText
          src="https://myhometown-bucket.s3.us-west-1.amazonaws.com/uploads/d6a06a43-2c30-4b8e-bbf2-00bc6e6c3c0d-teens.webp"
          content={`Empowers students to proactively improve their mental well-being through personalized, inspiring and motivating text and email messages from qualified counselors.`}
          isInverted
        />
        {/* </ContainerStyled> */}
      </CitiesStrongLayout>
    </ProviderWrapper>
  );
};

export default Page;

const ButtonStyled = styled(Button)({
  borderRadius: "0px",
  textTransform: "capitalize",
  borderColor: "black",
  borderWidth: "2px",
  color: "black",
  fontWeight: "bold",
});

const CityImage = ({ src, title, sx }) => {
  const theme = useTheme();
  const isMd = useMediaQuery(theme.breakpoints.up("md"));

  return (
    <Grid
      item
      xs={12}
      sm={6}
      md={4}
      sx={{
        padding: 2,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <Typography
        variant={isMd ? "h5" : "h6"}
        fontWeight={700}
        gutterBottom
        align="center"
      >
        {title}
      </Typography>
      <Box
        sx={{
          width: "100%",
          paddingTop: "75%", // 4:3 aspect ratio
          position: "relative",
          overflow: "hidden",
          boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.15)",
        }}
      >
        <LoadingImage
          src={src}
          alt={title}
          boxSx={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%", // This will now work because it's absolutely positioned
          }}
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            ...sx,
          }}
        />
      </Box>
    </Grid>
  );
};

const PictureWithText = ({ src, title, content, isInverted, sx }) => {
  const theme = useTheme();
  const isMd = useMediaQuery(theme.breakpoints.up("md"));

  return (
    <Grid
      item
      xs={12}
      sx={{
        padding: 4,
        display: "flex",
        flexDirection: isInverted ? "row-reverse" : "row",
      }}
    >
      <Grid item xs={4} display="flex" sx={{}}>
        <Box
          sx={{
            flex: 1,
            width: "100%",
            paddingTop: "75%", // 4:3 aspect ratio
            position: "relative",
            overflow: "hidden",
            boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.15)",
          }}
        >
          <LoadingImage
            src={src}
            alt={title}
            boxSx={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
            }}
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              ...sx,
            }}
          />
        </Box>
      </Grid>
      <Grid
        item
        xs={8}
        sx={{ px: 4 }}
        display={"flex"}
        flexDirection={"column"}
        alignItems={"start"}
      >
        {title && (
          <Typography
            variant={isMd ? "h5" : "h6"}
            fontWeight={700}
            gutterBottom
          >
            {title}
          </Typography>
        )}
        <Typography variant="body1" sx={{ mt: title ? 2 : 0 }}>
          {content}
        </Typography>
      </Grid>
    </Grid>
  );
};
