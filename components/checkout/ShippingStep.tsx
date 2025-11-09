// ============================================================================
// components/checkout/ShippingStep.tsx
// ============================================================================

'use client';

import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Truck, Zap, ArrowRight, ArrowLeft, Package, Clock } from 'lucide-react';

export function ShippingStep({ nextStep, prevStep, data, setData }: { 
  nextStep: () => void, 
  prevStep: () => void, 
  data: any, 
  setData: (data: any) => void 
}) {
  const handleShippingChange = (value: string) => {
    setData((prev: any) => ({ ...prev, shippingOption: value }));
  };

  const shippingOptions = [
    {
      id: 'standard',
      icon: Package,
      title: 'Standard Shipping',
      duration: '3-5 Business Days',
      description: 'Free on orders over GHS 100, otherwise GHS 15.00',
      badge: 'Most Popular',
      badgeColor: 'bg-blue-500',
    },
    {
      id: 'express',
      icon: Zap,
      title: 'Express Shipping',
      duration: '1-2 Business Days',
      description: 'Flat rate of GHS 25.00',
      badge: 'Fastest',
      badgeColor: 'bg-green-500',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b pb-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-lg bg-primary/10">
            <Truck className="h-5 w-5 text-primary" />
          </div>
          <h3 className="text-2xl font-bold">Shipping Method</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          Choose your preferred delivery speed
        </p>
      </div>

      <RadioGroup 
        defaultValue={data.shippingOption} 
        onValueChange={handleShippingChange}
        className="space-y-4"
      >
        {shippingOptions.map((option) => {
          const IconComponent = option.icon;
          const isSelected = data.shippingOption === option.id;
          
          return (
            <div 
              key={option.id}
              className={`relative border-2 rounded-xl p-5 cursor-pointer transition-all hover:shadow-md ${
                isSelected 
                  ? 'border-primary bg-primary/5 shadow-lg' 
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <div className="flex items-start gap-4">
                <RadioGroupItem 
                  value={option.id} 
                  id={option.id} 
                  className="mt-1"
                />
                
                <Label htmlFor={option.id} className="flex-1 cursor-pointer">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${isSelected ? 'bg-primary/20' : 'bg-muted'}`}>
                        <IconComponent className={`h-5 w-5 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                      </div>
                      <div>
                        <div className="font-semibold text-base flex items-center gap-2">
                          {option.title}
                          <span className={`text-xs px-2 py-0.5 rounded-full text-white ${option.badgeColor}`}>
                            {option.badge}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                          <Clock className="h-3.5 w-3.5" />
                          {option.duration}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-sm text-muted-foreground ml-14">
                    {option.description}
                  </p>
                </Label>
              </div>
            </div>
          );
        })}
      </RadioGroup>

      {/* Info Box */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <p className="text-sm text-green-800">
          🎉 <strong>Free Shipping:</strong> Orders over GHS 100 qualify for free standard shipping!
        </p>
      </div>
      
      <div className="flex justify-between pt-4 gap-3">
        <Button variant="outline" onClick={prevStep} className="h-11 px-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Address
        </Button>
        <Button onClick={nextStep} className="h-11 px-6 flex-1 sm:flex-initial">
          Continue to Payment
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
