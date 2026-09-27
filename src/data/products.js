/**
 * Product catalogue — single source of truth.
 *
 * Replaces the old `Assets/all_product.js`, `Assets/data.js` and
 * `Assets/new_collections.js`, which held three overlapping copies of the
 * same list (every entry sharing one name and one description).
 *
 * Records are assembled from a compact `SPECS` table plus derived fields
 * (sku, slug, discount percentage, size availability, gallery views,
 * reviews). Writing 36 fully-expanded literals by hand would be far
 * longer and would drift out of sync.
 *
 * Image note: the asset set contains exactly one photograph per product,
 * so the PDP gallery presents four *views* of that photograph (different
 * crops and grades) rather than pretending to have alternate angles.
 */

import { sizesForCategory, getColor } from "./catalog";

import p1 from "../Components/Assets/product_1.png";
import p2 from "../Components/Assets/product_2.png";
import p3 from "../Components/Assets/product_3.png";
import p4 from "../Components/Assets/product_4.png";
import p5 from "../Components/Assets/product_5.png";
import p6 from "../Components/Assets/product_6.png";
import p7 from "../Components/Assets/product_7.png";
import p8 from "../Components/Assets/product_8.png";
import p9 from "../Components/Assets/product_9.png";
import p10 from "../Components/Assets/product_10.png";
import p11 from "../Components/Assets/product_11.png";
import p12 from "../Components/Assets/product_12.png";
import p13 from "../Components/Assets/product_13.png";
import p14 from "../Components/Assets/product_14.png";
import p15 from "../Components/Assets/product_15.png";
import p16 from "../Components/Assets/product_16.png";
import p17 from "../Components/Assets/product_17.png";
import p18 from "../Components/Assets/product_18.png";
import p19 from "../Components/Assets/product_19.png";
import p20 from "../Components/Assets/product_20.png";
import p21 from "../Components/Assets/product_21.png";
import p22 from "../Components/Assets/product_22.png";
import p23 from "../Components/Assets/product_23.png";
import p24 from "../Components/Assets/product_24.png";
import p25 from "../Components/Assets/product_25.png";
import p26 from "../Components/Assets/product_26.png";
import p27 from "../Components/Assets/product_27.png";
import p28 from "../Components/Assets/product_28.png";
import p29 from "../Components/Assets/product_29.png";
import p30 from "../Components/Assets/product_30.png";
import p31 from "../Components/Assets/product_31.png";
import p32 from "../Components/Assets/product_32.png";
import p33 from "../Components/Assets/product_33.png";
import p34 from "../Components/Assets/product_34.png";
import p35 from "../Components/Assets/product_35.png";
import p36 from "../Components/Assets/product_36.png";

const IMAGES = {
    1: p1, 2: p2, 3: p3, 4: p4, 5: p5, 6: p6, 7: p7, 8: p8, 9: p9,
    10: p10, 11: p11, 12: p12, 13: p13, 14: p14, 15: p15, 16: p16,
    17: p17, 18: p18, 19: p19, 20: p20, 21: p21, 22: p22, 23: p23,
    24: p24, 25: p25, 26: p26, 27: p27, 28: p28, 29: p29, 30: p30,
    31: p31, 32: p32, 33: p33, 34: p34, 35: p35, 36: p36,
};

/* ------------------------------------------------------------------
   Compact specification table.
   ids 1–12 women, 13–24 men, 25–36 kid — matching the original image
   assignments so photographs still suit their category.
   ------------------------------------------------------------------ */

