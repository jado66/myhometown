"use client";

import { useState, useEffect } from "react";

interface BlogPostProps {
  url: string;
}

export default function BlogPost({ url }: BlogPostProps) {
  const [title, setTitle] = useState < string > "";
  const [excerpt, setExcerpt] = useState < string > "";
  const [loading, setLoading] = useState < boolean > true;
  const [error, setError] = (useState < string) | (null > null);

  useEffect(() => {
    const fetchBlogPost = async () => {
      try {
        const response = await fetch(url);
        const html = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, "text/html");

        const titleElement = doc.querySelector("h1");
        const excerptElement = doc.querySelector("h3");

        if (titleElement) setTitle(titleElement.textContent || "");
        if (excerptElement) setExcerpt(excerptElement.textContent || "");

        setLoading(false);
      } catch (err) {
        setError("Failed to fetch blog post");
        setLoading(false);
      }
    };

    fetchBlogPost();
  }, [url]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="border rounded-lg p-4 mb-4 shadow-sm hover:shadow-md transition-shadow">
      <h2 className="text-xl font-bold mb-2">{title}</h2>
      <p className="text-gray-600 mb-2">{excerpt}</p>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-500 hover:underline"
      >
        Read more
      </a>
    </div>
  );
}
