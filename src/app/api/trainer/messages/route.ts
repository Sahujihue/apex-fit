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
    const peerId = searchParams.get('peerId') || (user.trainer_id || 'user-trainer-1');

    const messages = db.prepare(`
      SELECT m.*, u.name as sender_name, u.avatar as sender_avatar
      FROM trainer_messages m
      JOIN users u ON m.sender_id = u.id
      WHERE (m.sender_id = ? AND m.receiver_id = ?)
         OR (m.sender_id = ? AND m.receiver_id = ?)
      ORDER BY m.created_at ASC
    `).all(user.id, peerId, peerId, user.id);

    return NextResponse.json({ messages });
  } catch (error: any) {
    console.error('Trainer messages GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { receiverId, content } = await request.json();
    if (!receiverId || !content || !content.trim()) {
      return NextResponse.json({ error: 'Receiver and content are required' }, { status: 400 });
    }

    const msgId = `tm-${Date.now()}`;
    db.prepare(`
      INSERT INTO trainer_messages (id, sender_id, receiver_id, content, is_read, created_at)
      VALUES (?, ?, ?, ?, 0, datetime('now'))
    `).run(msgId, user.id, receiverId, content.trim());

    return NextResponse.json({
      success: true,
      message: {
        id: msgId,
        sender_id: user.id,
        receiver_id: receiverId,
        content: content.trim(),
        created_at: new Date().toISOString()
      }
    });
  } catch (error: any) {
    console.error('Trainer messages POST error:', error);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}