const SPECS = [
    // ---------------- Women ----------------
    {
        id: 1, name: "Striped Flutter Sleeve Peplum Blouse", category: "women",
        price: 50, was: 80.5, colors: ["bone", "terracotta", "slate"],
        fabric: "Viscose crepe", fit: "Relaxed, peplum hem", rating: 4.6, reviews: 122, age: 26,
        tags: ["blouse", "striped", "occasion"],
        description: "A softly structured blouse in fluid viscose crepe. The flutter sleeve falls from a dropped shoulder and the overlap collar sits open without gaping, while a seamed peplum hem gives shape through the waist without a cinch.",
    },
    {
        id: 2, name: "Crepe Wrap Midi Dress", category: "women",
        price: 85, was: 120.5, colors: ["ink", "rust", "sage"],
        fabric: "Recycled crepe de chine", fit: "True to size, wrap front", rating: 4.8, reviews: 214, age: 12,
        tags: ["dress", "midi", "occasion", "wrap"], isNew: true,
        description: "A true wrap, tied rather than faked, in a recycled crepe that moves well and creases little. The skirt falls to mid-calf with a generous overlap so it stays closed when you walk.",
    },
    {
        id: 3, name: "Oversized Cotton Poplin Shirt", category: "women",
        price: 60, was: 100.5, colors: ["bone", "denim", "oat"],
        fabric: "Organic cotton poplin", fit: "Oversized, drop shoulder", rating: 4.4, reviews: 96, age: 58,
        tags: ["shirt", "cotton", "layering"],
        description: "Cut deliberately large to be worn open over a tee or buttoned with the sleeves pushed up. Crisp organic poplin that softens with every wash, finished with a curved shirt-tail hem.",
    },
    {
        id: 4, name: "Ribbed Knit Turtleneck", category: "women",
        price: 100, was: 150, colors: ["cream", "charcoal", "clay"],
        fabric: "Merino wool blend", fit: "Slim, stretches to fit", rating: 4.7, reviews: 178, age: 40,
        tags: ["knitwear", "turtleneck", "wool", "layering"],
        description: "A fine 2x2 rib in a merino blend that holds its shape through the day. The neck is tall enough to fold once and the body is long enough to stay tucked.",
    },
    {
        id: 5, name: "Pleated Wide-Leg Trousers", category: "women",
        price: 75, was: 110, colors: ["olive", "ink", "oat"],
        fabric: "Tencel twill", fit: "High rise, wide leg", rating: 4.5, reviews: 134, age: 33,
        tags: ["trousers", "tailoring", "wide-leg"],
        description: "Two pressed pleats release from a high waistband into a column leg that skims rather than clings. Cut in a Tencel twill with enough weight to hang straight.",
    },
    {
        id: 6, name: "Cropped Linen Jacket", category: "women",
        price: 95, was: 140, colors: ["ecru", "sage", "terracotta"],
        fabric: "European flax linen", fit: "Boxy, cropped", rating: 4.3, reviews: 71, age: 8,
        tags: ["jacket", "linen", "summer"], isNew: true,
        description: "An unlined summer jacket in mid-weight European flax. Boxy through the body, cropped at the hip, and softened at the shoulder so it layers over a dress without bulk.",
    },
    {
        id: 7, name: "Satin Slip Camisole", category: "women",
        price: 38, was: 62, colors: ["rose", "bone", "ink"],
        fabric: "Cupro satin", fit: "Bias cut, adjustable strap", rating: 4.2, reviews: 88, age: 71,
        tags: ["camisole", "satin", "layering"],
        description: "Cut on the bias so it falls close without gripping. Cupro satin has the handle of silk and survives a cool machine wash, and the straps adjust properly at the back.",
    },
    {
        id: 8, name: "Cable-Knit Cardigan", category: "women",
        price: 110, was: 165, colors: ["oat", "indigo", "rust"],
        fabric: "Lambswool", fit: "Relaxed, hip length", rating: 4.9, reviews: 246, age: 47,
        tags: ["knitwear", "cardigan", "wool"],
        description: "A heavyweight lambswool cardigan with a traditional cable running the length of each front panel. Horn-look buttons, ribbed cuffs deep enough to turn back.",
    },
    {
        id: 9, name: "High-Rise Straight Jeans", category: "women",
        price: 88, was: 125, colors: ["denim", "ink", "bone"],
        fabric: "Rigid cotton denim, 12oz", fit: "High rise, straight leg", rating: 4.6, reviews: 302, age: 88,
        tags: ["denim", "jeans", "straight"],
        description: "A rigid 12oz denim that breaks in properly rather than stretching out. High waist, straight through the hip and thigh, and hemmed to sit at the ankle.",
    },
    {
        id: 10, name: "Tiered Cotton Maxi Skirt", category: "women",
        price: 68, was: 98, colors: ["terracotta", "bone", "olive"],
        fabric: "Crinkle cotton", fit: "Elasticated waist, full length", rating: 4.1, reviews: 57, age: 19,
        tags: ["skirt", "maxi", "cotton", "summer"],
        description: "Three gathered tiers in a crinkle cotton that needs no ironing. A covered elastic waistband sits flat and there are real pockets in the side seams.",
    },
    {
        id: 11, name: "Boxy Cropped Tee", category: "women",
        price: 28, was: 45, colors: ["cream", "ink", "sage", "clay"],
        fabric: "Heavy organic jersey, 240gsm", fit: "Boxy, cropped", rating: 4.4, reviews: 163, age: 5,
        tags: ["tee", "jersey", "cotton", "basic"], isNew: true,
        description: "A 240gsm organic jersey with enough body to hold a square shape. Cropped to sit at the high hip, with a wide ribbed neck that won't stretch out.",
    },
    {
        id: 12, name: "Belted Twill Trench", category: "women",
        price: 145, was: 210, colors: ["oat", "olive", "ink"],
        fabric: "Cotton twill, water-repellent finish", fit: "Relaxed, mid-calf", rating: 4.8, reviews: 119, age: 64,
        tags: ["coat", "trench", "outerwear"],
        description: "A proper trench in dense cotton twill with a water-repellent finish: storm flap, back vent, and a self belt with a covered buckle. Cut long enough to cover a midi skirt.",
    },

    // ---------------- Men ----------------
    {
        id: 13, name: "Brushed Cotton Overshirt", category: "men",
        price: 85, was: 120.5, colors: ["olive", "charcoal", "clay"],
        fabric: "Brushed cotton twill", fit: "Relaxed, straight hem", rating: 4.7, reviews: 188, age: 22,
        tags: ["overshirt", "shirt-jacket", "cotton"],
        description: "The weight of a light jacket with the ease of a shirt. Brushed cotton twill, two chest pockets with a clean bartack, and a straight hem so it wears untucked.",
    },
    {
        id: 14, name: "Merino Crew Neck Sweater", category: "men",
        price: 95, was: 140, colors: ["indigo", "oat", "charcoal"],
        fabric: "Extra-fine merino wool", fit: "Regular", rating: 4.8, reviews: 264, age: 44,
        tags: ["knitwear", "sweater", "merino", "wool"],
        description: "A 19.5 micron merino knitted at a fine gauge, so it layers under a jacket without bulk. Fully fashioned shoulders and a ribbed neck that keeps its shape.",
    },
    {
        id: 15, name: "Relaxed Oxford Shirt", category: "men",
        price: 62, was: 95, colors: ["bone", "denim", "sage"],
        fabric: "Organic cotton oxford", fit: "Relaxed, button-down collar", rating: 4.5, reviews: 141, age: 67,
        tags: ["shirt", "oxford", "cotton"],
        description: "A softly woven organic oxford with a proper roll to the button-down collar. Cut relaxed through the body, with a single patch pocket and a split back yoke.",
    },
    {
        id: 16, name: "Tapered Chino Trousers", category: "men",
        price: 72, was: 105, colors: ["oat", "olive", "ink"],
        fabric: "Cotton twill with 2% elastane", fit: "Mid rise, tapered", rating: 4.4, reviews: 197, age: 52,
        tags: ["trousers", "chino", "tapered"],
        description: "A cotton twill with just enough elastane to move in. Sits at the mid rise, straight through the thigh and tapered from the knee to a clean break at the ankle.",
    },
    {
        id: 17, name: "Garment-Dyed Heavy Tee", category: "men",
        price: 34, was: 52, colors: ["cream", "rust", "slate", "ink"],
        fabric: "Garment-dyed cotton, 260gsm", fit: "Boxy", rating: 4.6, reviews: 221, age: 10,
        tags: ["tee", "cotton", "basic"], isNew: true,
        description: "Dyed after making so the colour sits slightly uneven and softens with wear. 260gsm cotton, twin-needle hems, and a taped neck that survives the wash.",
    },
    {
        id: 18, name: "Quilted Liner Jacket", category: "men",
        price: 128, was: 185, colors: ["olive", "ink", "clay"],
        fabric: "Recycled nylon, recycled wadding", fit: "Regular, hip length", rating: 4.5, reviews: 108, age: 30,
        tags: ["jacket", "quilted", "outerwear"],
        description: "A light quilted liner that works alone in autumn or under a coat in winter. Recycled nylon shell, recycled wadding, and a jersey-bound collar that sits flat.",
    },
    {
        id: 19, name: "Selvedge Denim Jacket", category: "men",
        price: 138, was: 195, colors: ["denim", "ink"],
        fabric: "Japanese selvedge denim, 13.5oz", fit: "Regular, cropped", rating: 4.9, reviews: 176, age: 77,
        tags: ["denim", "jacket", "selvedge", "outerwear"],
        description: "Japanese 13.5oz selvedge with a visible red line at the side seam. Unwashed, so it fades to your own wear pattern. Adjustable waist tabs and copper rivets.",
    },
    {
        id: 20, name: "Waffle-Knit Henley", category: "men",
        price: 48, was: 72, colors: ["oat", "charcoal", "rust"],
        fabric: "Cotton waffle knit", fit: "Regular", rating: 4.3, reviews: 94, age: 39,
        tags: ["henley", "knit", "cotton", "layering"],
        description: "A textured cotton waffle that traps a little warmth without a jumper's weight. Four-button placket, ribbed cuffs, and a slightly dropped shoulder.",
    },
    {
        id: 21, name: "Pleated Wool Trousers", category: "men",
        price: 118, was: 170, colors: ["charcoal", "oat", "indigo"],
        fabric: "Wool blend suiting", fit: "High rise, wide leg", rating: 4.6, reviews: 83, age: 15,
        tags: ["trousers", "tailoring", "wool", "pleated"], isNew: true,
        description: "Single-pleated tailored trousers in a mid-weight wool blend. Cut high on the waist with a wide, straight leg and a half-inch turn-up at the hem.",
    },
    {
        id: 22, name: "Zip-Through Track Jacket", category: "men",
        price: 82, was: 118, colors: ["slate", "ink", "sage"],
        fabric: "Recycled poly tricot", fit: "Regular", rating: 4.2, reviews: 112, age: 61,
        tags: ["jacket", "track", "sport"],
        description: "A tricot track jacket cut closer to a 70s original than a gym top. Contrast piping along the raglan sleeve, ribbed collar, and two zipped hand pockets.",
    },
    {
        id: 23, name: "Corduroy Work Shirt", category: "men",
        price: 78, was: 112, colors: ["clay", "olive", "oat"],
        fabric: "8-wale cotton corduroy", fit: "Relaxed", rating: 4.7, reviews: 137, age: 49,
        tags: ["shirt", "corduroy", "cotton"],
        description: "A broad 8-wale corduroy with real substance. Two flapped chest pockets, a reinforced back yoke, and a spread collar that stands up under a jacket.",
    },
    {
        id: 24, name: "Lightweight Linen Blazer", category: "men",
        price: 155, was: 220, colors: ["ecru", "indigo", "sage"],
        fabric: "European flax linen", fit: "Unstructured, single breasted", rating: 4.4, reviews: 66, age: 6,
        tags: ["blazer", "linen", "tailoring", "summer"], isNew: true,
        description: "Unlined and unstructured, so it wears like a shirt but reads as tailoring. Patch pockets, a soft shoulder, and horn-look buttons on a two-button front.",
    },

    // ---------------- Kids ----------------
    {
        id: 25, name: "Rainbow Stripe Long Sleeve Tee", category: "kid",
        price: 22, was: 34, colors: ["cream", "terracotta", "denim"],
        fabric: "Organic cotton jersey", fit: "Regular", rating: 4.8, reviews: 156, age: 18,
        tags: ["tee", "striped", "cotton", "everyday"],
        description: "Soft organic jersey in a yarn-dyed stripe that won't fade in the wash. An envelope neck on the smaller sizes makes it easy to pull on without a fight.",
    },
    {
        id: 26, name: "Corduroy Dungarees", category: "kid",
        price: 42, was: 62, colors: ["clay", "olive", "denim"],
        fabric: "Cotton corduroy", fit: "Relaxed, adjustable strap", rating: 4.7, reviews: 128, age: 35,
        tags: ["dungarees", "corduroy", "everyday"],
        description: "Hard-wearing cotton cord with adjustable straps to follow a growth spurt. Reinforced knees, a big front pocket, and poppers down one leg for quick changes.",
    },
    {
        id: 27, name: "Quilted Puffer Gilet", category: "kid",
        price: 48, was: 70, colors: ["mustard", "sage", "ink"],
        fabric: "Recycled nylon, recycled fill", fit: "Regular", rating: 4.5, reviews: 91, age: 25,
        tags: ["gilet", "quilted", "outerwear"],
        description: "A light, packable gilet for the in-between weather. Recycled shell and fill, a high collar, and zipped pockets that actually keep things in.",
    },
    {
        id: 28, name: "Jersey Pull-On Joggers", category: "kid",
        price: 26, was: 38, colors: ["charcoal", "sage", "rose"],
        fabric: "Brushed-back cotton jersey", fit: "Relaxed, elasticated", rating: 4.6, reviews: 174, age: 42,
        tags: ["joggers", "jersey", "everyday", "cotton"],
        description: "Brushed soft on the inside, with a flat elasticated waist and no drawcord to chew. Cuffed ankles stay put on a scooter.",
    },
    {
        id: 29, name: "Printed Cotton Sundress", category: "kid",
        price: 32, was: 48, colors: ["bone", "rose", "sage"],
        fabric: "Organic cotton poplin", fit: "A-line", rating: 4.4, reviews: 82, age: 9,
        tags: ["dress", "cotton", "summer", "printed"], isNew: true,
        description: "A simple A-line sundress in organic poplin, printed with a small hand-drawn floral. Ties at the shoulder so it lasts more than one summer.",
    },
    {
        id: 30, name: "Fleece Zip Hoodie", category: "kid",
        price: 38, was: 55, colors: ["denim", "terracotta", "oat"],
        fabric: "Recycled polyester fleece", fit: "Regular", rating: 4.5, reviews: 143, age: 56,
        tags: ["hoodie", "fleece", "outerwear"],
        description: "A warm recycled fleece with a full-length zip and a chin guard at the top so it doesn't scratch. Deep hood, two lined hand pockets.",
    },
    {
        id: 31, name: "Denim Pinafore Dress", category: "kid",
        price: 44, was: 64, colors: ["denim", "ink"],
        fabric: "Cotton denim, 10oz", fit: "Relaxed, adjustable strap", rating: 4.6, reviews: 97, age: 31,
        tags: ["dress", "pinafore", "denim"],
        description: "A 10oz cotton denim pinafore to layer over a tee all year. Adjustable buttoned straps, a patch front pocket, and a hem deep enough to let down.",
    },
    {
        id: 32, name: "Ribbed Cotton Leggings", category: "kid",
        price: 18, was: 28, colors: ["ink", "rose", "sage", "cream"],
        fabric: "Ribbed organic cotton", fit: "Slim, elasticated", rating: 4.3, reviews: 205, age: 73,
        tags: ["leggings", "cotton", "basic", "everyday"],
        description: "A fine cotton rib with plenty of stretch and a soft covered waistband. Sold as a staple — they go under everything and survive the tumble dryer.",
    },
    {
        id: 33, name: "Checked Flannel Shirt", category: "kid",
        price: 34, was: 50, colors: ["rust", "olive", "denim"],
        fabric: "Brushed cotton flannel", fit: "Relaxed", rating: 4.4, reviews: 76, age: 45,
        tags: ["shirt", "flannel", "checked", "cotton"],
        description: "Brushed cotton flannel in a yarn-dyed check, soft from the first wear. One chest pocket, a curved hem, and buttons a small hand can manage.",
    },
    {
        id: 34, name: "Crew Neck Sweatshirt", category: "kid",
        price: 30, was: 44, colors: ["oat", "sage", "mustard"],
        fabric: "Loopback organic cotton", fit: "Regular", rating: 4.7, reviews: 188, age: 14,
        tags: ["sweatshirt", "cotton", "everyday"], isNew: true,
        description: "Classic loopback organic cotton with ribbed cuffs and hem and a stitched V insert at the neck to stop it stretching. Gets softer every wash.",
    },
    {
        id: 35, name: "Colour-Block Windbreaker", category: "kid",
        price: 52, was: 76, colors: ["mustard", "denim", "terracotta"],
        fabric: "Recycled ripstop nylon", fit: "Relaxed", rating: 4.2, reviews: 64, age: 4,
        tags: ["jacket", "windbreaker", "outerwear"], isNew: true,
        description: "A packable recycled ripstop shell that folds into its own pocket. Elasticated cuffs, a drawcord hem, and reflective tape across the back yoke.",
    },
    {
        id: 36, name: "Cotton Pyjama Set", category: "kid",
        price: 28, was: 42, colors: ["cream", "rose", "denim"],
        fabric: "Organic cotton jersey", fit: "Relaxed", rating: 4.8, reviews: 212, age: 69,
        tags: ["pyjamas", "cotton", "sleepwear"],
        description: "A two-piece set in breathable organic jersey, cut generous for sleeping. Flat seams throughout and a soft elastic waist with no scratchy label.",
    },
];

