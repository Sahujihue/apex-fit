import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/jwt';
import db from '@/lib/db';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const gamification = db.prepare('SELECT * FROM gamification WHERE user_id = ?').get(user.id) as any;
    const unlockedBadges = gamification?.unlocked_badges_json ? JSON.parse(gamification.unlocked_badges_json) : [];

    // All Master Badges catalogue
    const allBadges = [
      { id: 'b-streak-7', name: 'Week on Fire', desc: 'Maintained 7 consecutive active workout days', icon: 'Flame', xp: 200, category: 'streaks' },
      { id: 'b-century', name: 'Century Club', desc: 'Crushed 100 total logged workouts', icon: 'Award', xp: 500, category: 'milestones' },
      { id: 'b-pr-crusher', name: 'Iron Will', desc: 'Broke 5 distinct Personal Records', icon: 'Trophy', xp: 350, category: 'strength' },
      { id: 'b-hydration', name: 'Hydro Master', desc: 'Drank 3,000ml+ water for 10 consecutive days', icon: 'Droplets', xp: 150, category: 'habits' },
      { id: 'b-early-bird', name: 'Dawn Warrior', desc: 'Completed a workout before 7:00 AM', icon: 'Sunrise', xp: 100, category: 'habits' },
      { id: 'b-step-titan', name: 'Step Titan', desc: 'Hit 20,000 steps in a single calendar day', icon: 'Footprints', xp: 300, category: 'endurance' },
      { id: 'b-macro-sniper', name: 'Macro Sniper', desc: 'Hit all protein, carb and fat targets within 5%', icon: 'Target', xp: 250, category: 'nutrition' },
      { id: 'b-hiit-survivor', name: 'Metabolic Beast', desc: 'Completed 10 brutal HIIT sessions', icon: 'Zap', xp: 350, category: 'endurance' }
    ];

    const badgesWithStatus = allBadges.map(b => {
      const unlocked = unlockedBadges.find((ub: any) => ub.id === b.id);
      return {
        ...b,
        unlocked: Boolean(unlocked),
        unlockedAt: unlocked?.unlocked_at || null
      };
    });

    // Challenges
    const challenges = db.prepare('SELECT * FROM challenges').all() as any[];
    const userChallenges = db.prepare('SELECT * FROM user_challenges WHERE user_id = ?').all(user.id) as any[];

    const challengesFormatted = challenges.map(ch => {
      const uc = userChallenges.find(u => u.challenge_id === ch.id);
      const progress = uc ? uc.progress_value : 0;
      const pct = Math.min(Math.round((progress / ch.target_value) * 100), 100);
      return {
        ...ch,
        isJoined: Boolean(uc),
        progress,
        pct,
        completed: uc ? Boolean(uc.completed) : false
      };
    });

    // Leaderboard
    const leaderboard = [
      { rank: 1, name: 'Elena Rostova', points: 5420, level: 10, streak: 34, avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100' },
      { rank: 2, name: 'Marcus Sterling', points: 4890, level: 9, streak: 26, avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100' },
      { rank: 3, name: user.name || 'Alex Rivera (You)', points: gamification?.total_points || 3850, level: gamification?.current_level || 7, streak: gamification?.current_streak || 14, avatar: user.avatar, isCurrentUser: true },
      { rank: 4, name: 'David Kim', points: 3410, level: 6, streak: 12, avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100' },
      { rank: 5, name: 'Sarah Jenkins', points: 2950, level: 5, streak: 9, avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100' }
    ];

    return NextResponse.json({
      streak: gamification?.current_streak || 1,
      longestStreak: gamification?.longest_streak || 1,
      points: gamification?.total_points || 100,
      level: gamification?.current_level || 1,
      badges: badgesWithStatus,
      challenges: challengesFormatted,
      leaderboard
    });
  } catch (error: any) {
    console.error('Gamification GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch gamification data' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { challengeId } = await request.json();
    if (!challengeId) {
      return NextResponse.json({ error: 'Challenge ID is required' }, { status: 400 });
    }

    const existing = db.prepare('SELECT id FROM user_challenges WHERE user_id = ? AND challenge_id = ?').get(user.id, challengeId);
    if (existing) {
      return NextResponse.json({ message: 'Already joined this challenge' });
    }

    db.prepare(`
      INSERT INTO user_challenges (id, user_id, challenge_id, progress_value, completed, joined_at)
      VALUES (?, ?, ?, 0, 0, datetime('now'))
    `).run(`uc-${Date.now()}`, user.id, challengeId);

    // Increase participants count
    db.prepare('UPDATE challenges SET participants_count = participants_count + 1 WHERE id = ?').run(challengeId);

    return NextResponse.json({ success: true, message: 'Joined challenge! Go crush your goal.' });
  } catch (error: any) {
    console.error('Gamification POST error:', error);
    return NextResponse.json({ error: 'Failed to join challenge' }, { status: 500 });
  }
}
