import React from 'react';
import { motion } from 'framer-motion';
import { Skeleton } from '@chakra-ui/react';

const StatCard = ({ title, value, icon: Icon, color = 'teal', loading = false }) => {
  const colors = {
    teal: 'from-teal-500 to-teal-600',
    blue: 'from-blue-500 to-blue-600',
    indigo: 'from-indigo-500 to-indigo-600',
    purple: 'from-purple-500 to-purple-600',
    pink: 'from-pink-500 to-pink-600',
  };

  const gradient = colors[color] || colors.teal;

  return (
    <motion.div
      whileHover={{ y: -5, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}
      className="bg-white rounded-xl shadow-lg overflow-hidden"
    >
      <div className="p-6">
        <div className="flex items-center">
          <div className={`p-3 rounded-lg bg-gradient-to-r ${gradient} text-white`}>
            <Icon className="h-6 w-6" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-500">{title}</p>
            {loading ? (
              <Skeleton height="28px" width="80px" mt={2} />
            ) : (
              <p className="text-2xl font-semibold text-gray-900">
                {value?.toLocaleString()}
              </p>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default StatCard;
