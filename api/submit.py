"""
PRISM Labs Registration Form Handler
Flask endpoint alternative for Python-based deployment

Environment Variables:
- RESEND_API_KEY: Your Resend API key

Install dependencies:
  pip install flask requests

Run:
  python submit.py
"""

import os
from flask import Flask, request, jsonify
import requests

app = Flask(__name__)

# Resend API configuration
RESEND_API_KEY = os.environ.get('RESEND_API_KEY')
RESEND_API_URL = 'https://api.resend.com/emails'

if not RESEND_API_KEY:
    print("WARNING: RESEND_API_KEY environment variable not set!")


@app.route('/api/submit', methods=['POST'])
def submit_registration():
    """Handle registration form submission"""
    
    # Parse JSON data
    data = request.get_json()
    
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    
    # Extract and validate fields
    full_name = data.get('fullName')
    year_level = data.get('yearLevel')
    email = data.get('email')
    why_join = data.get('whyJoin')
    
    # Check required fields
    if not all([full_name, year_level, email, why_join]):
        return jsonify({'error': 'All fields are required'}), 400
    
    # Basic email validation
    import re
    email_regex = r'^[^\s@]+@[^\s@]+\.[^\s@]+$'
    if not re.match(email_regex, email):
        return jsonify({'error': 'Invalid email format'}), 400
    
    # Prepare email payload for Resend
    resend_payload = {
        'from': 'PRISM Labs <onboarding@resend.dev>',
        'to': ['jedidiah@asdah.school.nz'],
        'subject': 'New PRISM Labs Registration',
        'html': f"""
        <h2>New Registration for PRISM Labs</h2>
        <p>A student has registered for PRISM Labs.</p>
        
        <h3>Student Details:</h3>
        <ul>
          <li><strong>Name:</strong> {full_name}</li>
          <li><strong>Year Level:</strong> {year_level}</li>
          <li><strong>Email:</strong> {email}</li>
        </ul>
        
        <h3>Why they want to join:</h3>
        <p>{why_join}</p>
        
        <hr>
        <p><em>This registration was submitted via the PRISM Labs website.</em></p>
        """
    }
    
    # Send email via Resend API
    try:
        headers = {
            'Authorization': f'Bearer {RESEND_API_KEY}',
            'Content-Type': 'application/json'
        }
        
        response = requests.post(
            RESEND_API_URL,
            json=resend_payload,
            headers=headers,
            timeout=30
        )
        
        if response.status_code >= 400:
            raise Exception(f"Resend API error: {response.text}")
        
        result = response.json()
        print(f"Email sent successfully: {result.get('id')}")
        
        return jsonify({
            'success': True,
            'message': 'Registration submitted successfully',
            'data': {'id': result.get('id')}
        }), 200
        
    except requests.exceptions.Timeout:
        return jsonify({'error': 'Email service timeout'}), 504
    except Exception as e:
        print(f"Error sending email: {str(e)}")
        return jsonify({
            'error': 'Failed to submit registration',
            'message': str(e)
        }), 500


@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'healthy'}), 200


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('FLASK_DEBUG', 'False').lower() == 'true'
    app.run(host='0.0.0.0', port=port, debug=debug)