/* ------------------------------------------------------------------
   Derivation helpers
   ------------------------------------------------------------------ */

const slugify = (value) =>
    value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

/**
 * Pieces currently reduced. A fixed set spread across all three
 * categories, so the Sale collection and the "Reduced" filter both return a
 * genuine subset rather than the whole catalogue.
 */
const SALE_IDS = new Set([
    1, 3, 5, 7, 10, // women
    13, 16, 19, 22, // men
    25, 28, 31, 35, // kids
]);

/**
 * Deterministic pseudo-random integer in [0, max).
 * Used so "out of stock" sizes, stock counts and review selections are
 * stable across reloads — a random value per render would make the UI
 * flicker and make manual verification impossible.
 */
const seeded = (seed, max) => {
    const x = Math.sin(seed * 12.9898) * 43758.5453;
    return Math.floor((x - Math.floor(x)) * max);
};

const REVIEW_POOL = [
    { author: "Mara T.", title: "Exactly as described", body: "The fabric feels far better than the price suggests and the fit matched the size guide measurements precisely.", rating: 5 },
    { author: "Ines R.", title: "Lovely, sized down", body: "Beautiful quality. It runs a touch generous as the description warns, so I took the smaller of my two sizes and it's perfect.", rating: 4 },
    { author: "Joss K.", title: "Wearing it constantly", body: "Third week in a row I've reached for this. Washes well, no pilling, no sagging at the seams.", rating: 5 },
    { author: "Dana P.", title: "Good, with one caveat", body: "Really well made and the colour is accurate to the photographs. Slightly shorter in the body than I expected.", rating: 4 },
    { author: "Rafael M.", title: "Worth it", body: "I hesitated at the price and shouldn't have. The finishing details are the kind you normally pay twice this for.", rating: 5 },
    { author: "Tomas L.", title: "Nice but sizing is odd", body: "Quality is genuinely good. The shoulders are cut narrower than the chest measurement implies, so check that first.", rating: 3 },
    { author: "Ayo B.", title: "Great everyday piece", body: "Unfussy, comfortable and holds its shape. Exactly what I wanted and nothing I didn't.", rating: 5 },
    { author: "Kirsten H.", title: "Soft and warm", body: "Softer than expected without feeling flimsy. Layers well under a coat without adding bulk.", rating: 4 },
    { author: "Nils A.", title: "Colour slightly deeper", body: "Arrived a shade deeper than on screen, which I actually prefer. Fit is spot on.", rating: 4 },
    { author: "Priya S.", title: "Bought a second", body: "Liked the first one enough to order another in a different colour. That's the whole review really.", rating: 5 },
];

