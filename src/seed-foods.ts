// Seeds (or overwrites) the reference/foods doc - the Malaysian food
// calorie list shown on the client's daily log page, from the trainer's
// "MALAYSIAN FOOD CALORIES.docx". Edit here and re-run to update.
//
// Usage: npm run seed:foods
import { db } from "./config/firebase.js";

const disclaimer =
  "These counts are approximate estimates - actual values vary with portion size, " +
  "cooking oil and fats (ghee, santan), sugar and condensed milk, and cooking method. " +
  "Add-ons like a fried egg, extra sambal, or tambah nasi increase the total.";

const categories = [
  {
    name: "Common Malaysian Breakfast",
    items: [
      { name: "Nasi Lemak Bungkus", calories: 644 },
      { name: "Teh Tarik", calories: 180 },
      { name: "Roti Canai / Dhal", calories: 359 },
      { name: "Roti Telur / Dhal", calories: 414 },
      { name: "Curry Puff (2 pcs)", calories: 400 },
      { name: "Chapati / Green Gravy", calories: 166 },
      { name: "Half-boiled Eggs (2) / Plain Bread", calories: 227 },
      { name: "Sardine Sandwiches", calories: 150 }
    ]
  },
  {
    name: "Common Malaysian Food",
    items: [
      { name: "Mamak Mee Goreng", calories: 660 },
      { name: "Prawn Mee Soup", calories: 293 },
      { name: "Lor Mee", calories: 383 },
      { name: "Mee Rebus", calories: 556 },
      { name: "Mee Hailam", calories: 277 },
      { name: "Wantan Mee Soup", calories: 217 },
      { name: "Fried Meehoon / Noodle", calories: 510 },
      { name: "Char Kway Teow", calories: 745 },
      { name: "Wantan Mee Dry", calories: 409 },
      { name: "Penang Laksa", calories: 436 },
      { name: "Noodle Soup", calories: 381 },
      { name: "Steam Chicken Rice", calories: 650 },
      { name: "Roasted Chicken Rice", calories: 800 }
    ]
  },
  {
    name: "Common Fast Food",
    items: [
      { name: "Beef Burger (1 whole)", calories: 317 },
      { name: "Cheese Burger (1 whole)", calories: 341 },
      { name: "Cheese Burger, extra cheese (1 whole)", calories: 438 },
      { name: "Hot Dog (1 whole)", calories: 225 },
      { name: "Sundae Chocolate (1 cup)", calories: 380 },
      { name: "Apple Pie (1)", calories: 260 },
      { name: "Pizza, pepperoni & beef (1 slice)", calories: 155 },
      { name: "Fried Chicken (1 piece)", calories: 290 },
      { name: "Chicken Wing (1 piece)", calories: 166 },
      { name: "Chicken Thigh (1 piece)", calories: 320 },
      { name: "Mashed Potatoes (1 cup)", calories: 87 },
      { name: "Coleslaw (1 cup)", calories: 62 },
      { name: "French Fries (1 cup)", calories: 290 },
      { name: "Soft Drink (1 can)", calories: 120 }
    ]
  },
  {
    name: "Traditional Malaysian Kuih",
    items: [
      { name: "Cucur Udang (1 pc)", calories: 144 },
      { name: "Yau Car Kuih (1 pc)", calories: 292 },
      { name: "Doughnut (1 pc)", calories: 268 },
      { name: "Goreng Pisang (1 pc)", calories: 129 },
      { name: "Apam Balik (1 pc)", calories: 282 },
      { name: "Cake, plain (1 pc)", calories: 100 },
      { name: "Dumpling, Chicken (1 pc)", calories: 203 },
      { name: "Kuih Koci (1 pc)", calories: 183 },
      { name: "Kuih Talam (1 pc)", calories: 183 },
      { name: "Yam Cake (1 pc)", calories: 174 },
      { name: "Fried Spring Roll (1 pc)", calories: 91 }
    ]
  },
  {
    name: "Meat, Poultry & Seafood",
    items: [
      { name: "Fried Ikan Kembung (1 pc)", calories: 219 },
      { name: "Steamed Pomfret (1 pc)", calories: 65 },
      { name: "Fish Head Curry (small plate)", calories: 288 },
      { name: "Deep Fried Baby Sotong (small plate)", calories: 630 },
      { name: "Prawn Sambal (small plate)", calories: 194 },
      { name: "Chicken Satay (10 sticks)", calories: 365 },
      { name: "Satay Sauce (1/2 cup)", calories: 129 },
      { name: "Beef Rendang (2 small pieces)", calories: 228 },
      { name: "Mutton Curry (2 small pieces)", calories: 287 },
      { name: "Char Siew (small plate)", calories: 191 },
      { name: "Chicken Curry (1 pc)", calories: 195 },
      { name: "Ayam Goreng (1 pc)", calories: 350 }
    ]
  }
];

async function main() {
  await db.doc("reference/foods").set({
    disclaimer,
    categories,
    updated_at: new Date().toISOString()
  });
  const itemCount = categories.reduce((n, c) => n + c.items.length, 0);
  console.log(`Seeded reference/foods: ${categories.length} categories, ${itemCount} items.`);
}

main().then(
  () => process.exit(0),
  (err) => {
    console.error("Failed:", err instanceof Error ? err.message : err);
    process.exit(1);
  }
);
