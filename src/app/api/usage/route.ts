import { NextRequest, NextResponse } from 'next/server'
import { stackServerApp } from '@/stack'
import { SubscriptionService } from '@/lib/subscription-service'

export async function GET(request: NextRequest) {
  try {
    const user = await stackServerApp.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const usage = await SubscriptionService.getUserUsage(user.id)
    return NextResponse.json({ usage })
  } catch (error) {
    console.error('Error fetching usage data:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await stackServerApp.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { type, amount = 1 } = body

    if (!type || !['forms', 'responses', 'storage', 'apiCalls'].includes(type)) {
      return NextResponse.json({ error: 'Invalid usage type' }, { status: 400 })
    }

    // Check if user can perform this action
    const actionMap = {
      forms: 'create_form',
      responses: 'receive_response', 
      storage: 'use_storage',
      apiCalls: 'api_call'
    } as const
    
    const canPerform = await SubscriptionService.canPerformAction(user.id, actionMap[type as keyof typeof actionMap], amount)
    
    if (!canPerform.allowed) {
      return NextResponse.json(
        { error: canPerform.reason || 'Usage limit exceeded', code: 'LIMIT_EXCEEDED' },
        { status: 403 }
      )
    }

    // Update usage
    const updates = { [type === 'apiCalls' ? 'apiCallsUsed' : `${type}${type === 'forms' ? 'Created' : type === 'responses' ? 'Received' : 'Used'}`]: amount }
    await SubscriptionService.updateUsage(user.id, updates)

    // Return updated usage
    const updatedUsage = await SubscriptionService.getUserUsage(user.id)
    
    return NextResponse.json({ 
      success: true,
      usage: updatedUsage
    })
  } catch (error) {
    console.error('Error updating usage:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await stackServerApp.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { type, amount } = body

    if (!type || !['forms', 'responses', 'storage', 'apiCalls'].includes(type)) {
      return NextResponse.json({ error: 'Invalid usage type' }, { status: 400 })
    }

    if (typeof amount !== 'number' || amount < 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 })
    }

    // Set usage to specific amount (useful for corrections)
    await SubscriptionService.setUsage(user.id, type, amount)

    const updatedUsage = await SubscriptionService.getUserUsage(user.id)
    
    return NextResponse.json({ 
      success: true,
      usage: updatedUsage
    })
  } catch (error) {
    console.error('Error setting usage:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}