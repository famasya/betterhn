import { FetchPostApiResponse } from "./types"

export const fetchFrontpage = async () => {
  const res = await fetch('https://hn.algolia.com/api/v1/search_by_date?tags=front_page')
  const data = await res.json() as FetchPostApiResponse
  return data.hits
}
