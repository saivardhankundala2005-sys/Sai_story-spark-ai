import { useGetLatestListsQuery } from "../../../redux/apis/post.api";
import { Post } from "../../../models/post";
import LoadingAnimation from "../../loading/loading.component";
import SSProfile from "../../ui-component/ss-profile/ss-profile";

/*
 * Community Spotlight Section
 * ----------------------------
 * Displays recent top stories with author info, genre tags, and view count.
 * Uses the existing getLatestLists API endpoint.
 * No new backend changes are required.
 */

const CommunitySpotlightComponent = () => {
  const { data, isLoading } = useGetLatestListsQuery(undefined);

  if (isLoading) {
    return <LoadingAnimation />;
  }

  return (
    <div className="px-5 py-10">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-200">
          Community Spotlight
        </h2>
        <p className="text-gray-400 mt-2">
          Top stories handpicked from our community
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data?.posts?.length ?? 0 > 0 ? (
          data?.posts?.slice(0, 6).map((post: Post) => (
            <div
              key={post._id}
              className="bg-blue-500/10 rounded-xl p-6 hover:bg-blue-500/20 transition-all duration-300"
            >
              <div className="flex items-center mb-4">
                <SSProfile name={post.author.name} size="h-9 w-9" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-300">
                    {post.author.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(post.publishedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-200 mb-2 line-clamp-2">
                {post.title}
              </h3>
              <p className="text-gray-400 text-sm mb-4 line-clamp-3">
                {post.content.slice(0, 120)}...
              </p>
              <div className="flex items-center justify-between">
                <div className="flex items-center text-xs text-gray-500 gap-3">
                  <span className="flex items-center gap-1">
                    <i className="far fa-eye"></i> {post.viewsCount}
                  </span>
                  <span className="flex items-center gap-1">
                    <i className="far fa-heart"></i> {post.likesCount}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {post.topic.slice(0, 2).map((topic) => (
                    <span
                      key={topic._id}
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${topic.color}`}
                    >
                      {topic.title}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500 col-span-3">No spotlight stories yet.</p>
        )}
      </div>
    </div>
  );
};

export default CommunitySpotlightComponent;