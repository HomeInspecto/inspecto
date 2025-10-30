import { Request, Response } from 'express';
import { CohereClientV2 } from 'cohere-ai';

const cohere = new CohereClientV2({
  token: process.env.COHERE_API_KEY || 'your-api-key-here',
});

/**
 * @swagger
 * /api/polish:
 *   post:
 *     summary: Polish a transcription into structured observation
 *     description: Takes raw transcription text and converts it into a structured observation format
 *     tags:
 *       - Polish
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               transcription:
 *                 type: string
 *                 description: Raw transcription text
 *                 example: "gutters are clogged with leaves"
 *     responses:
 *       '200':
 *         description: Successfully polished
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 observation:
 *                   type: object
 *                 message:
 *                   type: string
 *       '400':
 *         description: Missing transcription field
 *       '500':
 *         description: Server error
 */
export const polishTranscription = async (req: Request, res: Response) => {
  try {
    const { transcription } = req.body;

    if (!transcription) {
      return res.status(400).json({ error: 'transcription field is required' });
    }

    // Use AI to structure the transcription
    const polishedData = await polishWithAI(transcription);

    return res.json({
      observation: polishedData,
      message: 'Transcription polished successfully',
    });
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ error: err.message || 'server_error' });
  }
};

/**
 * @swagger
 * /api/repolish:
 *   post:
 *     summary: Re-polish with additional instructions
 *     description: Takes existing observation and applies modifications based on user instruction
 *     tags:
 *       - Polish
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               transcription:
 *                 type: string
 *                 description: Original transcription text
 *                 example: "gutters are clogged with leaves"
 *               currentObservation:
 *                 type: object
 *                 description: Current observation object (optional)
 *                 properties:
 *                   description:
 *                     type: string
 *                   implications:
 *                     type: string
 *                   recommendation:
 *                     type: string
 *                   severity:
 *                     type: string
 *               instruction:
 *                 type: string
 *                 description: Modification instruction
 *                 example: "make it shorter"
 *     responses:
 *       '200':
 *         description: Successfully re-polished
 *       '400':
 *         description: Missing required fields
 *       '500':
 *         description: Server error
 */

// At the top of repolishTranscription function
export const repolishTranscription = async (req: Request, res: Response) => {
  try {
    const { transcription, currentObservation, instruction } = req.body;

    if (!transcription) {
      return res.status(400).json({ error: 'transcription field is required' });
    }

    if (!instruction) {
      return res.status(400).json({ error: 'instruction field is required' });
    }

    //check if user wants no changes
    const keepSameKeywords = ['keep it the same', 'dont change', "don't change", 'no change', 'keep same'];
    const shouldKeepSame = keepSameKeywords.some(keyword => 
      instruction.toLowerCase().includes(keyword)
    );

    if (shouldKeepSame && currentObservation) {
      // Just return the current observation without AI call
      return res.json({
        observation: currentObservation,
        message: 'Observation kept the same',
      });
    }

    // Re-polish with instruction and current observation
    const polishedData = await polishWithAI(transcription, instruction, currentObservation);

    return res.json({
      observation: polishedData,
      message: 'Observation re-polished successfully',
    });
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ error: err.message || 'server_error' });
  }
};

// Helper function to polish with AI
async function polishWithAI(
  transcription: string,
  instruction?: string,
  currentObservation?: any
): Promise<{
  description: string;
  implications: string;
  recommendation: string;
  severity: 'critical' | 'medium' | 'low';
}> {
  let prompt = `You are a home inspection report expert. Convert the following observation into a structured format.

Context: This is from a home inspection. The inspector verbally described an issue.

Original transcription: "${transcription}"`;

  if (currentObservation && instruction) {
    prompt += `\n\nCurrent observation:
Description: ${currentObservation.description}
Implications: ${currentObservation.implications}
Recommendation: ${currentObservation.recommendation}
Severity: ${currentObservation.severity}

Instruction: ${instruction}

Please modify the observation according to the instruction while keeping it professional and accurate.`;
  } else if (instruction) {
    prompt += `\n\nAdditional instruction: ${instruction}

Please apply this instruction while keeping the observation professional and accurate.`;
  }

  prompt += `\n\nProvide the response in this EXACT JSON format (no markdown, no code blocks, just raw JSON):
{
  "name": "Brief title of the issue (3-6 words)",
  "description": "What was observed (1-2 sentences)",
  "implications": "Why this matters and potential consequences (1-2 sentences)",
  "recommendation": "What should be done about it (1-2 sentences)",
  "severity": "critical, medium, or low"
}

Guidelines:
- Description: Observable facts only
- Implications: Explain the risks or consequences
- Recommendation: Specific action items
- Severity: 
  * critical = immediate safety hazard or major damage risk
  * medium = should be addressed soon, moderate risk
  * low = minor issue, cosmetic, or maintenance item

Return ONLY the JSON object, nothing else.`;

  const response = await cohere.chat({
    model: process.env.COHERE_MODEL || 'command-a-03-2025',
    messages: [{ role: 'user', content: prompt }],
    maxTokens: 600,
    temperature: 0.3,
  });

  const responseText = (response?.message?.content ?? [])
    .filter(
      (p): p is { type: 'text'; text: string } =>
        Boolean(p) && (p as any).type === 'text' && typeof (p as any).text === 'string'
    )
    .map((p) => p.text)
    .join('')
    .trim();

  // Parse JSON
  let parsed;
  try {
    const cleaned = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    parsed = JSON.parse(cleaned);
  } catch (parseError) {
    console.error('Failed to parse AI response:', responseText);
    throw new Error('AI returned invalid JSON format');
  }

  // Validate
  if (!parsed.description || !parsed.implications || !parsed.recommendation || !parsed.severity) {
    throw new Error('AI response missing required fields');
  }

  if (!['critical', 'medium', 'low'].includes(parsed.severity)) {
    parsed.severity = 'medium';
  }

  return parsed;
}