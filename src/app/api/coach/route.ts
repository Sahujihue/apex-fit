import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/jwt';
import db from '@/lib/db';
import { chatWithAICoach, generateFullWorkoutPlan } from '@/lib/ai/coach';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const messages = db.prepare(`
      SELECT id, role, content, category, created_at
      FROM ai_chat_messages
      WHERE user_id = ?
      ORDER BY created_at ASC
    `).all(user.id);

    return NextResponse.json({ messages });
  } catch (error: any) {
    console.error('Coach GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch conversation' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check feature flag in admin_settings
    const flagRow = db.prepare("SELECT setting_value FROM admin_settings WHERE setting_key = 'feature_ai_coach'").get() as any;
    if (flagRow && flagRow.setting_value === 'false') {
      return NextResponse.json({ error: 'AI Coach feature is temporarily disabled by admin.' }, { status: 403 });
    }

    const body = await request.json();
    const { action = 'chat', message, splitType = 'Push/Pull/Legs' } = body;

    // Load user profile context
    const profile = db.prepare('SELECT * FROM user_profiles WHERE user_id = ?').get(user.id) as any;
    const userContext = {
      name: user.name,
      age: profile?.age,
      gender: profile?.gender,
      heightCm: profile?.height_cm,
      weightKg: profile?.current_weight_kg,
      goal: profile?.fitness_goal,
      experience: profile?.experience_level,
      activityLevel: profile?.activity_level,
      location: profile?.workout_location,
      equipment: profile?.equipment ? JSON.parse(profile.equipment) : [],
      dietaryPreference: profile?.dietary_preference
    };

    if (action === 'generate_plan') {
      const generatedPlan = await generateFullWorkoutPlan(userContext, splitType);
      return NextResponse.json({ success: true, plan: generatedPlan });
    }

    if (!message || !message.trim()) {
      return NextResponse.json({ error: 'Message cannot be empty' }, { status: 400 });
    }

    // Record user message
    const userMsgId = `ai-msg-${Date.now()}`;
    db.prepare(`
      INSERT INTO ai_chat_messages (id, user_id, role, content, category)
      VALUES (?, ?, 'user', ?, 'general')
    `).run(userMsgId, user.id, message);

    // Fetch recent 6 messages for context
    const recentDbMessages = db.prepare(`
      SELECT role, content FROM ai_chat_messages
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT 6
    `).all(user.id) as any[];

    const conversationHistory = recentDbMessages.reverse();

    // Call AI coach
    const aiResponseText = await chatWithAICoach(conversationHistory, userContext);

    // Save assistant response
    const assistantMsgId = `ai-msg-${Date.now() + 1}`;
    db.prepare(`
      INSERT INTO ai_chat_messages (id, user_id, role, content, category)
      VALUES (?, ?, 'assistant', ?, 'general')
    `).run(assistantMsgId, user.id, aiResponseText);

    return NextResponse.json({
      success: true,
      userMessage: { id: userMsgId, role: 'user', content: message },
      assistantMessage: { id: assistantMsgId, role: 'assistant', content: aiResponseText }
    });
  } catch (error: any) {
    console.error('Coach POST error:', error);
    return NextResponse.json({ error: 'Failed to process AI response' }, { status: 500 });
  }
}
