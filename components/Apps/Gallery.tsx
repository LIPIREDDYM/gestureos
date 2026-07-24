"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

// Gallery items are rendered as generated gradient tiles rather than fetched
// photos, so the demo works fully offline with zero external requests.
const ITEMS = [
  { id: 1, title: "Aurora", gradient: "from-accent-blue via-accent-purple to-accent-pink" },
  { id: 2, title: "Dune", gradient: "from-accent-amber via-accent-pink to-accent-purple" },
  { id: 3, title: "Glacier", gradient: "from-accent-teal via-accent-blue to-accent-purple" },
  { id: 4, title: "Canopy", gradient: "from-accent-green via-accent-teal to-accent-blue" },
  { id: 5, title: "Ember", gradient: "from-accent-pink via-accent-amber to-accent-green" },
  { id: 6, title: "Nebula", gradient: "from-accent-purple via-accent-blue to-accent-teal" },
  { id: 7, title: "Tidepool", gradient: "from-accent-teal via-accent-green to-accent-amber" },
  { id: 8, title: "Twilight", gradient: "from-accent-blue via-accent-pink to-accent-amber" },
];

export function Gallery() {
  const [selected, setSelected] = useState<number | null>(null);
  const selectedItem = ITEMS.find((i) => i.id === selected);

  return (
    <div className="h-full overflow-y-auto p-4 no-scrollbar">
      <div className="grid grid-cols-3 gap-3">
        {ITEMS.map((item) => (
          <motion.button
            key={item.id}
            layoutId={`gallery-${item.id}`}
            onClick={() => setSelected(item.id)}
            whileHover={{ scale: 1.03 }}
            className={`aspect-square rounded-xl bg-gradient-to-br ${item.gradient} shadow-lg`}
          />
        ))}
      </div>

      <AnimatePresence>
        {selectedItem && (
          <motion.div
            className="absolute inset-0 z-10 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelected(null)}
          >
            <motion.div
              layoutId={`gallery-${selectedItem.id}`}
              className={`relative h-3/4 w-3/4 rounded-2xl bg-gradient-to-br ${selectedItem.gradient} shadow-2xl`}
            >
              <div className="absolute bottom-4 left-4 rounded-lg bg-black/30 px-3 py-1.5 text-sm backdrop-blur-md">
                {selectedItem.title}
              </div>
              <button
                onClick={() => setSelected(null)}
                className="absolute right-3 top-3 rounded-full bg-black/40 p-1.5 hover:bg-black/60"
              >
                <X size={16} />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
