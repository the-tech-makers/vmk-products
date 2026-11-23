/**
 * Vercel Serverless Function: /api/process-lead
 * Handles lead enquiries from the VMK Products 3D smart home landing page.
 * Captures all Google Ads attribution tokens (gclid, gbraid, wbraid, UTMs)
 * and returns standard JSON response for seamless client handling.
 */

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  try {
    const data = req.body || {};

    // 1. Honeypot check
    if (data.website) {
      return res.status(200).json({ success: true, message: 'Thank you.' });
    }

    const name = (data.name || '').trim();
    const phone = (data.phone || '').trim();
    const email = (data.email || '').trim();
    const city = (data.city || '').trim();
    const propertyType = (data.property_type || '').trim();
    const interest = (data.interest || '').trim();
    const message = (data.message || '').trim();

    // 2. Validate required fields
    if (!name) {
      return res.status(422).json({ success: false, message: 'Name is required.' });
    }
    if (!phone || !/^[+0-9\s\-()]{7,20}$/.test(phone)) {
      return res.status(422).json({ success: false, message: 'A valid phone number is required.' });
    }

    // 3. Extract Google Ads & Campaign Attribution
    const attribution = {};
    const attributionKeys = ['gclid', 'gbraid', 'wbraid', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];
    attributionKeys.forEach(key => {
      if (data[key]) {
        attribution[key] = data[key];
      }
    });

    const leadRecord = {
      submittedAt: new Date().toISOString(),
      name,
      phone,
      email: email || null,
      city: city || null,
      propertyType: propertyType || null,
      interest: interest || 'Complete home automation',
      message: message || null,
      attribution
    };

    console.log('New VMK Lead Captured:', JSON.stringify(leadRecord, null, 2));

    return res.status(200).json({
      success: true,
      message: 'Thank you! Our home automation experts will contact you shortly.'
    });
  } catch (error) {
    console.error('Lead processing error:', error);
    return res.status(500).json({
      success: false,
      message: 'Unable to process your request. Please contact us on WhatsApp at +91 85270 87270.'
    });
  }
};
