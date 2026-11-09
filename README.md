# ApexFit AI — Premium AI-Powered Fitness Tracker SaaS Platform

ApexFit AI is an international, production-ready, full-stack fitness and athletic intelligence ecosystem inspired by **Apple Fitness**, **WHOOP**, **Linear**, and **MyFitnessPal**.

Built with Next.js 14 App Router, TypeScript, Tailwind CSS, Recharts, better-sqlite3 ACID database, and Google Gemini / OpenAI LLM sports physiology engines.

---

## ⚡ Key Modules & Features

### 1. Apple Fitness Activity Rings & Biometrics Dashboard (`/dashboard`)
- **Three Concentric Interactive Activity Rings**: Move (active kcal), Exercise (minutes), and Stand/Steps with real-time percentage indicators.
- **Daily Readiness & Strain Score (0–100)**: WHOOP-style recovery strain algorithm based on sleep architecture, heart rate metrics, and workout volume.
- **Energy Balance & Nutrition Gauge**: Net calories, macronutrient progress (Protein, Carbs, Fats, Fiber) vs personalized biometric targets.
- **Hydration Tracker**: 1-click quick-log buttons (+250ml, +500ml, +1000ml).
- **Personal Records (PRs)**: Auto-highlighting PR breakthroughs in compound lifts.
- **Weekly Activity Chart**: Recharts area visualization of daily calorie expenditure.

### 2. Apex AI Personal Fitness Coach (`/coach`)
- **Conversational Sports Scientist**: Formulated with sports physiology reasoning, progressive overload algorithms, and injury-reduction exercise substitutions.
- **Injury Modification & Recovery**: Suggests immediate joint-friendly alternatives (e.g., box squats for patellar soreness, chest-supported rows for lower back fatigue).
- **8-Week Training Program Generator**: Dynamic curriculum generation for Push/Pull/Legs, Upper/Lower, and Home Dumbbell splits.
- **Safety Disclaimer Enforced**: Clearly demarcates sports guidance from clinical medical diagnosis.

### 3. Workout Management & Active Tracker (`/workouts`)
- **Live Active Session Logger**: Stopwatch, automatic 60-second rest countdown timer, set-by-set weight and repetition recording, total volume tonnage calculation.
- **Pre-loaded & Custom Routines**: Hypertrophy Push Power, Posterior Chain Back Dominance, Full Body, and custom routine builder.
- **Master Exercise Library**: Filterable by muscle group (Chest, Back, Legs, Shoulders, Arms, Core, HIIT, Yoga) with execution instructions and pro coaching cues.
- **History Log**: Detailed session history with volume and calorie metrics.

### 4. Nutrition & AI Meal Scanner (`/nutrition`)
- **Master Food Database**: 100+ verified foods with accurate protein, carb, fat, and fiber metrics per serving.
- **Meal Classification**: Breakfast, Lunch, Dinner, and Snacks breakdown.
- **AI Meal Vision Scanner**: Estimates calories, protein, carbs, and fats from meal descriptions and photos with approximate disclaimers.
- **Custom Food Creator**: Easily add custom recipes and foods.

### 5. Weight & Body Composition Progress (`/progress`)
- **Weight Progression Chart**: Recharts line visualization with continuous check-in points and target weight reference line.
- **BMI Health Classification**: Metric BMI calculator with visual classification.
- **Body Circumference Logs**: Waist, Chest, Biceps, Hips, and Thighs.
- **Before & After Visual Slider**: Interactive comparison slider comparing baseline and current transformation photos.

### 6. Smart Activity & Sleep Recovery (`/activity`)
- **Wearable Telemetry Sync**: Integration-ready architecture for Apple Health, WHOOP 4.0, Google Health Connect, and Fitbit.
- **Sleep Quality Journal**: Sleep duration logging, sleep quality scoring, and restorative stage breakdown (Deep, REM, Light).
- **Rest Day Recommendations**: Active recovery protocols and hydration prescriptions.

### 7. Gamification & Community Challenges (`/gamification`)
- **Streak Multipliers**: Live consecutive active day counter with flame badge.
- **Community Challenges**: "70,000 Step Odyssey", "Hypertrophy Iron Week", and "Pure Hydration Protocol".
- **Achievement Badges**: "Week on Fire", "Century Club", "Iron Will", "Hydro Master", "Dawn Warrior".
- **Global Leaderboard**: Opt-in competitive rankings with user level and XP.

### 8. Coach & Personal Trainer Portal (`/trainer`)
- **Athlete Client Roster**: View client weight, goal, target, adherence streak, and notes.
- **Routine Assignment**: Assign custom workout programs directly to specific clients.
- **Encrypted 1-on-1 Trainer Chat**: Real-time communication between coach and athlete.
- **Video Appointments Scheduler**: Book Google Meet coaching and form-audit calls.

### 9. SaaS Subscription & Monetization (`/billing`)
- **Tier Structure**: FREE ($0), PRO ($9.99/mo or $89.99/yr), ELITE ($19.99/mo or $179.99/yr), TRAINER ($39.99/mo or $349.99/yr).
- **Promotional Coupon System**: Try code `APEX50` for 50% discount.
- **Billing History & Invoices**: Downloadable PDF receipt records.
- **Self-Serve Tier Switch & Cancellation**: Upgrade or downgrade with 1-click.

### 10. Super Admin Control Center (`/admin`)
- **Executive SaaS Telemetry**: MRR ($), ARR ($), Active Subscribers, Churn Rate.
- **User Management**: Edit user roles (USER, TRAINER, ADMIN) and subscription tiers.
- **AI Engine Configuration**: Select LLM model (`gemini-1.5-pro`, `gemini-1.5-flash`, `gpt-4o`) and temperature.
- **Dynamic Feature Flags**: Toggle AI Coach, Meal Scanner, Leaderboard, Trainer Portal, or Maintenance mode.
- **Promo Code Generator**: Create new promotional coupons and discount rules.

---

## 👥 Pre-Configured Demo Accounts

Use the **1-Click Demo Persona Switcher** in the top navigation bar or log in with these credentials:

| Persona | Email | Password | Role & Highlights |
|---|---|---|---|
| **Athlete (Pro)** | `user@apexfit.com` | `apexfit123` | Pro Tier, 14-day streak, rich workout logs, meal entries, PRs |
| **Personal Trainer** | `trainer@apexfit.com` | `apexfit123` | Coach Marcus Vance, manages athlete roster, assigns routines |
| **SaaS Super Admin** | `admin@apexfit.com` | `admin123` | Super Admin with complete control over MRR, users, and AI configs |
| **Client Member** | `sarah@apexfit.com` | `apexfit123` | Sarah Jenkins, coached by Marcus Vance |

---

## 🚀 Running Locally

```bash
# 1. Install dependencies (Node.js 18+ required)
npm install

# 2. Seed database with rich sample data
npm run seed

# 3. Start production server
npm run build
npm run start

# Application is live at http://localhost:3000
```
