import { Link } from "react-router-dom";
import { useEffect, useRef, useState, type MouseEvent } from "react";
import NavListComponent from "./nav_list.component";

const HeroSectionComponent = () => {
  const [stars, setStars] = useState<Array<{ id: number; x: number; y: number; size: number }>>([]);
  const nextStarId = useRef(1);
  const starTimers = useRef<number[]>([]);

  const handleMouseMove = (event: MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const id = nextStarId.current++;
    const size = 8 + Math.floor(Math.random() * 8);

    setStars((prev) => {
      const next = [...prev, { id, x, y, size }];
      return next.slice(-18);
    });

    const timerId = window.setTimeout(() => {
      setStars((prev) => prev.filter((star) => star.id !== id));
      starTimers.current = starTimers.current.filter((timer) => timer !== timerId);
    }, 650);
    starTimers.current.push(timerId);
  };

  useEffect(() => {
    return () => {
      starTimers.current.forEach((timerId) => window.clearTimeout(timerId));
      starTimers.current = [];
    };
  }, []);

  return (
    <div className="gradient-bg min-h-screen flex flex-col">
      <div className="relative overflow-hidden flex-grow" onMouseMove={handleMouseMove}>
        <div 
          className="relative z-10 mx-auto max-w-7xl px-6 pb-24 text-center"
          style={{ paddingTop: 'calc(var(--header-height) + 3.5rem)' }}
        >
          <div className="inline-flex items-center justify-center mx-auto px-4 py-1.5 mb-8 rounded-full bg-opacity-10 border border-white/20 opacity-80 bg-blue-500/20 text-white">
            <span className="text-sm font-medium">
              NEW TEXT TO STORY GENERATION
            </span>
            <span className="ml-2 text-sm font-semibold">
              {" "}
              AI <i className="fa-solid fa-wand-sparkles"></i>
            </span>
          </div>
          <h1 className="mx-auto max-w-5xl text-5xl sm:text-6xl lg:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-blue-500 to-slate-900 mb-8 tracking-tight leading-tight">
            Unleash Your
            <br />
            Imagination with AI-Generated Stories!
            <span className="inline-block ml-4 align-middle">
              <i className="fas fa-bolt text-yellow-400 glow"></i>
            </span>
          </h1>
          <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto">
            Transform your ideas into captivating narratives with just a simple
            prompt. Whether it's fantasy, mystery, or sci-fi — let your
            creativity flow effortlessly.
          </p>

        </div>
        <div className="absolute inset-0 -z-10 pointer-events-none overflow-hidden">
          <div className="hero-cursor-stars absolute inset-0" aria-hidden="true">
            <style>{
              stars
                .map(
                  (star) =>
                    `.hero-cursor-star-${star.id} { left: ${star.x}px; top: ${star.y}px; width: ${star.size}px; height: ${star.size}px; }`
                )
                .join(" ")
            }</style>
            {stars.map((star) => (
              <span
                key={star.id}
                className={`hero-cursor-star hero-cursor-star-${star.id} ${star.size > 12 ? "hero-cursor-star-large" : ""}`}
              />
            ))}
          </div>
          <div className="hero-3d-scene absolute inset-0" aria-hidden="true">
            <div className="hero-3d-card left-[8%] top-[30%]"></div>
            <div className="hero-3d-card hero-3d-card-secondary left-[18%] top-[62%]"></div>
            <div className="hero-3d-ring left-[65%] top-[18%]"></div>
            <div className="hero-3d-orb left-[72%] top-[62%]"></div>
            <div className="hero-3d-cube left-[55%] top-[42%]"></div>
            <div className="hero-3d-frame left-[42%] top-[74%]"></div>
            <div className="hero-3d-shard left-[28%] top-[22%]"></div>
            <div className="hero-3d-glint left-[12%] top-[15%]"></div>
            <div className="hero-3d-reading left-[50%] top-[34%]">
              <div className="hero-3d-reading-glow"></div>
              <div className="hero-3d-reading-head"></div>
              <div className="hero-3d-reading-torso"></div>
              <div className="hero-3d-reading-book"></div>
            </div>
          </div>
        </div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-custom/20 rounded-full blur-3xl -z-10"></div>
        <div className="absolute top-[-200px] left-[250px] w-[800px] h-[350px] bg-blue-500/20 rounded-full blur-3xl -z-10"></div>
        {/* <div className="absolute top-[-200px] right-[100px] w-[500px] h-[400px] bg-pink-500/20 rounded-full blur-3xl -z-10"></div> */}
      </div>

    </div>
  );
};

export default HeroSectionComponent;
