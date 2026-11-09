import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/jwt';
import db from '@/lib/db';

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    // 1. Fetch Exercises Library
    let exercisesQuery = 'SELECT * FROM exercises';
    let exercisesParams: any[] = [];
    if (category && category !== 'all') {
      exercisesQuery += ' WHERE category = ?';
      exercisesParams.push(category);
    }
    exercisesQuery += ' ORDER BY name ASC';
    const exercises = db.prepare(exercisesQuery).all(...exercisesParams) as any[];

    // Parse JSON fields in exercises
    const formattedExercises = exercises.map(ex => ({
      ...ex,
      instructions: ex.instructions ? JSON.parse(ex.instructions) : [],
      target_muscles: ex.target_muscles ? JSON.parse(ex.target_muscles) : []
    }));

    // 2. Fetch User Routines
    const routines = db.prepare(`
      SELECT * FROM workout_routines
      WHERE user_id = ? OR is_template = 1
      ORDER BY created_at DESC
    `).all(user.id) as any[];

    const formattedRoutines = routines.map(r => ({
      ...r,
      exercises: r.exercises_json ? JSON.parse(r.exercises_json) : []
    }));

    // 3. Fetch Workout History
    const history = db.prepare(`
      SELECT * FROM workout_logs
      WHERE user_id = ?
      ORDER BY started_at DESC
      LIMIT 20
    `).all(user.id) as any[];

    const formattedHistory = history.map(h => ({
      ...h,
      exercises: h.exercises_log_json ? JSON.parse(h.exercises_log_json) : []
    }));

    // 4. Fetch Personal Records
    const prs = db.prepare(`
      SELECT * FROM personal_records
      WHERE user_id = ?
      ORDER BY achieved_at DESC
    `).all(user.id) as any[];

    return NextResponse.json({
      exercises: formattedExercises,
      routines: formattedRoutines,
      history: formattedHistory,
      personalRecords: prs
    });
  } catch (error: any) {
    console.error('Workouts GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch workout data' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action = 'log_workout' } = body;

    if (action === 'create_routine') {
      const { title, description, category, durationMin = 45, exercises } = body;
      if (!title || !exercises || !exercises.length) {
        return NextResponse.json({ error: 'Title and exercises are required' }, { status: 400 });
      }

      const routineId = `routine-${Date.now()}`;
      db.prepare(`
        INSERT INTO workout_routines (id, user_id, title, description, category, estimated_duration_min, exercises_json, is_template)
        VALUES (?, ?, ?, ?, ?, ?, ?, 0)
      `).run(routineId, user.id, title, description || '', category || 'Custom', durationMin, JSON.stringify(exercises));

      return NextResponse.json({ success: true, routineId, message: 'Custom workout routine saved!' });
    }

    // Default: Log completed workout
    const {
      title,
      routineId,
      startedAt,
      completedAt,
      durationSeconds = 2700,
      caloriesBurned = 400,
      totalVolumeKg = 5000,
      notes = '',
      rating = 5,
      exercisesLog = []
    } = body;

    const logId = `log-${Date.now()}`;
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO workout_logs (
        id, user_id, routine_id, title, started_at, completed_at,
        duration_seconds, calories_burned, total_volume_kg, notes, rating, exercises_log_json, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      logId,
      user.id,
      routineId || null,
      title || 'Workout Session',
      startedAt || now,
      completedAt || now,
      durationSeconds,
      caloriesBurned,
      totalVolumeKg,
      notes,
      rating,
      JSON.stringify(exercisesLog),
      now
    );

    // Update streak and points in gamification
    const today = new Date().toISOString().split('T')[0];
    const gamification = db.prepare('SELECT * FROM gamification WHERE user_id = ?').get(user.id) as any;

    if (gamification) {
      const isNewDay = gamification.last_active_date !== today;
      const newStreak = isNewDay ? gamification.current_streak + 1 : gamification.current_streak;
      const longestStreak = Math.max(newStreak, gamification.longest_streak);
      const addedPoints = 100;
      const newPoints = gamification.total_points + addedPoints;
      const newLevel = Math.floor(newPoints / 500) + 1;

      db.prepare(`
        UPDATE gamification
        SET current_streak = ?, longest_streak = ?, last_active_date = ?, total_points = ?, current_level = ?
        WHERE user_id = ?
      `).run(newStreak, longestStreak, today, newPoints, newLevel, user.id);
    }

    // Also update today's daily_activity_logs with calories burned & active minutes
    const activeMins = Math.round(durationSeconds / 60);
    const activityToday = db.prepare('SELECT * FROM daily_activity_logs WHERE user_id = ? AND date = ?').get(user.id, today) as any;
    if (activityToday) {
      db.prepare(`
        UPDATE daily_activity_logs
        SET calories_burned = calories_burned + ?, active_minutes = active_minutes + ?
        WHERE user_id = ? AND date = ?
      `).run(caloriesBurned, activeMins, user.id, today);
    } else {
      db.prepare(`
        INSERT INTO daily_activity_logs (id, user_id, date, calories_burned, active_minutes, source)
        VALUES (?, ?, ?, ?, ?, 'manual')
      `).run(`act-${Date.now()}`, user.id, today, caloriesBurned, activeMins);
    }

    // Add in-app notification
    db.prepare(`
      INSERT INTO notifications (id, user_id, title, message, type, action_url)
      VALUES (?, ?, ?, ?, 'workout', '/workouts')
    `).run(`notif-${Date.now()}`, user.id, 'Workout Logged!', `Crushed "${title}" — ${caloriesBurned} kcal burned, volume: ${totalVolumeKg}kg.`);

    return NextResponse.json({
      success: true,
      logId,
      message: 'Workout session logged and gamification points awarded!'
    });
  } catch (error: any) {
    console.error('Workouts POST error:', error);
    return NextResponse.json({ error: 'Failed to record workout' }, { status: 500 });
  }
}
