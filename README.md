# Girlgeous — Shopify Theme

A soft-girl / coquette Shopify **Online Store 2.0** theme built for the **Girlgeous** brand.
Aesthetic inspiration: Princess Polly, Edikted, Angel Ruche — trendy Gen-Z womenswear with a
dreamy blush-and-cream palette, playful serif display type and a fully sectioned homepage.

## Look & feel
- **Palette:** blush pink `#E8A0B4`, berry accent `#C25C7A`, cream background `#FFF8F5`, soft rose `#FCE9EE`
- **Pill buttons**, rounded cards, coquette `✿ / 🎀` accents, scrolling marquee
- Everything is editable from the **theme editor** (colors, fonts, radius, spacing, cards, cart)

## Features
- Sticky header with **desktop mega-menu** + slide-out **mobile nav**
- **Cart drawer** with AJAX add/update, quantity steppers and a **free-shipping progress bar**
- Product cards with **hover image swap**, sale/new badges, colour swatches, **quick add**
- Product page: variant pills, thumbnail gallery, quantity stepper, accordions, dynamic checkout, related products
- Collection page: **sorting + faceted filters**, pagination
- Predictive-style **search modal**, newsletter blocks, testimonials, trust badges
- Blog, article, page, contact, 404 and full **customer account** templates
- Responsive down to mobile, accessible skip-link and focus states

## Structure
```
layout/      theme.liquid, password.liquid
templates/   index/product/collection/cart/blog/... (JSON) + customers/ (liquid)
sections/    header, footer, hero-banner, featured-collection, main-* etc.
snippets/    product-card, price, cart-drawer, pagination, icons, social-icons
assets/      base.css, theme.js
config/      settings_schema.json, settings_data.json
locales/     en.default.json
```

## Install
1. Zip the theme root (the folders above must be at the top level of the zip).
2. Shopify admin → **Online Store → Themes → Add theme → Upload zip**.
3. Or use the [Shopify CLI](https://shopify.dev/docs/themes/tools/cli): `shopify theme push`.

## Recommended setup
- Create a navigation menu named **`main-menu`** (with nested links for the mega-menu) and a **`footer`** menu.
- Add your logo, favicon and social links in the theme editor.
- Set the free-shipping threshold under **Theme settings → Cart**.
