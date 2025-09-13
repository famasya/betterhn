import { createFileRoute } from '@tanstack/react-router'
import AppLayout from './app-layout'
import { fetchFrontpage } from './loaders/frontpage'
export const Route = createFileRoute('/')({
  component: Home,
  loader: fetchFrontpage,
})

function Home() {
  const posts = Route.useLoaderData()
  const location = Route.path
  return (
    <AppLayout posts={posts} activePath={location}>
      <div className="p-2">
        <h3>Welcome Home!!!</h3>
      </div>
    </AppLayout>
  )
}
