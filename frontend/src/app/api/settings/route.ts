import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const settings = await request.json();
        
        // TODO: Lưu settings vào database
        // Ví dụ:
        // await prisma.userSettings.upsert({
        //     where: { userId: session.user.id },
        //     update: settings,
        //     create: {
        //         userId: session.user.id,
        //         ...settings
        //     }
        // });

        return NextResponse.json({ message: 'Settings saved successfully' });
    } catch (error) {
        console.error('Error saving settings:', error);
        return NextResponse.json(
            { error: 'Failed to save settings' },
            { status: 500 }
        );
    }
} 