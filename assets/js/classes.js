/* ==========================================================================
   CLASSES — the only file to edit when dates or prices change.

   RB_CLASS_TYPES  The classes Rylee teaches (name, price, who it's for).
   RB_CLASSES      Scheduled dates. One entry per date. Past dates hide
                   themselves automatically once the class has ended.

   Date fields:
   id         The class date as YYYY-MM-DD. Also used in the Square
              redirect link: https://ryleesbake.com/booked.html?class=<id>
   type       "101" or "201" (must match a key in RB_CLASS_TYPES).
   start/end  24-hour time, Eastern.
   price      Optional. Leave out to use the class type's price.
   capacity   Total seats in the class.
   soldOut    Optional. Add  soldOut: true  when a class fills up to show
              "Sold out" and turn off its booking button.
   checkout   The Square payment link for this date.
   ========================================================================== */

window.RB_CLASS_TYPES = {
  "101": {
    name: "Sourdough 101",
    title: "Sourdough Fundamentals",
    price: 90,
    forWho: "For complete beginners",
    bring: "Nothing but yourself. Everything is provided except a Dutch oven, which you'll need at home to bake your loaf.",
    // Shown on the booked page under "Before class".
    prep: [
      "Make sure you have a Dutch oven at home. You'll bake the dough you take home in it."
    ],
    // Shown on the booked page under "After class".
    afterClass: "Bake your loaf, then share how it turned out. The ideas below help this small business grow more than anything else."
  },
  "201": {
    name: "Sourdough 201",
    title: "Discard Recipes & Everyday Baking",
    price: 80,
    forWho: "For 101 grads, or anyone already keeping a starter",
    bring: "Your Sourdough 101 kit (mixing bowl, proofing basket and tea towel) and your starter in a lidded jar, or the equivalent supplies if you have your own setup.",
    prep: [
      "The night before class, feed your starter so it's active and bubbly when you arrive. You'll use it to mix your own pizza dough.",
      "Pack your Sourdough 101 kit and your starter so you don't forget them in the morning."
    ],
    afterClass: "Bake your cinnamon roll that evening and use your pizza dough within 3 days (keep it in the fridge). Then share how it turned out. The ideas below help this small business grow more than anything else."
  }
};

window.RB_CLASSES = [
  {
    id: "2026-12-12",
    type: "101",
    start: "11:30",
    end: "14:00",
    capacity: 8,
    checkout: "https://square.link/u/u55EVCgX"
  },
  {
    id: "2027-01-16",
    type: "101",
    start: "11:30",
    end: "14:00",
    capacity: 8,
    checkout: "https://square.link/u/HLU89BJU"
  },
  {
    id: "2027-03-13",
    type: "101",
    start: "11:30",
    end: "14:00",
    capacity: 8,
    checkout: "https://square.link/u/OfmqIkkx"
  },
  {
    id: "2027-04-03",
    type: "101",
    start: "11:30",
    end: "14:00",
    capacity: 8,
    checkout: "https://square.link/u/VfluXijg"
  },
  {
    id: "2027-05-15",
    type: "101",
    start: "11:30",
    end: "14:00",
    capacity: 8,
    checkout: "https://square.link/u/83UuduOD"
  },
  {
    id: "2027-06-05",
    type: "101",
    start: "11:30",
    end: "14:00",
    capacity: 8,
    checkout: "https://square.link/u/mt5ob2nq"
  }
];

/* Shared business details used by both pages. */
window.RB_INFO = {
  name: "Rylee's Bake",
  email: "ryleesbake@gmail.com",
  facebook: "https://www.facebook.com/profile.php?id=61573125724592",
  reviews: "https://www.facebook.com/profile.php?id=61573125724592&sk=reviews",
  privateClassForm: "https://docs.google.com/forms/d/e/1FAIpQLSfYBBfUP6SKK-DPc8k233DRJyjPu90RRjPOQ7ujXxhpwyw9_A/viewform",
  // Shown only on the booked page, after someone has paid.
  address: {
    street: "1335 Zeek Ridge St",
    city: "Clermont",
    state: "FL",
    zip: "34715"
  }
};
