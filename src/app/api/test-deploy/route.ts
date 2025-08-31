import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({ 
    message: 'Deployment successful',
    timestamp: new Date().toISOString(),
    adminRoute: '/admin-x7k9m2p4'
  })
}
