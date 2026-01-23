/**
 * @param locale - SUPPORTED news locale
 * @param categories - list of categories slugs separated by comma
 * @param tags - (optional) list of tags slugs separated by comma
 * @param sticky - (optional) true returns only sticky news, false returns only non-sticky news, undefined is default
 * @param page - (optional) page number
 * @param perPage - (optional) number of posts per page
 */
export const posts = (
  locale: string,
  categories: string,
  tags?: string,
  sticky?: boolean,
  author?: string,
  page = 1,
  perPage = 12
) => {
  let queryString = `?page=${page}&per_page=${perPage}&categories=${categories}`;
  if (tags) {
    queryString += `&tags=${tags}`;
  }
  if (sticky !== undefined) {
    queryString += `&sticky=${sticky}`;
  }
  if (author) {
    queryString += `&author=${author}`;
  }

  console.log(`/sofascore-news/${locale}/posts${queryString}`);
  return `/sofascore-news/${locale}/posts${queryString}`;
};

/**
 * @param locale - SUPPORTED news locale
 * @param searchTerm - search term
 * @param page - (optional) page number
 * @param perPage - (optional) number of posts per page
 */
export const search = (
  locale: string,
  searchTerm: string,
  page = 1,
  perPage = 12
) => {
  return `/sofascore-news/${locale}/search?query=${searchTerm}&page=${page}&per_page=${perPage}`;
};

/**
 * @param slug - tag slug
 */
export const tag = (locale: string, slug: string) => {
  return `/sofascore-news/${locale}/tags?slug=${slug}`;
};

/**
 * @param slug - author slug
 */
export const author = (locale: string, slug: string) => {
  return `/sofascore-news/${locale}/author?slug=${slug}`;
};

/**
 * @param slug - post slug
 */
export const post = (locale: string, slug: string) => {
  return `/sofascore-news/${locale}/post?slug=${slug}`;
};

/**
 * @param id - post id
 */
export const postPreview = (id: number) => {
  return `https://news-admin.sofascore.com/wp-json/wp/v2/posts/${id}`;
};

export const homeSeoHead = () => {
  return `https://news-admin.sofascore.com/wp-json/yoast/v1/get_head?url=https://www.sofascore.com/news/`;
};