const DAY = 24 * 60 * 60 * 1000;

const buildGallery = (image, name) => [
    { src: image, label: "Front", objectPosition: "center top", zoom: 1 },
    { src: image, label: "Detail", objectPosition: "center 20%", zoom: 1.8 },
    { src: image, label: "Fabric", objectPosition: "center 55%", zoom: 2.4 },
    { src: image, label: "Full length", objectPosition: "center center", zoom: 1 },
].map((view, index) => ({
    ...view,
    id: `${slugify(name)}-view-${index + 1}`,
    alt: `${name} — ${view.label.toLowerCase()} view`,
}));

const buildSizes = (spec) => {
    const scale = sizesForCategory(spec.category);
    // One or two sizes per product are out of stock, chosen deterministically
    // so the PDP always shows a realistic mix of available/unavailable.
    const missingIndex = seeded(spec.id, scale.length);
    const alsoMissing = spec.id % 5 === 0 ? (missingIndex + 2) % scale.length : -1;

    return scale.map((label, index) => ({
        label,
        inStock: index !== missingIndex && index !== alsoMissing,
        stock: index === missingIndex || index === alsoMissing
            ? 0
            : 3 + seeded(spec.id * 31 + index, 14),
    }));
};

const buildReviews = (spec) => {
    const count = 2 + seeded(spec.id * 7, 2); // 2–3 reviews
    const start = seeded(spec.id * 13, REVIEW_POOL.length);
    return Array.from({ length: count }, (_, i) => {
        const source = REVIEW_POOL[(start + i * 3) % REVIEW_POOL.length];
        return {
            id: `${spec.id}-r${i + 1}`,
            ...source,
            date: new Date(Date.now() - (spec.age + i * 9 + 2) * DAY).toISOString(),
            verified: true,
        };
    });
};

