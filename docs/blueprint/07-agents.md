# 07 · The seven agents

---

## 1 · Why seven, and what makes it real

"Multi-agent" is easy to claim and hard to defend. What makes this architecture real rather than seven prompts in a trenchcoat: **each agent has different inputs, different outputs, and different failure modes**, and **Safety runs independently and in parallel** so the conversational agent cannot be talked out of firing it.

That last point is the architectural argument. Separation of concerns here is a **safety property, not an engineering preference**. A single model that both befriends the student and judges their risk will, under pressure, choose to be kind rather than accurate.

---

## 2 · The seven

### Companion — conversation

The one the student talks to. Warm, unhurried, remembers what was said last week. Handles the daily check-in acknowledgement and any conversation the student starts.

| | |
|---|---|
| **In** | Free text, transcribed voice notes, conversation history, relevant recent signals |
| **Out** | Replies, follow-up questions |
| **Fails as** | Too clinical, or too agreeable |

**Never diagnoses, never names a condition, never gives medication advice.**

### Signal — structured extraction

Reads everything the student writes and pulls out observable facts: hours slept, appetite, energy, whether they left their room, social contact, somatic complaints, self-worth language, substance mentions. **Produces a record, not an interpretation.**

| | |
|---|---|
| **In** | Raw conversation text, check-in notes |
| **Out** | Typed daily record → `signals` table |
| **Fails as** | Over-reading a throwaway line |

### Trend — longitudinal memory

Owns the mood meter. Holds each student's baseline and watches for **slope, not state**. This is where *"your sleep has been slipping for eleven days, and that usually comes before a bad stretch for you"* comes from.

| | |
|---|---|
| **In** | Daily records over time |
| **Out** | Baseline, drift score, named patterns, the weekly insight sentence |
| **Fails as** | Noise mistaken for decline |

The single most valuable agent, and the hardest to fake in a demo — which is why the current fixture is a hardcoded six-week array.

### Screening — validated instruments

Administers standard questionnaires **conversationally**, one item at a time, rather than as a wall of radio buttons — PHQ-9, GAD-7, ISI for sleep, DASS-21 for the baseline. Crucially it decides **when** to screen based on drift, instead of nagging weekly.

| | |
|---|---|
| **In** | Drift signal, time since last screen |
| **Out** | Instrument scores, sub-scores |
| **Fails as** | Screening too often, or too late |

Scores are recorded for the counsellor; **the student sees plain language, never a label**. PHQ-9 item 9 routes through Safety before anything else happens.

### Care — preliminary support

Delivers structured, evidence-backed self-help: behavioural activation, sleep scheduling, worry postponement, grounding, cognitive reframing. Five to ten minutes, conversationally guided, one thing at a time. **Prescribed by Trend, delivered through Companion's voice.**

| | |
|---|---|
| **In** | Drift pattern, what worked before |
| **Out** | A module, an exercise, a small task |
| **Fails as** | Homework nobody does |

Call it **guided self-help**, never "AI therapy" — that phrase is a clinical and legal problem, and it is not what this is.

### Safety — runs on every message

Reads every single message **independently, in parallel, before anything else responds**. Looks for self-harm intent, hopelessness, means and plan, abuse disclosure, acute crisis. **Its verdict cannot be overridden by any other agent.** Fires the tier-3 protocol on its own authority.

| | |
|---|---|
| **In** | Every message, unfiltered |
| **Out** | Risk verdict, protocol trigger |
| **Fails as** | A miss. **Design for false positives.** |

> A tier-3 that turns out to be nothing costs a student five awkward minutes. A tier-3 that was missed costs something you cannot undo. Tune accordingly, and say so out loud when someone asks about accuracy.

### Referral — the handoff

Owns the moment the app stops being enough. Matches the student to the right counsellor, offers real appointment slots, writes the one-page clinical brief, and — the part everyone forgets — **follows up afterwards** to find out whether they actually went, and gently re-offers if they didn't.

| | |
|---|---|
| **In** | Tier decision, full history |
| **Out** | Booking, clinical brief, follow-up |
| **Fails as** | A dead end after "see someone" |

---

## 3 · How they fit together

