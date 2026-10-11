# Kanha Upvan Valley — Hero + About

## Current sections
- Navbar
- Hero
- About

## CSS organization
All styling is split by section/function:
- `css/base.css` — global reset, variables, body and shared typography
- `css/navbar.css` — navbar, logo, navigation and enquiry button
- `css/hero.css` — hero image, overlay, vertical brand rail, copy and CTAs
- `css/about.css` — About section only
- `css/placeholders.css` — temporary Project/Amenities/Location/Gallery/Contact blocks
- `css/animations.css` — animations
- `css/responsive.css` — responsive/mobile rules

## Latest requested refinements
- Removed the visible `24×7 CCTV` text from About.
- Removed the visible `4 Plot categories` text from About.
- Kept the About section clean without the lower facts row.
- Navbar keeps the same glass appearance while scrolling instead of turning white.
- Logo uses the transparent logo asset.
- Typography remains standardized to Manrope.


## Why Choose Us
Added the Why Choose Us section directly below About. Its feature content is based on the supplied Kanha Upvan Valley brochure:
- 25 feet main road / 20 feet branch road
- Street lights
- Campus outer boundary and entry/exit gate
- Temple and chatt talab
- Sites for school and hospital
- CCTV camera provision
- Park and community hall

The section has its own `css/why-choose-us.css` file.

## Enquiry delivery setup (Vercel)

The enquiry form posts to `/api/enquiry.mjs`.

### Gmail email delivery
- `GMAIL_USER` — the company Gmail account, e.g. `shrikanhaupvanvalley@gmail.com`.
- `GMAIL_APP_PASSWORD` — a Google App Password generated after enabling 2-Step Verification. Store only in Vercel Environment Variables; never commit it.
- `ENQUIRY_TO_EMAIL` — destination inbox (currently configured as `shrikanhaupvanvalley@gmail.com`).

### WhatsApp notifications
- `WHATSAPP_ACCESS_TOKEN` — Meta WhatsApp Cloud API access token.
- `WHATSAPP_PHONE_NUMBER_ID` — sender phone-number ID from the WhatsApp Business Platform.
- `WHATSAPP_TO_NUMBERS` — comma-separated internal recipients in international digits-only format. Current recipients are `919608689709,917977915800`.
- `WHATSAPP_TEMPLATE_NAME` — approved WhatsApp message template with six body placeholders, in this order: name, phone, email, interest, preferred location, query.
- `WHATSAPP_TEMPLATE_LANGUAGE` — template language code.
- `WHATSAPP_GRAPH_API_VERSION` — optional Graph API version; defaults in code.

Secrets must only be stored in Vercel Environment Variables, never committed to this repository or pasted into chat. After changing environment variables, redeploy to make the new values available to the function. WhatsApp requires a Meta Business Platform setup and an approved notification template before automated delivery can be tested.
