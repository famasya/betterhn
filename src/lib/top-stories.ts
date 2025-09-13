import { firebaseFetcher } from "./fetcher";
import type { FirebasePostDetail } from "./types";

export const fetchTopStories = async () => {
  // fetch post lists
  const postLists = await firebaseFetcher
    .get("topstories.json")
    .json<number[]>();

  // fetch post details
  const posts = await Promise.all(
    postLists.map((postId) =>
      firebaseFetcher.get<FirebasePostDetail>(`item/${postId}.json`).json()
    )
  );

  return posts;
};
