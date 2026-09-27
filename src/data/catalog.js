/**
 * Static catalogue reference data — colour palette, size scales, size guide
 * tables, FAQ copy and promo codes.
 *
 * Kept separate from products.js so product records can reference shared
 * colour/size definitions by key instead of duplicating hex values.
 */

/* ------------------------------------------------------------------
   Colours
   ------------------------------------------------------------------ */

export const COLORS = {
    bone: { key: "bone", name: "Bone", hex: "#F2EDE2" },
    ecru: { key: "ecru", name: "Ecru", hex: "#E3D9C4" },
    oat: { key: "oat", name: "Oat", hex: "#D6C8AC" },
    clay: { key: "clay", name: "Clay", hex: "#B4694B" },
    terracotta: { key: "terracotta", name: "Terracotta", hex: "#C4401E" },
    rust: { key: "rust", name: "Rust", hex: "#9C3116" },
    sage: { key: "sage", name: "Sage", hex: "#8A9A7B" },
    olive: { key: "olive", name: "Olive", hex: "#6B6B3A" },
    slate: { key: "slate", name: "Slate", hex: "#55606B" },
    indigo: { key: "indigo", name: "Indigo", hex: "#2E3A59" },
    denim: { key: "denim", name: "Denim", hex: "#4A6280" },
    charcoal: { key: "charcoal", name: "Charcoal", hex: "#34302A" },
    ink: { key: "ink", name: "Ink", hex: "#17140F" },
    rose: { key: "rose", name: "Dusty Rose", hex: "#C39B9B" },
    mustard: { key: "mustard", name: "Mustard", hex: "#C99A2E" },
    cream: { key: "cream", name: "Cream", hex: "#FFFBF2" },
};

export const colorList = Object.values(COLORS);

export const getColor = (key) => COLORS[key] || COLORS.bone;

/* ------------------------------------------------------------------
   Size scales
   ------------------------------------------------------------------ */

export const ADULT_SIZES = ["S", "M", "L", "XL", "XXL"];
export const KID_SIZES = ["2-3Y", "4-5Y", "6-7Y", "8-9Y", "10-11Y"];

export const sizesForCategory = (category) =>
    category === "kid" ? KID_SIZES : ADULT_SIZES;

/* ------------------------------------------------------------------
   Categories
   ------------------------------------------------------------------ */

/**
 * `title` is stored explicitly rather than derived, because a naive
 * `label + "'s"` produces "Kids's Catalogue".
 */
export const CATEGORIES = [
    {
        key: "women",
        label: "Women",
        title: "Women's Catalogue",
        path: "/womens",
        index: "01",
    },
    {
        key: "men",
        label: "Men",
        title: "Men's Catalogue",
        path: "/mens",
        index: "02",
    },
    {
        key: "kid",
        label: "Kids",
        title: "Kids' Catalogue",
        path: "/kids",
        index: "03",
    },
];

export const categoryLabel = (key) =>
    CATEGORIES.find((c) => c.key === key)?.label || "Catalogue";

export const categoryTitle = (key) =>
    CATEGORIES.find((c) => c.key === key)?.title || "Catalogue";

export const categoryPath = (key) =>
    CATEGORIES.find((c) => c.key === key)?.path || "/";

/* ------------------------------------------------------------------
   Sort options — shared by category, collection and search pages
   ------------------------------------------------------------------ */

export const SORT_OPTIONS = [
    { value: "featured", label: "Featured" },
    { value: "newest", label: "Newest" },
    { value: "price-asc", label: "Price: low to high" },
    { value: "price-desc", label: "Price: high to low" },
    { value: "rating", label: "Top rated" },
];

export const DEFAULT_SORT = "featured";

/* ------------------------------------------------------------------
   Promo codes (cart)
   ------------------------------------------------------------------ */

export const PROMO_CODES = [
    {
        code: "CATALOGUE10",
        type: "percent",
        value: 10,
        description: "10% off your order",
    },
    {
        code: "SPRING20",
        type: "percent",
        value: 20,
        description: "20% off your order",
        minSubtotal: 150,
    },
    {
        code: "FREEPOST",
        type: "shipping",
        value: 0,
        description: "Free express shipping",
    },
    {
        code: "PAPER15",
        type: "fixed",
        value: 15,
        description: "$15 off your order",
        minSubtotal: 80,
    },
];

export const findPromo = (code) =>
    PROMO_CODES.find(
        (promo) => promo.code.toLowerCase() === String(code).trim().toLowerCase()
    );

/* ------------------------------------------------------------------
   Shipping
   ------------------------------------------------------------------ */

export const FREE_SHIPPING_THRESHOLD = 75;
export const STANDARD_SHIPPING = 6.5;

/* ------------------------------------------------------------------
   Size guide tables (cm)
   ------------------------------------------------------------------ */

