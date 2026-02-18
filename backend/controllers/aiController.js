import axios from 'axios';

const OLLAMA_API_URL = 'http://localhost:11434/api/generate';
const MODEL_NAME = 'qwen2:latest';

export const chatWithAI = async (req, res) => {
  const { message } = req.body;

  if (!message || typeof message !== 'string') {
    return res.status(400).json({
      success: false,
      error: 'Message is required and must be a string',
    });
  }

  try {
    // system prompt for Qwen 2 - Comprehensive Application Assistant
    const systemPrompt = `You are "WellnessAI", the intelligent assistant for our Smart Headache Relief Headband system. You help users understand and use ALL features of the application, interpret their health data, and guide them through therapeutic protocols.

COMPLETE SYSTEM CAPABILITIES:

1. REAL-TIME MONITORING DASHBOARD:
   - Heart Rate (BPM): Normal range 60-100, alert if >100 or <60
   - Body Temperature (°C): Normal 36-37.5, alert if >37.5
   - Stress Level (0-3): 0=calm, 1=mild, 2=moderate, 3=high stress
   - All update every second via WebSocket real-time streaming

2. VIBRATION THERAPY SYSTEM:
   - Intensity: 0-100% adjustable (neurostimulation for headache relief)
   - Recommended levels: Mild headache (40-60%), Moderate (60-80%), Severe (80-100%)
   - Duration: 5-15 minutes per session
   - Science: Based on occipital nerve stimulation research (Cephalalgia 2022)

3. MUSIC THERAPY LIBRARY (8 Therapeutic Tracks):
   - "Weightless" - Most relaxing song (65% anxiety reduction in studies)
   - "Alpha Waves Meditation" - 432Hz healing frequency (pain relief + relaxation)
   - "Binaural Waves 11Hz" - Alpha wave entrainment (37min deep session)
   - "River Flows in You" (Yiruma) - Gentle piano for stress relief
   - "Nuvole Bianche" (Einaudi) - Calming minimalist composition
   - "Clair de Lune" (Debussy) - Classic relaxation masterpiece
   - "Moonlight Sonata" (Beethoven) - Soothing for deep calm
   - "Bach Suite No. 3" - Baroque for reducing tension

4. DEVICE COMMUNICATION:
   - Send commands to ESP32 headband
   - Receive status updates
   - Control therapy modes remotely

5. ADVANCED ANALYTICS:
   - Historical trend charts for heart rate, temperature, stress
   - Pattern recognition for headache triggers
   - Session effectiveness tracking

YOUR COMPREHENSIVE ROLE:

A) SENSOR INTERPRETATION:
   - Explain what current sensor readings mean
   - Alert if readings are concerning
   - Identify stress patterns
   - Suggest when intervention is needed

B) FEATURE GUIDANCE:
   - Explain how to use vibration controls
   - Guide through music player features
   - Help understand charts and trends
   - Troubleshoot connection issues
   - Show users how to navigate the app

C) THERAPEUTIC PROTOCOLS:
   - Design multi-modal therapy sessions (vibration + music + breathing)
   - Recommend intensity based on symptom severity
   - Suggest session duration
   - Create personalized relaxation routines

D) WELLNESS COACHING:
   - Breathing exercises (4-7-8, box breathing, diaphragmatic)
   - Progressive muscle relaxation techniques
   - Lifestyle tips (hydration, posture, screen time)
   - Headache prevention strategies
   - Stress management advice

E) MUSIC RECOMMENDATIONS:
   - Match tracks to symptoms and mood
   - Explain scientific benefits of each track
   - Create playlists for different needs (sleep, focus, pain relief)

F) GENERAL ASSISTANCE:
   - Answer questions about the headband device
   - Explain features and capabilities
   - Provide usage tips
   - Help interpret notifications

RESPONSE GUIDELINES:
- Keep responses under 3-4 sentences (brief but comprehensive)
- Be warm, empathetic, and CONCISE (2-3 sentences max for faster responses)
- Provide actionable guidance immediately
- Reference specific features/tracks/settings by name
- Combine multiple therapies when appropriate
- Keep responses under 120 words for speed
- Adapt tone to user's urgency (calm for questions, directive for pain)

EXAMPLE INTERACTIONS:

User: "What does my heart rate of 92 mean?"
You: "92 BPM is slightly elevated (stress/anxiety). Try vibration 50% + 'Weightless' music now. Deep breathing: inhale 4, hold 7, exhale 8."

User: "How do I use the vibration control?"
You: "Use slider in 'Therapy Controls' to set 0-100%, then click 'Activate'. Start at 40-60% for mild relief."

User: "I'm stressed but not in pain"
You: "Great for prevention! Vibration 30-40% + 'Binaural Waves 11Hz' + box breathing (inhale 4, hold 4, exhale 4, hold 4)."

User: "Device won't connect"
You: "Check headband power and green LED. Status bar shows connection. Demo mode works offline with simulated data."

Now respond to the user's message:`;

    const fullPrompt = `${systemPrompt}\n\nUser: ${message}\nWellnessAI:`;

    // Call Ollama API with optimized parameters
    const response = await axios.post(
      OLLAMA_API_URL,
      {
        model: MODEL_NAME,
        prompt: fullPrompt,
        stream: false,
        options: {
          temperature: 0.5, // Lower for faster, more focused responses
          top_p: 0.8,
          top_k: 20, // Reduced for faster token selection
          num_predict: 120, // Shorter responses = faster generation (2-3 sentences)
          repeat_penalty: 1.15,
          stop: ['\nUser:', '\nHuman:', 'User:', 'Human:', '\n\n\n'],
          num_ctx: 2048, // Smaller context window for faster processing
        },
      },
      {
        timeout: 30000, // 30 second timeout - 7B model is much faster
      }
    );

    const aiResponse = response.data.response.trim();

    console.log(`✅ Qwen 2: Response generated (${aiResponse.length} chars)`);

    res.json({
      success: true,
      response: aiResponse,
      model: MODEL_NAME,
      timestamp: Date.now(),
      tokens: response.data.eval_count || 0,
    });
  } catch (error) {
    console.error('❌ AI Error:', error.message);

    // Fallback responses if Ollama is unavailable - Comprehensive assistant responses
    const fallbackResponses = {
      'headache': 'Try the 4-7-8 breathing technique: Inhale for 4 counts, hold for 7, exhale for 8. Set vibration therapy to 60-80% using the slider in "Therapy Controls". I recommend listening to "Weightless" or "Alpha Waves Meditation" from our music player - proven to reduce pain.',
      'stress': 'Your stress readings suggest intervention. Set vibration to 40-50%, play "Binaural Waves 11Hz" for relaxed focus, and try box breathing: inhale 4, hold 4, exhale 4, hold 4. This multi-modal approach reduces stress before it triggers headaches.',
      'sensor': 'Your sensor dashboard shows real-time data updating every second: Heart rate (normal 60-100 BPM), temperature (normal 36-37.5°C), and stress level (0-3 scale). Values outside normal range suggest starting therapy.',
      'reading': 'Check your dashboard at the top - green values are normal, yellow indicates mild concern, red needs attention. If heart rate is elevated or stress is 2-3, activate vibration therapy and calming music.',
      'vibration': 'Use the slider in "Therapy Controls" to set intensity (0-100%). Recommended: mild headache 40-60%, moderate 60-80%, severe 80-100%. Click "Activate Vibration" to start. Sessions typically last 10-15 minutes.',
      'how': 'To use the app: Monitor sensors at top, control vibration therapy in "Therapy Controls", play therapeutic music in "Music Therapy" section, and ask me anything in this chat. All features work together for headache relief.',
      'music': 'For headache relief, I recommend: "Weightless" (reduces anxiety 65%), "Alpha Waves Meditation" (432Hz healing frequency), or classical pieces like "Clair de Lune" and "Nuvole Bianche". All available in our music player section!',
      'track': 'Start with "Weightless" - scientifically proven as the world\'s most relaxing song. For deeper meditation, try our binaural beats at 11Hz or 432Hz. Classical options include Debussy, Beethoven, and Yiruma.',
      'protocol': 'Complete relaxation protocol: 1) Check sensors, 2) Set vibration to 50%, 3) Play "Alpha Waves Meditation", 4) Do 4-7-8 breathing for 10 minutes. This combines neurostimulation, sound therapy, and breathwork.',
      'feature': 'Our app has: Real-time sensor monitoring (updates every second), vibration therapy control (0-100% intensity), music therapy (8 therapeutic tracks), historical charts (click "Advanced Analytics"), and device messaging.',
      'chart': 'Click "Advanced Analytics" below the sensor cards to expand historical trend charts. You\'ll see heart rate, temperature, and stress patterns over time to identify triggers.',
      'connect': 'Check the status bar at bottom - green means connected to backend, yellow means attempting reconnection. The app works in demo mode (simulated sensors) when hardware isn\'t connected.',
      'breathing': 'Box breathing is excellent: Inhale 4 counts, hold 4, exhale 4, hold 4. Repeat 5 times. Pair with "Binaural Waves 11Hz" to enhance relaxation. The headband vibration can guide your rhythm at 30-40%.',
      'sleep': 'Create a wind-down routine: dim lights, reduce screen time 1 hour before bed. Play "Moonlight Sonata" or "Clair de Lune" with gentle vibration at 30% for 15 minutes before sleep.',
      'relax': 'Start our relaxation protocol: Set vibration to 40-50%, play "Weightless" or "Alpha Waves Meditation", close your eyes, and do deep breathing. Relief typically starts in 3-5 minutes.',
    };

    // Find best fallback match with improved logic
    const messageLower = message.toLowerCase();
    let fallbackResponse = 'I recommend trying our vibration therapy on a low setting, taking deep breaths, and staying hydrated. If symptoms persist, consult a healthcare provider.';

    // Check for negative context first (e.g., "I don't have a headache")
    const hasNegation = /\b(no|not|don't|doesn't|never|without)\b/i.test(message);

    if (!hasNegation) {
      // Score each keyword by word boundary matches for better accuracy
      let bestMatch = { keyword: null, score: 0 };

      for (const [keyword, response] of Object.entries(fallbackResponses)) {
        // Use word boundary regex for better matching
        const regex = new RegExp(`\\b${keyword}\\w*\\b`, 'i');
        if (regex.test(message)) {
          // Prioritize exact matches over partial matches
          const exactMatch = messageLower.includes(keyword);
          const score = exactMatch ? 2 : 1;
          if (score > bestMatch.score) {
            bestMatch = { keyword, score };
            fallbackResponse = response;
          }
        }
      }
    }

    res.json({
      success: true,
      response: fallbackResponse,
      model: 'fallback',
      timestamp: Date.now(),
      note: 'Using fallback response (Ollama unavailable)',
    });
  }
};

export const getAIStatus = (req, res) => {
  axios
    .get('http://localhost:11434/api/tags', { timeout: 5000 })
    .then((response) => {
      res.json({
        success: true,
        available: true,
        models: response.data.models || [],
      });
    })
    .catch(() => {
      res.json({
        success: true,
        available: false,
        message: 'Ollama not running - using fallback responses',
      });
    });
};

