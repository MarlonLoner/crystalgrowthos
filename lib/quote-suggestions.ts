export type SuggestedQuoteLineItem = {
  description: string;
  quantity: number;
  unitPrice: number;
};

export function suggestQuoteLineItems(serviceInterestedIn = "", notes = ""): SuggestedQuoteLineItem[] {
  const text = `${serviceInterestedIn} ${notes}`.toLowerCase();

  if (/vehicle|car|truck|fleet/.test(text)) {
    return [
      { description: "Vehicle branding design", quantity: 1, unitPrice: 120 },
      { description: "Vinyl print", quantity: 1, unitPrice: 420 },
      { description: "Application / installation", quantity: 1, unitPrice: 180 }
    ];
  }

  if (/banner|pull up|gazebo|flag/.test(text)) {
    return [
      { description: "Banner print", quantity: 1, unitPrice: 180 },
      { description: "Eyelets and finishing", quantity: 1, unitPrice: 35 },
      { description: "Installation / stand if needed", quantity: 1, unitPrice: 75 }
    ];
  }

  if (/shopfront|signage|3d|illuminated|logo/.test(text)) {
    return [
      { description: "Illuminated shopfront sign", quantity: 1, unitPrice: 650 },
      { description: "3D lettering / signage", quantity: 1, unitPrice: 420 },
      { description: "Window vinyl branding", quantity: 1, unitPrice: 180 },
      { description: "Installation", quantity: 1, unitPrice: 150 },
      { description: "Design / mockup refinement", quantity: 1, unitPrice: 90 }
    ];
  }

  return [
    { description: serviceInterestedIn || "Branding service", quantity: 1, unitPrice: 450 },
    { description: "Design preparation", quantity: 1, unitPrice: 90 },
    { description: "Installation / delivery", quantity: 1, unitPrice: 120 }
  ];
}

export function quoteLineItemsTotal(items: SuggestedQuoteLineItem[]) {
  return items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
}