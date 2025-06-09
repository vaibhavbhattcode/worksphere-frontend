import { useState, useEffect, useCallback } from 'react';
import axios from '../api/api';

export const useDashboardData = () => {
  const [stats, setStats] = useState({ users: 0, companies: 0, jobs: 0 });
  const [userGrowth, setUserGrowth] = useState([]);
  const [jobTrends, setJobTrends] = useState([]);
  const [jobStats, setJobStats] = useState([]);
  const [companyStats, setCompanyStats] = useState([]);
  const [topCompanies, setTopCompanies] = useState([]);
  const [unmatchedIndustries, setUnmatchedIndustries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      const adminToken = localStorage.getItem('adminToken');
      const headers = { 
        headers: { 
          Authorization: `Bearer ${adminToken}` 
        },
        withCredentials: true 
      };

      // Fetch all data in parallel
      const [
        statsRes, 
        growthRes, 
        trendsRes, 
        jobStatsRes, 
        companyStatsRes
      ] = await Promise.all([
        axios.get('/admin/stats', headers),
        axios.get('/admin/user-growth', headers),
        axios.get('/admin/job-trends', headers),
        axios.get('/admin/job-stats', headers),
        axios.get('/admin/company-stats', headers)
      ]);

      setStats(statsRes.data);
      setUserGrowth(growthRes.data);
      setJobTrends(trendsRes.data);
      setJobStats(jobStatsRes.data);

      // Process company stats
      const industryStats = companyStatsRes.data.industryStats || [];
      const totalCompanies = industryStats.reduce((sum, item) => sum + item.count, 0);
      
      const industryStatsWithPercentage = industryStats
        .map(item => ({
          ...item,
          percentage: totalCompanies ? Number(((item.count / totalCompanies) * 100).toFixed(2)) : 0
        }))
        .sort((a, b) => b.count - a.count || a.industry.localeCompare(b.industry));

      setCompanyStats(industryStatsWithPercentage);
      setUnmatchedIndustries(companyStatsRes.data.unmatchedIndustries || []);
      
      // Process top companies
      setTopCompanies(
        (companyStatsRes.data.topCompanies || []).map(company => ({
          name: company.name,
          jobCount: company.jobCount,
        }))
      );
      
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refetch = () => {
    setLoading(true);
    setError(null);
    fetchData();
  };

  return {
    stats,
    userGrowth,
    jobTrends,
    jobStats,
    companyStats,
    topCompanies,
    unmatchedIndustries,
    loading,
    error,
    refetch,
  };
};

export const useIntervalData = (endpoint, interval, params = {}) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const adminToken = localStorage.getItem('adminToken');
      const response = await axios.get(`/admin/${endpoint}`, {
        params: { ...params, interval },
        headers: { Authorization: `Bearer ${adminToken}` },
        withCredentials: true,
      });
      setData(response.data);
    } catch (err) {
      console.error(`Error fetching ${endpoint} data:`, err);
      setError(`Failed to load ${endpoint} data. Please try again later.`);
    } finally {
      setLoading(false);
    }
  }, [endpoint, interval, params]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
};
