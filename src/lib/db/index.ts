import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

// Ensure data directory exists
const dbDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, 'apexfit.db');
const db = new Database(dbPath);

// Enable WAL mode for high concurrency & performance
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

export function initDatabase() {
  // Create tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      avatar TEXT,
      role TEXT DEFAULT 'USER', -- 'USER', 'TRAINER', 'ADMIN'
      subscription_tier TEXT DEFAULT 'FREE', -- 'FREE', 'PRO', 'ELITE', 'TRAINER'
      subscription_status TEXT DEFAULT 'ACTIVE', -- 'ACTIVE', 'TRIALING', 'CANCELLED', 'EXPIRED'
      subscription_period TEXT DEFAULT 'MONTHLY',
      stripe_customer_id TEXT,
      onboarding_completed INTEGER DEFAULT 0,
      trainer_id TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS user_profiles (
      user_id TEXT PRIMARY KEY,
      age INTEGER,
      gender TEXT,
      height_cm REAL,
      current_weight_kg REAL,
      target_weight_kg REAL,
      target_date TEXT,
      fitness_goal TEXT DEFAULT 'weight_loss', -- 'weight_loss', 'muscle_gain', 'endurance', 'maintenance'
      experience_level TEXT DEFAULT 'intermediate', -- 'beginner', 'intermediate', 'advanced'
      activity_level TEXT DEFAULT 'moderately_active', -- 'sedentary', 'lightly_active', 'moderately_active', 'very_active'
      workout_location TEXT DEFAULT 'gym', -- 'gym', 'home', 'hybrid'
      equipment TEXT, -- JSON string array
      preferred_days_per_week INTEGER DEFAULT 4,
      daily_calorie_target INTEGER DEFAULT 2200,
      daily_protein_target INTEGER DEFAULT 160,
      daily_carbs_target INTEGER DEFAULT 220,
      daily_fat_target INTEGER DEFAULT 65,
      daily_water_target_ml INTEGER DEFAULT 3000,
      daily_steps_target INTEGER DEFAULT 10000,
      dietary_preference TEXT DEFAULT 'omnivore',
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS exercises (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      category TEXT NOT NULL, -- 'chest', 'back', 'legs', 'shoulders', 'arms', 'core', 'cardio', 'hiit', 'yoga'
      equipment_required TEXT DEFAULT 'None',
      difficulty TEXT DEFAULT 'intermediate',
      description TEXT,
      instructions TEXT, -- JSON array
      tips TEXT,
      target_muscles TEXT, -- JSON array
      image_url TEXT,
      is_custom INTEGER DEFAULT 0,
      created_by TEXT
    );

    CREATE TABLE IF NOT EXISTS workout_routines (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      category TEXT,
      estimated_duration_min INTEGER DEFAULT 45,
      exercises_json TEXT NOT NULL, -- JSON array of exercises with sets, reps, weight
      is_template INTEGER DEFAULT 0,
      assigned_by_trainer_id TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS workout_logs (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      routine_id TEXT,
      title TEXT NOT NULL,
      started_at TEXT,
      completed_at TEXT,
      duration_seconds INTEGER DEFAULT 0,
      calories_burned INTEGER DEFAULT 0,
      total_volume_kg REAL DEFAULT 0,
      notes TEXT,
      rating INTEGER DEFAULT 5,
      exercises_log_json TEXT NOT NULL, -- JSON detailed sets with weight, reps, completed
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS personal_records (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      exercise_name TEXT NOT NULL,
      record_type TEXT NOT NULL, -- 'WEIGHT', 'REPS', 'TIME', 'DISTANCE'
      value REAL NOT NULL,
      unit TEXT NOT NULL,
      achieved_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS foods (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      brand TEXT,
      serving_size TEXT NOT NULL,
      calories REAL NOT NULL,
      protein REAL NOT NULL,
      carbs REAL NOT NULL,
      fat REAL NOT NULL,
      fiber REAL DEFAULT 0,
      category TEXT DEFAULT 'general',
      is_verified INTEGER DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS meal_logs (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      date TEXT NOT NULL, -- YYYY-MM-DD
      meal_type TEXT NOT NULL, -- 'breakfast', 'lunch', 'dinner', 'snack'
      food_name TEXT NOT NULL,
      servings REAL DEFAULT 1.0,
      calories REAL NOT NULL,
      protein REAL NOT NULL,
      carbs REAL NOT NULL,
      fat REAL NOT NULL,
      fiber REAL DEFAULT 0,
      logged_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS daily_activity_logs (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      date TEXT NOT NULL, -- YYYY-MM-DD
      steps INTEGER DEFAULT 0,
      distance_km REAL DEFAULT 0,
      calories_burned INTEGER DEFAULT 0,
      active_minutes INTEGER DEFAULT 0,
      water_intake_ml INTEGER DEFAULT 0,
      sleep_duration_hours REAL DEFAULT 7.5,
      sleep_quality_score INTEGER DEFAULT 80,
      recovery_score INTEGER DEFAULT 85,
      source TEXT DEFAULT 'manual', -- 'manual', 'apple_health', 'fitbit', 'whoop', 'google_health'
      synced_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(user_id, date)
    );

    CREATE TABLE IF NOT EXISTS body_measurements (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      date TEXT NOT NULL, -- YYYY-MM-DD
      weight_kg REAL NOT NULL,
      body_fat_pct REAL,
      waist_cm REAL,
      chest_cm REAL,
      arms_cm REAL,
      hips_cm REAL,
      thighs_cm REAL,
      photo_front TEXT,
      photo_side TEXT,
      notes TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS gamification (
      user_id TEXT PRIMARY KEY,
      current_streak INTEGER DEFAULT 1,
      longest_streak INTEGER DEFAULT 1,
      last_active_date TEXT DEFAULT (date('now')),
      total_points INTEGER DEFAULT 100,
      current_level INTEGER DEFAULT 1,
      unlocked_badges_json TEXT DEFAULT '[]', -- JSON array of badge IDs
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS challenges (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      category TEXT NOT NULL, -- 'steps', 'workouts', 'water', 'calories'
      target_value INTEGER NOT NULL,
      unit TEXT NOT NULL,
      duration_days INTEGER DEFAULT 7,
      badge_reward TEXT NOT NULL,
      xp_reward INTEGER DEFAULT 500,
      participants_count INTEGER DEFAULT 120
    );

    CREATE TABLE IF NOT EXISTS user_challenges (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      challenge_id TEXT NOT NULL,
      progress_value REAL DEFAULT 0,
      completed INTEGER DEFAULT 0,
      joined_at TEXT DEFAULT (datetime('now')),
      completed_at TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (challenge_id) REFERENCES challenges(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS trainer_clients (
      id TEXT PRIMARY KEY,
      trainer_id TEXT NOT NULL,
      client_id TEXT NOT NULL,
      status TEXT DEFAULT 'active', -- 'active', 'pending', 'archived'
      notes TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (trainer_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (client_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(trainer_id, client_id)
    );

    CREATE TABLE IF NOT EXISTS trainer_messages (
      id TEXT PRIMARY KEY,
      sender_id TEXT NOT NULL,
      receiver_id TEXT NOT NULL,
      content TEXT NOT NULL,
      is_read INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS trainer_appointments (
      id TEXT PRIMARY KEY,
      trainer_id TEXT NOT NULL,
      client_id TEXT NOT NULL,
      title TEXT NOT NULL,
      date_time TEXT NOT NULL,
      duration_min INTEGER DEFAULT 45,
      status TEXT DEFAULT 'scheduled', -- 'scheduled', 'completed', 'cancelled'
      meeting_link TEXT,
      notes TEXT,
      FOREIGN KEY (trainer_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (client_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS ai_chat_messages (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      role TEXT NOT NULL, -- 'user', 'assistant', 'system'
      content TEXT NOT NULL,
      category TEXT DEFAULT 'general', -- 'general', 'workout_gen', 'nutrition_gen', 'form_check'
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS admin_settings (
      setting_key TEXT PRIMARY KEY,
      setting_value TEXT NOT NULL,
      description TEXT,
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS coupons (
      id TEXT PRIMARY KEY,
      code TEXT UNIQUE NOT NULL,
      discount_percent INTEGER NOT NULL,
      valid_until TEXT,
      max_uses INTEGER DEFAULT 100,
      times_used INTEGER DEFAULT 0,
      active INTEGER DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      type TEXT DEFAULT 'info', -- 'workout', 'nutrition', 'water', 'badge', 'trainer', 'system'
      is_read INTEGER DEFAULT 0,
      action_url TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- Indices for speed
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_meal_logs_user_date ON meal_logs(user_id, date);
    CREATE INDEX IF NOT EXISTS idx_activity_user_date ON daily_activity_logs(user_id, date);
    CREATE INDEX IF NOT EXISTS idx_workout_logs_user ON workout_logs(user_id);
    CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
  `);
}

// Auto-run schema initialization
initDatabase();

export default db;
