import type {MetadataRoute} from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },

    sitemap: "https://rwandafitness.com/sitemap.xml",
    host: "https://rwandafitness.com",
  };
}