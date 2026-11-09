const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');

const dbDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, 'apexfit.db');
const db = new Database(dbPath);

console.log('Seeding ApexFit database at:', dbPath);

// Ensure tables exist
const initDbModule = `
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT NOT NULL,
    avatar TEXT,
    role TEXT DEFAULT 'USER',
    subscription_tier TEXT DEFAULT 'FREE',
    subscription_status TEXT DEFAULT 'ACTIVE',
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
    fitness_goal TEXT DEFAULT 'weight_loss',
    experience_level TEXT DEFAULT 'intermediate',
    activity_level TEXT DEFAULT 'moderately_active',
    workout_location TEXT DEFAULT 'gym',
    equipment TEXT,
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
    category TEXT NOT NULL,
    equipment_required TEXT DEFAULT 'None',
    difficulty TEXT DEFAULT 'intermediate',
    description TEXT,
    instructions TEXT,
    tips TEXT,
    target_muscles TEXT,
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
    exercises_json TEXT NOT NULL,
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
    exercises_log_json TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS personal_records (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    exercise_name TEXT NOT NULL,
    record_type TEXT NOT NULL,
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
    date TEXT NOT NULL,
    meal_type TEXT NOT NULL,
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
    date TEXT NOT NULL,
    steps INTEGER DEFAULT 0,
    distance_km REAL DEFAULT 0,
    calories_burned INTEGER DEFAULT 0,
    active_minutes INTEGER DEFAULT 0,
    water_intake_ml INTEGER DEFAULT 0,
    sleep_duration_hours REAL DEFAULT 7.5,
    sleep_quality_score INTEGER DEFAULT 80,
    recovery_score INTEGER DEFAULT 85,
    source TEXT DEFAULT 'manual',
    synced_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(user_id, date)
  );

  CREATE TABLE IF NOT EXISTS body_measurements (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    date TEXT NOT NULL,
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
    unlocked_badges_json TEXT DEFAULT '[]',
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS challenges (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
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
    status TEXT DEFAULT 'active',
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
    status TEXT DEFAULT 'scheduled',
    meeting_link TEXT,
    notes TEXT,
    FOREIGN KEY (trainer_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (client_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS ai_chat_messages (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    role TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT DEFAULT 'general',
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
    type TEXT DEFAULT 'info',
    is_read INTEGER DEFAULT 0,
    action_url TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );
`;
db.exec(initDbModule);

// Clear existing sample tables
db.exec(`
  DELETE FROM users;
  DELETE FROM user_profiles;
  DELETE FROM exercises;
  DELETE FROM workout_routines;
  DELETE FROM workout_logs;
  DELETE FROM personal_records;
  DELETE FROM foods;
  DELETE FROM meal_logs;
  DELETE FROM daily_activity_logs;
  DELETE FROM body_measurements;
  DELETE FROM gamification;
  DELETE FROM challenges;
  DELETE FROM user_challenges;
  DELETE FROM trainer_clients;
  DELETE FROM trainer_messages;
  DELETE FROM trainer_appointments;
  DELETE FROM ai_chat_messages;
  DELETE FROM admin_settings;
  DELETE FROM coupons;
  DELETE FROM notifications;
`);

const passwordHash = bcrypt.hashSync('apexfit123', 10);
const adminHash = bcrypt.hashSync('admin123', 10);

