import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Trophy,
  Medal,
  Award,
  TrendingUp,
  Target,
  CheckCircle,
  Users,
} from 'lucide-react';
import {
  collection,
  getDocs,
  type DocumentData,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import Navbar from '../components/Navbar';
import type { Challenge } from '../types/Challenge';

interface UserStats {
  userId: string;
  userEmail: string;
  totalChallenges: number;
  completedChallenges: number;
  averageCompletionRate: number;
  totalProgress: number;
  rank: number;
}

const Leaderboard: React.FC = () => {
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState<UserStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);

      // Fetch all challenges
      const challengesRef = collection(db, 'challenges');
      const snapshot = await getDocs(challengesRef);

      // Group challenges by user and calculate stats
      const userStatsMap = new Map<string, UserStats>();

      for (const docSnapshot of snapshot.docs) {
        const data = docSnapshot.data() as DocumentData;
        const userId = data.userId;

        if (!userId) continue;

        const challenge: Challenge = {
          id: docSnapshot.id,
          userId: data.userId,
          title: data.title,
          description: data.description,
          targetValue: data.targetValue,
          unit: data.unit,
          deadline: data.deadline?.toDate(),
          currentValue: data.currentValue || 0,
          createdAt: data.createdAt?.toDate(),
          status: data.status || 'active',
        };

        const completionRate = Math.min(
          (challenge.currentValue / challenge.targetValue) * 100,
          100
        );

        if (!userStatsMap.has(userId)) {
          userStatsMap.set(userId, {
            userId,
            userEmail: '', // Will be populated separately
            totalChallenges: 0,
            completedChallenges: 0,
            averageCompletionRate: 0,
            totalProgress: 0,
            rank: 0,
          });
        }

        const stats = userStatsMap.get(userId)!;
        stats.totalChallenges += 1;
        if (challenge.status === 'completed') {
          stats.completedChallenges += 1;
        }
        stats.totalProgress += completionRate;
      }

      // Calculate average completion rate for each user
      const userStatsArray = Array.from(userStatsMap.values()).map((stats) => ({
        ...stats,
        averageCompletionRate:
          stats.totalChallenges > 0
            ? Math.round(stats.totalProgress / stats.totalChallenges)
            : 0,
      }));

      // Sort by average completion rate (descending), then by completed challenges
      userStatsArray.sort((a, b) => {
        if (b.averageCompletionRate !== a.averageCompletionRate) {
          return b.averageCompletionRate - a.averageCompletionRate;
        }
        return b.completedChallenges - a.completedChallenges;
      });

      // Assign ranks
      const rankedStats = userStatsArray.map((stats, index) => ({
        ...stats,
        rank: index + 1,
      }));

      setLeaderboard(rankedStats);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-8 h-8 text-yellow-400" />;
      case 2:
        return <Medal className="w-8 h-8 text-gray-400" />;
      case 3:
        return <Award className="w-8 h-8 text-amber-600" />;
      default:
        return <span className="text-2xl font-bold text-gray-400">#{rank}</span>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-slate-900 to-black flex items-center justify-center">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full blur-xl opacity-50 animate-pulse" />
          <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-white text-lg font-medium">Loading Leaderboard...</span>
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
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-500 to-amber-500 rounded-2xl blur-xl opacity-40" />
            <div className="relative bg-gradient-to-r from-yellow-500 to-amber-500 p-5 rounded-2xl shadow-2xl shadow-yellow-500/30">
              <Trophy className="w-12 h-12 text-white" />
            </div>
          </div>
          <h2 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 via-amber-400 to-orange-400 bg-clip-text text-transparent mb-3">
            Fitness Challenge Leaderboard
          </h2>
          <p className="text-gray-400 text-lg leading-relaxed">
            See how you stack up against other fitness enthusiasts!
          </p>
        </div>

        {/* Stats Summary Grid - 4 columns on desktop, 2 on tablet, 1 on mobile */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="group bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10 hover:border-blue-500/50 transition-all duration-300 text-center">
            <Users className="w-9 h-9 text-blue-400 mx-auto mb-4 group-hover:scale-110 transition-transform duration-300" />
            <div className="text-3xl font-bold text-white mb-1">{leaderboard.length}</div>
            <div className="text-gray-400 text-sm font-medium leading-relaxed">Total Users</div>
          </div>
          <div className="group bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10 hover:border-purple-500/50 transition-all duration-300 text-center">
            <Target className="w-9 h-9 text-purple-400 mx-auto mb-4 group-hover:scale-110 transition-transform duration-300" />
            <div className="text-3xl font-bold text-white mb-1">
              {leaderboard.reduce((acc, u) => acc + u.totalChallenges, 0)}
            </div>
            <div className="text-gray-400 text-sm font-medium leading-relaxed">Total Challenges</div>
          </div>
          <div className="group bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10 hover:border-green-500/50 transition-all duration-300 text-center">
            <CheckCircle className="w-9 h-9 text-green-400 mx-auto mb-4 group-hover:scale-110 transition-transform duration-300" />
            <div className="text-3xl font-bold text-white mb-1">
              {leaderboard.reduce((acc, u) => acc + u.completedChallenges, 0)}
            </div>
            <div className="text-gray-400 text-sm font-medium leading-relaxed">Completed</div>
          </div>
          <div className="group bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10 hover:border-pink-500/50 transition-all duration-300 text-center">
            <TrendingUp className="w-9 h-9 text-pink-400 mx-auto mb-4 group-hover:scale-110 transition-transform duration-300" />
            <div className="text-3xl font-bold text-white mb-1">
              {leaderboard.length > 0
                ? Math.round(
                    leaderboard.reduce((acc, u) => acc + u.averageCompletionRate, 0) /
                      leaderboard.length
                  )
                : 0}
              %
            </div>
            <div className="text-gray-400 text-sm font-medium leading-relaxed">Avg. Completion</div>
          </div>
        </div>

        {/* Leaderboard List */}
        {leaderboard.length === 0 ? (
          <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-12 border border-white/10 text-center">
            <div className="relative inline-block mb-6">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full blur-2xl opacity-30" />
              <div className="relative bg-gradient-to-r from-purple-600 to-blue-600 p-6 rounded-full">
                <Trophy className="w-16 h-16 text-white" />
              </div>
            </div>
            <h3 className="text-3xl font-bold text-white mb-3">No Rankings Yet</h3>
            <p className="text-gray-400 text-lg leading-relaxed">
              Be the first to create and complete challenges to top the leaderboard!
            </p>
          </div>
        ) : (
          <div className="space-y-10">
            {leaderboard.map((userStats) => {
              const isCurrentUser = userStats.userId === user?.uid;

              return (
                <div
                  key={userStats.userId}
                  className={`group relative bg-white/5 backdrop-blur-xl rounded-2xl p-8 border transition-all duration-300 hover:scale-[1.02] ${
                    isCurrentUser
                      ? 'border-purple-500/50 bg-purple-500/10'
                      : userStats.rank === 1
                      ? 'border-yellow-500/50 hover:border-yellow-500/70'
                      : userStats.rank === 2
                      ? 'border-gray-400/50 hover:border-gray-400/70'
                      : userStats.rank === 3
                      ? 'border-amber-600/50 hover:border-amber-600/70'
                      : 'border-white/10 hover:border-purple-500/50'
                  }`}
                >
                  {/* Rank badge glow effect for top 3 */}
                  {userStats.rank <= 3 && (
                    <div className={`absolute inset-0 bg-gradient-to-r from-yellow-500/10 to-amber-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
                      userStats.rank === 1 ? 'from-yellow-500/20 to-amber-500/20' :
                      userStats.rank === 2 ? 'from-gray-500/20 to-silver-500/20' :
                      'from-amber-600/20 to-orange-600/20'
                    }`} />
                  )}

                  <div className="relative flex items-center gap-6 sm:gap-8">
                    {/* Rank */}
                    <div className="flex-shrink-0 w-16 text-center">
                      {getRankIcon(userStats.rank)}
                    </div>

                    {/* User Info & Stats */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-bold text-white truncate">
                            {userStats.userEmail || `User ${userStats.userId.slice(0, 6)}`}
                          </h3>
                          {isCurrentUser && (
                            <span className="text-xs text-purple-400 font-medium bg-purple-500/20 px-2 py-0.5 rounded-full">You</span>
                          )}
                        </div>
                        <div className="flex items-center gap-4 sm:gap-6 text-sm">
                          <div className="text-center">
                            <div className="text-white font-bold text-lg">{userStats.totalChallenges}</div>
                            <div className="text-gray-400 text-xs leading-relaxed">Challenges</div>
                          </div>
                          <div className="text-center">
                            <div className="text-green-400 font-bold text-lg">{userStats.completedChallenges}</div>
                            <div className="text-gray-400 text-xs leading-relaxed">Completed</div>
                          </div>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="flex items-center gap-4">
                        <span className="text-gray-400 text-sm w-28 hidden sm:block">Completion Rate</span>
                        <div className="flex-1 bg-white/5 rounded-full h-4 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              userStats.rank === 1
                                ? 'bg-gradient-to-r from-yellow-500 via-amber-500 to-orange-500 shadow-lg shadow-yellow-500/30'
                                : userStats.rank === 2
                                ? 'bg-gradient-to-r from-gray-400 via-gray-500 to-gray-600 shadow-lg shadow-gray-500/30'
                                : userStats.rank === 3
                                ? 'bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 shadow-lg shadow-amber-600/30'
                                : 'bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500'
                            }`}
                            style={{ width: `${userStats.averageCompletionRate}%` }}
                          />
                        </div>
                        <span className="text-white font-bold w-14 text-right">
                          {userStats.averageCompletionRate}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default Leaderboard;
