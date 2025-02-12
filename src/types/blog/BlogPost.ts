import type { Url } from "url";

// types/blog/BlogPost.ts
export interface BlogPost {
  title: string;
  link: string;
  author: string;
  pubDate: string;
  content?: string;
}
