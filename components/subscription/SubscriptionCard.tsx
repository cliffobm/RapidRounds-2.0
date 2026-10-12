'use client'

import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { usePayments } from '@/lib/hooks/useAccess'
import { useAuth } from '@/store/useAuth'
import { SUBSCRIPTION_TIERS, formatPrice } from '@/lib/payments/stripe'
import { 
  Crown, 
  Check, 
  Zap, 
  Gift, 
  Star,
  Shield,
  Infinity,
  Clock,
  Users,
  Download,
  Headphones,
  TrendingUp,
  Lightbulb
} from 'lucide-react'

interface SubscriptionCardProps {
  onSubscribe?: () => void
  showCurrentPlan?: boolean
  variant?: 'default' | 'compact' | 'comparison'
  className?: string
}

export function SubscriptionCard({ 
  onSubscribe,
  showCurrentPlan = true,
  variant = 'default',
  className = ''
}: SubscriptionCardProps) {
  const { profile } = useAuth()
  const { createCheckoutSession, startFreeTrial, loading } = usePayments()

  const handleUpgrade = async (priceId: string) => {
    try {
      await createCheckoutSession(priceId)
      onSubscribe?.()
    } catch (error) {
      console.error('Error upgrading subscription:', error)
    }
  }

  const handleStartTrial = async () => {
    try {
      await startFreeTrial()
      onSubscribe?.()
    } catch (error) {
      console.error('Error starting trial:', error)
    }
  }

  const getFeatureIcon = (feature: string) => {
    if (feature.includes('Unlimited')) return Infinity
    if (feature.includes('rationale')) return Lightbulb
    if (feature.includes('analytics')) return TrendingUp
    if (feature.includes('support')) return Headphones
    if (feature.includes('download')) return Download
    if (feature.includes('leaderboards')) return Users
    return Check
  }

  const currentTier = profile?.subscription_tier || 'free'
  const isTrialActive = profile?.trial_active && 
                       profile?.trial_expires_at && 
                       new Date(profile.trial_expires_at) > new Date()

  if (variant === 'compact') {
    return (
      <Card className={`${className}`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-accent/10 rounded-lg">
                {currentTier === 'premium' ? (
                  <Crown className="w-5 h-5 text-accent" />
                ) : isTrialActive ? (
                  <Gift className="w-5 h-5 text-warning" />
                ) : (
                  <Star className="w-5 h-5 text-slate-500" />
                )}
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white">
                  {currentTier === 'premium' ? 'Premium Plan' : 
                   isTrialActive ? 'Free Trial Active' : 'Free Plan'}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {currentTier === 'premium' ? 'Full access to all features' :
                   isTrialActive ? `${Math.ceil((new Date(profile.trial_expires_at!).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days remaining` :
                   'Limited access to scenarios'}
                </p>
              </div>
            </div>
            {currentTier !== 'premium' && (
              <Button 
                size="sm" 
                variant="accent"
                onClick={() => handleUpgrade(SUBSCRIPTION_TIERS[1]?.stripePriceId || '')}
                disabled={loading}
              >
                Upgrade
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (variant === 'comparison') {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 ${className}`}>
        {SUBSCRIPTION_TIERS.map((tier, index) => {
          const isCurrentPlan = currentTier === tier.id
          const isPremium = tier.id === 'premium'
          
          return (
            <motion.div
              key={tier.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className={`relative hover:shadow-lg transition-all duration-200 ${
                isPremium ? 'border-accent bg-gradient-to-b from-accent/5 to-accent/10' : ''
              } ${isCurrentPlan ? 'ring-2 ring-primary' : ''}`}>
                {isPremium && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge variant="accent" className="px-4 py-1">
                      <Crown className="w-3 h-3 mr-1" />
                      Most Popular
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="text-center pb-4">
                  <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4 ${
                    isPremium ? 'bg-accent/10' : 'bg-slate-100'
                  }`}>
                    {isPremium ? (
                      <Crown className="w-8 h-8 text-accent" />
                    ) : (
                      <Star className="w-8 h-8 text-slate-500" />
                    )}
                  </div>
                  
                  <CardTitle className="text-2xl">{tier.name}</CardTitle>
                  
                  <div className="text-3xl font-bold text-slate-900 dark:text-white">
                    {tier.price === 0 ? 'Free' : formatPrice(tier.price)}
                    {tier.price > 0 && (
                      <span className="text-base font-normal text-slate-500">
                        /{tier.interval}
                      </span>
                    )}
                  </div>
                  
                  {isCurrentPlan && (
                    <Badge variant="default" className="mt-2">
                      Current Plan
                    </Badge>
                  )}
                </CardHeader>
                
                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {tier.features.map((feature, featureIndex) => {
                      const FeatureIcon = getFeatureIcon(feature)
                      return (
                        <li key={featureIndex} className="flex items-start space-x-3">
                          <FeatureIcon className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-slate-700 dark:text-slate-300">
                            {feature}
                          </span>
                        </li>
                      )
                    })}
                  </ul>
                  
                  {!isCurrentPlan && (
                    <Button
                      className="w-full"
                      variant={isPremium ? "accent" : "outline"}
                      onClick={() => handleUpgrade(tier.stripePriceId)}
                      disabled={loading || tier.price === 0}
                    >
                      {loading ? (
                        'Processing...'
                      ) : isPremium ? (
                        <>
                          <Crown className="w-4 h-4 mr-2" />
                          Upgrade to Premium
                        </>
                      ) : (
                        'Current Plan'
                      )}
                    </Button>
                  )}
                  
                  {tier.id === 'free' && currentTier === 'free' && !isTrialActive && (
                    <Button
                      className="w-full mt-3"
                      variant="warning"
                      onClick={handleStartTrial}
                      disabled={loading}
                    >
                      <Gift className="w-4 h-4 mr-2" />
                      Start Free Trial
                    </Button>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>
    )
  }

  // Default variant - single upgrade card
  return (
    <Card className={`border-l-4 border-l-accent bg-gradient-to-r from-accent/5 to-primary/5 ${className}`}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-accent/10 rounded-xl">
              <Crown className="w-8 h-8 text-accent" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                Unlock Premium Features
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                Get unlimited access to scenarios, detailed rationales, and advanced analytics.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                {SUBSCRIPTION_TIERS[1]?.features?.slice(0, 4).map((feature, index) => {
                  const FeatureIcon = getFeatureIcon(feature)
                  return (
                    <div key={index} className="flex items-center space-x-2">
                      <FeatureIcon className="w-4 h-4 text-success" />
                      <span className="text-sm text-slate-700 dark:text-slate-300">
                        {feature}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
              {formatPrice(SUBSCRIPTION_TIERS[1]?.price || 0)}
            </div>
            <div className="text-sm text-slate-500 mb-4">per month</div>
            
            <div className="space-y-2">
              <Button
                variant="accent"
                onClick={() => handleUpgrade(SUBSCRIPTION_TIERS[1]?.stripePriceId || '')}
                disabled={loading}
                className="w-full"
              >
                {loading ? 'Processing...' : (
                  <>
                    <Crown className="w-4 h-4 mr-2" />
                    Upgrade Now
                  </>
                )}
              </Button>
              
              {currentTier === 'free' && !isTrialActive && (
                <Button
                  variant="outline"
                  onClick={handleStartTrial}
                  disabled={loading}
                  className="w-full"
                >
                  <Gift className="w-4 h-4 mr-2" />
                  Try Free for 7 Days
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
