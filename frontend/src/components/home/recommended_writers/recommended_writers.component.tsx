import React, { useState } from "react";

const RecommendedWritersComponent = () => {
  const recommendedWriters = [
    {
      name: "Roni Sarkar",
      role: "AI Writer",
      image: "https://avatars.githubusercontent.com/u/76697055?v=4",
    },
    {
      name: "Sarah Lee",
      role: "Content Creator",
      image: "https://i.pravatar.cc/150?img=5",
    },
    {
      name: "John Doe",
      role: "Story Writer",
      image: "https://i.pravatar.cc/150?img=8",
    },
  ];

  const [following, setFollowing] = useState<number[]>([]);

  const toggleFollow = (index: number) => {
    if (following.includes(index)) {
      setFollowing(following.filter((id) => id !== index));
    } else {
      setFollowing([...following, index]);
    }
  };

  return (
    <section className="bg-blue-500/10 rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-semibold text-slate-900 dark:text-gray-300 mb-4">
        Recommended Writers
      </h3>

      <div className="space-y-4">
        {recommendedWriters.map((writer, index) => (
          <div
            key={index}
            className="flex items-center justify-between"
          >
            <div className="flex items-center">
              <img
                className="h-10 w-10 rounded-full"
                src={writer.image}
                alt={writer.name}
              />

              <div className="ml-3">
                <p className="text-sm font-medium text-slate-700 dark:text-gray-400">
                  {writer.name}
                </p>

                <p className="text-xs text-slate-500 dark:text-gray-500">
                  {writer.role}
                </p>
              </div>
            </div>

            <button
              onClick={() => toggleFollow(index)}
              className="!rounded-button text-indigo-600 text-sm font-medium hover:text-indigo-700 cursor-pointer"
            >
              {following.includes(index) ? "Following" : "Follow"}
            </button>
          </div>
        ))}
      </div>
    </section>
  );
};

export default RecommendedWritersComponent;