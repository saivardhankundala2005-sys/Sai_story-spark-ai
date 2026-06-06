import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Post } from "../../../models/post";
import { useGetLatestListsQuery } from "../../../redux/apis/post.api";
import LoadingAnimation from "../../loading/loading.component";

const INITIAL_VISIBLE_COUNT = 6;

const LatestPostsComponent = () => {
  const { data, isLoading, isError, refetch } = useGetLatestListsQuery(undefined);
  const navigate = useNavigate();
  const [showAllPosts, setShowAllPosts] = useState(false);

  // Remove duplicate posts based on _id
  const seenIds = new Set<string>();
  const uniquePosts = (data?.posts ?? []).filter((post: Post) => {
    if (!post?._id || seenIds.has(post._id)) return false;
    seenIds.add(post._id);
    return true;
  });

  if (isLoading) return <LoadingAnimation />;

  if (isError) {
    return (
      <section className="mb-12">
        <h2 className="mb-6 text-2xl font-bold text-slate-900 dark:text-slate-100">
          Latest Posts
        </h2>
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-5 text-center">
          <p className="mb-3 font-semibold text-red-200">Failed to load latest posts.</p>
          <button
            onClick={() => refetch()}
            className="rounded bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </section>
    );
  }

  const shouldShowLoadMore = uniquePosts.length > INITIAL_VISIBLE_COUNT;
  const visiblePosts =
    showAllPosts || !shouldShowLoadMore
      ? uniquePosts
      : uniquePosts.slice(0, INITIAL_VISIBLE_COUNT);

  const truncateContent = (content: string, maxLength: number = 100) => {
    if (!content) return "No preview available.";
    return content.length > maxLength 
      ? content.substring(0, maxLength).trim() + "..." 
      : content;
  };

  return (
    <section className="w-full min-w-0 max-w-full">
      <h2 className="mb-8 text-3xl font-bold text-slate-900 dark:text-slate-100">
        Latest Posts
      </h2>
      
      {visiblePosts.length > 0 ? (
        <>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
            {visiblePosts.map((post: Post) => (
              <div
                key={post._id}
                onClick={() => navigate(`/post/${post._id}`)}
                className="group cursor-pointer overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:border-indigo-300 hover:shadow-lg hover:-translate-y-1 dark:border-slate-800 dark:bg-slate-900/40 dark:hover:border-indigo-500/30 dark:hover:shadow-indigo-500/10 flex flex-col"
              >
                {/* Card Header with Gradient Accent */}
                <div className="relative h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Card Content */}
                <div className="flex flex-col flex-1 p-5">
                  {/* Title */}
                  <h3 className="mb-3 text-lg font-bold text-slate-900 transition-colors duration-200 group-hover:text-indigo-600 line-clamp-2 dark:text-slate-100 dark:group-hover:text-indigo-400">
                    {post.title}
                  </h3>

                  {/* Content Preview */}
                  <p className="mb-4 flex-1 text-sm leading-relaxed text-slate-600 dark:text-slate-400 line-clamp-3">
                    {truncateContent(post.content, 120)}
                  </p>

                  {/* Footer with Metadata */}
                  <div className="flex items-center justify-between border-t border-slate-100 pt-4 dark:border-slate-800">
                    <span className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Story
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                      Read More
                      <svg 
                        className="h-3 w-3 transition-transform group-hover:translate-x-1" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={2} 
                          d="M9 5l7 7-7 7" 
                        />
                      </svg>
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Load More Button */}
          {shouldShowLoadMore && !showAllPosts && (
            <div className="mt-10 flex justify-center">
              <button
                type="button"
                onClick={() => setShowAllPosts(true)}
                className="rounded-lg border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-800 shadow-sm transition-all duration-200 hover:bg-slate-50 hover:shadow-md dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                Load More Stories
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="rounded-lg border border-slate-200 bg-slate-50 px-6 py-8 text-center dark:border-slate-800 dark:bg-slate-900/20">
          <p className="text-slate-500 dark:text-slate-400">
            Stories are not available.
          </p>
        </div>
      )}
    </section>
  );
};

export default LatestPostsComponent;