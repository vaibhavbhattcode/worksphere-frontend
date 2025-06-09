// CommunityHub.js
import React, { useEffect, useState } from "react";
import { Parallax } from "react-parallax";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import axios from "axios";

export default function CommunityHub() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/community/events"
        );
        setEvents(response.data);
      } catch (error) {
        console.error("Error fetching events:", error);
        setEvents([
          {
            title: "Career Fair 2025",
            date: "May 5, 2025",
            description: "Network with top employers in tech.",
            link: "/events/career-fair",
            image: "https://source.unsplash.com/300x200/?career",
          },
          {
            title: "AI in Jobs Webinar",
            date: "May 10, 2025",
            description: "Explore AI’s role in modern hiring.",
            link: "/webinars/ai-jobs",
            image: "https://source.unsplash.com/300x200/?webinar",
          },
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  return (
    <Parallax
      bgImage="https://source.unsplash.com/1600x900/?community"
      strength={400}
    >
      <section className="py-20 bg-black/60 dark:bg-black/70 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold text-center mb-16"
          >
            Join Our Community
          </motion.h2>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[...Array(2)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white/20 dark:bg-gray-700/20 rounded-2xl p-6 h-64 animate-pulse"
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {events.map((event, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, rotateY: 90 }}
                  whileInView={{ opacity: 1, rotateY: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.3, duration: 0.6 }}
                  className="glassmorphism rounded-2xl p-6 shadow-2xl hover:shadow-glow"
                >
                  <img
                    src={event.image}
                    alt={event.title}
                    className="w-full h-40 object-cover rounded-lg mb-4"
                  />
                  <h3 className="text-2xl font-semibold mb-2">{event.title}</h3>
                  <p className="text-sm text-gray-300 dark:text-gray-400 mb-2">
                    {event.date}
                  </p>
                  <p className="text-gray-200 dark:text-gray-300 mb-4">
                    {event.description}
                  </p>
                  <Link
                    to={event.link}
                    className="inline-block px-6 py-3 bg-gradient-to-r from-orange-500 to-pink-500 rounded-lg hover:shadow-glow"
                    aria-label={`Register for ${event.title}`}
                  >
                    Register Now
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>
    </Parallax>
  );
}
