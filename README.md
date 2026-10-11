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

The enquiry form posts to `/api/enquiry.mjs`. Before live delivery works, configure these Vercel Production environment variables:

- `RESEND_API_KEY` — sending-only API key from Resend.
- `RESEND_FROM_EMAIL` — sender address on a domain verified with Resend.
- `ENQUIRY_TO_EMAIL` — destination mailbox (currently configured as `shrikanhaupvanvalley@gmail.com`).
- `WHATSAPP_ACCESS_TOKEN` — Meta WhatsApp Cloud API access token.
- `WHATSAPP_PHONE_NUMBER_ID` — sender phone-number ID from the WhatsApp Business Platform.
- `WHATSAPP_TO_NUMBERS` — comma-separated recipients in international digits-only format. Currently configured as `919608689709,917977915800`.
- `WHATSAPP_TEMPLATE_NAME` — approved WhatsApp template with six body placeholders, in order: name, phone, email, interest, preferred location, query.
- `WHATSAPP_TEMPLATE_LANGUAGE` — the approved template language code (commonly `en`).
- `WHATSAPP_GRAPH_API_VERSION` — optional; defaults to `v26.0`.

Secrets must only be stored in Vercel Environment Variables, not committed to this repository or pasted into chat. Environment-variable changes apply to a new deployment, so redeploy after configuration. For the email sender, verify a domain first; Resend requires API credentials and an authorized sender domain for production sending. For WhatsApp delivery, configure Meta Business Platform and obtain approval for the notification template before testing.