const buildProduct = (spec) => {
    const image = IMAGES[spec.id];
    const sizes = buildSizes(spec);
    const totalStock = sizes.reduce((sum, size) => sum + size.stock, 0);

    // Only a deliberate subset is reduced. Deriving "on sale" from a
    // discount threshold made every single product look discounted, which
    // reads as fake and made a "Reduced" filter meaningless.
    const onSale = SALE_IDS.has(spec.id);
    const salePercent = onSale
        ? Math.round(((spec.was - spec.price) / spec.was) * 100)
        : 0;

    return {
        id: spec.id,
        sku: `SKU ${String(spec.id).padStart(3, "0")}`,
        slug: slugify(spec.name),
        name: spec.name,
        category: spec.category,
        image,
        gallery: buildGallery(image, spec.name),

        new_price: spec.price,
        // Null rather than 0 when there is no reduction, so the card can
        // simply omit the struck-through price.
        old_price: onSale ? spec.was : null,
        salePercent,
        onSale,

        colors: spec.colors.map(getColor),
        sizes,
        stock: totalStock,
        inStock: totalStock > 0,

        rating: spec.rating,
        reviewCount: spec.reviews,
        reviews: buildReviews(spec),

        description: spec.description,
        details: {
            fabric: spec.fabric,
            fit: spec.fit,
            care: spec.fabric.toLowerCase().includes("wool")
                ? "Hand wash cool or dry clean. Dry flat, away from direct heat."
                : "Machine wash cool on a short cycle. Dry flat. Warm iron if needed.",
            origin: "Made in Portugal from responsibly sourced materials.",
        },

        tags: spec.tags,
        isNew: Boolean(spec.isNew),
        // Drives the "newest" sort and the New Arrivals collection.
        createdAt: new Date(Date.now() - spec.age * DAY).toISOString(),
    };
};

/* ------------------------------------------------------------------
   Public exports
   ------------------------------------------------------------------ */

const products = SPECS.map(buildProduct);

export default products;

/** All products, newest first. */
export const newArrivals = [...products]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 8);

/** Discounted pieces, deepest reduction first. */
export const saleProducts = [...products]
    .filter((product) => product.onSale)
    .sort((a, b) => b.salePercent - a.salePercent);

/** Highest-rated pieces, used for "Popular this season" on the home page. */
export const popularProducts = [...products]
    .sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount)
    .slice(0, 8);

export const findProductById = (id) =>
    products.find((product) => product.id === Number(id));

export const priceBounds = products.reduce(
    (acc, product) => ({
        min: Math.min(acc.min, product.new_price),
        max: Math.max(acc.max, product.new_price),
    }),
    { min: Infinity, max: 0 }
);
