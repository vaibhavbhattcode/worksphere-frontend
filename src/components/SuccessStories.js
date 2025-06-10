// SuccessStories.js
import React, { useEffect, useState } from "react";
import Slider from "react-slick";
import { motion } from "framer-motion";
import axios from "axios";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

export default function SuccessStories() {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStories = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_BACKEND_URL}/api/success-stories`
        );
        setStories(response.data);
      } catch (error) {
        console.error("Error fetching success stories:", error);
        setStories([
          {
            name: "Emma Larson",
            role: "UX Designer",
            company: "Innovex Solutions",
            quote:
              "WorkSphere matched me with a role that aligns perfectly with my passion for design.",
            avatar: "https://source.unsplash.com/100x100/?portrait,woman",
          },
          {
            name: "Rahul Singh",
            role: "Backend Engineer",
            company: "DataCore Technologies",
            quote:
              "The AI-driven job recommendations saved me weeks of searching!",
            avatar: "https://source.unsplash.com/100x100/?portrait,man",
          },
          {
            name: "Lila Nguyen",
            role: "Marketing Lead",
            company: "BrightPath Inc.",
            quote:
              "I landed my dream job in marketing within days of joining WorkSphere.",
            avatar: "https://source.unsplash.com/100x100/?portrait,person",
          },
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchStories();
  }, []);

  const settings = {
    dots: true,
    infinite: true,
    speed: 600,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    pauseOnHover: true,
    centerPadding: "40px",
    cssEase: "ease-out",
    responsive: [
      {
        breakpoint: 1024,
        settings: { slidesToShow: 2, centerPadding: "30px" },
      },
      { breakpoint: 640, settings: { slidesToShow: 1, centerPadding: "20px" } },
    ],
  };

  return (
    <section className="py-32 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 min-h-[700px]">
      <style jsx>{`
        .slick-track {
          display: flex !important;
          align-items: stretch !important;
          min-height: 300px;
        }
        .slick-slide {
          height: auto !important;
        }
        .slick-slide > div {
          height: 100%;
        }
        .slick-dots {
          margin-bottom: 2rem;
        }
        .slick-dots li button:before {
          color: #d1d5db;
          font-size: 12px;
        }
        .slick-dots li.slick-active button:before {
          color: #4f46e5;
        }
        .dark .slick-dots li button:before {
          color: #9ca3af;
        }
        .dark .slick-dots li.slick-active button:before {
          color: #a78bfa;
        }
      `}</style>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-4xl md:text-5xl font-bold text-center mb-16 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent"
        >
          Success Stories
        </motion.h2>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 my-8">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="bg-white/50 dark:bg-gray-800/50 rounded-2xl p-5 min-h-[300px] animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div className="overflow-visible my-8">
            <Slider {...settings}>
              {stories.map((story, index) => (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.015, y: -5, zIndex: 10 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="px-8"
                  aria-label={`Success story by ${story.name}`}
                >
                  <div className="bg-white/30 dark:bg-gray-800/30 backdrop-blur-md rounded-2xl p-5 shadow-lg border border-gray-100/20 dark:border-gray-700/20 min-h-[300px] flex flex-col justify-between">
                    <div>
                      <motion.img
                        src={story.avatar}
                        alt={`${story.name}'s avatar`}
                        className="w-16 h-16 rounded-full mx-auto mb-2 border-3 border-indigo-500 dark:border-purple-500 object-cover"
                        whileHover={{ scale: 1.1 }}
                        transition={{ type: "spring" }}
                      />
                      <p className="text-gray-600 dark:text-gray-200 text-center italic mb-2 text-sm leading-tight max-h-20 overflow-hidden text-ellipsis">
                        "{story.quote}"
                      </p>
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-gray-900 dark:text-white text-center">
                        {story.name}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                        {story.role} at {story.company}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </Slider>
          </div>
        )}
      </div>
    </section>
  );
}
