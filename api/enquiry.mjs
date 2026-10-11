// Vercel serverless handler for the Kanha Upvan Valley enquiry form.
// Required Vercel Environment Variables:
// GMAIL_USER, GMAIL_APP_PASSWORD, ENQUIRY_TO_EMAIL
// Gmail App Password is secret; store it only in Vercel Environment Variables.
// WhatsApp: WHATSAPP_ACCESS_TOKEN, WHATSAPP_PHONE_NUMBER_ID, WHATSAPP_TO_NUMBERS,
//           WHATSAPP_TEMPLATE_NAME, WHATSAPP_TEMPLATE_LANGUAGE (defaults to "en"),
//           WHATSAPP_GRAPH_API_VERSION (defaults to "v26.0")
// WHATSAPP_TO_NUMBERS is a comma-separated list of full international numbers without + signs.

import nodemailer from "nodemailer";

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

  const gmailUser = process.env.GMAIL_USER;
  const gmailAppPassword = (process.env.GMAIL_APP_PASSWORD || "").replace(/\\s/g, "");
  const emailConfigured = Boolean(gmailUser && gmailAppPassword);

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
    (process.env.WHATSAPP_TO_NUMBERS || process.env.WHATSAPP_TO_NUMBER) &&
    process.env.WHATSAPP_TEMPLATE_NAME
  );
  let whatsappResults = [];

  if (emailConfigured) {
    try {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: gmailUser,
          pass: gmailAppPassword
        }
      });

      await transporter.sendMail({
        from: `Shri Kanha Upvan Valley Website <${gmailUser}>`,
        to: COMPANY_EMAIL,
        replyTo: email,
        subject: "Website enquiry: " + name,
        text: plainText,
        html
      });
      emailSent = true;
    } catch (error) {
      console.error("Gmail SMTP delivery failed:", error.message);
    }
  }


  if (whatsappConfigured) {
    const token = process.env.WHATSAPP_ACCESS_TOKEN;
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    const configuredNumbers = process.env.WHATSAPP_TO_NUMBERS || process.env.WHATSAPP_TO_NUMBER || "";
    const recipients = [...new Set(configuredNumbers.split(",").map(normalizeWhatsAppNumber).filter(Boolean))];
    const templateName = process.env.WHATSAPP_TEMPLATE_NAME;
    const language = process.env.WHATSAPP_TEMPLATE_LANGUAGE || "en";
    const apiVersion = process.env.WHATSAPP_GRAPH_API_VERSION || "v26.0";

    if (!recipients.length || !phoneNumberId || !token) {
      whatsappConfigured = false;
    } else {
      // The approved WhatsApp template must contain six BODY placeholders in this order:
      // name, phone, email, interest, preferred location, query.
      const parameters = [
        name,
        phone,
        email,
        interest,
        location || "Not provided",
        query || "Not provided"
      ].map((value) => ({ type: "text", text: value.slice(0, 1000) }));

      // Send separately to both internal notification recipients.
      whatsappResults = await Promise.all(recipients.map(async (recipient) => {
        try {
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
          if (!waResponse.ok) {
            const errorBody = await waResponse.text();
            console.error("WhatsApp notification error for recipient:", recipient, waResponse.status, errorBody.slice(0, 500));
          }
          return { recipient, sent: waResponse.ok };
        } catch (error) {
          console.error("WhatsApp request failed for recipient:", recipient, error.message);
          return { recipient, sent: false };
        }
      }));
      whatsappSent = recipients.length > 0 && whatsappResults.every((result) => result.sent);
    }
  }

  const responseBody = {
    emailSent,
    emailConfigured,
    whatsappSent,
    whatsappConfigured,
    whatsappResults: whatsappResults.map((result) => ({ sent: result.sent }))
  };

  if (emailSent && whatsappSent) return json(res, 200, responseBody);
  if (emailSent && !whatsappConfigured) {
    return json(res, 207, { ...responseBody, error: "The email was sent, but WhatsApp notifications still need to be configured." });
  }
  if (emailSent && whatsappConfigured) {
    return json(res, 207, { ...responseBody, error: "Email was sent, but one or more WhatsApp notifications failed." });
  }
  if (!emailConfigured && whatsappSent) {
    return json(res, 207, { ...responseBody, error: "WhatsApp notifications were sent, but email is not configured." });
  }
  return json(res, 502, {
    ...responseBody,
    error: "We could not deliver the enquiry to all configured channels. Please try again or contact the company directly."
  });
}
