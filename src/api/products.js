/**
 * Products API. All list endpoints accept the same query shape so the
 * category, collection and search pages can share filter/sort/pagination
 * components without adapters.
 */

import products, {
    newArrivals,
    saleProducts,
    popularProducts,
    priceBounds,
} from "../data/products";
import { DEFAULT_SORT } from "../data/catalog";
import { ApiError, request, clone, paginate } from "./client";

/* ------------------------------------------------------------------
   Filtering + sorting (pure, exported for reuse and reasoning)
   ------------------------------------------------------------------ */

const toArray = (value) => {
    if (value == null) return [];
    return Array.isArray(value) ? value : [value];
};

export const applyFilters = (list, filters = {}) => {
    const sizes = toArray(filters.sizes).map(String);
    const colors = toArray(filters.colors).map((c) => String(c).toLowerCase());
    const { minPrice, maxPrice, onSale, inStock } = filters;

    return list.filter((product) => {
        if (Number.isFinite(minPrice) && product.new_price < minPrice) {
            return false;
        }
        if (Number.isFinite(maxPrice) && product.new_price > maxPrice) {
            return false;
        }
        if (onSale && !product.onSale) {
            return false;
        }
        if (inStock && !product.inStock) {
            return false;
        }
        if (sizes.length > 0) {
            const available = product.sizes
                .filter((size) => size.inStock)
                .map((size) => size.label);
            if (!sizes.some((size) => available.includes(size))) {
                return false;
            }
        }
        if (colors.length > 0) {
            const productColors = product.colors.map((color) => color.key);
            if (!colors.some((color) => productColors.includes(color))) {
                return false;
            }
        }
        return true;
    });
};

