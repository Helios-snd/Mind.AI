# 06 · Database schema

PostgreSQL 16. SQLAlchemy 2 + Alembic. Identity, onboarding and health data are kept in **separate table families** so access control and deletion can be reasoned about per family.

`[1]` = created in slice 1. Everything else lands with its own slice.

---

## 1 · Identity

```
institutions
  id            uuid pk
  name          text
  slug          text uniq
  created_at    timestamptz

users                                       [1]
  id            uuid pk
  created_at    timestamptz
  deleted_at    timestamptz null            -- soft delete; hard purge is a job

user_profiles                               [1]
  user_id       uuid pk → users.id  on delete cascade
  language      text  not null default 'en' -- 'en' | 'bn'
  name          text null
  email         citext null uniq
  phone         text null uniq
  institution_id uuid null → institutions.id
  claimed_at    timestamptz null            -- null = still anonymous
  updated_at    timestamptz

auth_sessions                               [1]
  id                  uuid pk
  user_id             uuid → users.id  on delete cascade
  refresh_token_hash  text not null         -- never the token itself
  expires_at          timestamptz
  revoked_at          timestamptz null
  created_at          timestamptz

login_codes                                 [1]
  id            uuid pk
  destination   text not null               -- email or phone
  code_hash     text not null               -- never the code itself
  expires_at    timestamptz
  consumed_at   timestamptz null
  attempts      int default 0
  created_at    timestamptz
```

`language` lives here but is **serialised into the `OnboardingProgress` payload**, because `i18n/index.ts:41` reads it from `useOnboardingProgress()`. Moving it would break language switching.

---

## 2 · Onboarding

```
onboarding_progress                         [1]
  user_id       uuid pk → users.id  on delete cascade
  step          smallint not null           -- 1..5
  consent_at    timestamptz null
  completed_at  timestamptz null
  updated_at    timestamptz

baseline_answers                            [1]
  id            uuid pk
  user_id       uuid → users.id  on delete cascade
  item_id       text not null               -- 'dass-3', 'dass-5', …
  value         smallint not null           -- 0..3
  answered_at   timestamptz
  unique (user_id, item_id)

consent_events                              [1]   -- append-only, never updated
  id              uuid pk
  user_id         uuid → users.id
  kind            text     -- 'onboarding' | 'referral_share' | 'tier3_protocol'
  policy_version  text
  at              timestamptz
```

`consent_events` is the audit trail. It is append-only and survives everything except a full account purge, because "did this student consent, and to which version" must be answerable after the fact.

---

## 3 · Crisis and support

```
crisis_plans                                [1]
  user_id             uuid pk → users.id  on delete cascade
  who_id_call         text
  what_helps          text
  what_makes_it_worse text
  updated_at          timestamptz

trusted_contacts                            [1]
  user_id       uuid pk → users.id  on delete cascade
  name          text
  relationship  text
  phone         text
  updated_at    timestamptz
```

Phone is validated against the same rule as the UI — `phoneLooksValid` in `src/components/formFields.tsx`, `/^(\+?91)?\d{10}$/` after stripping spaces and hyphens. **The backend mirrors that regex; it does not invent a second one.**

The trusted contact is **never defaulted to a parent** (hard constraint 9). The schema has no `relationship` enum for exactly that reason — it is free text and the student's choice.

---

## 4 · Daily signal

```
checkins
  id            uuid pk
  user_id       uuid → users.id  on delete cascade
  local_date    date not null               -- the user's day key
  at            timestamptz not null        -- also the delete handle
  mood          smallint     not null       -- 1..5
  sleep_hours   numeric(3,1) not null       -- 0..12, step 0.5
  energy        smallint null               -- 1..5, added with the Today slice
  social        smallint null               -- 1..5, added with the Today slice
  note          text
  unique (user_id, at)
  index on (user_id, local_date desc)

signals                                     -- SIGNAL agent output
  id            uuid pk
  user_id       uuid → users.id  on delete cascade
  source_type   text     -- 'checkin' | 'message'
  source_id     uuid
  kind          text     -- 'sleep' | 'appetite' | 'energy' | 'social' | 'somatic' | …
  value         jsonb
  observed_at   timestamptz
  index on (user_id, kind, observed_at desc)
```

`energy` and `social` are **nullable** because rows recorded before the Today slice do not have them. They are read as `null` and simply not plotted — never zero-filled, never inferred, never fabricated.

