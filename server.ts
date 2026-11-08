import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = parseInt(process.env.PORT || '3000', 10);

app.use(express.json());

// Initialize Gemini SDK with User-Agent header as required by guidelines
const apiKey = process.env.GEMINI_API_KEY;
const isValidKey = Boolean(apiKey && apiKey !== 'MY_GEMINI_API_KEY' && apiKey.trim().length > 10);
let ai: GoogleGenAI | null = null;
if (isValidKey && apiKey) {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Built-in comprehensive Knowledge Base fallback if API key is absent or offline
function generateFallbackResponse(userPrompt: string, context?: any): string {
  const q = userPrompt.toLowerCase();
  
  if (q.includes('who are you') || q.includes('name') || q.includes('zari')) {
    return "Habari! I am **Zari**, your personal AI investor concierge on HavenShare. My purpose is to guide you step-by-step through our high-yield real estate plans, answer any FAQs, explain platform rules, and ensure you never get stuck while growing your wealth!";
  }
  
  if (q.includes('plan') || q.includes('fakeer') || q.includes('habibi') || q.includes('dubaj') || q.includes('hamza') || q.includes('invest') || q.includes('levels') || q.includes('tier')) {
    return "### HavenShare Investment Plans Overview:\n\n" +
      "1. **Level 1: Al-fakeer**\n   - **Capital:** KSh 1,000\n   - **Daily Return:** KSh 100/day for 60 days\n   - **Total Payout:** KSh 6,000 (500% Net ROI)\n\n" +
      "2. **Level 2: Habibi**\n   - **Capital:** KSh 5,000\n   - **Daily Return:** KSh 300/day for 60 days\n   - **Total Payout:** KSh 18,000 (260% Net ROI)\n\n" +
      "3. **Level 3: Dubaj**\n   - **Capital:** KSh 10,000\n   - **Daily Return:** KSh 500/day for 72 days\n   - **Total Payout:** KSh 36,000 (260% Net ROI)\n\n" +
      "4. **VIP 1: Hamza**\n   - **Capital:** KSh 20,000\n   - **Daily Return:** KSh 1,000/day for 70 days\n   - **Total Payout:** KSh 70,000 (250% Net ROI)\n\n" +
      "⚠️ **Important Policy:** You can subscribe to **only one plan at a time**. Once active, you must wait until full contract maturity before subscribing again.";
  }

  if (q.includes('task') || q.includes('video') || q.includes('daily return') || q.includes('claim') || q.includes('accumulate') || q.includes('forfeit') || q.includes('24 hour') || q.includes('watch')) {
    return "### Daily Video Tasks & Return Accumulation:\n\n" +
      "- **The Rule:** Every 24 hours, you must watch **2 short inspirational & financial videos**.\n" +
      "- **Earning Returns:** Only after finishing both videos does your daily return accumulate to your cash wallet balance.\n" +
      "- **24-Hour Wait Window:** Once claimed, you must wait 24 hours for tomorrow's task.\n" +
      "- **Forfeiture Penalty:** If you skip the task or let the 24-hour cycle expire without watching both videos, **that day's daily return is permanently forfeited**.\n" +
      "- **No Admin Oversight Needed:** The system enforces this automatically—if you skip, the money simply does not reflect on your balance.";
  }

  // Specific Quick Reply Actions
  if (q.includes('check withdrawal') || q.includes('withdrawal status')) {
    if (context && context.pendingWithdrawalsCount > 0) {
      return "### Live M-Pesa Withdrawal Status:\n\n" +
        `- **Pending Queue:** You currently have **${context.pendingWithdrawalsCount} withdrawal(s)** in the 12-hour allocation queue.\n` +
        "- **12-Hour Allocation Rule:** The admin has full authority to grant access at **any moment within the 12-hour timeframe** without waiting for the 12 hours to elapse.\n" +
        `- **Available Balance:** KSh ${(context.walletBalanceKsh || 0).toLocaleString()}\n` +
        "- **Action:** Once granted by admin, your status will immediately update to **'Allocation Successful & Disbursed to M-Pesa'**.\n\n" +
        "Would you like to open your Cash Wallet to inspect the live queue?";
    } else if (context && context.grantedWithdrawalsCount > 0) {
      return "### Live M-Pesa Withdrawal Status:\n\n" +
        "- **Status:** **✓ Allocation Successful & Disbursed to M-Pesa!**\n" +
        "- Your withdrawal was granted by admin within the 12-hour allocation window and payment was disbursed.\n" +
        `- **Available Wallet Balance:** KSh ${(context.walletBalanceKsh || 0).toLocaleString()}\n\n` +
        "You can view the full disbursement ledger in your Cash Wallet.";
    } else {
      return "### Live M-Pesa Withdrawal Status:\n\n" +
        "- You currently have **no pending withdrawals** in the allocation queue.\n" +
        `- **Available Cash Balance:** KSh ${(context?.walletBalanceKsh || 0).toLocaleString()}\n` +
        "- You can request an M-Pesa withdrawal at any time from your Cash Wallet modal. Withdrawals enter a 12-hour allocation window where the admin can grant access at any time.";
    }
  }

  if (q.includes('plan maturity') || q.includes('maturity date') || q.includes('when does my plan mature')) {
    if (context && context.hasActiveSubscription) {
      return "### Plan Maturity & Contract Timeline:\n\n" +
        `- **Active Plan:** **${context.activePlanName}**\n` +
        `- **Contract Number:** \`${context.activeContractNumber || 'HDC-ACTIVE'}\`\n` +
        `- **Contract Start Date:** ${context.activeContractStartDate || 'Active'}\n` +
        `- **Maturity Date:** **${context.activeContractMaturityDate || 'Active'}**\n` +
        `- **Elapsed Time:** ${context.activeContractDaysElapsed || 0} days\n` +
        `- **Days Remaining to Full Maturity:** **${context.activeContractDaysRemaining || 0} days**\n` +
        `- **Daily Return Rate:** KSh ${(context.activeContractDailyReturnKsh || 0).toLocaleString()}/day\n` +
        `- **Total Accumulated Return:** KSh ${(context.activeContractAccumulatedKsh || 0).toLocaleString()}\n\n` +
        `⚠️ **Single Plan Policy:** Under platform rules, you can subscribe to only one plan at a time. Once this contract reaches maturity in **${context.activeContractDaysRemaining || 0} days**, you can reinvest or activate a new tier!`;
    } else {
      return "### Plan Maturity & Contract Timeline:\n\n" +
        "- You currently **do not have an active subscription**.\n" +
        "- Once you subscribe to an offering (Al-fakeer for 60 days, Habibi for 60 days, Dubaj for 72 days, or Hamza for 70 days), you can track your exact maturity countdown right here!\n\n" +
        "Would you like to explore available investment plans in the Marketplace?";
    }
  }

  if (q.includes('how to referral') || q.includes('how to refer') || q.includes('referral program') || q.includes('referral bonus') || q.includes('invite code')) {
    const code = context?.userReferralCode || 'HDC-DAVID-8942';
    return "### How to Use the 10% Referral Program:\n\n" +
      `1. **Your Unique Referral Code:** \`${code}\`\n` +
      "2. **Share with Fellow Investors:** Send your referral code or direct invite link to colleagues, friends, and family.\n" +
      "3. **Earn 10% Cash Commission:** When your referee signs up and activates any investment plan, you receive **10% of their invested capital** directly into your cash wallet:\n" +
      "   - Referee activates **Level 1 Al-fakeer (1k)** → You earn **+KSh 100**\n" +
      "   - Referee activates **Level 2 Habibi (5k)** → You earn **+KSh 500**\n" +
      "   - Referee activates **Level 3 Dubaj (10k)** → You earn **+KSh 1,000**\n" +
      "   - Referee activates **VIP 1 Hamza (20k)** → You earn **+KSh 2,000**\n" +
      "4. **Instant Access:** Referral rewards can be withdrawn to Safaricom M-Pesa immediately or reinvested!\n\n" +
      "You can open the **Referral Program** modal to copy your share link or review credited payouts.";
  }

  if (q.includes('stuck') || q.includes('help') || q.includes('guide') || q.includes('start') || q.includes('how to')) {
    return "### Quick Guidance — 3 Simple Steps to Get Started:\n\n" +
      "1. **Explore & Subscribe:** Browse the **Marketplace** tab, choose your preferred tier (Al-fakeer, Habibi, Dubaj, or Hamza), and activate your contract via M-Pesa.\n" +
      "2. **Complete Daily Tasks:** Open your **Profile Menu > Daily Tasks** every day, watch the two short financial wisdom videos, and claim your daily return to your Cash Wallet.\n" +
      "3. **Withdraw Returns:** Open your **Cash Wallet** anytime to request payout directly to your Safaricom M-Pesa line!\n\n" +
      "What specific step are you on right now? I can walk you through it!";
  }

  return "I'm here to help with all HavenShare questions! You can ask me about:\n" +
    "- **Investment Plans & Daily Yields** (Al-fakeer, Habibi, Dubaj, Hamza)\n" +
    "- **Daily Tasks Course & 24h Gating Rules**\n" +
    "- **M-Pesa Withdrawals & the 12-Hour Allocation System**\n" +
    "- **The 10% Referral Program**\n" +
    "- **Account verification and troubleshooting**\n\n" +
    "How can I assist you right now?";
}

// Zari Chat Endpoint
app.post('/api/zari/chat', async (req, res) => {
  try {
    const { message, history, context } = req.body;
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message string is required' });
    }

    if (!ai) {
      const fallback = generateFallbackResponse(message, context);
      return res.json({ response: fallback, source: 'knowledge_base' });
    }

    const systemInstruction = `You are Zari, the intelligent, warm, inspiring, and empowering AI investor concierge for HavenShare (a fractional real estate investment platform in Kenya).
Your task is answering investor FAQs, providing step-by-step guidance whenever an investor is stuck, clarifying platform policies, and helping investors build long-term wealth.

PLATFORM FACTS (Strict Source of Truth):
1. Investment Plans:
   - Level 1: Al-fakeer | Capital: KSh 1,000 | Daily Return: KSh 100/day | Period: 60 Days | Total Return: KSh 6,000 (500% net ROI)
   - Level 2: Habibi | Capital: KSh 5,000 | Daily Return: KSh 300/day | Period: 60 Days | Total Return: KSh 18,000 (260% net ROI)
   - Level 3: Dubaj | Capital: KSh 10,000 | Daily Return: KSh 500/day | Period: 72 Days | Total Return: KSh 36,000 (260% net ROI)
   - VIP 1: Hamza | Capital: KSh 20,000 | Daily Return: KSh 1,000/day | Period: 70 Days | Total Return: KSh 70,000 (250% net ROI)

2. Core Platform Rules:
   - ONE PLAN AT A TIME: A user can subscribe only once to any plan. After subscribing, the investor must wait until maturity before subscribing again. No concurrent plans.
   - DAILY TASKS: A user watches two short inspirational/financial videos every day in the Daily Tasks course. After completion, the daily return is accumulated to their cash wallet balance, and they wait 24 hours for tomorrow's task.
   - SELF-ENFORCING FORFEITURE: Admin does not monitor task completion. If a user skips a task or the 24-hour window expires, the daily return is forfeited and does not reflect on their balance.
   - M-PESA WITHDRAWALS & 12-HOUR ALLOCATION: Withdrawals enter a 12-hour allocation queue. The admin can grant access at ANY TIME within the 12-hour window without waiting for 12 hours to finish. Once granted, the status displays "Allocation Successful & Disbursed to M-Pesa". A 12-hour cooldown applies.
   - 10% REFERRAL COMMISSION: Referrers get an instant 10% cash bonus of their referee's capital invested credited directly to their cash wallet.
   - Super Admin: David Kivunja.

CURRENT INVESTOR CONTEXT:
${context ? JSON.stringify(context, null, 2) : 'No investor context passed.'}

TONE:
- Welcoming, professional, articulate, encouraging.
- Kenyan financial context aware (KSh, M-Pesa, Safaricom).
- Use clear bullet points and bolding for readability.
- If an investor is stuck, provide proactive step-by-step navigation instructions.`;

    const chatContents: any[] = [];
    if (Array.isArray(history)) {
      for (const h of history.slice(-6)) {
        chatContents.push({
          role: h.role === 'user' ? 'user' : 'model',
          parts: [{ text: h.content }],
        });
      }
    }
    chatContents.push({
      role: 'user',
      parts: [{ text: message }],
    });

    let replyText: string | undefined;
    if (ai) {
      let timer: NodeJS.Timeout | null = null;
      try {
        const timeoutPromise = new Promise<never>((_, reject) => {
          timer = setTimeout(() => reject(new Error('Gemini API request exceeded 30s timeout')), 30000);
        });
        const geminiPromise = ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: chatContents,
          config: {
            systemInstruction,
            temperature: 0.7,
          },
        });
        const response = await Promise.race([geminiPromise, timeoutPromise]);
        if (timer) clearTimeout(timer);
        replyText = response.text;
      } catch {
        if (timer) clearTimeout(timer);
        replyText = generateFallbackResponse(message, context);
      }
    } else {
      replyText = generateFallbackResponse(message, context);
    }

    return res.json({
      response: replyText || generateFallbackResponse(message, context),
      source: ai ? 'gemini' : 'knowledge_base',
    });
  } catch (err: any) {
    console.error('Zari chat error:', err);
    // Graceful fallback to guarantee user gets helpful answer
    const fallback = generateFallbackResponse(req.body.message || '', req.body.context);
    return res.json({ response: fallback, source: 'fallback_after_error' });
  }
});

async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: process.env.DISABLE_HMR !== 'true' },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${port}`);
  });
}

startServer();
