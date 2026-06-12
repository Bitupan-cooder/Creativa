import React, { useState, useEffect } from 'react';
import { useStore, apiRequest } from '../store';
import { X, Flame, Trophy, Calendar, Check, ChevronRight, Sparkles, Award } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ConsistencyPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ConsistencyPanel({ isOpen, onClose }: ConsistencyPanelProps) {
  const { user, token, updateProfile } = useStore();
  const [streakDays, setStreakDays] = useState(4);
  const [hasCheckedIn, setHasCheckedIn] = useState(false);
  const [checkingIn, setCheckingIn] = useState(false);
  const [leaderboardTab, setLeaderboardTab] = useState<'weekly' | 'monthly'>('weekly');
  const [checkedDays, setCheckedDays] = useState<boolean[]>([true, true, true, false, false, false, false]);

  // Sync state from active login user details
  useEffect(() => {
    if (user) {
      const dbStreak = (user as any).streakDays !== undefined ? (user as any).streakDays : 4;
      const dbChecked = !!(user as any).checkedInToday;
      setStreakDays(dbStreak);
      setHasCheckedIn(dbChecked);
      
      // Seed mockup checkin days status based on streak length to look realistic
      const mockChecked = [false, false, false, false, false, false, false];
      const todayIdx = (new Date().getDay() + 6) % 7; // Convert 0-6 (Sun-Sat) to 0-6 (Mon-Sun)
      for (let i = 0; i < 7; i++) {
        if (i < todayIdx) {
          mockChecked[i] = true; // previous days this week checked
        } else if (i === todayIdx) {
          mockChecked[i] = dbChecked;
        }
      }
      setCheckedDays(mockChecked);
    }
  }, [user]);

  if (!isOpen) return null;

  const handleCheckIn = async () => {
    if (hasCheckedIn || checkingIn || !token) return;
    setCheckingIn(true);
    try {
      // Trigger API checkin
      const data = await apiRequest('/api/users/checkin', 'POST', {}, token);
      if (data.user) {
        // Update user state in store
        await updateProfile(data.user);
        setStreakDays(data.user.streakDays);
        setHasCheckedIn(true);
      }
    } catch (err) {
      console.error('Checkin server failure, running dynamic local fallback', err);
      // Fallback
      const nextStreak = streakDays + 1;
      setStreakDays(nextStreak);
      setHasCheckedIn(true);
      if (user) {
        updateProfile({ ...user, streakDays: nextStreak, checkedInToday: true } as any);
      }
    } finally {
      setCheckingIn(false);
    }
  };

  // Mocked creators for leaderboard populated with relevant consistency stats
  const weeklyLeaders = [
    { rank: 1, name: 'Elena Rostova', username: 'elena', streak: '12 Days 🔥', score: '1,420 pts', badge: '🏆 3D Shape Master', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAAzNNc6Mtkq0KB0UiL3X6Ad2o_1GDIMgTd9kpVBIoeqAr7T3yD-fyePEqivTbAkMXSf40fQHmEV7Lh-qxVP1vmpMTosn8jyqM0Vzb8CSmTHishJ2cWRPmbZTZe_GDABoomql7VPK0coiRkdsalLBJmOHSiqxJQEXlA3l2c-QeDO1h_TPZ8_EPLWpntLUOV1lSHSo9EtAqs10qy4ih8uBrKAr4IX1Of9Zzi2ZKOKaBmnv6clPKVVQ0CBnH1HMuGY7hwW13ZZUmViRcQ' },
    { rank: 2, name: 'Marcus Chen', username: 'marcus', streak: '8 Days 🔥', score: '1,280 pts', badge: '⚡ UI Interface Legend', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAYlXBBf4JngeMaXv1n4oI532-0zjnkkUW5cz_7WyCewALzX0NGnrL8RalXOHUz_lKYU5Loll_h0jVoqCzIT_bUZzWKESpkLzXxHyr50sUrPl00S79ltQt0NCPD8Jyg8T0eIjvjBJsJP8CIOmFyumqBnmKSC8JYnNMo6sofSAfY2PGXpjpE2UqWtMWmpiOyc05xoXQXdhOAs7cicE9E3yHvCEHRcXX3VylhiWucDDVn3qFbPeBkGoGa-VJ0kFr-BbBslyOyMpYx9CI7' },
    { rank: 3, name: 'Sarah Jenkins', username: 'sarah', streak: '5 Days 🔥', score: '990 pts', badge: '🎨 Branding Craft', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDybg0lIcvzqz36sEInhWj-rbtBla5_9-lmBMvgiCIkbQmmhFOjhs4cFGB5Syxu-VyY57hHrawKTBc4zPqWHaESEEvhi8AHYUsf-rZXSFa83z65gvOo_RUJN4EfLk8sDYl09iPDxn6menx_tdn2DJBLLgMkYuuJ4KZXWI2jzP6QIs5FlXs4nspYxGITvRiUvaV7lmFVxygN2utR_DpskAOKmcIuGIyrPRFe5zOn-QWSy0lvvfB2Ul3espMjvAPxJmi7WLdR2pItnpDq' }
  ];

  const monthlyLeaders = [
    { rank: 1, name: 'Marcus Chen', username: 'marcus', streak: '8 Days 🔥', score: '5,800 pts', badge: '👑 Monthly King', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAYlXBBf4JngeMaXv1n4oI532-0zjnkkUW5cz_7WyCewALzX0NGnrL8RalXOHUz_lKYU5Loll_h0jVoqCzIT_bUZzWKESpkLzXxHyr50sUrPl00S79ltQt0NCPD8Jyg8T0eIjvjBJsJP8CIOmFyumqBnmKSC8JYnNMo6sofSAfY2PGXpjpE2UqWtMWmpiOyc05xoXQXdhOAs7cicE9E3yHvCEHRcXX3VylhiWucDDVn3qFbPeBkGoGa-VJ0kFr-BbBslyOyMpYx9CI7' },
    { rank: 2, name: 'Elena Rostova', username: 'elena', streak: '12 Days 🔥', score: '5,100 pts', badge: '🔮 Abstract Architect', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAAzNNc6Mtkq0KB0UiL3X6Ad2o_1GDIMgTd9kpVBIoeqAr7T3yD-fyePEqivTbAkMXSf40fQHmEV7Lh-qxVP1vmpMTosn8jyqM0Vzb8CSmTHishJ2cWRPmbZTZe_GDABoomql7VPK0coiRkdsalLBJmOHSiqxJQEXlA3l2c-QeDO1h_TPZ8_EPLWpntLUOV1lSHSo9EtAqs10qy4ih8uBrKAr4IX1Of9Zzi2ZKOKaBmnv6clPKVVQ0CBnH1HMuGY7hwW13ZZUmViRcQ' },
    { rank: 3, name: 'David Lee', username: 'david', streak: '3 Days 🔥', score: '4,450 pts', badge: '🌌 Cyber Illustrator', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDdJKEbyqGUBE2hxlWz1gpRD5tcEioJ597ICSsuQr3f8kL822zxUwjjFY11a31MEaPhDSF2QMvnGrodTy5QS680BBVrh-D2r2ZZ5pnb4_Gxddk7e1JPgGADgOThnnYDVbW2jZyHoUE5hSjUDXNz9v9l5LU205diICSF2_fIDAFyrP9yR0OpHnrvBXxgOFNWShBCwxA_cTRTY9WBnQcGODdnU_pAtTwZsG6RNaoweP4pcR6oTGs1VqiNHC4utIXd_AgpYJtSoP64DeJg' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop background blur overlay */}
      <div className="absolute inset-0 bg-gray-950/40 backdrop-blur-[4px]" onClick={onClose} />

      {/* Main Drawer side-sheet */}
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col z-10 border-l border-red-500/10">
        
        {/* Header toolbar banner */}
        <div className="px-5 py-4 border-b border-red-50 flex justify-between items-center h-16 bg-red-50/20 flex-shrink-0">
          <div className="flex items-center gap-1.5 text-gray-900">
            <Flame className="w-5 h-5 text-red-650 text-red-600 fill-current" />
            <h3 className="font-display font-black text-sm uppercase tracking-wide">Creator Consistency</h3>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-red-50 rounded-full text-gray-400 hover:text-gray-700 transition-all">
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* Content body layout container */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          
          {/* Main Streak Tracker Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-red-50/70 via-rose-50/20 to-white border border-red-500/10 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-1 text-[10px] uppercase font-bold text-red-600 tracking-widest leading-none">
                <Sparkles className="w-3.5 h-3.5 animate-spin" />
                Live Creator Target
              </span>
              <span className="text-[9px] uppercase font-bold text-white bg-red-600 px-2.5 py-0.5 rounded-full shadow-sm animate-pulse">Hot</span>
            </div>

            <div className="flex items-baseline gap-2">
              <h4 className="text-4xl font-black tracking-tight text-gray-950">{streakDays} Days</h4>
              <p className="text-xs text-gray-400 font-semibold font-sans">current active streak 🔥</p>
            </div>

            {/* Micro checks and daily target indicator details */}
            <div className="space-y-2.5 pt-2">
              <div className="flex items-start gap-2.5 text-xs">
                <div className={`w-4 h-4 rounded-full flex items-center justify-center border mt-0.5 ${hasCheckedIn ? 'bg-red-600 border-red-600 text-white' : 'border-gray-200 bg-white'}`}>
                  {hasCheckedIn && <Check className="w-2.5 h-2.5 stroke-[4px]" />}
                </div>
                <div>
                  <p className={hasCheckedIn ? 'text-gray-400 line-through font-semibold' : 'text-gray-700 font-bold'}>
                    Check in with visual board activity
                  </p>
                  <p className="text-[10px] text-gray-400">Maintains your presence multiplier</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5 text-xs">
                <div className="w-4 h-4 rounded-full flex items-center justify-center border mt-0.5 border-gray-200 bg-white">
                  {/* Visual checklist default */}
                  <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
                </div>
                <div>
                  <p className="text-gray-700 font-medium">Publish a new visual board design or model</p>
                  <p className="text-[10px] text-gray-400">Guarantees high visibility in curation algorithm</p>
                </div>
              </div>
            </div>

            {/* Mon-Sun tracker progress dots */}
            <div className="pt-2">
              <div className="grid grid-cols-7 gap-1.5 text-center bg-white/60 p-2.5 rounded-xl border border-red-500/5">
                {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, ix) => {
                  const todayIdx = (new Date().getDay() + 6) % 7;
                  const isChecked = checkedDays[ix];
                  const isToday = ix === todayIdx;

                  return (
                    <div key={`${day}-${ix}`} className="space-y-1">
                      <button
                        disabled={!isToday || hasCheckedIn}
                        onClick={isToday && !hasCheckedIn ? handleCheckIn : undefined}
                        className={`w-7 h-7 mx-auto rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                          isChecked
                            ? 'bg-red-600 text-white shadow-sm shadow-red-500/10'
                            : isToday
                            ? 'bg-red-50 border border-red-500/20 text-red-600 animate-pulse font-black'
                            : 'bg-gray-100/70 text-gray-400'
                        }`}
                      >
                        {isChecked ? '✓' : day}
                      </button>
                      <span className="text-[9px] font-semibold text-gray-400 uppercase">{day}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Large trigger button */}
            <button
              onClick={handleCheckIn}
              disabled={hasCheckedIn || checkingIn}
              className={`w-full py-2.5 rounded-xl font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-1.5 ${
                hasCheckedIn
                  ? 'bg-gray-100 text-gray-400 border border-gray-150 cursor-default shadow-none'
                  : 'bg-red-600 hover:bg-rose-700 text-white hover:scale-[1.01] active:scale-[0.99]'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              {hasCheckedIn ? 'Checked-in Today! Streak Secured' : checkingIn ? 'Synchronizing checkin...' : 'Check-in Today’s Target'}
            </button>
          </div>

          {/* Creativa Leaderboard Card section block */}
          <div className="space-y-3.5">
            <div className="flex justify-between items-center bg-gray-50/70 py-1.5 px-3 rounded-xl border border-gray-150/40">
              <span className="flex items-center gap-1.5 text-xs font-bold text-gray-850">
                <Trophy className="w-4 h-4 text-orange-500" />
                Creator Leaderboard
              </span>
              <div className="flex bg-gray-200/60 p-0.5 rounded-lg border border-gray-200 flex-shrink-0">
                <button
                  onClick={() => setLeaderboardTab('weekly')}
                  className={`px-2.5 py-0.5 rounded-md text-[9px] font-bold tracking-tight transition-all ${leaderboardTab === 'weekly' ? 'bg-white text-gray-950 shadow-sm border border-gray-200/50' : 'text-gray-500 hover:text-gray-900'}`}
                >
                  Weekly
                </button>
                <button
                  onClick={() => setLeaderboardTab('monthly')}
                  className={`px-2.5 py-0.5 rounded-md text-[9px] font-bold tracking-tight transition-all ${leaderboardTab === 'monthly' ? 'bg-white text-gray-950 shadow-sm border border-gray-200/50' : 'text-gray-500 hover:text-gray-900'}`}
                >
                  Monthly
                </button>
              </div>
            </div>

            {/* List and rankings mapping */}
            <div className="divide-y divide-gray-100 bg-white rounded-2xl border border-gray-150 p-2 shadow-sm space-y-1">
              {(leaderboardTab === 'weekly' ? weeklyLeaders : monthlyLeaders).map((leader, leaderIdx) => {
                const rankColor = leaderIdx === 0 ? 'text-yellow-500' : leaderIdx === 1 ? 'text-gray-400' : 'text-amber-600';
                return (
                  <div key={leader.username} className="flex items-center justify-between p-2 rounded-xl hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="flex items-center justify-center w-5 flex-shrink-0">
                        <span className={`text-[10px] font-black ${rankColor}`}>#{leader.rank}</span>
                      </div>

                      <Link to={`/profile/${leader.username}`} onClick={onClose} className="w-8 h-8 rounded-full overflow-hidden border border-gray-200 hover:scale-105 transition-transform flex-shrink-0 bg-[#f5f5f5]">
                        <img src={leader.avatar} alt="Leader profile" className="w-full h-full object-cover" />
                      </Link>

                      <div className="min-w-0">
                        <Link to={`/profile/${leader.username}`} onClick={onClose} className="text-xs font-bold text-gray-900 hover:underline block truncate hover:text-red-600">
                          {leader.name}
                        </Link>
                        <span className="text-[8px] uppercase tracking-wider font-extrabold text-red-500/80 block">{leader.badge}</span>
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0 pl-2">
                      <span className="text-xs font-black text-gray-950 block">{leader.score}</span>
                      <span className="text-[9px] text-gray-400 font-medium">{leader.streak} active</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Value guidelines / visual note */}
          <div className="p-4 rounded-xl bg-orange-50/45 border border-orange-100 flex gap-2 text-[10px] text-amber-800 leading-normal">
            <span className="text-sm">🏆</span>
            <p>
              <strong>Consistency Multiplier</strong>: Keeping a streak active boosts your position by up to 25% in the Discovery Feed curation engine. Gain weekly merit tokens dynamically!
            </p>
          </div>

        </div>

        {/* Footer controls space */}
        <div className="p-4 border-t border-gray-100 bg-gray-50/70 text-center flex-shrink-0">
          <Link to="/network" onClick={onClose} className="text-[10px] font-extrabold uppercase tracking-widest text-[#dc2626] hover:underline flex items-center justify-center gap-1.5 py-1">
            Browse All Creative Collaborators
            <ChevronRight className="w-4 h-4 cursor-pointer" />
          </Link>
        </div>

      </div>
    </div>
  );
}
