import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/jwt';
import db from '@/lib/db';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Role check: either user is TRAINER or ADMIN
    const isTrainer = user.role === 'TRAINER' || user.role === 'ADMIN';

    // 1. Fetch Clients
    const clientRows = db.prepare(`
      SELECT 
        tc.id as relation_id, tc.status as relation_status, tc.notes as trainer_notes,
        u.id as client_id, u.name, u.email, u.avatar, u.subscription_tier,
        p.age, p.current_weight_kg, p.target_weight_kg, p.fitness_goal, p.experience_level,
        g.current_streak, g.current_level
      FROM trainer_clients tc
      JOIN users u ON tc.client_id = u.id
      LEFT JOIN user_profiles p ON u.id = p.user_id
      LEFT JOIN gamification g ON u.id = g.user_id
      WHERE tc.trainer_id = ?
    `).all(user.id) as any[];

    // 2. Fetch Appointments
    const appointments = db.prepare(`
      SELECT a.*, u.name as client_name, u.avatar as client_avatar
      FROM trainer_appointments a
      JOIN users u ON a.client_id = u.id
      WHERE a.trainer_id = ?
      ORDER BY a.date_time ASC
    `).all(user.id) as any[];

    // 3. Routines available to assign
    const routines = db.prepare(`
      SELECT id, title, category, estimated_duration_min
      FROM workout_routines
      WHERE is_template = 1 OR user_id = ?
    `).all(user.id);

    return NextResponse.json({
      isTrainer,
      clients: clientRows,
      appointments,
      routines
    });
  } catch (error: any) {
    console.error('Trainer GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch trainer portal data' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action = 'create_appointment' } = body;

    if (action === 'assign_routine') {
      const { clientId, routineId } = body;
      if (!clientId || !routineId) {
        return NextResponse.json({ error: 'Client ID and Routine ID are required' }, { status: 400 });
      }

      const sourceRoutine = db.prepare('SELECT * FROM workout_routines WHERE id = ?').get(routineId) as any;
      if (!sourceRoutine) {
        return NextResponse.json({ error: 'Routine not found' }, { status: 404 });
      }

      const newId = `routine-${Date.now()}`;
      db.prepare(`
        INSERT INTO workout_routines (id, user_id, title, description, category, estimated_duration_min, exercises_json, is_template, assigned_by_trainer_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?)
      `).run(newId, clientId, sourceRoutine.title, sourceRoutine.description, sourceRoutine.category, sourceRoutine.estimated_duration_min, sourceRoutine.exercises_json, user.id);

      // Notify client
      db.prepare(`
        INSERT INTO notifications (id, user_id, title, message, type, action_url)
        VALUES (?, ?, ?, ?, 'trainer', '/workouts')
      `).run(`notif-${Date.now()}`, clientId, 'New Workout Assigned!', `Coach assigned routine: "${sourceRoutine.title}". Review your training plan!`);

      return NextResponse.json({ success: true, message: `Routine assigned to client!` });
    }

    if (action === 'create_appointment') {
      const { clientId, title, dateTime, durationMin = 45, meetingLink, notes } = body;
      if (!clientId || !title || !dateTime) {
        return NextResponse.json({ error: 'Client, title, and date/time are required' }, { status: 400 });
      }

      const apptId = `appt-${Date.now()}`;
      db.prepare(`
        INSERT INTO trainer_appointments (id, trainer_id, client_id, title, date_time, duration_min, status, meeting_link, notes)
        VALUES (?, ?, ?, ?, ?, ?, 'scheduled', ?, ?)
      `).run(apptId, user.id, clientId, title, dateTime, durationMin, meetingLink || 'https://meet.google.com/apex-fit-coaching', notes || '');

      return NextResponse.json({ success: true, apptId, message: 'Coaching session booked!' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error('Trainer POST error:', error);
    return NextResponse.json({ error: 'Failed to complete trainer action' }, { status: 500 });
  }
}
