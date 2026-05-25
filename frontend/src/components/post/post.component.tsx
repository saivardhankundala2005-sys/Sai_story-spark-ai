import React, { useState } from "react";
import ExploreViewListComponent from "./post.view.list.component";
import ExploreFeatureComponent from "./post.feature.component";
import { Link } from "react-router-dom";
import { useGetPostListsQuery } from "../../redux/apis/post.api";
import { useDebounced } from "../../hooks/global";
import PaginationComponent from "../pagination/pagination.component";

const ExploreComponent = () => {
  const [sortBy, setSortBy] = useState<string>("createdAt");
  const [sortOrder, setSortOrder] = useState<string>("desc");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [size, setSize] = useState<number>(10);
  const [page, setPage] = useState<number>(1);
  const [featuredPost, setFeaturedPost] = useState<boolean>(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const query: Record<string, string | number> = {
    page,
    limit: size,
    sortBy,
    sortOrder,
  };

  const debounceTerm = useDebounced({
    searchQuery: searchTerm,
    daley: 600,
  });

  if (debounceTerm) {
    query["searchTerm"] = debounceTerm;
  }

  if (selectedTags.length > 0) {
    query["tags"] = selectedTags.join(",");
  }

  const { data, isLoading } = useGetPostListsQuery({ ...query });

  const resetAllStates = () => {
    setSortBy("createdAt");
    setSortOrder("desc");
    setSearchTerm("");
    setSelectedTags([]);
    setPage(1);
  };

  const onPaginationChange = (page: number, pageSize: number) => {
    setPage(page);
    setSize(pageSize);
  };

  const handleTagClick = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
    setPage(1);
  };

  const availableTags = [
    "adventure",
    "steampunk",
    "fantasy",
    "thriller",
    "mystery",
    "romance",
  ];
  const availableGenres = ["Fantasy", "Science Fiction", "Mystery", "Romance"];

  return (
    <div className="pt-0 min-h-screen bg-slate-900 text-slate-100 relative overflow-hidden">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="pt-2 pb-6 flex gap-8">
          <div className="w-64">
            <Link to="/">
              <div className="!rounded-button bg-gradient-to-r from-white/20 to-white/10 hover:from-white/30 hover:to-white/20 text-gray-300 px-3 py-2 flex items-center gap-2 transition-all duration-300 rounded">
                <i className="fa-solid fa-left-long"></i> BACK
              </div>
            </Link>
          </div>
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                placeholder="Search title, tag..."
                className="w-full pl-12 pr-4 py-2 text-base text-gray-200 placeholder-gray-400 bg-blue-500/10 border outline-1 -outline-offset-1 outline-indigo-600 rounded-md focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(1);
                }}
              />
            <i className="fas fa-search absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400"></i>
            </div>
          </div>
        </div>

        <div className="flex gap-8">
          <div className="w-64 flex-shrink-0">
            <div className="sticky top-4 bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 shadow-xl z-10">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-slate-200">
                  Filters
                </h3>
                <button
                  onClick={resetAllStates}
                  className="text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Reset
                </button>
              </div>
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold mb-3 text-slate-300">Genres</h4>
                  <div className="space-y-2">
                    {availableGenres.map((genre) => (
                      <label key={genre} className="flex items-center">
                        <input
                          type="checkbox"
                          className="rounded border-slate-600 bg-slate-700/50 text-blue-500 focus:ring-blue-500 cursor-pointer transition-all"
                          checked={selectedTags.includes(genre.toLowerCase())}
                          onChange={() => handleTagClick(genre.toLowerCase())}
                        />
                        <span className="ml-3 text-sm text-slate-400 cursor-pointer hover:text-slate-300 transition-colors">
                          {genre}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-3 text-slate-300">
                    Trending Tags
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {availableTags.map((tag) => (
                      <span
                        key={tag}
                        onClick={() => handleTagClick(tag)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-all duration-200 shadow-sm ${
                          selectedTags.includes(tag)
                            ? "bg-blue-600 text-white shadow-blue-500/25"
                            : "bg-slate-700/60 border border-slate-600/50 text-slate-300 hover:bg-slate-600 hover:text-white"
                        }`}
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-3 text-slate-300">Sort By</h4>
                  <select
                    value={sortBy}
                    onChange={(e) => {
                      setSortBy(e.target.value);
                      setPage(1);
                    }}
                    className="w-full border border-slate-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-slate-700/50 text-slate-200 p-2.5 outline-none transition-all cursor-pointer appearance-none"
                  >
                    <option value="createdAt">Latest</option>
                    <option value="views">Most Popular</option>
                    <option value="commentsCount">Most Discussed</option>
                    <option value="likesCount">Most Liked</option>
                  </select>
                </div>
                <div>
                  <h4 className="font-semibold mb-3 text-slate-300">Order</h4>
                  <select
                    value={sortOrder}
                    onChange={(e) => {
                      setSortOrder(e.target.value);
                      setPage(1);
                    }}
                    className="w-full border border-slate-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-slate-700/50 text-slate-200 p-2.5 outline-none transition-all cursor-pointer appearance-none"
                  >
                    <option value="desc">Descending</option>
                    <option value="asc">Ascending</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 flex flex-col min-h-[70vh]">
            <div className={`${featuredPost ? "mb-6" : ""}`}>
              <div className="flex justify-between items-center">
                <div className="flex space-x-4 items-center justify-items-start overflow-x-auto">
                  <h2
                    onClick={() => setFeaturedPost(false)}
                className={`text-3xl font-extrabold mb-6 cursor-pointer transition-all duration-300 ${
                  !featuredPost ? "bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400 drop-shadow-sm" : "text-slate-500 hover:text-slate-300"
                    }`}
                  >
                    All Stories
                  </h2>
                  <h2
                className={`text-2xl font-bold mb-6 cursor-pointer transition-all duration-300 flex items-center ${
                  featuredPost ? "bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-amber-500 drop-shadow-sm" : "text-slate-500 hover:text-slate-300"
                    }`}
                    onClick={() => setFeaturedPost(!featuredPost)}
                  >
                    <i className="fas fa-star mr-2 text-yellow-500"></i>Featured
                  </h2>
                </div>
                <div className="flex items-center space-x-4">
                  <label className="text-sm text-gray-400">Show</label>
                  <select
                className="!rounded-button border border-slate-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 bg-slate-800 text-slate-300 py-1.5 px-3 outline-none transition-all appearance-none cursor-pointer"
                    value={size}
                    onChange={(e) => {
                      setSize(Number(e.target.value));
                      setPage(1);
                    }}
                  >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                  <span className="text-sm text-gray-400">entries</span>
                </div>
              </div>
              {featuredPost && <ExploreFeatureComponent />}
            </div>

            {selectedTags.length > 0 && (
              <div className="mb-4 flex flex-wrap gap-2">
                {selectedTags.map((tag) => (
                  <span
                    key={tag}
                className="px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg shadow-md shadow-blue-500/25 flex items-center gap-1"
                  >
                    #{tag}
                    <button
                      onClick={() => handleTagClick(tag)}
                  className="w-4 h-4 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
                    >
                      ×
                    </button>
                  </span>
                ))}
                <button
                  onClick={() => setSelectedTags([])}
              className="text-xs font-medium text-blue-400 hover:text-blue-300 transition-colors underline underline-offset-2"
                >
                  Clear all
                </button>
              </div>
            )}

            <div className="flex-grow">
              <ExploreViewListComponent
                posts={data?.posts || []}
                isLoading={isLoading}
              />
            </div>

            {!featuredPost && data?.meta && (
              <div className="sticky bottom-0 bg-gray-900/90 backdrop-blur-md border-t border-gray-800 z-10 mt-auto py-4">
                <PaginationComponent
                  current={page}
                  pageSize={size}
                  total={data.meta.total}
                  onChange={onPaginationChange}
                />
              </div>
            )}
          </div>
        </div>
      </div>
  
  <div className="fixed top-[-20%] left-[-10%] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none -z-10"></div>
  <div className="fixed bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px] pointer-events-none -z-10"></div>
    </div>
  );
};

export default ExploreComponent;
