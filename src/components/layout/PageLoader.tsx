import { motion } from "framer-motion";

export function PageLoader() {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-background/80 backdrop-blur-md">
      <div className="flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
          className="mb-4"
        >
          <span className="text-3xl font-display font-bold tracking-tighter text-charcoal">OHOUSE</span>
        </motion.div>
        <div className="w-48 h-0.5 bg-secondary overflow-hidden rounded-full">
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: "100%" }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="w-full h-full bg-primary"
          />
        </div>
      </div>
    </div>
  );
}