export const applySort = (list, sort = DEFAULT_SORT) => {
    const sorted = [...list];

    switch (sort) {
        case "price-asc":
            return sorted.sort((a, b) => a.new_price - b.new_price);
        case "price-desc":
            return sorted.sort((a, b) => b.new_price - a.new_price);
        case "newest":
            return sorted.sort(
                (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
            );
        case "rating":
            return sorted.sort(
                (a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount
            );
        case "featured":
        default:
            // "Featured" = a blend of rating and review volume, so the
            // default order is not simply id order.
            return sorted.sort(
                (a, b) =>
                    b.rating * Math.log10(b.reviewCount + 10) -
                    a.rating * Math.log10(a.reviewCount + 10)
            );
    }
};

/**
 * Facet counts for the current result set, so the filter rail can show how
 * many pieces each option would return and disable dead options.
 */
export const buildFacets = (list) => {
    const sizes = new Map();
    const colors = new Map();

    list.forEach((product) => {
        product.sizes.forEach((size) => {
            if (!size.inStock) return;
            sizes.set(size.label, (sizes.get(size.label) || 0) + 1);
        });
        product.colors.forEach((color) => {
            const existing = colors.get(color.key);
            colors.set(color.key, {
                ...color,
                count: (existing?.count || 0) + 1,
            });
        });
    });

    return {
        sizes: [...sizes.entries()].map(([label, count]) => ({ label, count })),
        colors: [...colors.values()].sort((a, b) =>
            a.name.localeCompare(b.name)
        ),
        priceBounds,
        saleCount: list.filter((product) => product.onSale).length,
    };
};

/* ------------------------------------------------------------------
   Shared list resolver
   ------------------------------------------------------------------ */

const resolveList = (source, query = {}) => {
    const {
        sort = DEFAULT_SORT,
        page = 1,
        perPage = 12,
        ...filters
    } = query;

    // Facets are computed from the unfiltered source so counts don't
    // collapse to zero as the user narrows down.
    const facets = buildFacets(source);
    const filtered = applyFilters(source, filters);
    const sorted = applySort(filtered, sort);
    const pageData = paginate(sorted, { page, perPage });

    return clone({ ...pageData, sort, facets });
};

/* ------------------------------------------------------------------
   Endpoints
   ------------------------------------------------------------------ */

export const getProducts = (query = {}, options = {}) =>
    request(() => resolveList(products, query), options);

export const getCategory = (category, query = {}, options = {}) =>
    request(() => {
        const source = products.filter(
            (product) => product.category === category
        );
        if (source.length === 0) {
            throw new ApiError(`No such category: ${category}`, {
                status: 404,
                code: "NOT_FOUND",
            });
        }
        return { ...resolveList(source, query), category };
    }, options);

export const getCollection = (collection, query = {}, options = {}) =>
    request(() => {
        let source;
        if (collection === "new-arrivals") {
            source = [...products].sort(
                (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
            );
        } else if (collection === "sale") {
            source = products.filter((product) => product.onSale);
        } else {
            throw new ApiError(`No such collection: ${collection}`, {
                status: 404,
                code: "NOT_FOUND",
            });
        }
        return { ...resolveList(source, query), collection };
    }, options);

export const getProductById = (id, options = {}) =>
    request(() => {
        const numericId = Number(id);
        const product = Number.isFinite(numericId)
            ? products.find((item) => item.id === numericId)
            : undefined;

        if (!product) {
            throw new ApiError("Product not found", {
                status: 404,
                code: "NOT_FOUND",
            });
        }
        return clone(product);
    }, options);

/** Home-page rails. `canFail: false` keeps the landing page reliable. */
export const getPopular = (options = {}) =>
    request(() => clone(popularProducts), { canFail: false, ...options });

export const getNewArrivals = (options = {}) =>
    request(() => clone(newArrivals), { canFail: false, ...options });

export const getSale = (options = {}) =>
    request(() => clone(saleProducts), { canFail: false, ...options });

/**
 * Related products: same category, excluding the product itself, closest
 * in price first so suggestions feel deliberate rather than random.
 */
export const getRelated = (productId, limit = 4, options = {}) =>
    request(() => {
        const numericId = Number(productId);
        const product = products.find((item) => item.id === numericId);
        if (!product) return [];

        const sameCategory = products.filter(
            (item) =>
                item.category === product.category && item.id !== product.id
        );
        const sharesTag = (item) =>
            item.tags.some((tag) => product.tags.includes(tag)) ? 0 : 1;

        return clone(
            sameCategory
                .sort(
                    (a, b) =>
                        sharesTag(a) - sharesTag(b) ||
                        Math.abs(a.new_price - product.new_price) -
                            Math.abs(b.new_price - product.new_price)
                )
                .slice(0, limit)
        );
    }, options);

/* ------------------------------------------------------------------
   Search
   ------------------------------------------------------------------ */

const matchesQuery = (product, terms) => {
    const haystack = [
        product.name,
        product.category,
        product.description,
        product.details.fabric,
        product.details.fit,
        ...product.tags,
        ...product.colors.map((color) => color.name),
    ]
        .join(" ")
        .toLowerCase();

    // Every term must appear somewhere, so "linen jacket" is narrower than
    // "linen" alone rather than returning the union.
    return terms.every((term) => haystack.includes(term));
};

const scoreMatch = (product, terms) => {
    const name = product.name.toLowerCase();
    let score = 0;
    terms.forEach((term) => {
        if (name.startsWith(term)) score += 6;
        else if (name.includes(term)) score += 4;
        if (product.tags.includes(term)) score += 3;
        if (product.category === term) score += 2;
    });
    return score + product.rating / 10;
};

export const search = (rawQuery, query = {}, options = {}) =>
    request(() => {
        const terms = String(rawQuery || "")
            .toLowerCase()
            .split(/\s+/)
            .filter(Boolean);

        if (terms.length === 0) {
            return clone({
                ...resolveList([], query),
                query: "",
                terms: [],
            });
        }

        const matched = products
            .filter((product) => matchesQuery(product, terms))
            .sort((a, b) => scoreMatch(b, terms) - scoreMatch(a, terms));

        // For search, "featured" means relevance, so preserve match order.
        const sort = query.sort || "relevance";
        const facets = buildFacets(matched);
        const filtered = applyFilters(matched, query);
        const sorted =
            sort === "relevance" ? filtered : applySort(filtered, sort);
        const pageData = paginate(sorted, {
            page: query.page,
            perPage: query.perPage || 12,
        });

        return clone({
            ...pageData,
            sort,
            facets,
            query: String(rawQuery).trim(),
            terms,
        });
    }, options);

/** Lightweight typeahead for the navbar overlay. */
export const suggest = (rawQuery, limit = 6, options = {}) =>
    request(
        () => {
            const terms = String(rawQuery || "")
                .toLowerCase()
                .split(/\s+/)
                .filter(Boolean);
            if (terms.length === 0) return [];

            return clone(
                products
                    .filter((product) => matchesQuery(product, terms))
                    .sort((a, b) => scoreMatch(b, terms) - scoreMatch(a, terms))
                    .slice(0, limit)
                    .map((product) => ({
                        id: product.id,
                        name: product.name,
                        image: product.image,
                        category: product.category,
                        new_price: product.new_price,
                    }))
            );
        },
        // Typeahead must feel immediate and must not randomly fail while
        // the user is mid-keystroke.
        { latency: 120, canFail: false, ...options }
    );
