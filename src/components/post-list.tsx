import { Link } from "@tanstack/react-router"
import { ApiResponse } from "../loaders/types"

type Params = {
  posts: Array<ApiResponse["hits"][number]>
}
export default function PostList({ posts }: Params) {
  // replace all non-alphanumeric characters with a dash
  const lowerCaseTitle = (title: string) => title.toLowerCase().replace(/[^a-z0-9]/g, '-')
  return <>
    {posts.map((post) => (
      <Link to="/post/$postId" params={{ postId: `${lowerCaseTitle(post.title)}-${post.objectID}` }} key={post.objectID}>
        <div className="p-3 border-b hover:bg-gray-100 border-gray-200 text-sm">{post.title}</div>
      </Link>
    ))}
  </>
}
