"use client";
import { Box, Grid } from "@mui/material";

import { ImageAccordion } from "@/components/ImageAccordion";
import { MyHometownHouse } from "@/assets/svg/logos/MyHometownHouse";
import UploadImage from "@/components/util/UploadImage";

export const ImageWithAccordion = ({
  title,
  editTitle,
  bgColor,
  imageSrc,
  editImageSrc,
  contentColor,
  editContent,
  content,
  index,
  isEdit,
}) => {
  const bgColors = ["#a16faf", "#1b75bc", "#febc18", "#318d43", "#e45620"];
  const contentColors = ["#000", "#fff", "#000", "#000", "#000"];

  return (
    <Grid
      item
      xs={12}
      id="outer-card"
      sx={{
        m: 4,
        mt: 0,
        borderRadius: 3,
        p: "0 !important;",
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
          borderRadius: 3,
        }}
      >
        <Box
          component="img"
          src={imageSrc}
          alt="Mental Health"
          sx={{
            borderRadius: 3,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            position: "absolute",
            bottom: "0%",
          }}
        />
        {isEdit && (
          <UploadImage setUrl={(newUrl) => editImageSrc(index, newUrl)} />
        )}
      </Grid>
      <ImageAccordion
        isEdit={isEdit}
        title={title}
        editTitle={(newTitle) => editTitle(index, newTitle)}
        content={content}
        editContent={(newContent) => editContent(index, newContent)}
        bgColor={bgColor ? bgColor : bgColors[index % bgColors.length]} //febc18 y - e45620 o - lb 1bc7bc - db 00357d - lp a16faf - lp 592569 - nc efefe7 - cg 63666a
        contentColor={
          contentColor
            ? contentColor
            : contentColors[index % contentColors.length]
        }
        cornerIcon={<MyHometownHouse />}
        rounded
        right={index % 2 == 1}
      />
    </Grid>
  );
};
