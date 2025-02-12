import { BlogPost } from "@/types/blog/BlogPost";
import { DOMParser } from "xmldom";

export async function fetchBlogPosts(urls: string[]): Promise<BlogPost[]> {
  const posts: BlogPost[] = [];
  const parser = new DOMParser();

  for (const url of urls) {
    try {
      const response = await fetch(
        `/api/blog-feed?url=${encodeURIComponent(url)}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const text = await response.text();
      const xmlDoc = parser.parseFromString(text, "text/xml");
      const items = Array.from(xmlDoc.getElementsByTagName("item"));

      for (const item of items) {
        try {
          const title = item.getElementsByTagName("title")[0]?.textContent;
          const link = item.getElementsByTagName("link")[0]?.textContent;
          const author =
            item.getElementsByTagName("creator")[0]?.textContent ||
            item.getElementsByTagName("dc:creator")[0]?.textContent ||
            "Unknown Author";
          const pubDate = item.getElementsByTagName("pubDate")[0]?.textContent;
          const content =
            item.getElementsByTagName("content:encoded")[0]?.textContent ||
            item.getElementsByTagName("description")[0]?.textContent ||
            "";

          // Extract cover image from content or media:content tag
          let coverImage: string | undefined;

          // Try to find image in media:content tag first
          const mediaContent = item.getElementsByTagName("media:content")[0];
          if (mediaContent?.getAttribute("url")) {
            coverImage = mediaContent.getAttribute("url") || undefined;
          }

          // If no media:content, try to extract first image from content
          if (!coverImage && content) {
            const imgMatch = content.match(/<img[^>]+src="([^">]+)"/);
            if (imgMatch) {
              coverImage = imgMatch[1];
            }
          }

          if (title && link && pubDate) {
            posts.push({
              title,
              link,
              author,
              pubDate: new Date(pubDate).toISOString(),
              content,
              coverImage,
            });
          }
        } catch (itemError) {
          console.error(`Error processing blog post item:`, itemError);
        }
      }
    } catch (urlError) {
      console.error(`Error fetching feed from ${url}:`, urlError);
    }
  }

  return posts.sort(
    (a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime()
  );
}
