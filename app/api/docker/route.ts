import { NextResponse } from 'next/server';
import { getDockerContainers } from '@/lib/systemInfo';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
    try {
        const containers = await getDockerContainers();
        return NextResponse.json(containers, {
            headers: {
                'Cache-Control': 'no-store, no-cache, must-revalidate',
                'Pragma': 'no-cache',
            },
        });
    } catch (error) {
        console.error('Failed to fetch docker containers:', error);
        return NextResponse.json(
            { error: 'Failed to fetch docker containers' },
            { status: 500 }
        );
    }
}