```
                         THE DAILY LOOP
   ┌──────────────────────────────────────────────────────┐
   │                                                      │
   │   Signal ──────► Screening                           │
   │      ▲              │                                │
   │      │              ▼                                │
 Student ─┼──► Companion ──► Trend ──► Care               │
   ▲      │       ▲                      │                │
   │      └───────┴──────────────────────┘                │
   │                                                      │
   └──────────────────────────┬───────────────────────────┘
                              │
                              ▼
                          Referral ──────► counsellor
                              ▲
        ┌─────────────────────┘
        │  fires directly, on its own authority
   ┌────┴──────────────────────────────────────────────┐
   │  SAFETY                                           │
   │  reads every message · independent · not overridable │
   └───────────────────────────────────────────────────┘
        ▲
        │
     Student   ← reads the same input at the same time as Companion
```

**The path from Safety straight to Referral is the point of the architecture.** Safety reads everything the student says at the same moment the Companion does, and can reach the handoff without asking permission from any other agent.

---

## 4 · Provider abstraction

`FEATURES.md:110`: *"target architecture is self-hosted open-weight multilingual models, not third-party APIs, because mental health data should not leave controlled infrastructure."* Combined with DPDP Act 2023, this is a hard constraint, not a preference.

```
backend/agents/
├── provider/
│   ├── base.py        LLMProvider (ABC): complete() · stream() · embed()
│   ├── openai_compat.py   one HTTP client, serves Ollama AND vLLM
│   └── registry.py    resolves LLM_BASE_URL + LLM_MODEL from env
├── companion/
├── signal/
├── trend/
├── screening/
├── care/
├── safety/
└── referral/
```

**No agent module ever imports a vendor SDK, and no model id is ever a constant in agent code.** Everything goes through `LLMProvider`.

| Environment | Runtime | Why |
|---|---|---|
| Local dev (macOS / Apple Silicon) | **Ollama** | vLLM is CUDA-oriented and impractical on Metal |
| Production (Linux / GPU) | **vLLM** | throughput, batching, tensor parallelism |

Both expose an OpenAI-compatible HTTP surface, so `openai_compat.py` serves both and the switch is one env var.

**Model selection is deliberately unfixed.** Multilingual EN+BN candidates (Qwen3, Gemma 3 families) must be **evaluated against real Bengali and romanised-Bengali distress phrasing** before one is chosen — the existing `talk/replies.ts` regexes are a ready-made starting corpus (ghabrahat, bechaini, *kichu bhalo lagche na*, বুকে ভার). Until that evaluation runs, `LLM_MODEL` stays an environment variable.

**Speech-to-text** is `faster-whisper`, self-hosted, same reasoning. `useVoiceCapture` already produces a `Blob` and discards it; the STT endpoint is where it goes.

---

## 5 · Safety is not a prompt

Three properties the implementation must have, or it is not the Safety agent:

1. **Separate call.** Safety runs as its own request against the raw user message, not as an instruction inside the Companion's system prompt. A jailbroken conversational prompt cannot suppress a call that has already been dispatched.
2. **Parallel, not sequential.** Safety and Companion are dispatched together. Safety's verdict gates whether the Companion's response is *shown*, and can replace it with an escalation view.
3. **Independently persisted.** A `safety_assessments` row is written whether or not the Companion succeeded. If the Companion call fails, the Safety verdict still exists.

```python
# shape, not final code
verdict_task   = safety.assess(raw_text, user_id)
response_task  = companion.respond(raw_text, context)
verdict, draft = await asyncio.gather(verdict_task, response_task)

await persist(verdict)                  # always, regardless of draft
if verdict.tier >= 3:
    return escalation_view(verdict)     # draft is discarded
return draft
```

Fail-closed: if the Safety call errors or times out, the message is treated as **needing review**, not as safe.

---

## 6 · Current state

| Agent | Exists |
|---|---|
| Companion | 8 regexes + 4 rules |
| Trend | Hardcoded 6-week array |
| Screening | 3 of 21 DASS items, no scoring |
| Care | Static suggestion copy |
| Signal, Safety, Referral | **Nothing** |

**No demo may present the app as safety-capable until the Safety slice ships.**
