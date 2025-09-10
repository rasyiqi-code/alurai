import { NextRequest, NextResponse } from 'next/server'
import { stackServerApp } from '@/stack'
import { SubscriptionService } from '@/lib/subscription-service'
import { creemService } from '@/lib/creem-service'

export async function GET(request: NextRequest) {
  try {
    const user = await stackServerApp.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const subscription = await SubscriptionService.getUserSubscription(user.id)
    const usage = await SubscriptionService.getUserUsage(user.id)

    return NextResponse.json({
      subscription,
      usage
    })
  } catch (error) {
    console.error('Error fetching subscription data:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Create subscription (for free plan)
export async function POST(request: NextRequest) {
  try {
    const user = await stackServerApp.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { action, planId } = body

    if (action !== 'create_free') {
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      )
    }

    if (planId !== 'free') {
      return NextResponse.json(
        { error: 'Invalid plan ID for free subscription' },
        { status: 400 }
      )
    }

    // Check if user already has a subscription
    const existingSubscription = await SubscriptionService.getUserSubscription(user.id)
    if (existingSubscription && existingSubscription.planId !== 'free') {
      return NextResponse.json(
        { error: 'User already has a subscription' },
        { status: 409 }
      )
    }

    // Create free subscription
    const subscription = await SubscriptionService.createSubscription(user.id, 'free')

    return NextResponse.json({
      success: true,
      subscription
    })
  } catch (error) {
    console.error('Error creating subscription:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT - Update subscription (upgrade/downgrade)
export async function PUT(request: NextRequest) {
  try {
    const user = await stackServerApp.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { planId, action } = body

    if (!planId || !action) {
      return NextResponse.json(
        { error: 'Missing required fields: planId, action' },
        { status: 400 }
      )
    }

    const validPlans = ['free', 'basic', 'pro', 'enterprise']
    const validActions = ['upgrade', 'downgrade', 'change']
    
    if (!validPlans.includes(planId) || !validActions.includes(action)) {
      return NextResponse.json(
        { error: 'Invalid planId or action' },
        { status: 400 }
      )
    }

    const currentSubscription = await SubscriptionService.getUserSubscription(user.id)
    
    if (!currentSubscription) {
      return NextResponse.json(
        { error: 'No subscription found' },
        { status: 404 }
      )
    }

    // Jika downgrade ke free plan
    if (planId === 'free') {
      if (currentSubscription.creemSubscriptionId) {
        // Cancel subscription di Creem
        await creemService.cancelSubscription(currentSubscription.creemSubscriptionId)
      }
      
      // Update ke free plan
      await SubscriptionService.updateSubscription(user.id, {
        planId: 'free',
        status: 'active',
      })

      return NextResponse.json({
        message: 'Subscription downgraded to free plan',
        planId: 'free'
      })
    }

    // Untuk upgrade/change ke paid plan, redirect ke checkout
    const productId = creemService.getCreemProductId(planId)
    if (!productId) {
      return NextResponse.json(
        { error: 'Product not found for this plan' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      message: 'Redirect to checkout required for paid plans',
      requiresCheckout: true,
      planId,
      productId
    })

  } catch (error) {
    console.error('Error updating subscription:', error)
    return NextResponse.json(
      { error: 'Failed to update subscription' },
      { status: 500 }
    )
  }
}

// DELETE - Cancel subscription
export async function DELETE(request: NextRequest) {
  try {
    const user = await stackServerApp.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const currentSubscription = await SubscriptionService.getUserSubscription(user.id)
    
    if (!currentSubscription) {
      return NextResponse.json(
        { error: 'No subscription found' },
        { status: 404 }
      )
    }

    if (currentSubscription.planId === 'free') {
      return NextResponse.json(
        { error: 'Cannot cancel free plan' },
        { status: 400 }
      )
    }

    // Cancel subscription di Creem jika ada
    if (currentSubscription.creemSubscriptionId) {
      await creemService.cancelSubscription(currentSubscription.creemSubscriptionId)
    }

    // Cancel subscription di database
    await SubscriptionService.cancelSubscription(user.id)

    return NextResponse.json({
      message: 'Subscription cancelled successfully'
    })

  } catch (error) {
    console.error('Error cancelling subscription:', error)
    return NextResponse.json(
      { error: 'Failed to cancel subscription' },
      { status: 500 }
    )
  }
}