"use client";
import { Image, Card } from "@heroui/react";
import { motion } from "framer-motion";

export default function InfiniteDriftGallery() {
  const ALL_IMAGES = [
  "/images/graph.png",
  "/images/tree.png",
  "/images/stack.png",
  "/images/array.png",
  "/images/queue.png",
  "/images/ll.png",
];

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-black">
      {/* Background Image */}
      <div 
        className="absolute inset-0 opacity-100 bg-cover bg-center"
        style={{ backgroundImage: `url('/images/bg.png')` }}
      />

      <div className="relative z-10 flex flex-wrap justify-center gap-12 max-w-6xl isolate">
        {ALL_IMAGES.map((src, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ 
              opacity: 1, 
              scale: 1,
              // THE DRIFT: Move subtly in a random loop
              y: [Math.random() * 20, Math.random() * -20, Math.random() * 20],
              x: [Math.random() * 15, Math.random() * -15, Math.random() * 15],
              rotate: [Math.random() * 5, Math.random() * -5, Math.random() * 5],
            }}
            transition={{
              duration: 4 + Math.random() * 4, // Different speeds for each
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.2 // Still pop in one-by-one at start
            }}
            whileHover={{ 
              scale: 1.1, 
              rotate: 0, 
              zIndex: 50,
              transition: { duration: 0.2, delay: 0 } // Instant hover response
            }}
          >
            <Card isPressable className="border-none shadow-2xl backdrop-blur-md bg-white/10">
              <Image
                alt="Drifting card"
                className="object-cover"
                height={220}
                src={src}
                width={220}
              />
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
