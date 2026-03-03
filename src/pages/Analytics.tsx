import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  BarChart3,
  TrendingUp,
  Target,
  Calendar,
  Activity,
} from 'lucide-react';
import {
  collection,
  query,
  where,
  onSnapshot,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  PointElement,
  LineElement,
  Filler,
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import Navbar from '../components/Navbar';
import type { Challenge } from '../types/Challenge';

// Register Chart.js components
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  PointElement,
  LineElement,
  Filler
);

interface WeeklyData {
  labels: string[];
  data: number[];
}

const Analytics: React.FC = () => {
  const { user } = useAuth();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [weeklyData, setWeeklyData] = useState<WeeklyData | null>(null);

  useEffect(() => {
    if (!user) return;

    const challengesRef = collection(db, 'challenges');
    const q = query(challengesRef, where('userId', '==', user.uid));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const challengesData: Challenge[] = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          userId: data.userId,
          title: data.title,
          description: data.description,
          targetValue: data.targetValue,
          unit: data.unit,
          deadline: data.deadline?.toDate(),
          currentValue: data.currentValue || 0,
          createdAt: data.createdAt?.toDate(),
          status: data.status || 'active',
        } as Challenge;
      });
      setChallenges(challengesData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  // Calculate weekly progress data
  useEffect(() => {
    if (challenges.length === 0) {
      setWeeklyData(null);
      return;
    }

    const today = new Date();
    const labels: string[] = [];
    const data: number[] = [];

    // Get last 7 days
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      labels.push(date.toLocaleDateString('en-US', { weekday: 'short' }));

      // Calculate total progress for this day across all challenges
      let dayProgress = 0;
      challenges.forEach((challenge) => {
        if (challenge.createdAt) {
          const actualProgress = Math.min(challenge.currentValue, challenge.targetValue);
          dayProgress += actualProgress / 7;
        }
      });

      data.push(Math.round(dayProgress));
    }

    setWeeklyData({ labels, data });
  }, [challenges]);

  const calculateProgress = (current: number, target: number): number => {
    return Math.min(Math.round((current / target) * 100), 100);
  };

  // Progress Bar Chart Data
  const getProgressChartData = () => {
    if (challenges.length === 0) return null;

    const labels = challenges.map((c) =>
      c.title.length > 15 ? c.title.substring(0, 15) + '...' : c.title
    );
    const progressData = challenges.map((c) =>
      calculateProgress(c.currentValue, c.targetValue)
    );

    return {
      labels,
      datasets: [
        {
          label: 'Progress (%)',
          data: progressData,
          backgroundColor: progressData.map((p) =>
            p === 100
              ? 'rgba(34, 197, 94, 0.8)'
              : p >= 75
              ? 'rgba(59, 130, 246, 0.8)'
              : p >= 50
              ? 'rgba(168, 85, 247, 0.8)'
              : 'rgba(239, 68, 68, 0.8)'
          ),
          borderColor: progressData.map((p) =>
            p === 100
              ? 'rgb(34, 197, 94)'
              : p >= 75
              ? 'rgb(59, 130, 246)'
              : p >= 50
              ? 'rgb(168, 85, 247)'
              : 'rgb(239, 68, 68)'
          ),
          borderWidth: 2,
          borderRadius: 8,
        },
      ],
    };
  };

  // Status Distribution Doughnut Chart Data
  const getStatusChartData = () => {
    const activeCount = challenges.filter((c) => c.status === 'active').length;
    const completedCount = challenges.filter((c) => c.status === 'completed').length;
    const expiredCount = challenges.filter((c) => c.status === 'expired').length;

    if (activeCount === 0 && completedCount === 0 && expiredCount === 0) return null;

    return {
      labels: ['Active', 'Completed', 'Expired'],
      datasets: [
        {
          label: 'Challenges',
          data: [activeCount, completedCount, expiredCount],
          backgroundColor: [
            'rgba(59, 130, 246, 0.8)',
            'rgba(34, 197, 94, 0.8)',
            'rgba(239, 68, 68, 0.8)',
          ],
          borderColor: [
            'rgb(59, 130, 246)',
            'rgb(34, 197, 94)',
            'rgb(239, 68, 68)',
          ],
          borderWidth: 2,
        },
      ],
    };
  };

  // Weekly Progress Line Chart Data
  const getWeeklyChartData = () => {
    if (!weeklyData) return null;

    return {
      labels: weeklyData.labels,
      datasets: [
        {
          label: 'Weekly Progress',
          data: weeklyData.data,
          fill: true,
          backgroundColor: 'rgba(168, 85, 247, 0.2)',
          borderColor: 'rgb(168, 85, 247)',
          borderWidth: 3,
          pointBackgroundColor: 'rgb(168, 85, 247)',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 5,
          pointHoverRadius: 7,
          tension: 0.4,
        },
      ],
    };
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'Progress by Challenge',
        color: 'rgba(255, 255, 255, 0.9)',
        font: { size: 14, weight: 'bold' as const },
      },
    },
    scales: {
      x: {
        ticks: { color: 'rgba(255, 255, 255, 0.7)' },
        grid: { color: 'rgba(255, 255, 255, 0.1)' },
      },
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          color: 'rgba(255, 255, 255, 0.7)',
          callback: (value: number | string) => `${value}%`,
        },
        grid: { color: 'rgba(255, 255, 255, 0.1)' },
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          color: 'rgba(255, 255, 255, 0.8)',
          font: { size: 12 },
        },
      },
      title: {
        display: true,
        text: 'Challenges by Status',
        color: 'rgba(255, 255, 255, 0.9)',
        font: { size: 14, weight: 'bold' as const },
      },
    },
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'Weekly Progress Trend',
        color: 'rgba(255, 255, 255, 0.9)',
        font: { size: 14, weight: 'bold' as const },
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
      },
    },
    scales: {
      x: {
        ticks: { color: 'rgba(255, 255, 255, 0.7)' },
        grid: { color: 'rgba(255, 255, 255, 0.1)' },
      },
      y: {
        beginAtZero: true,
        ticks: {
          color: 'rgba(255, 255, 255, 0.7)',
        },
        grid: { color: 'rgba(255, 255, 255, 0.1)' },
      },
    },
  };

  const progressChartData = getProgressChartData();
  const statusChartData = getStatusChartData();
  const weeklyChartData = getWeeklyChartData();

  // Calculate summary stats
  const activeChallenges = challenges.filter((c) => c.status === 'active');
  const completedChallenges = challenges.filter((c) => c.status === 'completed');
  const totalProgress =
    challenges.length > 0
      ? Math.round(
          challenges.reduce(
            (acc, c) => acc + calculateProgress(c.currentValue, c.targetValue),
            0
          ) / challenges.length
        )
      : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-slate-900 to-black flex items-center justify-center">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full blur-xl opacity-50 animate-pulse" />
          <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-white text-lg font-medium">Loading Analytics...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-slate-900 to-black">
      {/* Navigation Bar */}
      <Navbar showLogout={false} />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-8 pt-28 pb-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="relative inline-flex items-center justify-center mb-6">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl blur-xl opacity-40" />
            <div className="relative bg-gradient-to-r from-purple-600 to-blue-600 p-5 rounded-2xl shadow-2xl shadow-purple-500/30">
              <BarChart3 className="w-12 h-12 text-white" />
            </div>
          </div>
          <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent mb-3">
            Analytics Dashboard
          </h2>
          <p className="text-gray-400 text-lg leading-relaxed">
            Track your fitness journey with detailed insights and progress metrics
          </p>
        </div>

        {/* Summary Stats Grid - 4 columns on desktop, 2 on tablet, 1 on mobile */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="group bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10 hover:border-blue-500/50 transition-all duration-300 text-center">
            <Target className="w-9 h-9 text-blue-400 mx-auto mb-4 group-hover:scale-110 transition-transform duration-300" />
            <div className="text-3xl font-bold text-white mb-1">{activeChallenges.length}</div>
            <div className="text-gray-400 text-sm font-medium leading-relaxed">Active Challenges</div>
          </div>
          <div className="group bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10 hover:border-green-500/50 transition-all duration-300 text-center">
            <Activity className="w-9 h-9 text-green-400 mx-auto mb-4 group-hover:scale-110 transition-transform duration-300" />
            <div className="text-3xl font-bold text-white mb-1">{completedChallenges.length}</div>
            <div className="text-gray-400 text-sm font-medium leading-relaxed">Completed</div>
          </div>
          <div className="group bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10 hover:border-purple-500/50 transition-all duration-300 text-center">
            <TrendingUp className="w-9 h-9 text-purple-400 mx-auto mb-4 group-hover:scale-110 transition-transform duration-300" />
            <div className="text-3xl font-bold text-white mb-1">{totalProgress}%</div>
            <div className="text-gray-400 text-sm font-medium leading-relaxed">Avg. Progress</div>
          </div>
          <div className="group bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10 hover:border-pink-500/50 transition-all duration-300 text-center">
            <Calendar className="w-9 h-9 text-pink-400 mx-auto mb-4 group-hover:scale-110 transition-transform duration-300" />
            <div className="text-3xl font-bold text-white mb-1">{challenges.length}</div>
            <div className="text-gray-400 text-sm font-medium leading-relaxed">Total Challenges</div>
          </div>
        </div>

        {/* Charts Grid - Side by side on desktop, stacked on mobile */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
          {/* Progress Bar Chart */}
          {progressChartData && (
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10">
              <div className="h-80">
                <Bar data={progressChartData} options={barOptions} />
              </div>
            </div>
          )}

          {/* Status Doughnut Chart */}
          {statusChartData && (
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10">
              <div className="h-80">
                <Doughnut data={statusChartData} options={doughnutOptions} />
              </div>
            </div>
          )}
        </div>

        {/* Weekly Progress Chart */}
        {weeklyChartData && (
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10 mb-12">
            <div className="h-80">
              <Line data={weeklyChartData} options={lineOptions} />
            </div>
          </div>
        )}

        {/* No Data State */}
        {challenges.length === 0 && (
          <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-12 border border-white/10 text-center">
            <div className="relative inline-block mb-6">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full blur-2xl opacity-30" />
              <div className="relative bg-gradient-to-r from-purple-600 to-blue-600 p-6 rounded-full">
                <BarChart3 className="w-16 h-16 text-white" />
              </div>
            </div>
            <h3 className="text-3xl font-bold text-white mb-3">No Data Yet</h3>
            <p className="text-gray-400 mb-8 max-w-md mx-auto text-lg leading-relaxed">
              Create your first fitness challenge to start tracking your progress and viewing analytics!
            </p>
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-10 py-4 rounded-xl font-bold text-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-300 shadow-xl shadow-purple-500/25 hover:shadow-purple-500/40 hover:scale-105"
            >
              <Target className="w-6 h-6" />
              Create Your First Challenge
            </Link>
          </div>
        )}

        {/* Detailed Stats Table */}
        {challenges.length > 0 && (
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10">
            <h3 className="text-xl font-bold text-white mb-8 flex items-center gap-3">
              <BarChart3 className="w-6 h-6 text-purple-400" />
              Challenge Details
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="pb-4 text-gray-300 font-semibold text-sm uppercase tracking-wider">Challenge</th>
                    <th className="pb-4 text-gray-300 font-semibold text-sm uppercase tracking-wider">Goal</th>
                    <th className="pb-4 text-gray-300 font-semibold text-sm uppercase tracking-wider">Current</th>
                    <th className="pb-4 text-gray-300 font-semibold text-sm uppercase tracking-wider">Progress</th>
                    <th className="pb-4 text-gray-300 font-semibold text-sm uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {challenges.map((challenge) => {
                    const progress = calculateProgress(
                      challenge.currentValue,
                      challenge.targetValue
                    );
                    return (
                      <tr
                        key={challenge.id}
                        className="border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors"
                      >
                        <td className="py-4 text-white font-medium">{challenge.title}</td>
                        <td className="py-4 text-gray-300">
                          {challenge.targetValue} {challenge.unit}
                        </td>
                        <td className="py-4 text-gray-300">
                          {challenge.currentValue} {challenge.unit}
                        </td>
                        <td className="py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex-1 bg-white/5 rounded-full h-4 w-32">
                              <div
                                className={`h-full rounded-full transition-all duration-500 ${
                                  progress === 100
                                    ? 'bg-gradient-to-r from-green-500 to-emerald-600'
                                    : progress >= 50
                                    ? 'bg-gradient-to-r from-blue-500 to-purple-600'
                                    : 'bg-gradient-to-r from-red-500 to-orange-600'
                                }`}
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                            <span className="text-white font-semibold w-12 text-right">
                              {progress}%
                            </span>
                          </div>
                        </td>
                        <td className="py-4">
                          <span
                            className={`text-xs font-medium px-3 py-1.5 rounded-full border ${
                              challenge.status === 'completed'
                                ? 'text-green-400 bg-green-400/10 border-green-400/20'
                                : challenge.status === 'expired'
                                ? 'text-red-400 bg-red-400/10 border-red-400/20'
                                : 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20'
                            }`}
                          >
                            {challenge.status.charAt(0).toUpperCase() +
                              challenge.status.slice(1)}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Analytics;
