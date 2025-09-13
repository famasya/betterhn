import { AppleStocksIcon, UserSquareIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Link } from "@tanstack/react-router";
import type { FirebasePostDetail } from "~/lib/types";

type Params = {
  posts: FirebasePostDetail[];
};
export default function PostList({ posts }: Params) {
  // replace all non-alphanumeric characters with a dash
  const lowerCaseTitle = (title: string) =>
    title.toLowerCase().replace(/[^a-z0-9]/g, "-");
  return (
    <>
      {posts.map((post) => (
        <Link
          key={post.id}
          params={{ postId: `${lowerCaseTitle(post.title)}-${post.id}` }}
          to="/post/$postId"
        >
          <div className="border-gray-200 border-b p-3 text-sm hover:bg-gray-100">
            {post.title}

            <div className="mt-1 flex items-center justify-between gap-2 text-gray-500 text-xs">
              <div className="flex items-center gap-1">
                <HugeiconsIcon icon={AppleStocksIcon} size={16} /> {post.score}{" "}
                points
              </div>
              <div className="flex items-center gap-1"><HugeiconsIcon icon={UserSquareIcon} size={16} /> {post.by}</div>
            </div>
          </div>
        </Link>
      ))}
    </>
  );
}