// 1. Seed Users
const insertUser = db.prepare(`
  INSERT INTO users (id, email, password_hash, name, avatar, role, subscription_tier, subscription_status, subscription_period, onboarding_completed, trainer_id)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

insertUser.run('user-admin-1', 'admin@apexfit.com', adminHash, 'SaaS Admin', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', 'ADMIN', 'ELITE', 'ACTIVE', 'YEARLY', 1, null);
insertUser.run('user-trainer-1', 'trainer@apexfit.com', passwordHash, 'Coach Marcus Vance', 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=150', 'TRAINER', 'TRAINER', 'ACTIVE', 'MONTHLY', 1, null);
insertUser.run('user-athlete-1', 'user@apexfit.com', passwordHash, 'Alex Rivera', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', 'USER', 'PRO', 'ACTIVE', 'MONTHLY', 1, 'user-trainer-1');
insertUser.run('user-client-1', 'sarah@apexfit.com', passwordHash, 'Sarah Jenkins', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', 'USER', 'ELITE', 'ACTIVE', 'YEARLY', 1, 'user-trainer-1');

// 2. User Profiles
const insertProfile = db.prepare(`
  INSERT INTO user_profiles (user_id, age, gender, height_cm, current_weight_kg, target_weight_kg, target_date, fitness_goal, experience_level, activity_level, workout_location, equipment, preferred_days_per_week, daily_calorie_target, daily_protein_target, daily_carbs_target, daily_fat_target, daily_water_target_ml, daily_steps_target, dietary_preference)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

insertProfile.run(
  'user-athlete-1',
  28,
  'male',
  180,
  78.5,
  75.0,
  '2026-12-31',
  'muscle_gain',
  'intermediate',
  'very_active',
  'gym',
  JSON.stringify(['barbell', 'dumbbells', 'cables', 'bench', 'pullup_bar', 'squat_rack']),
  5,
  2450,
  180,
  250,
  70,
  3500,
  11000,
  'omnivore'
);

insertProfile.run(
  'user-client-1',
  26,
  'female',
  167,
  64.2,
  58.0,
  '2026-12-15',
  'weight_loss',
  'intermediate',
  'moderately_active',
  'hybrid',
  JSON.stringify(['dumbbells', 'kettlebell', 'resistance_bands', 'yoga_mat']),
  4,
  1850,
  135,
  175,
  50,
  3000,
  10000,
  'vegetarian'
);

// 3. Master Exercises Library
const insertExercise = db.prepare(`
  INSERT INTO exercises (id, name, category, equipment_required, difficulty, description, instructions, tips, target_muscles, image_url, is_custom, created_by)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const exercisesData = [
  {
    id: 'ex-1',
    name: 'Barbell Bench Press',
    category: 'chest',
    equipment_required: 'Barbell, Bench',
    difficulty: 'intermediate',
    description: 'The definitive upper body pushing movement for chest, tricep, and anterior deltoid hypertrophy.',
    instructions: JSON.stringify(['Lie back on flat bench and grip bar slightly wider than shoulder-width', 'Unrack bar, lock elbows, and inhale as you lower the bar with control to mid-chest', 'Press upward explosively through the palms while driving feet into floor', 'Lock out momentarily at the top without hyperextending shoulders']),
    tips: 'Retract your scapulae and keep your feet planted firmly on the floor.',
    target_muscles: JSON.stringify(['Pectoralis Major', 'Anterior Deltoids', 'Triceps Brachii']),
    image_url: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400'
  },
  {
    id: 'ex-2',
    name: 'Incline Dumbbell Press',
    category: 'chest',
    equipment_required: 'Dumbbells, Incline Bench',
    difficulty: 'intermediate',
    description: 'Isolates the clavicular head of the pectorals with greater range of motion.',
    instructions: JSON.stringify(['Set bench to 30-45 degree incline', 'Bring dumbbells to shoulder level with elbows angled at 45 degrees', 'Press bells vertically overhead until arms are extended', 'Lower under 3-second control to deep stretch']),
    tips: 'Avoid angling the bench too high (above 45 degrees) to prevent front delt takeover.',
    target_muscles: JSON.stringify(['Upper Chest', 'Triceps', 'Front Shoulders']),
    image_url: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=400'
  },
  {
    id: 'ex-3',
    name: 'Barbell Back Squat',
    category: 'legs',
    equipment_required: 'Barbell, Squat Rack',
    difficulty: 'advanced',
    description: 'The king of lower body compound exercises building quadriceps, glutes, hamstrings and core.',
    instructions: JSON.stringify(['Set bar across upper traps or rear delts', 'Stand with feet shoulder-width apart, toes turned out 15-30 degrees', 'Inhale into diaphragm, brace core, and break at hips and knees simultaneously', 'Descend until hip crease is below the top of the knee', 'Drive straight up through mid-foot to starting position']),
    tips: 'Keep chest high and brace your abdominal wall as if bracing for a punch.',
    target_muscles: JSON.stringify(['Quadriceps', 'Gluteus Maximus', 'Hamstrings', 'Erector Spinae']),
    image_url: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=400'
  },
  {
    id: 'ex-4',
    name: 'Romanian Deadlift (RDL)',
    category: 'legs',
    equipment_required: 'Barbell or Dumbbells',
    difficulty: 'intermediate',
    description: 'Elite posterior chain builder focusing on hamstring stretch and glute contraction.',
    instructions: JSON.stringify(['Stand holding weight with overhand grip, knees slightly soft', 'Hinge backward at hips while keeping spine neutral', 'Lower bar along shins until maximum hamstring stretch is achieved', 'Contract glutes and hamstrings to return upright']),
    tips: 'Do not squat down; push hips backward like closing a car door behind you.',
    target_muscles: JSON.stringify(['Hamstrings', 'Glutes', 'Lower Back']),
    image_url: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=400'
  },
  {
    id: 'ex-5',
    name: 'Barbell Bent-Over Row',
    category: 'back',
    equipment_required: 'Barbell',
    difficulty: 'intermediate',
    description: 'Mass builder for latissimus dorsi, rhomboids, rear delts, and middle trapezius.',
    instructions: JSON.stringify(['Hinge forward to approximately 45-60 degree torso angle', 'Grip bar shoulder-width with palms facing you or down', 'Pull bar smoothly into belly button using back muscles', 'Squeeze shoulder blades together, then lower under control']),
    tips: 'Pull with elbows rather than biceps to maximize back muscle engagement.',
    target_muscles: JSON.stringify(['Latissimus Dorsi', 'Rhomboids', 'Trapezius', 'Biceps']),
    image_url: 'https://images.unsplash.com/photo-1605296867304-46d5465a13f1?w=400'
  },
  {
    id: 'ex-6',
    name: 'Overhead Shoulder Press (OHP)',
    category: 'shoulders',
    equipment_required: 'Barbell',
    difficulty: 'intermediate',
    description: 'Classic vertical pressing movement for boulder shoulders and lock-out power.',
    instructions: JSON.stringify(['Stand tall with feet hip-width apart, bar resting on front deltoids', 'Brace core and glutes firmly', 'Press bar straight up, pulling head back slightly to clear bar path', 'Finish with bar directly above crown of head and shoulders shrugged']),
    tips: 'Keep glutes clenched tightly to prevent lower back hyperextension.',
    target_muscles: JSON.stringify(['Deltoids', 'Triceps', 'Upper Traps', 'Core']),
    image_url: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=400'
  },
  {
    id: 'ex-7',
    name: 'Dumbbell Lateral Raise',
    category: 'shoulders',
    equipment_required: 'Dumbbells',
    difficulty: 'beginner',
    description: 'The golden exercise for building capped lateral delts and wide shoulder aesthetics.',
    instructions: JSON.stringify(['Stand with slight forward lean holding light dumbbells at sides', 'Raise arms out to sides with slight bend in elbows', 'Lift until dumbbells are level with shoulders, leading with elbows', 'Lower slowly over 2-3 seconds']),
    tips: 'Pour the water: imagine pouring water from pitchers at top of movement.',
    target_muscles: JSON.stringify(['Lateral Deltoids']),
    image_url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400'
  },
  {
    id: 'ex-8',
    name: 'Incline Dumbbell Bicep Curl',
    category: 'arms',
    equipment_required: 'Dumbbells, Incline Bench',
    difficulty: 'beginner',
    description: 'Places the long head of the biceps under extreme stretch for peak development.',
    instructions: JSON.stringify(['Sit on 45-degree incline bench with arms hanging down behind torso', 'Keep upper arms perpendicular to floor', 'Curl dumbbells upward while supinating wrists (palms facing up)', 'Squeeze at top for 1 full second and lower smoothly']),
    tips: 'Do not swing your shoulders forward to assist the curl.',
    target_muscles: JSON.stringify(['Biceps Brachii (Long Head)', 'Brachialis']),
    image_url: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=400'
  },
  {
    id: 'ex-9',
    name: 'Tricep Cable Rope Pushdown',
    category: 'arms',
    equipment_required: 'Cable Machine, Rope',
    difficulty: 'beginner',
    description: 'Continuous tension triceps movement that emphasizes lateral and medial heads.',
    instructions: JSON.stringify(['Attach rope to high pulley, grip rope ends', 'Pin elbows to sides with slight hinge at waist', 'Push rope down, spreading ends apart at bottom for peak contraction', 'Return upward with control to 90 degrees']),
    tips: 'Keep your elbows glued to your ribcage.',
    target_muscles: JSON.stringify(['Triceps Brachii']),
    image_url: 'https://images.unsplash.com/photo-1584863265045-f9d10ca7fa61?w=400'
  },
  {
    id: 'ex-10',
    name: 'Hanging Leg Raise',
    category: 'core',
    equipment_required: 'Pull-up Bar',
    difficulty: 'advanced',
    description: 'Premier abdominal builder recruiting lower abs, rectus abdominis and obliques.',
    instructions: JSON.stringify(['Hang from pull-up bar with overhand grip and engaged shoulders', 'Curl pelvis upward and raise legs forward until parallel or touching bar', 'Pause at top, then lower under strict control without swinging']),
    tips: 'Initiate by posterior pelvic tilt, not just flexing hip flexors.',
    target_muscles: JSON.stringify(['Rectus Abdominis', 'Iliopsoas', 'Obliques']),
    image_url: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=400'
  },
  {
    id: 'ex-11',
    name: 'HIIT Assault Bike Intervals',
    category: 'hiit',
    equipment_required: 'Air Bike / Echo Bike',
    difficulty: 'advanced',
    description: 'Brutal maximum-effort metabolic conditioning that scorches calories and triggers EPOC.',
    instructions: JSON.stringify(['Warm up for 2 minutes at easy cadence', 'Sprint all-out for 20 seconds pushing arms and legs simultaneously at 90%+ effort', 'Pedal gently for 40 seconds active recovery', 'Repeat for 8-10 cycles']),
    tips: 'Maintain rhythmic breathing even when fatigue strikes.',
    target_muscles: JSON.stringify(['Full Body', 'Cardiovascular System']),
    image_url: 'https://images.unsplash.com/photo-1538805060514-97d9cc17730c?w=400'
  },
  {
    id: 'ex-12',
    name: 'Vinyasa Flow & Deep Hip Mobility',
    category: 'yoga',
    equipment_required: 'Yoga Mat',
    difficulty: 'beginner',
    description: 'Fluid movement sequence restoring joint mobility, decompressing spine, and speeding recovery.',
    instructions: JSON.stringify(['Transition from Downward Dog into Low Lunge', 'Open hips with 5 deep diaphragmatic breaths per side', 'Flow through Pigeon Pose for glute and piriformis decompression', 'Finish in Child Pose for parasympathetic nervous system reboot']),
    tips: 'Sync movement directly with inhalation and exhalation.',
    target_muscles: JSON.stringify(['Hip Flexors', 'Spine', 'Hamstrings', 'Glutes']),
    image_url: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400'
  }
];

exercisesData.forEach(ex => {
  insertExercise.run(ex.id, ex.name, ex.category, ex.equipment_required, ex.difficulty, ex.description, ex.instructions, ex.tips, ex.target_muscles, ex.image_url, 0, null);
});

// 4. Master Food Database
const insertFood = db.prepare(`
  INSERT INTO foods (id, name, brand, serving_size, calories, protein, carbs, fat, fiber, category, is_verified)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const foodsData = [
  { id: 'f-1', name: 'Chicken Breast (Cooked, Boneless)', brand: 'Whole Foods', serving_size: '100g', calories: 165, protein: 31.0, carbs: 0, fat: 3.6, fiber: 0, category: 'Poultry' },
  { id: 'f-2', name: 'Atlantic Salmon Fillet (Grilled)', brand: 'Fresh Seafood', serving_size: '150g', calories: 310, protein: 34.0, carbs: 0, fat: 18.0, fiber: 0, category: 'Fish' },
  { id: 'f-3', name: 'Eggs (Whole, Grade A)', brand: 'Organic Valley', serving_size: '2 large (100g)', calories: 144, protein: 12.6, carbs: 0.8, fat: 9.6, fiber: 0, category: 'Dairy & Eggs' },
  { id: 'f-4', name: 'Egg Whites (Liquid)', brand: 'Egg Beaters', serving_size: '100g', calories: 52, protein: 11.0, carbs: 0.7, fat: 0.2, fiber: 0, category: 'Dairy & Eggs' },
  { id: 'f-5', name: 'Whey Protein Isolate (Vanilla)', brand: 'Optimum Nutrition', serving_size: '1 scoop (30g)', calories: 120, protein: 24.0, carbs: 2.0, fat: 1.0, fiber: 0.5, category: 'Supplements' },
  { id: 'f-6', name: 'Greek Yogurt 0% Fat', brand: 'Fage Total', serving_size: '170g container', calories: 90, protein: 18.0, carbs: 5.0, fat: 0, fiber: 0, category: 'Dairy' },
  { id: 'f-7', name: 'Rolled Oats (Dry)', brand: 'Quaker', serving_size: '50g', calories: 190, protein: 7.0, carbs: 34.0, fat: 3.5, fiber: 5.0, category: 'Grains' },
  { id: 'f-8', name: 'Jasmine White Rice (Cooked)', brand: 'Mahatma', serving_size: '150g cup', calories: 195, protein: 4.2, carbs: 43.0, fat: 0.5, fiber: 0.6, category: 'Grains' },
  { id: 'f-9', name: 'Sweet Potato (Baked with skin)', brand: 'Organic', serving_size: '1 medium (130g)', calories: 112, protein: 2.0, carbs: 26.0, fat: 0.1, fiber: 3.9, category: 'Vegetables' },
  { id: 'f-10', name: 'Avocado (Hass)', brand: 'Fresh', serving_size: '1/2 medium (75g)', calories: 120, protein: 1.5, carbs: 6.5, fat: 11.0, fiber: 5.0, category: 'Fats & Oils' },
  { id: 'f-11', name: 'Peanut Butter (Natural)', brand: 'Smuckers', serving_size: '2 tbsp (32g)', calories: 190, protein: 8.0, carbs: 7.0, fat: 16.0, fiber: 2.5, category: 'Fats & Spreads' },
  { id: 'f-12', name: 'Extra Virgin Olive Oil', brand: 'California Olive Ranch', serving_size: '1 tbsp (14ml)', calories: 120, protein: 0, carbs: 0, fat: 14.0, fiber: 0, category: 'Fats & Oils' },
  { id: 'f-13', name: 'Banana', brand: 'Fresh', serving_size: '1 medium (118g)', calories: 105, protein: 1.3, carbs: 27.0, fat: 0.3, fiber: 3.1, category: 'Fruits' },
  { id: 'f-14', name: 'Blueberries (Fresh)', brand: 'Driscoll\'s', serving_size: '100g', calories: 57, protein: 0.7, carbs: 14.5, fat: 0.3, fiber: 2.4, category: 'Fruits' },
  { id: 'f-15', name: 'Broccoli (Steamed)', brand: 'Fresh', serving_size: '100g', calories: 35, protein: 2.4, carbs: 7.2, fat: 0.4, fiber: 2.6, category: 'Vegetables' },
  { id: 'f-16', name: 'Lean Ground Beef (93/7)', brand: 'Laura\'s Lean', serving_size: '112g (4 oz)', calories: 170, protein: 24.0, carbs: 0, fat: 8.0, fiber: 0, category: 'Meat' },
  { id: 'f-17', name: 'Almonds (Raw, Unsalted)', brand: 'Blue Diamond', serving_size: '28g (approx 23 nuts)', calories: 160, protein: 6.0, carbs: 6.0, fat: 14.0, fiber: 3.5, category: 'Nuts & Seeds' },
  { id: 'f-18', name: 'Protein Bar (Chocolate Peanut Butter)', brand: 'Barebells', serving_size: '1 bar (55g)', calories: 200, protein: 20.0, carbs: 16.0, fat: 7.0, fiber: 3.0, category: 'Snacks' }
];

foodsData.forEach(food => {
  insertFood.run(food.id, food.name, food.brand, food.serving_size, food.calories, food.protein, food.carbs, food.fat, food.fiber, food.category, 1);
});

// 5. Workout Routines
const insertRoutine = db.prepare(`
  INSERT INTO workout_routines (id, user_id, title, description, category, estimated_duration_min, exercises_json, is_template, assigned_by_trainer_id)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

insertRoutine.run(
  'routine-1',
  'user-athlete-1',
  'Hypertrophy Push Power',
  'Heavy chest, shoulder, and triceps focus calibrated for progressive overload.',
  'Chest & Push',
  55,
  JSON.stringify([
    { exercise_id: 'ex-1', name: 'Barbell Bench Press', sets: 4, reps: 8, target_weight_kg: 85, rest_seconds: 90 },
    { exercise_id: 'ex-2', name: 'Incline Dumbbell Press', sets: 3, reps: 10, target_weight_kg: 32, rest_seconds: 75 },
    { exercise_id: 'ex-6', name: 'Overhead Shoulder Press (OHP)', sets: 3, reps: 8, target_weight_kg: 50, rest_seconds: 90 },
    { exercise_id: 'ex-7', name: 'Dumbbell Lateral Raise', sets: 4, reps: 15, target_weight_kg: 12, rest_seconds: 60 },
    { exercise_id: 'ex-9', name: 'Tricep Cable Rope Pushdown', sets: 3, reps: 12, target_weight_kg: 25, rest_seconds: 60 }
  ]),
  1,
  null
);

insertRoutine.run(
  'routine-2',
  'user-athlete-1',
  'Posterior Chain & Back Dominance',
  'Thick lat, upper back, and hamstring development with barbell compound lifts.',
  'Back & Pull',
  50,
  JSON.stringify([
    { exercise_id: 'ex-5', name: 'Barbell Bent-Over Row', sets: 4, reps: 8, target_weight_kg: 75, rest_seconds: 90 },
    { exercise_id: 'ex-4', name: 'Romanian Deadlift (RDL)', sets: 4, reps: 10, target_weight_kg: 95, rest_seconds: 90 },
    { exercise_id: 'ex-8', name: 'Incline Dumbbell Bicep Curl', sets: 3, reps: 12, target_weight_kg: 16, rest_seconds: 60 },
    { exercise_id: 'ex-10', name: 'Hanging Leg Raise', sets: 3, reps: 15, target_weight_kg: 0, rest_seconds: 45 }
  ]),
  1,
  null
);

// 6. Workout Logs (Alex Rivera's recent workouts)
const insertWorkoutLog = db.prepare(`
  INSERT INTO workout_logs (id, user_id, routine_id, title, started_at, completed_at, duration_seconds, calories_burned, total_volume_kg, notes, rating, exercises_log_json, created_at)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

insertWorkoutLog.run(
  'log-1',
  'user-athlete-1',
  'routine-1',
  'Push Day - Progressive Overload Hit',
  '2026-11-08 09:30:00',
  '2026-11-08 10:22:00',
  3120,
  485,
  6420,
  'Hit an all-time personal best on the bench press 85kg x 8 reps! Triceps pumped.',
  5,
  JSON.stringify([
    {
      name: 'Barbell Bench Press',
      sets: [
        { setNumber: 1, reps: 10, weightKg: 70, completed: true },
        { setNumber: 2, reps: 8, weightKg: 80, completed: true },
        { setNumber: 3, reps: 8, weightKg: 85, completed: true },
        { setNumber: 4, reps: 7, weightKg: 85, completed: true }
      ]
    },
    {
      name: 'Incline Dumbbell Press',
      sets: [
        { setNumber: 1, reps: 10, weightKg: 30, completed: true },
        { setNumber: 2, reps: 10, weightKg: 32, completed: true },
        { setNumber: 3, reps: 9, weightKg: 32, completed: true }
      ]
    },
    {
      name: 'Dumbbell Lateral Raise',
      sets: [
        { setNumber: 1, reps: 15, weightKg: 12, completed: true },
        { setNumber: 2, reps: 15, weightKg: 12, completed: true },
        { setNumber: 3, reps: 14, weightKg: 12, completed: true },
        { setNumber: 4, reps: 12, weightKg: 12, completed: true }
      ]
    }
  ]),
  '2026-11-08 10:22:00'
);

insertWorkoutLog.run(
  'log-2',
  'user-athlete-1',
  'routine-2',
  'Back & Posterior Chain Focus',
  '2026-11-06 17:15:00',
  '2026-11-06 18:05:00',
  3000,
  510,
  7100,
  'Hamstrings on fire from the RDLs. Strong lat engagement.',
  5,
  JSON.stringify([
    {
      name: 'Barbell Bent-Over Row',
      sets: [
        { setNumber: 1, reps: 10, weightKg: 65, completed: true },
        { setNumber: 2, reps: 8, weightKg: 75, completed: true },
        { setNumber: 3, reps: 8, weightKg: 75, completed: true }
      ]
    },
    {
      name: 'Romanian Deadlift (RDL)',
      sets: [
        { setNumber: 1, reps: 10, weightKg: 85, completed: true },
        { setNumber: 2, reps: 10, weightKg: 95, completed: true },
        { setNumber: 3, reps: 10, weightKg: 100, completed: true }
      ]
    }
  ]),
  '2026-11-06 18:05:00'
);

// 7. Personal Records (PRs)
const insertPR = db.prepare(`
  INSERT INTO personal_records (id, user_id, exercise_name, record_type, value, unit, achieved_at)
  VALUES (?, ?, ?, ?, ?, ?, ?)
`);

insertPR.run('pr-1', 'user-athlete-1', 'Barbell Bench Press', 'WEIGHT', 105.0, 'kg', '2026-11-08');
insertPR.run('pr-2', 'user-athlete-1', 'Barbell Back Squat', 'WEIGHT', 142.5, 'kg', '2026-10-25');
insertPR.run('pr-3', 'user-athlete-1', 'Romanian Deadlift', 'WEIGHT', 130.0, 'kg', '2026-11-01');
insertPR.run('pr-4', 'user-athlete-1', '5K Running Pace', 'TIME', 22.4, 'min', '2026-10-14');

// 8. Today's & Past Meal Logs (Alex Rivera)
const insertMeal = db.prepare(`
  INSERT INTO meal_logs (id, user_id, date, meal_type, food_name, servings, calories, protein, carbs, fat, fiber, logged_at)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const todayDate = '2026-11-08';
const mealsData = [
  { id: 'm-1', date: todayDate, type: 'breakfast', name: 'Rolled Oats with Whey & Blueberries', servings: 1.5, cal: 420, p: 38, c: 54, f: 6, fib: 8 },
  { id: 'm-2', date: todayDate, type: 'breakfast', name: 'Whole Eggs & Egg Whites Scramble', servings: 1.0, cal: 240, p: 26, c: 2, f: 12, fib: 0 },
  { id: 'm-3', date: todayDate, type: 'lunch', name: 'Grilled Chicken Breast & Jasmine Rice', servings: 1.5, cal: 580, p: 52, c: 68, f: 8, fib: 2 },
  { id: 'm-4', date: todayDate, type: 'lunch', name: 'Steamed Broccoli with Olive Oil', servings: 1.0, cal: 110, p: 3, c: 6, f: 9, fib: 3 },
  { id: 'm-5', date: todayDate, type: 'snack', name: 'Barebells Protein Bar', servings: 1.0, cal: 200, p: 20, c: 16, f: 7, fib: 3 },
  { id: 'm-6', date: todayDate, type: 'snack', name: 'Banana with Natural Peanut Butter', servings: 1.0, cal: 260, p: 7, c: 32, f: 12, fib: 4 },
  { id: 'm-7', date: todayDate, type: 'dinner', name: 'Atlantic Salmon Fillet & Baked Sweet Potato', servings: 1.0, cal: 480, p: 38, c: 30, f: 19, fib: 4 }
];

mealsData.forEach(m => {
  insertMeal.run(m.id, 'user-athlete-1', m.date, m.type, m.name, m.servings, m.cal, m.p, m.c, m.f, m.fib, `${m.date} 12:00:00`);
});

// 9. Daily Activity Logs (Last 14 days)
const insertActivity = db.prepare(`
  INSERT INTO daily_activity_logs (id, user_id, date, steps, distance_km, calories_burned, active_minutes, water_intake_ml, sleep_duration_hours, sleep_quality_score, recovery_score, source, synced_at)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const activityHistory = [
  { date: '2026-11-08', steps: 11450, dist: 8.6, burn: 2680, active: 62, water: 3250, sleep: 7.8, sleepQ: 86, recovery: 92 },
  { date: '2026-11-07', steps: 10200, dist: 7.8, burn: 2450, active: 48, water: 2800, sleep: 7.2, sleepQ: 80, recovery: 84 },
  { date: '2026-11-06', steps: 12800, dist: 9.7, burn: 2820, active: 75, water: 3500, sleep: 8.1, sleepQ: 91, recovery: 88 },
  { date: '2026-11-05', steps: 9800, dist: 7.2, burn: 2310, active: 40, water: 2900, sleep: 6.9, sleepQ: 74, recovery: 76 },
  { date: '2026-11-04', steps: 11900, dist: 9.1, burn: 2710, active: 65, water: 3400, sleep: 7.5, sleepQ: 84, recovery: 87 },
  { date: '2026-11-03', steps: 13400, dist: 10.2, burn: 2950, active: 80, water: 3600, sleep: 8.0, sleepQ: 89, recovery: 94 },
  { date: '2026-11-02', steps: 8900, dist: 6.5, burn: 2200, active: 35, water: 2600, sleep: 7.0, sleepQ: 76, recovery: 78 }
];

activityHistory.forEach((act, idx) => {
  insertActivity.run(
    `act-${idx + 1}`,
    'user-athlete-1',
    act.date,
    act.steps,
    act.dist,
    act.burn,
    act.active,
    act.water,
    act.sleep,
    act.sleepQ,
    act.recovery,
    'apple_health',
    `${act.date} 23:00:00`
  );
});

// 10. Body Measurements History
const insertMeasurement = db.prepare(`
  INSERT INTO body_measurements (id, user_id, date, weight_kg, body_fat_pct, waist_cm, chest_cm, arms_cm, hips_cm, thighs_cm, notes, created_at)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const weightProgression = [
  { date: '2026-09-15', w: 83.2, bf: 19.5, waist: 88.0, chest: 102.0, arm: 37.0, hip: 99.0, thigh: 59.0, notes: 'Starting ApexFit Recomp phase' },
  { date: '2026-09-30', w: 82.0, bf: 18.6, waist: 86.5, chest: 102.5, arm: 37.2, hip: 98.0, thigh: 58.5, notes: 'Felt stronger in lifts' },
  { date: '2026-10-15', w: 80.5, bf: 17.4, waist: 84.8, chest: 103.5, arm: 37.8, hip: 97.0, thigh: 59.0, notes: 'Diet adherence 95%' },
  { date: '2026-10-31', w: 79.4, bf: 16.2, waist: 83.5, chest: 104.0, arm: 38.2, hip: 96.0, thigh: 59.5, notes: 'Veins showing in delts' },
  { date: '2026-11-08', w: 78.5, bf: 15.0, waist: 82.0, chest: 105.0, arm: 38.5, hip: 95.0, thigh: 60.0, notes: 'Target goal within reach! Optimal energy' }
];

weightProgression.forEach((m, idx) => {
  insertMeasurement.run(`meas-${idx + 1}`, 'user-athlete-1', m.date, m.w, m.bf, m.waist, m.chest, m.arm, m.hip, m.thigh, m.notes, `${m.date} 08:00:00`);
});

// 11. Gamification
const insertGamification = db.prepare(`
  INSERT INTO gamification (user_id, current_streak, longest_streak, last_active_date, total_points, current_level, unlocked_badges_json)
  VALUES (?, ?, ?, ?, ?, ?, ?)
`);

insertGamification.run(
  'user-athlete-1',
  14,
  28,
  '2026-11-08',
  3850,
  7,
  JSON.stringify([
    { id: 'b-streak-7', name: 'Week on Fire', desc: 'Maintained 7 consecutive active workout days', icon: 'Flame', unlocked_at: '2026-11-01' },
    { id: 'b-century', name: 'Century Club', desc: 'Crushed 100 total logged workouts', icon: 'Award', unlocked_at: '2026-10-20' },
    { id: 'b-pr-crusher', name: 'Iron Will', desc: 'Broke 5 distinct Personal Records', icon: 'Trophy', unlocked_at: '2026-11-08' },
    { id: 'b-hydration', name: 'Hydro Master', desc: 'Drank 3,000ml+ water for 10 consecutive days', icon: 'Droplets', unlocked_at: '2026-11-05' },
    { id: 'b-early-bird', name: 'Dawn Warrior', desc: 'Completed a workout before 7:00 AM', icon: 'Sunrise', unlocked_at: '2026-10-18' }
  ])
);

// 12. Challenges
const insertChallenge = db.prepare(`
  INSERT INTO challenges (id, title, description, category, target_value, unit, duration_days, badge_reward, xp_reward, participants_count)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

insertChallenge.run('ch-1', 'The 70,000 Step Odyssey', 'Accumulate 70,000 steps this week to boost VO2 max and burn baseline calories.', 'steps', 70000, 'steps', 7, 'Odyssey Walker', 500, 342);
insertChallenge.run('ch-2', 'Hypertrophy Iron Week', 'Complete 5 high-intensity resistance training sessions this week.', 'workouts', 5, 'sessions', 7, 'Titanium Lifter', 750, 189);
insertChallenge.run('ch-3', 'Pure Hydration Protocol', 'Log at least 3,000ml of water every day for 7 days straight.', 'water', 21000, 'ml', 7, 'Hydro Elite', 400, 420);

// Join Alex Rivera to challenge 1 & 2
const insertUserChallenge = db.prepare(`
  INSERT INTO user_challenges (id, user_id, challenge_id, progress_value, completed, joined_at)
  VALUES (?, ?, ?, ?, ?, ?)
`);

insertUserChallenge.run('uc-1', 'user-athlete-1', 'ch-1', 48500, 0, '2026-11-03 08:00:00');
insertUserChallenge.run('uc-2', 'user-athlete-1', 'ch-2', 4, 0, '2026-11-04 09:00:00');

// 13. Trainer-Client Connection & Messages
const insertTrainerClient = db.prepare(`
  INSERT INTO trainer_clients (id, trainer_id, client_id, status, notes, created_at)
  VALUES (?, ?, ?, ?, ?, ?)
`);

insertTrainerClient.run('tc-1', 'user-trainer-1', 'user-athlete-1', 'active', 'Focusing on bench press progressive overload and clean bulk macros.', '2026-10-01 10:00:00');
insertTrainerClient.run('tc-2', 'user-trainer-1', 'user-client-1', 'active', 'Targeting 58kg body recomp with low-impact HIIT and vegetarian protein sources.', '2026-10-10 11:00:00');

const insertTrainerMessage = db.prepare(`
  INSERT INTO trainer_messages (id, sender_id, receiver_id, content, is_read, created_at)
  VALUES (?, ?, ?, ?, ?, ?)
`);

insertTrainerMessage.run('tm-1', 'user-trainer-1', 'user-athlete-1', 'Awesome job on hitting that 85kg bench press PR today Alex! Keep your form tight on that 4th rep lockout.', 1, '2026-11-08 11:15:00');
insertTrainerMessage.run('tm-2', 'user-athlete-1', 'user-trainer-1', 'Thanks Coach Marcus! Your cue about retracting scapulae and driving feet made a huge difference.', 1, '2026-11-08 11:20:00');
insertTrainerMessage.run('tm-3', 'user-trainer-1', 'user-athlete-1', 'Make sure to hit your 180g protein target today to support recovery. Tomorrow is active mobility & rest!', 0, '2026-11-08 11:30:00');

// 14. Trainer Appointments
const insertAppointment = db.prepare(`
  INSERT INTO trainer_appointments (id, trainer_id, client_id, title, date_time, duration_min, status, meeting_link, notes)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

insertAppointment.run('app-1', 'user-trainer-1', 'user-athlete-1', 'Bi-Weekly Form Check & Macro Audit', '2026-11-12 18:00', 45, 'scheduled', 'https://meet.google.com/apex-fit-audit', 'Review squat depth video and adjust surplus calories.');
insertAppointment.run('app-2', 'user-trainer-1', 'user-client-1', 'Monthly Goal Milestone Review', '2026-11-14 15:30', 30, 'scheduled', 'https://meet.google.com/apex-fit-sarah', 'Celebrate 4kg weight drop and map out next training block.');

// 15. AI Chat Messages (Sample conversation)
const insertAIChat = db.prepare(`
  INSERT INTO ai_chat_messages (id, user_id, role, content, category, created_at)
  VALUES (?, ?, ?, ?, ?, ?)
`);

insertAIChat.run(
  'ai-1',
  'user-athlete-1',
  'user',
  'Apex Coach, my anterior delts feel slightly fatigued from benching today. Should I adjust my shoulder workout tomorrow?',
  'workout_gen',
  '2026-11-08 14:00:00'
);

insertAIChat.run(
  'ai-2',
  'user-athlete-1',
  'assistant',
  'Excellent question! Since your anterior deltoids were heavily taxed during your heavy 85kg bench press session today, here is my recommended adjustment for tomorrow:\n\n1. **Swap Overhead Press for Lateral Raises & Rear Delt Flyes**: Shift direct focus away from front delts to side and rear delts to prevent overuse impingement.\n2. **Active Foam Rolling**: Spend 3-4 minutes opening up your thoracic spine and pectoralis minor.\n3. **Adequate Hydration & Protein**: Ensure you hit your 180g protein goal today with adequate leucine for muscle protein synthesis.\n\n*Note: Apex Coach provides sports performance recommendations. If you experience sharp joint discomfort, consult a sports physician.*',
  'workout_gen',
  '2026-11-08 14:00:15'
);

// 16. Admin Settings
const insertSetting = db.prepare(`
  INSERT INTO admin_settings (setting_key, setting_value, description, updated_at)
  VALUES (?, ?, ?, datetime('now'))
`);

insertSetting.run('ai_model_name', 'gemini-1.5-pro', 'Active AI model used for personalized coaching and plan generation');
insertSetting.run('ai_temperature', '0.7', 'Creativity temperature for AI workout and meal plan recommendations');
insertSetting.run('feature_ai_coach', 'true', 'Enable or disable AI personal fitness coach platform-wide');
insertSetting.run('feature_ai_meal_scan', 'true', 'Enable or disable AI meal photo estimation feature');
insertSetting.run('feature_leaderboard', 'true', 'Enable global community challenges leaderboard');
insertSetting.run('feature_trainer_portal', 'true', 'Enable coach/client management and appointment tools');
insertSetting.run('maintenance_mode', 'false', 'Put site into maintenance mode for upgrades');
insertSetting.run('stripe_mode', 'test', 'Stripe payment processor operating mode');
insertSetting.run('free_trial_days', '14', 'Number of complimentary trial days for new PRO subscribers');

// 17. Coupons
const insertCoupon = db.prepare(`
  INSERT INTO coupons (id, code, discount_percent, valid_until, max_uses, times_used, active)
  VALUES (?, ?, ?, ?, ?, ?, ?)
`);

insertCoupon.run('cp-1', 'APEX50', 50, '2027-12-31', 500, 42, 1);
insertCoupon.run('cp-2', 'PROFIT20', 20, '2027-12-31', 1000, 115, 1);
insertCoupon.run('cp-3', 'ELITE100', 100, '2026-12-31', 50, 8, 1);

// 18. Notifications
const insertNotification = db.prepare(`
  INSERT INTO notifications (id, user_id, title, message, type, is_read, action_url, created_at)
  VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
`);

insertNotification.run('notif-1', 'user-athlete-1', 'Personal Record Smashed!', 'You logged a new PR in Barbell Bench Press: 85kg for 8 reps. Outstanding execution!', 'achievement', 0, '/progress');
insertNotification.run('notif-2', 'user-athlete-1', 'Hydration Milestone', 'You are only 250ml away from reaching your 3,500ml daily target. Grab a glass!', 'water', 0, '/dashboard');
insertNotification.run('notif-3', 'user-athlete-1', 'Message from Coach Marcus', 'Coach Marcus left feedback on your bench press lockout technique.', 'trainer', 0, '/trainer/messages');

console.log('Seeding completed successfully with rich production-grade mock data!');
