import { createFileRoute } from '@tanstack/react-router'
import { fetchSinglePost } from './loaders/fetch-single-post'

export const Route = createFileRoute("/_app/post/$postId")({
  loader: ({ params: { postId } }) => fetchSinglePost(postId),
  component: RouteComponent,
  head: ({ loaderData }) => ({
    meta: [
      {
        title: loaderData?.title || "Post"
      }
    ]
  }),
  pendingComponent: () => <div className="flex items-center justify-center h-64">Loading post...</div>,
})

function RouteComponent() {
  const post = Route.useLoaderData()
  return <div className='p-2'>
    <h1>{post.title}</h1>
    <p>{post.author}</p>
  </div>
}
