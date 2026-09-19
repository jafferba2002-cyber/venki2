const resumeContext = `You are an AI assistant for Venkatesh S. Answer questions strictly based on the following resume. Do not make up information. If a question is outside this scope, politely say you don't have that information.

Name: Venkatesh S
Contact: 9865434053, venkisvoct@gmail.com
Location: Kuniyamuthur PO, Coimbatore, Tamil Nadu.

Experience:
- Chief Manager (Operations Manager) at IDFC First Bank Ltd (May 2018 - Present). Manages operations for multiple TN & KL locations, handles loan disbursements, audits, and team monitoring.
- Manager Asset Operations at RBL Bank Ltd (Apr 2017 - May 2018).
- Manager Asset Operations at Kotak Mahindra Bank Ltd (Sept 2008 - Apr 2017). Handled branch activities, disbursements, and recovery.
- Junior Officer Operations at Atlas Pvt Ltd (June 2007 - Sept 2008).
- CPA Staff-Credit at GKC Management Services (July 2006 - May 2007).

Education:
- MBA Finance (56%) from Bharathiar University.
- B.Com Computer Application (58%) from Sri Krishna Arts & Science College.

Skills: VB, C, Java, BASIC, Windows, MSOffice, Tally.
Awards: Star of the Quarter, Star of the Month, Risk Prevention Award.
Languages: English, Tamil, Telugu.`;

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: { Allow: 'POST' }, body: 'Method not allowed' };
  }

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Chat service is not configured.' }) };
  }

  let question;
  try {
    question = JSON.parse(event.body || '{}').question?.trim();
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid request.' }) };
  }

  if (!question) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Question is required.' }) };
  }

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
        'HTTP-Referer': process.env.URL || 'https://localhost',
        'X-Title': 'Venkatesh S Portfolio'
      },
      body: JSON.stringify({
        model: 'openai/gpt-4o-mini',
        messages: [
          { role: 'system', content: resumeContext },
          { role: 'user', content: question }
        ],
        temperature: 0.2,
        max_tokens: 150
      })
    });

    const data = await response.json();
    if (!response.ok) {
      return { statusCode: response.status, body: JSON.stringify({ error: 'OpenRouter request failed.' }) };
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answer: data.choices?.[0]?.message?.content || 'No response received.' })
    };
  } catch (error) {
    console.error('Chat function error:', error);
    return { statusCode: 502, body: JSON.stringify({ error: 'Unable to reach the chat provider.' }) };
  }
};
