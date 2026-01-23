import type { PredefinedRoute } from "./interface";
import * as newsRoutes from "./newsRoutes";

const BE_BASE_URL = "https://api.sofascore.com/api/v1";

export const predefinedRoutes: PredefinedRoute[] = [
  "en",
  "es",
  "pt",
  "it",
  "fr",
].map((locale) => ({
  name: "Sofascore News" + (locale === "en" ? "" : ` ${locale.toUpperCase()}`),
  url: `https://www.sofascore.com${locale === "en" ? "" : `/${locale}`}/news/`,
  dependencies: [
    {
      name: "Sticky posts",
      url:
        BE_BASE_URL +
        newsRoutes.posts(
          locale,
          "news" + (locale === "en" ? "" : `-${locale}`),
          undefined,
          true
        ),
    },
    {
      name: "Non sticky posts",
      url:
        BE_BASE_URL +
        newsRoutes.posts(
          locale,
          "news" + (locale === "en" ? "" : `-${locale}`),
          undefined,
          false
        ),
    },
  ],
}));
