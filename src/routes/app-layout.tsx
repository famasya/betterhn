import { FireIcon, QuestionIcon, RocketIcon, StarIcon, TargetIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { ReactNode } from "react";
import PostList from "~/components/post-list";
import { cn } from "~/lib/utils";
import { ScrollArea } from "../components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../components/ui/tooltip";
import { FetchPostApiResponse } from "./loaders/types";

const links = [
  { label: "Front Page", href: "/", icon: FireIcon },
  { label: "Best", href: "/best", icon: StarIcon },
  { label: "New", href: "/new", icon: TargetIcon },
  { label: "Ask", href: "/ask", icon: QuestionIcon },
  { label: "Show", href: "/show", icon: RocketIcon },
]

type Props = {
  children: ReactNode
  posts: Array<FetchPostApiResponse["hits"][number]>
  activePath: string
}
export default function AppLayout({ children, posts, activePath }: Props) {
  return <div className="h-screen bg-gray-50 flex flex-row">
    <div className="bg-white border-r border-gray-200">
      <nav className="p-2 space-y-2">
        <TooltipProvider>
          {links.map((link) => (
            <Tooltip key={link.href} delayDuration={0}  >
              <TooltipTrigger asChild>
                <a href={link.href} className={cn(
                  "flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-700",
                  activePath === link.href && "bg-orange-200 text-orange-700 hover:bg-orange-200"
                )}>
                  <HugeiconsIcon icon={link.icon} className="w-5 h-5" />
                </a>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>{link.label}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </TooltipProvider>
      </nav>
    </div>
    <div className="w-1/4 max-w-[250px] bg-white border-r border-gray-200">
      <ScrollArea className="h-full">
        <PostList posts={posts} />
      </ScrollArea>
    </div>
    <main className="flex-1 bg-gray-50">
      {children}
    </main>
  </div>
}
