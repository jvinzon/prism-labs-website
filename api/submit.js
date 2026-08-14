/**
 * PRISM Labs Registration Form Handler
 * Serverless function for Vercel/Netlify deployment
 * 
 * Environment Variables:
 * - RESEND_API_KEY: Your Resend API key
 */

import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(request, response) {
  // Only allow POST requests
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Parse request body
    const { fullName, yearLevel, email, whyJoin } = request.body;

    // Validate required fields
    if (!fullName || !yearLevel || !email || !whyJoin) {
      return response.status(400).json({ 
        error: 'All fields are required' 
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return response.status(400).json({ 
        error: 'Invalid email format' 
      });
    }

    // Send email via Resend
    const data = await resend.emails.send({
      from: 'PRISM Labs <onboarding@resend.dev>',
      to: ['jedidiah@asdah.school.nz'],
      subject: 'New PRISM Labs Registration',
      html: `
        <h2>New Registration for PRISM Labs</h2>
        <p>A student has registered for PRISM Labs.</p>
        
        <h3>Student Details:</h3>
        <ul>
          <li><strong>Name:</strong> ${fullName}</li>
          <li><strong>Year Level:</strong> ${yearLevel}</li>
          <li><strong>Email:</strong> ${email}</li>
        </ul>
        
        <h3>Why they want to join:</h3>
        <p>${whyJoin}</p>
        
        <hr>
        <p><em>This registration was submitted via the PRISM Labs website.</em></p>
      `,
    });

    console.log('Email sent successfully:', data.id);

    return response.status(200).json({ 
      success: true, 
      message: 'Registration submitted successfully',
      data: { id: data.id }
    });

  } catch (error) {
    console.error('Error sending email:', error);
    
    return response.status(500).json({ 
      error: 'Failed to submit registration',
      message: error.message 
    });
  }
}
