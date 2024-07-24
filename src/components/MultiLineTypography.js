const { Typography } = require("@mui/material");

export const MultiLineTypography = ({ text }) => {
  const paragraphs = text.split("\n");

  return (
    <div style={{ padding: "10px 16px" }}>
      {paragraphs.map((text, index) => (
        <Typography
          key={index}
          variant="body1"
          paragraph
          sx={{
            width: "fit-content",

            fontSize: 16,
            lineHeight: "24px",
          }}
        >
          {text}
        </Typography>
      ))}
    </div>
  );
};
