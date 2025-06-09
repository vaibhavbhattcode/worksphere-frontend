import React from 'react';
import { motion } from 'framer-motion';
import { Skeleton } from '@chakra-ui/react';

const ChartContainer = ({
  title,
  children,
  loading = false,
  className = '',
  height = '400px',
  actions,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`bg-white rounded-lg shadow-md p-6 ${className}`}
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-700">{title}</h2>
        {actions && <div className="flex items-center space-x-2">{actions}</div>}
      </div>
      <div className="relative" style={{ height }}>
        {loading ? (
          <Skeleton height="100%" width="100%" />
        ) : (
          <div className="w-full h-full">{children}</div>
        )}
      </div>
    </motion.div>
  );
};

export default ChartContainer;
