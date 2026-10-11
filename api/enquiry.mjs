// Vercel serverless handler for the Kanha Upvan Valley enquiry form.
// Required Vercel Environment Variables:
// RESEND_API_KEY, RESEND_FROM_EMAIL
// Optional email recipient: ENQUIRY_TO_EMAIL (defaults to the company's published Gmail)
// WhatsApp: WHATSAPP_ACCESS_TOKEN, WHATSAPP_PHONE_NUMBER_ID, WHATSAPP_TO_NUMBER,
//           WHATSAPP_TEMPLATE_NAME, WHATSAPP_TEMPLATE_LANGUAGE (defaults to "en"),
//           WHATSAPP_GRAPH_API_VERSION (defaults to "v26.0")

const COMPANY_EMAIL = process.env.ENQUIRY_TO_EMAIL || "shrikanhaupvanvalley@gmail.com";
const ALLOWED_INTERESTS = new Set([
  "Residential Plot",
  "Commercial Plot",
  "Farm House Plot",
  "Duplex Plot",
  "Site Visit",
  "Project Information"
]);

function json(res, status, data) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(data));
}

function clean(value, maxLength = 500) {
  return String(value ?? "").trim().replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "").slice(0, maxLength);
}

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[char]));
}

function normalizeWhatsAppNumber(value) {
  return String(value || "").replace(/\D/g, "");
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return json(res, 405, { error: "Method not allowed." });
  }

  const body = req.body && typeof req.body === "object" ? req.body : {};
  // Honeypot field: silently accept bot submissions without sending notifications.
  if (clean(body.website, 200)) return json(res, 200, { emailSent: true, whatsappSent: true, ignored: true });

  const name = clean(body.name, 120);
  const email = clean(body.email, 254);
  const phone = clean(body.phone, 40);
  const location = clean(body.location, 160);
  const interest = clean(body.interest, 80);
  const query = clean(body.query, 1200);
  const consent = body.consent === "on" || body.consent === true || body.consent === "true";

  if (!name || !email || !phone || !interest || !consent) {
    return json(res, 400, { error: "Please fill in all required fields and consent to be contacted." });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return json(res, 400, { error: "Please enter a valid email address." });
  }
  if (!/[0-9]{7,}/.test(phone)) {
    return json(res, 400, { error: "Please enter a valid contact number." });
  }
  if (!ALLOWED_INTERESTS.has(interest)) {
    return json(res, 400, { error: "Please select one of the listed enquiry options." });
  }

  const emailApiKey = process.env.RESEND_API_KEY;
  const sender = process.env.RESEND_FROM_EMAIL;
  if (!emailApiKey || !sender) {
    return json(res, 503, {
      error: "The enquiry delivery service has not been configured yet. Please try again later or contact the company directly."
    });
  }

  const plainText = [
    "New website enquiry — Shri Kanha Upvan Valley",
    "",
    "Name: " + name,
    "Email: " + email,
    "Contact number: " + phone,
    "Preferred location: " + (location || "Not provided"),
    "Interested in: " + interest,
    "Specific query: " + (query || "Not provided"),
    "",
    "Submitted through the website enquiry form."
  ].join("\n");
  const html = [
    "<h2>New website enquiry — Shri Kanha Upvan Valley</h2>",
    "<p><strong>Name:</strong> " + escapeHtml(name) + "</p>",
    "<p><strong>Email:</strong> " + escapeHtml(email) + "</p>",
    "<p><strong>Contact number:</strong> " + escapeHtml(phone) + "</p>",
    "<p><strong>Preferred location:</strong> " + escapeHtml(location || "Not provided") + "</p>",
    "<p><strong>Interested in:</strong> " + escapeHtml(interest) + "</p>",
    "<p><strong>Specific query:</strong> " + escapeHtml(query || "Not provided") + "</p>"
  ].join("");

  let emailSent = false;
  let whatsappSent = false;
  let whatsappConfigured = Boolean(
    process.env.WHATSAPP_ACCESS_TOKEN &&
    process.env.WHATSAPP_PHONE_NUMBER_ID &&
    process.env.WHATSAPP_TO_NUMBER &&
    process.env.WHATSAPP_TEMPLATE_NAME
  );

  try {
    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + emailApiKey,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: sender,
        to: [COMPANY_EMAIL],
        reply_to: email,
        subject: "Website enquiry: " + name,
        text: plainText,
        html
      })
    });
    emailSent = emailResponse.ok;
    if (!emailResponse.ok) {
      const errorBody = await emailResponse.text();
      console.error("Resend email error:", emailResponse.status, errorBody.slice(0, 500));
    }
  } catch (error) {
    console.error("Resend request failed:", error.message);
  }

  if (whatsappConfigured) {
    try {
      const token = process.env.WHATSAPP_ACCESS_TOKEN;
      const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
      const recipient = normalizeWhatsAppNumber(process.env.WHATSAPP_TO_NUMBER);
      const templateName = process.env.WHATSAPP_TEMPLATE_NAME;
      const language = process.env.WHATSAPP_TEMPLATE_LANGUAGE || "en";
      const apiVersion = process.env.WHATSAPP_GRAPH_API_VERSION || "v26.0";

      if (!recipient || !phoneNumberId || !token) {
        whatsappConfigured = false;
      } else {
        // Create and get approval for this WhatsApp template in Meta Business Manager.
        // It must have six BODY placeholders, in this exact order:
        // name, phone, email, interest, preferred location, query.
        const parameters = [
          name,
          phone,
          email,
          interest,
          location || "Not provided",
          query || "Not provided"
        ].map((text) => ({ type: "text", text: text.slice(0, 1000) }));

        const waResponse = await fetch(
          "https://graph.facebook.com/" + apiVersion + "/" + phoneNumberId + "/messages",
          {
            method: "POST",
            headers: {
              "Authorization": "Bearer " + token,
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              messaging_product: "whatsapp",
              to: recipient,
              type: "template",
              template: {
                name: templateName,
                language: { code: language },
                components: [{ type: "body", parameters }]
              }
            })
          }
        );

        whatsappSent = waResponse.ok;
        if (!waResponse.ok) {
          const errorBody = await waResponse.text();
          console.error("WhatsApp notification error:", waResponse.status, errorBody.slice(0, 500));
        }
      }
    } catch (error) {
      console.error("WhatsApp notification request failed:", error.message);
    }
  }

  if (!emailSent && !whatsappSent) {
    return json(res, 502, {
      error: "We couldn't deliver your enquiry notifications. Please try again or contact the company directly.",
      emailSent,
      whatsappSent,
      whatsappConfigured
    });
  }

  const status = emailSent && whatsappSent ? 200 : (emailSent && !whatsappConfigured ? 200 : 207);
  return json(res, status, { emailSent, whatsappSent, whatsappConfigured });
}
