"use client";

import { useState, useEffect } from "react";
import type { BlogPost } from "@/types/blog/BlogPost";
import { fetchBlogPosts } from "@/util/blog/fetchBlogPosts";
import {
  CalendarMonth,
  ExpandMore,
  ExpandLess,
  Person,
  Link as LinkIcon,
} from "@mui/icons-material";
import {
  Box,
  Typography,
  CircularProgress,
  Stack,
  IconButton,
  Chip,
  Fade,
  Divider,
  Button,
  Card,
  CardContent,
  CardMedia,
  CardActionArea,
} from "@mui/material";

interface ExpandedPost extends BlogPost {
  isExpanded: boolean;
  content?: string;
  coverImage?: string;
}

const BlogPosts = ({ substackUrls }: { substackUrls: string[] }) => {
  const [posts, setPosts] = useState<ExpandedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const fetchedPosts = await fetchBlogPosts(substackUrls);
        setPosts(fetchedPosts.map((post) => ({ ...post, isExpanded: false })));
      } catch (err) {
        setError("Failed to load blog posts");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [substackUrls]);

  const toggleExpand = (index: number) => {
    setPosts((prevPosts) => {
      const newPosts = [...prevPosts];
      newPosts[index] = {
        ...newPosts[index],
        isExpanded: !newPosts[index].isExpanded,
      };
      return newPosts;
    });
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "16rem",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Typography color="error" textAlign="center" sx={{ p: 2 }}>
        {error}
      </Typography>
    );
  }

  return (
    <Stack spacing={4}>
      {posts.map((post, index) => (
        <Fade key={index} in={true} timeout={300 * (index + 1)}>
          <Card
            elevation={3}
            sx={{
              overflow: "hidden",
              transition: "all 0.3s ease",
              "&:hover": {
                boxShadow: 6,
              },
            }}
          >
            <CardActionArea onClick={() => toggleExpand(index)}>
              {post.coverImage && (
                <CardMedia
                  component="img"
                  height="300"
                  image={post.coverImage}
                  alt={post.title}
                  sx={{
                    objectFit: "cover",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      transform: "scale(1.05)",
                    },
                  }}
                />
              )}
              <CardContent>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    mb: 2,
                  }}
                >
                  <Typography
                    variant="h5"
                    component="h2"
                    sx={{
                      fontWeight: 700,
                      color: "primary.main",
                      mb: 1,
                    }}
                  >
                    {post.title}
                  </Typography>
                  <IconButton size="small">
                    {post.isExpanded ? <ExpandLess /> : <ExpandMore />}
                  </IconButton>
                </Box>

                <Stack
                  direction="row"
                  spacing={2}
                  sx={{
                    color: "text.secondary",
                    fontSize: "0.875rem",
                    mb: 2,
                  }}
                >
                  <Chip
                    icon={<CalendarMonth />}
                    label={new Date(post.pubDate).toLocaleDateString()}
                    size="small"
                    variant="outlined"
                  />
                </Stack>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    display: "-webkit-box",
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                    mb: 2,
                  }}
                >
                  {post.description}
                </Typography>
              </CardContent>
            </CardActionArea>

            {post.isExpanded && (
              <Fade in={post.isExpanded} timeout={500}>
                <Box>
                  <Divider />
                  <CardContent>
                    {post.content ? (
                      <Box
                        sx={{
                          "& img": {
                            maxWidth: "100%",
                            height: "auto",
                            borderRadius: 1,
                            my: 2,
                          },
                          "& a": { color: "primary.main" },
                          "& h1, h2, h3, h4, h5, h6": {
                            mt: 3,
                            mb: 2,
                            fontWeight: 600,
                          },
                          "& p": { mb: 2, lineHeight: 1.7 },
                          "& ul, ol": { pl: 3, mb: 2 },
                        }}
                        dangerouslySetInnerHTML={{ __html: post.content }}
                      />
                    ) : (
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "center",
                          py: 2,
                        }}
                      >
                        <CircularProgress size={24} />
                      </Box>
                    )}
                  </CardContent>
                </Box>
              </Fade>
            )}
          </Card>
        </Fade>
      ))}
    </Stack>
  );
};

export default BlogPosts;