---

## 5 · Conversation

```
conversations
  id            uuid pk
  user_id       uuid → users.id  on delete cascade
  started_at    timestamptz
  last_at       timestamptz

messages
  id                uuid pk
  conversation_id   uuid → conversations.id  on delete cascade
  role              text        -- 'user' | 'assistant'
  text              text
  at                timestamptz
  safety_verdict_id uuid null → safety_assessments.id
  index on (conversation_id, at)
```

Data minimisation (`FEATURES.md`): keep the **structured signals**, not indefinite raw transcripts. Retention limits are agreed with the institution in writing and enforced by a scheduled purge, not by hope.

---

## 6 · Trend

```
baselines                    -- one row per user per series
  user_id       uuid → users.id  on delete cascade
  series        text          -- 'mood' | 'sleep' | 'energy' | 'social'
  low           numeric
  high          numeric
  n_observations int
  computed_at   timestamptz
  primary key (user_id, series)

trend_points                 -- weekly rollups
  user_id       uuid → users.id  on delete cascade
  week_start    date
  series        text
  value         numeric
  primary key (user_id, week_start, series)

trend_insights
  id            uuid pk
  user_id       uuid → users.id  on delete cascade
  week_start    date
  text          text
  drift_score   numeric
  generated_at  timestamptz
```

Baselines are **the student's own history**, never a population average. That is the product's central claim and the schema enforces it by having no population table to compare against.

---

## 7 · Screening, care, safety, referral

```
screening_sessions            id · user_id · instrument ('phq9'|'gad7'|'isi'|'dass21')
                              started_at · completed_at · trigger ('drift'|'onboarding'|'scheduled')
screening_answers             session_id · item_id · value · answered_at
screening_scores              session_id · subscale · raw · severity_band · scored_at

care_recommendations          id · user_id · module · reason · offered_at
care_activities               id · recommendation_id · completed_at · helped smallint null

safety_assessments            id · user_id · message_id null · checkin_id null
                              verdict ('none'|'concern'|'tier2'|'tier3')
                              categories jsonb · model_version · assessed_at
escalation_events             id · user_id · tier · fired_by ('safety'|'trend'|'manual')
                              fired_at · resolved_at null
                              reviewed_by uuid null · reviewed_at null

referral_offers               id · user_id · escalation_id null · offered_at
                              accepted_at null · declined_at null · re_offer_after null
appointments                  id · referral_id · counsellor_id · slot_at · attended bool null
student_briefs                id · referral_id · content jsonb · approved_by_student_at
                              released_to_counsellor_at null
referral_followups            id · referral_id · due_at · asked_at null · outcome text null
```

Two rules encoded here:

- `safety_assessments` is written **independently of the conversational path**, so a Safety verdict exists even when the Companion response is discarded or fails.
- `student_briefs.released_to_counsellor_at` is null until `approved_by_student_at` is set. The counsellor cannot see a brief the student has not approved. See `08-safety-and-privacy.md`.

---

## 8 · Counsellor and institution

```
counsellors                   id · institution_id · name · email
counsellor_notes              id · counsellor_id · user_id · body · at
queue_snapshots               id · counsellor_id · generated_at · rows jsonb
institution_aggregates        institution_id · period_start · metric · value · cohort_size
```

`institution_aggregates.cohort_size` exists so the k-anonymity threshold can be enforced at read time. **A row whose `cohort_size` is below the agreed threshold is never returned.**

---

## 9 · Audit

```
access_logs                   id · actor_type ('student'|'counsellor'|'system')
                              actor_id · action · subject_user_id · at
deletion_events               id · user_id · requested_at · completed_at · scope
```

Deletion is transactional across every table above and writes a `deletion_events` row. `me/wipe.ts` today has a bug where the reset immediately re-writes the key it just deleted (defect 6) — the server version must actually delete.

---

## 10 · Slice-1 migration summary

Ten tables: `institutions`, `users`, `user_profiles`, `auth_sessions`, `login_codes`, `onboarding_progress`, `baseline_answers`, `consent_events`, `crisis_plans`, `trusted_contacts`.

Every `user_id` foreign key is `on delete cascade`, so `DELETE /me/data` is one statement plus a `deletion_events` insert — with `consent_events` deliberately excluded from cascade and purged explicitly, so the audit trail cannot be destroyed by an ordinary cascade.