export const SIZE_GUIDE = {
    women: {
        label: "Women",
        columns: ["Size", "UK", "Bust", "Waist", "Hip"],
        rows: [
            ["S", "8–10", "86–90", "68–72", "92–96"],
            ["M", "10–12", "90–94", "72–76", "96–100"],
            ["L", "12–14", "94–99", "76–82", "100–106"],
            ["XL", "16–18", "99–105", "82–89", "106–113"],
            ["XXL", "18–20", "105–112", "89–96", "113–120"],
        ],
    },
    men: {
        label: "Men",
        columns: ["Size", "Chest", "Waist", "Sleeve", "Neck"],
        rows: [
            ["S", "92–97", "76–81", "84", "37–38"],
            ["M", "97–102", "81–86", "86", "39–40"],
            ["L", "102–107", "86–94", "88", "41–42"],
            ["XL", "107–114", "94–102", "90", "43–44"],
            ["XXL", "114–122", "102–110", "92", "45–46"],
        ],
    },
    kid: {
        label: "Kids",
        columns: ["Size", "Age", "Height", "Chest", "Waist"],
        rows: [
            ["2-3Y", "2–3 yrs", "92–98", "53–55", "51–53"],
            ["4-5Y", "4–5 yrs", "104–110", "56–58", "53–55"],
            ["6-7Y", "6–7 yrs", "116–122", "59–62", "55–57"],
            ["8-9Y", "8–9 yrs", "128–134", "63–67", "57–60"],
            ["10-11Y", "10–11 yrs", "140–146", "68–72", "60–63"],
        ],
    },
};

export const MEASURING_TIPS = [
    {
        title: "Bust / chest",
        body: "Measure around the fullest part, keeping the tape level under the arms and parallel to the floor.",
    },
    {
        title: "Waist",
        body: "Measure around the narrowest part of your waist, usually just above the navel. Keep one finger under the tape.",
    },
    {
        title: "Hip",
        body: "Stand with feet together and measure around the fullest part of the hips, roughly 20 cm below the waist.",
    },
    {
        title: "Between sizes",
        body: "Our cuts run relaxed. If you fall between two sizes, take the smaller for a closer fit and the larger for layering.",
    },
];

/* ------------------------------------------------------------------
   FAQ
   ------------------------------------------------------------------ */

export const FAQ_GROUPS = [
    {
        group: "Orders & shipping",
        items: [
            {
                q: "How long will my order take to arrive?",
                a: "Standard delivery arrives in 3–5 working days. Express is 1–2 working days and is free on orders over $75. You'll get a tracking link by email as soon as your parcel leaves our warehouse.",
            },
            {
                q: "Do you ship internationally?",
                a: "We ship to 40 countries. International delivery takes 5–12 working days depending on destination, and duties are calculated at checkout so there is nothing to pay on arrival.",
            },
            {
                q: "Can I change my delivery address after ordering?",
                a: "Yes, as long as the parcel hasn't been dispatched. Contact us within two hours of placing the order and we'll update it for you.",
            },
        ],
    },
    {
        group: "Returns & exchanges",
        items: [
            {
                q: "What is your returns policy?",
                a: "Return anything unworn, with tags attached, within 30 days for a full refund. Sale pieces can be returned within 14 days. Underwear and swimwear are non-returnable for hygiene reasons.",
            },
            {
                q: "Is return postage free?",
                a: "Returns are free for domestic orders — print the prepaid label from your account. International returns cost a flat $12, deducted from your refund.",
            },
            {
                q: "How do I exchange for a different size?",
                a: "Start a return in your account and place a new order for the size you want. That way the size you need is reserved rather than waiting for the return to be processed.",
            },
        ],
    },
    {
        group: "Product & sizing",
        items: [
            {
                q: "How do your sizes run?",
                a: "Most pieces are cut relaxed and true to the measurements in our Size Guide. Knitwear has roughly 2 cm of give. Each product page lists the fit and the height of the model in the photograph.",
            },
            {
                q: "Will an out-of-stock size come back?",
                a: "Core pieces are restocked every few weeks. Seasonal and limited-run items are produced once and are not repeated — the badge on the product page tells you which is which.",
            },
            {
                q: "How should I care for natural fibres?",
                a: "Wash cool, inside out, on a short cycle and dry flat away from direct heat. Care instructions specific to each fabric are on every product page under Details.",
            },
        ],
    },
    {
        group: "Payment & account",
        items: [
            {
                q: "Which payment methods do you accept?",
                a: "All major cards, Apple Pay, Google Pay and PayPal. Prices are charged in your local currency where supported.",
            },
            {
                q: "Do I need an account to order?",
                a: "You can browse and build a bag without an account. An account is needed to save a wishlist and to view past orders.",
            },
        ],
    },
];

/* ------------------------------------------------------------------
   Shipping & returns page content
   ------------------------------------------------------------------ */

export const SHIPPING_OPTIONS = [
    {
        name: "Standard",
        time: "3–5 working days",
        cost: "$6.50 — free over $75",
        note: "Tracked, delivered by local post.",
    },
    {
        name: "Express",
        time: "1–2 working days",
        cost: "$12.00",
        note: "Order before 2pm for same-day dispatch.",
    },
    {
        name: "International",
        time: "5–12 working days",
        cost: "From $18.00",
        note: "Duties and taxes calculated up front.",
    },
    {
        name: "Collect in store",
        time: "Next working day",
        cost: "Free",
        note: "Available at our Lisbon and Copenhagen studios.",
    },
];

export const RETURNS_STEPS = [
    {
        step: "01",
        title: "Start the return",
        body: "Open your account, find the order and select the pieces you're sending back. Tell us why — it genuinely shapes the next production run.",
    },
    {
        step: "02",
        title: "Print the label",
        body: "A prepaid label is generated straight away for domestic orders. Fix it over the original label on the mailing bag.",
    },
    {
        step: "03",
        title: "Send it back",
        body: "Drop the parcel at any post office or collection point within 14 days of starting the return.",
    },
    {
        step: "04",
        title: "Get refunded",
        body: "Refunds are processed within 3 working days of arrival and land back on your original payment method within a week.",
    },
];
