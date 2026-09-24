# Voice recording script

Read this aloud once, straight through, in one take. Two to three minutes.

## Before you start

- **Quiet room.** No fan, no AC, no traffic. Close the window.
- **Phone is fine.** Hold it about a hand's width from your mouth, slightly off to the
  side so your breath doesn't hit the mic. A wired earphone mic works well too.
- **Record one long take.** Don't stop and restart. If you stumble, pause for a second
  and say the sentence again — the clone handles that fine.
- **Talk, don't read.** This matters more than the audio quality. If it sounds like a
  news bulletin, the clone will sound like a news bulletin.
- Save as WAV or the highest-quality M4A your recorder offers.

---

## The script

> Hi, I'm Mahesh. I build AI products that businesses actually use.

> Most of what I've learned came from putting something in front of real people and
> watching where it broke. That's a very different education from building things that
> only ever run on your own laptop.

> Right now I'm working with a car dealership in Pune. Their problem was simple to
> describe and annoying to solve: people were messaging on WhatsApp at eleven at night,
> nobody was answering, and by morning those buyers had gone somewhere else.

> So I built an assistant that picks it up. It handles text, it handles voice notes in
> Hinglish, and it handles photos — because that's how people actually message. Someone
> sends a picture of a car they saw on the road and asks, what is this, do you have it?

> Here's the part I find interesting. When somebody says "under six lakh", a search engine
> that only understands meaning will happily hand back a car costing six lakh forty
> thousand, because the sentence is close enough. But close is wrong. Six forty is not
> under six. So the meaning search narrows things down, and then the database enforces the
> number exactly.

> I've also built a voice agent that answers the phone. Real-time voice is unforgiving —
> every mistake you make in the architecture shows up as an awkward pause the caller can
> hear.

> My favourite bug was this one. When a caller interrupted, the bot kept talking over them.
> I stopped the model from generating, and it still kept talking. It took me a while to
> realise the audio that was already queued up was still playing. Stopping the speaker
> isn't the same as emptying the queue.

> Before that, I rebuilt how my college runs its blood donation drives. It used to be paper
> forms and a queue. Now it's an actual system, and it's been used by hundreds of donors.

> I'm in my final year of Information Technology at PICT, Pune. Last year my team won first
> prize at the MVPM Hackathon — one lakh rupees — for the dealership assistant.

> If you're building something that has to work in the real world, not just in a demo,
> I'd like to hear about it.

> You can reach me by email, or find me on GitHub and LinkedIn. Thanks for listening.

---

## Why it's written this way

The clone learns from variety, so the script mixes short sentences with long ones,
statements with questions, plain speech with numbers and names. Reading about your own work
also makes you sound like yourself, which no amount of audio quality can fake.

If you want to change the wording, keep roughly this length and keep the numbers and proper
nouns — "six lakh forty thousand", "Hinglish", "PICT", "MVPM" — since those teach the clone
how you say the things it will need to say later.
