// components/checkout/ShippingStep.tsx

import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

/**
 * Checkout Step 2: Shipping Method Selection.
 * @param props.nextStep - Function to advance to the next stage.
 * @param props.prevStep - Function to return to the previous stage.
 * @param props.data - Current checkout data.
 * @param props.setData - Function to update global checkout data.
 */
export function ShippingStep({ nextStep, prevStep, data, setData }: { nextStep: () => void, prevStep: () => void, data: any, setData: (data: any) => void }) {
  
  const handleShippingChange = (value: string) => {
    setData((prev: any) => ({ ...prev, shippingOption: value }));
  };

  return (
    <div className="space-y-6">
      <RadioGroup 
        defaultValue={data.shippingOption} 
        onValueChange={handleShippingChange}
        className="space-y-4"
      >
        <div className="border p-4 rounded-lg flex items-start space-x-4 cursor-pointer hover:border-primary transition-colors">
          <RadioGroupItem value="standard" id="standard" className="mt-1" />
          <Label htmlFor="standard" className="flex flex-col flex-1 cursor-pointer">
            <span className="font-semibold text-base">Standard Shipping (3-5 Days)</span>
            <span className="text-sm text-foreground/70">Free on orders over GHS 100, otherwise GHS 15.00</span>
          </Label>
        </div>
        
        <div className="border p-4 rounded-lg flex items-start space-x-4 cursor-pointer hover:border-primary transition-colors">
          <RadioGroupItem value="express" id="express" className="mt-1" />
          <Label htmlFor="express" className="flex flex-col flex-1 cursor-pointer">
            <span className="font-semibold text-base">Express Shipping (1-2 Days)</span>
            <span className="text-sm text-foreground/70">Flat rate of GHS 25.00</span>
          </Label>
        </div>
      </RadioGroup>
      
      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={prevStep}>
          Back to Address
        </Button>
        <Button onClick={nextStep}>
          Continue to Payment
        </Button>
      </div>
    </div>
  );
}