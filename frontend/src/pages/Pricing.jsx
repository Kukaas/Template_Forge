import { useState } from 'react';
import { useAuth } from '../lib/auth';
import { CustomButton, CustomBadge } from '../components/custom-components';
import { Check, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { toast } from 'sonner';

const SUBSCRIPTION_PLANS = {
  monthly: {
    id: 'monthly',
    name: 'Monthly',
    price: 3.99,
    duration: '1 month',
    description: 'Perfect for short-term needs',
    features: [
      'Access to all premium templates',
      'Priority support',
      'Ad-free experience',
      'Unlimited downloads'
    ]
  },
  biannual: {
    id: 'biannual',
    name: '6 Months',
    price: 19.99,
    duration: '6 months',
    description: 'Most popular choice',
    savings: 'Save 16.5%',
    features: [
      'All Monthly features',
      'Priority email support',
      'Early access to new templates',
      'Bulk downloads'
    ]
  },
  yearly: {
    id: 'yearly',
    name: 'Yearly',
    price: 35.99,
    duration: '12 months',
    description: 'Best value for money',
    savings: 'Save 25%',
    features: [
      'All Biannual features',
      'VIP support',
      'Custom template requests',
      'API access'
    ]
  }
};

const Pricing = () => {
  const { user } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const handleSubscribe = async (plan) => {
    if (!user) {
      toast.error('Please login to subscribe');
      return;
    }
    setSelectedPlan(plan);
    setShowPaymentModal(true);
  };

  const handleConfirmPayment = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/payment/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          planType: selectedPlan.id
        })
      });

      if (!response.ok) throw new Error('Failed to process payment');

      toast.success('Successfully upgraded to premium!');
      setShowPaymentModal(false);
      // Optionally refresh user data or redirect
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Failed to process payment');
    }
  };

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <CustomBadge variant="primary" size="lg" className="mb-4">
          Pricing Plans
        </CustomBadge>
        <h1 className="text-4xl font-bold tracking-tight mb-4">
          Choose Your Premium Plan
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Get unlimited access to all premium templates and features
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {Object.values(SUBSCRIPTION_PLANS).map((plan) => (
          <div
            key={plan.id}
            className="relative border rounded-xl p-6 flex flex-col bg-card hover:shadow-lg transition-all duration-200"
          >
            {plan.savings && (
              <span className="absolute -top-3 right-4 bg-primary text-white px-3 py-1 rounded-full text-sm">
                {plan.savings}
              </span>
            )}
            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-2">{plan.name}</h3>
              <p className="text-muted-foreground text-sm">{plan.description}</p>
            </div>
            <div className="mb-6">
              <span className="text-3xl font-bold">${plan.price}</span>
              <span className="text-muted-foreground">/{plan.duration}</span>
            </div>
            <ul className="space-y-3 mb-8">
              {plan.features.map((feature, index) => (
                <li key={index} className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-green-500" />
                  {feature}
                </li>
              ))}
            </ul>
            <div className="mt-auto">
              <CustomButton
                variant={plan.id === 'yearly' ? 'gradient' : 'outline'}
                className="w-full"
                onClick={() => handleSubscribe(plan)}
              >
                Get Started
              </CustomButton>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Subscription</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-semibold mb-2">Selected Plan: {selectedPlan?.name}</h4>
              <p className="text-muted-foreground">
                Total: ${selectedPlan?.price} for {selectedPlan?.duration}
              </p>
            </div>
            <p className="text-sm text-muted-foreground">
              Click confirm to simulate payment and activate your premium subscription.
            </p>
            <div className="flex gap-4">
              <CustomButton
                variant="gradient"
                className="flex-1"
                onClick={handleConfirmPayment}
              >
                Confirm Payment
              </CustomButton>
              <CustomButton
                variant="outline"
                className="flex-1"
                onClick={() => setShowPaymentModal(false)}
              >
                Cancel
              </CustomButton>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Pricing;