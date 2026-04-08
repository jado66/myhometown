"use client";
import BlogPosts from "@/components/blog/BlogPosts";
import { Container, Typography } from "@mui/material";
import useCommunity from "@/hooks/use-community";
import { communityTemplate } from "@/constants/templates/communityTemplate";

// Replace with your Substack subdomain

export default function Home({ params }) {
  const { stateQuery, cityQuery, communityQuery } = params;

  const { community, hasLoaded } = useCommunity(
    communityQuery,
    cityQuery,
    stateQuery,
    communityTemplate,
    true
  );
  return (
    <Container
      sx={{
        py: 5,
        minHeight: "80vh",
      }}
    >
      <Typography
        variant="h4"
        gutterBottom
        sx={{ textAlign: "center", width: "100%", mb: 3 }}
      >
        Blog Posts
      </Typography>

      {hasLoaded && community.substackUrls && (
        <BlogPosts substackUrls={community.substackUrls} />
      )}

      {hasLoaded && !community.substackUrls && (
        <Typography variant="body1" sx={{ textAlign: "center" }}>
          There are no blog posts available at this time.
        </Typography>
      )}
    </Container>
  );
}
