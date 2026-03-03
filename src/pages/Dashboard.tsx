import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Trophy,
  Target,
  TrendingUp,
  Plus,
  Edit3,
  CheckCircle,
  Clock,
  AlertCircle,
  BarChart3,
  Trash2,
} from 'lucide-react';
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  onSnapshot,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import ChallengeForm from '../components/ChallengeForm';
import Navbar from '../components/Navbar';
import type { Challenge, ChallengeFormData } from '../types/Challenge';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [updateProgressId, setUpdateProgressId] = useState<string | null>(null);
  const [progressValue, setProgressValue] = useState('');
  const [editingChallenge, setEditingChallenge] = useState<Challenge | null>(null);
  const [deletingChallengeId, setDeletingChallengeId] = useState<string | null>(null);

  // Fetch user's challenges in real-time
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

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      console.error('Failed to log out:', err);
    }
  };

  const handleCreateChallenge = async (formData: ChallengeFormData) => {
    if (!user) return;

    setIsCreating(true);
    try {
      const challengeData = {
        userId: user.uid,
        title: formData.title,
        description: formData.description,
        targetValue: formData.targetValue,
        unit: formData.unit,
        deadline: Timestamp.fromDate(new Date(formData.deadline)),
        currentValue: 0,
        createdAt: Timestamp.now(),
        status: 'active' as const,
      };

      await addDoc(collection(db, 'challenges'), challengeData);
      setIsFormOpen(false);
    } catch (error) {
      console.error('Error creating challenge:', error);
      throw error;
    } finally {
      setIsCreating(false);
    }
  };

  const handleEditChallenge = async (formData: ChallengeFormData) => {
    if (!user || !editingChallenge?.id) return;

    setIsCreating(true);
    try {
      const challengeRef = doc(db, 'challenges', editingChallenge.id);
      const challengeData = {
        title: formData.title,
        description: formData.description,
        targetValue: formData.targetValue,
        unit: formData.unit,
        deadline: Timestamp.fromDate(new Date(formData.deadline)),
      };

      await updateDoc(challengeRef, challengeData);
      setIsFormOpen(false);
      setEditingChallenge(null);
    } catch (error) {
      console.error('Error updating challenge:', error);
      throw error;
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteChallenge = async (challengeId: string) => {
    if (!window.confirm('Are you sure you want to delete this challenge? This action cannot be undone.')) {
      return;
    }

    setDeletingChallengeId(challengeId);
    try {
      const challengeRef = doc(db, 'challenges', challengeId);
      await deleteDoc(challengeRef);
    } catch (error) {
      console.error('Error deleting challenge:', error);
    } finally {
      setDeletingChallengeId(null);
    }
  };

  const handleUpdateProgress = async (challengeId: string) => {
    if (!progressValue || parseFloat(progressValue) <= 0) return;

    try {
      const challengeRef = doc(db, 'challenges', challengeId);
      const challenge = challenges.find((c) => c.id === challengeId);
      if (!challenge) return;

      const newValue = challenge.currentValue + parseFloat(progressValue);
      const status = newValue >= challenge.targetValue ? 'completed' : 'active';

      await updateDoc(challengeRef, {
        currentValue: newValue,
        status,
      });

      setUpdateProgressId(null);
      setProgressValue('');
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  const openEditForm = (challenge: Challenge) => {
    setEditingChallenge(challenge);
    setIsFormOpen(true);
  };

  const calculateProgress = (current: number, target: number): number => {
    return Math.min(Math.round((current / target) * 100), 100);
  };

  const getDaysRemaining = (deadline: Date): number => {
    const now = new Date();
    const diff = deadline.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const getStatusIcon = (status: Challenge['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'expired':
        return <AlertCircle className="w-5 h-5 text-red-400" />;
      default:
        return <Clock className="w-5 h-5 text-yellow-400" />;
    }
  };

  const getStatusColor = (status: Challenge['status']) => {
    switch (status) {
      case 'completed':
        return 'text-green-400 bg-green-400/10 border-green-400/20';
      case 'expired':
        return 'text-red-400 bg-red-400/10 border-red-400/20';
      default:
        return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
    }
  };

  const activeChallenges = challenges.filter((c) => c.status === 'active');
  const completedChallenges = challenges.filter((c) => c.status === 'completed');
  const totalProgress =
    challenges.length > 0
      ? Math.round(
          challenges.reduce((acc, c) => acc + calculateProgress(c.currentValue, c.targetValue), 0) /
            challenges.length
        )
      : 0;

  // Chart Data Preparation
  const getProgressChartData = () => {
    if (challenges.length === 0) return null;

    const labels = challenges.map(c => c.title.length > 15 ? c.title.substring(0, 15) + '...' : c.title);
    const progressData = challenges.map(c => calculateProgress(c.currentValue, c.targetValue));

    return {
      labels,
      datasets: [
        {
          label: 'Progress (%)',
          data: progressData,
          backgroundColor: progressData.map(p =>
            p === 100 ? 'rgba(34, 197, 94, 0.8)' :
            p >= 75 ? 'rgba(59, 130, 246, 0.8)' :
            p >= 50 ? 'rgba(168, 85, 247, 0.8)' :
            'rgba(239, 68, 68, 0.8)'
          ),
          borderColor: progressData.map(p =>
            p === 100 ? 'rgb(34, 197, 94)' :
            p >= 75 ? 'rgb(59, 130, 246)' :
            p >= 50 ? 'rgb(168, 85, 247)' :
            'rgb(239, 68, 68)'
          ),
          borderWidth: 2,
          borderRadius: 8,
        },
      ],
    };
  };

  const getStatusChartData = () => {
    const activeCount = activeChallenges.length;
    const completedCount = completedChallenges.length;
    const expiredCount = challenges.filter(c => c.status === 'expired').length;

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

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: 'rgba(255, 255, 255, 0.8)',
          font: { size: 12 },
        },
      },
      title: {
        display: true,
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
    },
  };

  const progressChartData = getProgressChartData();
  const statusChartData = getStatusChartData();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-slate-900 to-black flex items-center justify-center">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full blur-xl opacity-50 animate-pulse" />
          <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-white text-lg font-medium">Loading Dashboard...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-slate-900 to-black">
      {/* Navigation Bar */}
      <Navbar onLogout={handleLogout} />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-8 pt-28 pb-12">
        {/* Welcome Section with Create Button */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent mb-2">
              Welcome back!
            </h2>
            <p className="text-gray-400 text-lg leading-relaxed mb-8">{user?.email || 'User'} — Ready to crush your fitness goals today?</p>
          </div>
          <button
            onClick={() => setIsFormOpen(true)}
            className="group relative flex items-center justify-center gap-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-10 py-4 rounded-xl font-bold text-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-300 shadow-xl shadow-purple-500/25 hover:shadow-purple-500/40 hover:scale-105 whitespace-nowrap"
          >
            <Plus className="w-7 h-7 group-hover:rotate-90 transition-transform duration-300" />
            Create New Challenge
          </button>
        </div>

        {/* Stats Grid - 4 columns on desktop, 2 on tablet, 1 on mobile */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {/* Active Challenges Card */}
          <div className="group relative bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10 hover:border-purple-500/50 transition-all duration-300 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-gradient-to-br from-blue-500 to-cyan-600 p-3 rounded-xl shadow-lg shadow-blue-500/20">
                  <Target className="w-9 h-9 text-white" />
                </div>
                <span className="text-3xl font-bold text-white">{activeChallenges.length}</span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-1">Active Challenges</h3>
              <p className="text-gray-400 text-sm leading-relaxed">Currently ongoing goals</p>
            </div>
          </div>

          {/* Completed Challenges Card */}
          <div className="group relative bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10 hover:border-purple-500/50 transition-all duration-300 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-gradient-to-br from-purple-500 to-pink-600 p-3 rounded-xl shadow-lg shadow-purple-500/20">
                  <Trophy className="w-9 h-9 text-white" />
                </div>
                <span className="text-3xl font-bold text-white">{completedChallenges.length}</span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-1">Completed</h3>
              <p className="text-gray-400 text-sm leading-relaxed">Challenges conquered</p>
            </div>
          </div>

          {/* Progress Card */}
          <div className="group relative bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10 hover:border-purple-500/50 transition-all duration-300 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-3 rounded-xl shadow-lg shadow-green-500/20">
                  <TrendingUp className="w-9 h-9 text-white" />
                </div>
                <span className="text-3xl font-bold text-white">{totalProgress}%</span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-1">Avg. Completion</h3>
              <p className="text-gray-400 text-sm leading-relaxed">Overall progress rate</p>
            </div>
          </div>

          {/* Total Challenges Card */}
          <div className="group relative bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10 hover:border-purple-500/50 transition-all duration-300 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-gradient-to-br from-orange-500 to-red-600 p-3 rounded-xl shadow-lg shadow-orange-500/20">
                  <BarChart3 className="w-9 h-9 text-white" />
                </div>
                <span className="text-3xl font-bold text-white">{challenges.length}</span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-1">Total Challenges</h3>
              <p className="text-gray-400 text-sm leading-relaxed">All time created</p>
            </div>
          </div>
        </div>

        {/* Analytics Section */}
        {(progressChartData || statusChartData) && (
          <div className="mb-12">
            <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent mb-8 flex items-center gap-3">
              <BarChart3 className="w-9 h-9 text-purple-400" />
              Analytics Overview
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Progress Bar Chart */}
              {progressChartData && (
                <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10">
                  <h4 className="text-lg font-semibold text-white mb-8">Challenge Progress</h4>
                  <div className="h-80">
                    <Bar
                      data={progressChartData}
                      options={{
                        ...chartOptions,
                        plugins: {
                          ...chartOptions.plugins,
                          title: {
                            ...chartOptions.plugins.title,
                            text: 'Progress by Challenge',
                            display: true,
                          },
                          legend: {
                            display: false,
                          },
                        },
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Status Doughnut Chart */}
              {statusChartData && (
                <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10">
                  <h4 className="text-lg font-semibold text-white mb-8">Status Distribution</h4>
                  <div className="h-80">
                    <Doughnut
                      data={statusChartData}
                      options={{
                        ...doughnutOptions,
                        plugins: {
                          ...doughnutOptions.plugins,
                          title: {
                            display: true,
                            text: 'Challenges by Status',
                            color: 'rgba(255, 255, 255, 0.9)',
                            font: { size: 14, weight: 'bold' as const },
                          },
                        },
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Challenges Grid */}
        {challenges.length === 0 ? (
          <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-12 border border-white/10 text-center">
            <div className="relative inline-block mb-6">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full blur-2xl opacity-30" />
              <div className="relative bg-gradient-to-r from-purple-600 to-blue-600 p-6 rounded-full">
                <Target className="w-16 h-16 text-white" />
              </div>
            </div>
            <h3 className="text-3xl font-bold text-white mb-3">No Challenges Yet</h3>
            <p className="text-gray-400 mb-8 max-w-md mx-auto text-lg leading-relaxed">
              Create your first fitness challenge and start tracking your progress. Set goals, track workouts, and achieve amazing results!
            </p>
            <button
              onClick={() => setIsFormOpen(true)}
              className="group relative inline-flex items-center gap-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-10 py-4 rounded-xl font-bold text-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-300 shadow-xl shadow-purple-500/25 hover:shadow-purple-500/40 hover:scale-105"
            >
              <Plus className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" />
              Create Your First Challenge
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
            {challenges.map((challenge) => {
              const progress = calculateProgress(challenge.currentValue, challenge.targetValue);
              const daysRemaining = getDaysRemaining(challenge.deadline);

              return (
                <div
                  key={challenge.id}
                  className="group relative bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10 hover:border-purple-500/50 transition-all duration-300 ease-in-out h-auto"
                >
                  {/* Background gradient on hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  <div className="relative">
                    {/* Card Header with Status */}
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-3">
                          {getStatusIcon(challenge.status)}
                          <span
                            className={`text-xs font-medium px-2.5 py-1 rounded-full border ${getStatusColor(
                              challenge.status
                            )}`}
                          >
                            {challenge.status.charAt(0).toUpperCase() + challenge.status.slice(1)}
                          </span>
                        </div>
                        <h3 className="text-xl font-bold text-white mb-3">{challenge.title}</h3>
                        <p className="text-gray-400 text-sm leading-relaxed line-clamp-2">{challenge.description}</p>
                      </div>

                      {/* Edit/Delete buttons - appear on hover */}
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <button
                          onClick={() => openEditForm(challenge)}
                          className="p-2 bg-white/10 hover:bg-blue-500/20 text-gray-400 hover:text-blue-400 rounded-lg transition-all duration-200"
                          title="Edit challenge"
                        >
                          <Edit3 className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteChallenge(challenge.id!)}
                          disabled={deletingChallengeId === challenge.id}
                          className="p-2 bg-white/10 hover:bg-red-500/20 text-gray-400 hover:text-red-400 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Delete challenge"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                    {/* Goal Info */}
                    <div className="bg-white/5 rounded-xl p-6 mb-6 border border-white/5">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <span className="text-gray-400 text-xs uppercase tracking-wider">Goal</span>
                          <div className="text-white font-semibold mt-0.5">
                            {challenge.targetValue} {challenge.unit}
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-400 text-xs uppercase tracking-wider">Current</span>
                          <div className="text-white font-semibold mt-0.5">
                            {challenge.currentValue} {challenge.unit}
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-between items-center mt-3 pt-3 border-t border-white/5">
                        <span className="text-gray-400 text-xs uppercase tracking-wider">Time Left</span>
                        <span
                          className={`text-sm font-medium ${
                            daysRemaining <= 3 ? 'text-red-400' : 'text-gray-300'
                          }`}
                        >
                          {daysRemaining > 0 ? `${daysRemaining} days` : 'Expired'}
                        </span>
                      </div>
                    </div>

                    {/* Circular Progress Ring */}
                    <div className="mb-6">
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-gray-400 text-sm font-medium">Progress</span>
                        <span className="text-2xl font-bold text-white">{progress}%</span>
                      </div>

                      {/* Sleek thick progress bar */}
                      <div className="relative w-full bg-white/5 rounded-full h-4 overflow-hidden">
                        <div
                          className={`absolute inset-y-0 left-0 rounded-full transition-all duration-700 ease-out ${
                            progress === 100
                              ? 'bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500'
                              : progress >= 75
                              ? 'bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-500'
                              : progress >= 50
                              ? 'bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500'
                              : 'bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500'
                          }`}
                          style={{ width: `${progress}%` }}
                        />
                        {/* Shimmer effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                      {challenge.status === 'active' && (
                        <button
                          onClick={() => setUpdateProgressId(challenge.id!)}
                          className="flex-1 bg-gradient-to-r from-purple-600/20 to-blue-600/20 hover:from-purple-600/30 hover:to-blue-600/30 text-purple-300 hover:text-white py-4 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2 border border-purple-500/20 hover:border-purple-500/40"
                        >
                          <Edit3 className="w-5 h-5" />
                          Update Progress
                        </button>
                      )}
                      {challenge.status !== 'active' && (
                        <div className="flex-1 text-center py-4 text-gray-400 text-sm bg-white/5 rounded-xl border border-white/5">
                          {challenge.status === 'completed' ? '✓ Completed' : 'Expired'}
                        </div>
                      )}
                    </div>

                    {/* Progress Update Input */}
                    {updateProgressId === challenge.id && (
                      <div className="mt-4 pt-4 border-t border-white/10 mb-2">
                        <label className="block text-sm text-gray-400 mb-3 leading-relaxed">
                          Add {challenge.unit}
                        </label>
                        <div className="flex flex-wrap items-center gap-3">
                          <input
                            type="number"
                            value={progressValue}
                            onChange={(e) => setProgressValue(e.target.value)}
                            placeholder="0"
                            min="1"
                            className="flex-1 min-w-[200px] px-4 py-2 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm font-medium"
                            autoFocus
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleUpdateProgress(challenge.id!)}
                              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-medium hover:from-purple-700 hover:to-blue-700 transition-all text-sm shadow-lg shadow-purple-500/25"
                            >
                              Add
                            </button>
                            <button
                              onClick={() => {
                                setUpdateProgressId(null);
                                setProgressValue('');
                              }}
                              className="px-4 py-2 bg-white/10 text-white rounded-xl font-medium hover:bg-white/20 transition-all text-sm"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Create/Edit Challenge Modal */}
      <ChallengeForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingChallenge(null);
        }}
        onSubmit={editingChallenge ? handleEditChallenge : handleCreateChallenge}
        isLoading={isCreating}
        initialData={editingChallenge ? {
          title: editingChallenge.title,
          description: editingChallenge.description,
          targetValue: editingChallenge.targetValue,
          unit: editingChallenge.unit,
          deadline: editingChallenge.deadline.toISOString().split('T')[0],
        } : undefined}
        isEditing={!!editingChallenge}
      />
    </div>
  );
};

export default Dashboard;
