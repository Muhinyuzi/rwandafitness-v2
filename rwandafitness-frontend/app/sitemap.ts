import type {MetadataRoute} from "next";

import {API_URL} from "@/lib/api";

type Coach = {
  id: number;
  created_at?: string | null;
};

type Gym = {
  id: number;
  slug: string;
  created_at?: string | null;
};

type Article = {
  id: number;
  slug: string;
  published_at?: string | null;
};

type ApiList<T> =
  | T[]
  | {
      results?: T[];
    };

function getResults<T>(data: ApiList<T>): T[] {
  if (Array.isArray(data)) {
    return data;
  }

  return data.results ?? [];
}

async function fetchData<T>(url: string): Promise<T[]> {
  try {
    const response = await fetch(url, {
      next: {
        revalidate: 3600,
      },
    });

    if (!response.ok) {
      console.error(
        `Sitemap fetch failed: ${url} (${response.status})`,
      );

      return [];
    }

    const data = (await response.json()) as ApiList<T>;

    return getResults(data);
  } catch (error) {
    console.error(`Sitemap fetch error: ${url}`, error);

    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://rwandafitness.com";

  const locales = ["en", "rw"] as const;

  /*
   * Static public pages
   */
  const staticRoutes = [
    "",
    "/coaches",
    "/gyms",
    "/articles",
    "/videos",
    "/about",
    "/contact",
  ];

  const staticUrls: MetadataRoute.Sitemap = locales.flatMap(
    (locale) =>
      staticRoutes.map((route) => ({
        url: `${baseUrl}/${locale}${route}`,
        changeFrequency:
          route === "" ? ("daily" as const) : ("weekly" as const),
        priority: route === "" ? 1 : 0.8,
      })),
  );

  /*
   * Fetch dynamic content from Django
   */
  const [coaches, gyms, englishArticles, kinyarwandaArticles] =
    await Promise.all([
      fetchData<Coach>(`${API_URL}/api/coaches/`),

      fetchData<Gym>(`${API_URL}/api/gyms/`),

      fetchData<Article>(
        `${API_URL}/api/articles/?lang=en`,
      ),

      fetchData<Article>(
        `${API_URL}/api/articles/?lang=rw`,
      ),
    ]);

  /*
   * Coaches
   *
   * Coach URLs use the ID:
   * /en/coaches/12
   * /rw/coaches/12
   */
  const coachUrls: MetadataRoute.Sitemap = coaches.flatMap(
    (coach) =>
      locales.map((locale) => ({
        url: `${baseUrl}/${locale}/coaches/${coach.id}`,
        ...(coach.created_at
          ? {
              lastModified: new Date(coach.created_at),
            }
          : {}),
        changeFrequency: "weekly" as const,
        priority: 0.7,
      })),
  );

  /*
   * Gyms
   *
   * Gym URLs use the slug:
   * /en/gyms/apollo-fitness-gym
   * /rw/gyms/apollo-fitness-gym
   */
  const gymUrls: MetadataRoute.Sitemap = gyms
    .filter((gym) => Boolean(gym.slug))
    .flatMap((gym) =>
      locales.map((locale) => ({
        url: `${baseUrl}/${locale}/gyms/${gym.slug}`,
        ...(gym.created_at
          ? {
              lastModified: new Date(gym.created_at),
            }
          : {}),
        changeFrequency: "weekly" as const,
        priority: 0.8,
      })),
    );

  /*
   * English articles
   *
   * The slug comes from the English translation.
   */
  const englishArticleUrls: MetadataRoute.Sitemap =
    englishArticles
      .filter((article) => Boolean(article.slug))
      .map((article) => ({
        url: `${baseUrl}/en/articles/${article.slug}`,
        ...(article.published_at
          ? {
              lastModified: new Date(article.published_at),
            }
          : {}),
        changeFrequency: "monthly" as const,
        priority: 0.7,
      }));

  /*
   * Kinyarwanda articles
   *
   * The slug comes from the Kinyarwanda translation.
   */
  const kinyarwandaArticleUrls: MetadataRoute.Sitemap =
    kinyarwandaArticles
      .filter((article) => Boolean(article.slug))
      .map((article) => ({
        url: `${baseUrl}/rw/articles/${article.slug}`,
        ...(article.published_at
          ? {
              lastModified: new Date(article.published_at),
            }
          : {}),
        changeFrequency: "monthly" as const,
        priority: 0.7,
      }));

  return [
    ...staticUrls,
    ...coachUrls,
    ...gymUrls,
    ...englishArticleUrls,
    ...kinyarwandaArticleUrls,
  ];
}