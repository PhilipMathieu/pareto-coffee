export const CATEGORIES = {
  coffee: {
    label: "Coffee Shops",
    query: "coffee shop",
    allowedPrimaryTypes: ["cafe", "coffee_shop"],
    enabled: true,
  },
  bakery: {
    label: "Bakeries",
    query: "bakery",
    allowedPrimaryTypes: ["bakery"],
    enabled: false,
  },
  bar: {
    label: "Bars",
    query: "bar",
    allowedPrimaryTypes: ["bar", "pub"],
    enabled: false,
  },
  lunch: {
    label: "Lunch",
    query: "lunch restaurant",
    allowedPrimaryTypes: ["restaurant", "fast_food_restaurant", "sandwich_shop", "meal_takeaway"],
    enabled: false,
  },
  dinner: {
    label: "Dinner",
    query: "dinner restaurant",
    allowedPrimaryTypes: ["restaurant", "fine_dining_restaurant", "steak_house", "italian_restaurant", "american_restaurant"],
    enabled: false,
  },
};
