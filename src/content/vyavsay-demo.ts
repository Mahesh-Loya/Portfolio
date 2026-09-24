/**
 * A playable reconstruction of the Vyavsay Assist copilot.
 *
 * The real product runs on a dealer's live inventory over the WhatsApp Business
 * API, so it cannot be embedded here. This reproduces the flow the dealership
 * actually sees: a customer messages after hours, the assistant understands
 * text, a Hinglish voice note or a photo, and the CRM fills in behind it.
 *
 * Every reply is scripted. Nothing here calls a model.
 */

export type MessageKind = "text" | "voice" | "image";

export type Message = {
  id: string;
  from: "customer" | "assistant";
  kind: MessageKind;
  /** The text shown in the bubble, or the transcript for a voice note. */
  body: string;
  /** Voice notes only: how long the clip runs. */
  duration?: string;
  /** Image messages only: the filename shown under the photo. */
  filename?: string;
  /** What the assistant is doing while the typing indicator shows. */
  working?: string;
  /** Milliseconds the typing indicator holds before this message lands. */
  typingMs?: number;
};

export type CrmPatch = {
  status?: string;
  intent?: string;
  interest?: string;
  budget?: string;
  matched?: { label: string; price: string; km: string }[];
  appointment?: string;
  /** Appended to the running activity log. */
  event?: string;
};

export type Choice = {
  id: string;
  /** What the visitor sees on the button. */
  label: string;
  kind: MessageKind;
  /** The message that gets sent when they choose it. */
  send: Omit<Message, "id" | "from">;
  next: string;
};

export type Step = {
  id: string;
  /** Assistant messages, in order, after the customer's message. */
  replies: Message[];
  crm: CrmPatch;
  choices: Choice[];
};

export const openingMessages: Message[] = [
  {
    id: "open-1",
    from: "assistant",
    kind: "text",
    body: "Namaste! Girija Motors mein aapka swagat hai. Showroom abhi band hai, par main aapki poori help kar sakta hoon. Kya dhoondh rahe hain?",
  },
];

export const initialCrm = {
  status: "New",
  customer: "+91 98••• ••210",
  intent: "—",
  interest: "—",
  budget: "—",
  matched: [] as { label: string; price: string; km: string }[],
  appointment: "—",
  events: ["23:41 · Inbound message, outside business hours"],
};

export const openingChoices: Choice[] = [
  {
    id: "c-text",
    label: "Send a text",
    kind: "text",
    send: { kind: "text", body: "Bhai Fortuner ka price kya hai?" },
    next: "s-fortuner",
  },
  {
    id: "c-voice",
    label: "Send a voice note",
    kind: "voice",
    send: {
      kind: "voice",
      body: "Mujhe family ke liye ek gaadi chahiye, budget around 8 lakh. Diesel ho toh better.",
      duration: "0:09",
    },
    next: "s-voice",
  },
  {
    id: "c-photo",
    label: "Send a photo",
    kind: "image",
    send: {
      kind: "image",
      body: "Ye wali gaadi chahiye. Kya hai ye?",
      filename: "IMG_20260924_2343.jpg",
    },
    next: "s-photo",
  },
];

