const { Typography } = require("@mui/material");

const createLinkifiedText = (text) => {
  const urlPattern = /(\bhttps?:\/\/[^\s]+[^\s.,;!?"')])/g; // Regular expression for URLs

  return text.split(urlPattern).map((part, index) =>
    urlPattern.test(part) ? (
      <a
        key={index}
        href={part}
        target="_blank"
        rel="noopener noreferrer"
        style={{ color: "#1976d2", textDecoration: "underline" }}
      >
        {part}
      </a>
    ) : (
      part
    )
  );
};

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
          {createLinkifiedText(text)}
        </Typography>
      ))}
    </div>
  );
};
