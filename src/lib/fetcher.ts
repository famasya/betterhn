import ky from "ky";

export const firebaseFetcher = ky.create({
  prefixUrl: "https://hacker-news.firebaseio.com/v0"
});