export const steps: Step[] = [
  {
    id: "s-fortuner",
    replies: [
      {
        id: "r-f1",
        from: "assistant",
        kind: "text",
        body: "Fortuner abhi do available hain. 2021 4x2 AT — ₹33.5L, 42,000 km chali hui. Aur 2019 4x4 MT — ₹28.9L, 61,000 km. Dono single owner.",
        working: "Searching inventory",
        typingMs: 1400,
      },
    ],
    crm: {
      status: "Engaged",
      intent: "Price enquiry",
      interest: "Toyota Fortuner",
      matched: [
        { label: "2021 Fortuner 4x2 AT", price: "₹33.5L", km: "42,000 km" },
        { label: "2019 Fortuner 4x4 MT", price: "₹28.9L", km: "61,000 km" },
      ],
      event: "23:41 · Intent classified — price enquiry, Fortuner",
    },
    choices: [
      {
        id: "c-td",
        label: "Ask for a test drive",
        kind: "text",
        send: { kind: "text", body: "Test drive kab kar sakta hoon?" },
        next: "s-book",
      },
      {
        id: "c-emi",
        label: "Ask about EMI",
        kind: "text",
        send: { kind: "text", body: "EMI kitni banegi 33.5 pe?" },
        next: "s-emi",
      },
    ],
  },
  {
    id: "s-voice",
    replies: [
      {
        id: "r-v1",
        from: "assistant",
        kind: "text",
        body: "Samajh gaya — family car, 8 lakh tak, diesel preference. Teen gaadiyan fit hoti hain: 2021 Nexon XZ+ diesel ₹7.9L, 2020 Ertiga VDi ₹7.6L, aur 2019 Creta SX ₹7.95L.",
        working: "Transcribing Hinglish · matching inventory",
        typingMs: 2000,
      },
      {
        id: "r-v2",
        from: "assistant",
        kind: "text",
        body: "Ertiga 7-seater hai, family ke liye sabse practical rahegi. Photos bhej doon?",
        typingMs: 900,
      },
    ],
    crm: {
      status: "Engaged",
      intent: "Discovery — family vehicle",
      interest: "Diesel, 7-seater preference",
      budget: "≤ ₹8,00,000",
      matched: [
        { label: "2021 Tata Nexon XZ+ diesel", price: "₹7.9L", km: "38,000 km" },
        { label: "2020 Maruti Ertiga VDi", price: "₹7.6L", km: "52,000 km" },
        { label: "2019 Hyundai Creta SX", price: "₹7.95L", km: "47,000 km" },
      ],
      event: "23:41 · Voice note transcribed — Hinglish, budget extracted",
    },
    choices: [
      {
        id: "c-td2",
        label: "Ask for a test drive",
        kind: "text",
        send: { kind: "text", body: "Ertiga dekhni hai. Kal aa sakta hoon?" },
        next: "s-book",
      },
      {
        id: "c-emi2",
        label: "Ask about EMI",
        kind: "text",
        send: { kind: "text", body: "Ertiga pe EMI kitni hogi?" },
        next: "s-emi",
      },
    ],
  },
  {
    id: "s-photo",
    replies: [
      {
        id: "r-p1",
        from: "assistant",
        kind: "text",
        body: "Photo se lag raha hai ye Hyundai Creta hai, 2020–2023 facelift. Humare paas 2021 Creta SX(O) hai — ₹12.4L, 39,000 km, single owner.",
        working: "Reading photo · identifying make and model",
        typingMs: 2200,
      },
    ],
    crm: {
      status: "Engaged",
      intent: "Identify vehicle from photo",
      interest: "Hyundai Creta",
      matched: [{ label: "2021 Hyundai Creta SX(O)", price: "₹12.4L", km: "39,000 km" }],
      event: "23:42 · Photo processed — make and model identified",
    },
    choices: [
      {
        id: "c-td3",
        label: "Ask for a test drive",
        kind: "text",
        send: { kind: "text", body: "Isko dekhna hai. Kal time milega?" },
        next: "s-book",
      },
      {
        id: "c-emi3",
        label: "Ask about EMI",
        kind: "text",
        send: { kind: "text", body: "Iski EMI kya banegi?" },
        next: "s-emi",
      },
    ],
  },
  {
    id: "s-emi",
    replies: [
      {
        id: "r-e1",
        from: "assistant",
        kind: "text",
        body: "20% down payment pe, 5 saal ke liye approx ₹24,800/month aata hai. Exact figure bank approval pe depend karega — woh main sales team se confirm karwa dunga.",
        working: "Calculating",
        typingMs: 1200,
      },
    ],
    crm: {
      intent: "Finance enquiry",
      event: "23:43 · Finance question — indicative EMI shared",
    },
    choices: [
      {
        id: "c-td4",
        label: "Ask for a test drive",
        kind: "text",
        send: { kind: "text", body: "Theek hai. Test drive kab ho sakta hai?" },
        next: "s-book",
      },
    ],
  },
  {
    id: "s-book",
    replies: [
      {
        id: "r-b1",
        from: "assistant",
        kind: "text",
        body: "Kal ke slots khaali hain: 11:00 AM, 2:30 PM ya 5:00 PM. Kaunsa theek rahega?",
        working: "Checking calendar",
        typingMs: 1100,
      },
    ],
    crm: {
      intent: "Test drive request",
      event: "23:44 · Availability offered",
    },
    choices: [
      {
        id: "c-slot",
        label: "Pick 11:00 AM",
        kind: "text",
        send: { kind: "text", body: "Kal 11 baje theek rahega" },
        next: "s-done",
      },
    ],
  },
  {
    id: "s-done",
    replies: [
      {
        id: "r-d1",
        from: "assistant",
        kind: "text",
        body: "Confirm ✅ Kal 11:00 AM test drive book kar diya. Showroom address bhej raha hoon. Subah ek reminder bhi aayega.",
        working: "Booking appointment",
        typingMs: 1300,
      },
      {
        id: "r-d2",
        from: "assistant",
        kind: "text",
        body: "Sales team ko bhi bata diya hai — koi aur sawaal ho toh yahin pooch lijiye.",
        typingMs: 900,
      },
    ],
    crm: {
      status: "Qualified",
      appointment: "Tomorrow, 11:00 AM",
      event: "23:44 · Appointment booked · handed to sales team",
    },
    choices: [],
  },
];

/** Shown under the demo so nobody mistakes a reconstruction for the live system. */
export const demoDisclosure =
  "A scripted reconstruction of the real copilot. The production system runs on the dealer's live inventory over the WhatsApp Business API, which can't be embedded here.";
