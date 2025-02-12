import BlogPosts from "@/components/blog/BlogPosts";
import { Container, Typography } from "@mui/material";
// Replace with your Substack subdomain
const SUBSTACK_URLS = ["https://platinumprogramming.substack.com"];

export default function Home() {
  return (
    <Container
      sx={{
        py: 5,
      }}
    >
      <Typography
        variant="h4"
        gutterBottom
        sx={{ textAlign: "center", width: "100%", mb: 3 }}
      >
        Blog Posts
      </Typography>
      <BlogPosts substackUrls={SUBSTACK_URLS} />
    </Container>
  );
}
