-- Per-series certificate examination fees (€25 Bachelor / €35 Master) and final examination fees (€100 / €200).
-- Recorded after simulated or live checkout; RLS: students read own rows only (inserts via service role).

create table if not exists exam_fee_purchases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  pricing_item_code text not null,
  course_id uuid references courses (id) on delete cascade,
  order_id uuid references orders (id) on delete set null,
  paid_at timestamptz not null default now(),
  constraint exam_fee_purchases_code_chk check (
    pricing_item_code in (
      'EXAM_CERT_BACHELOR_EUR',
      'EXAM_CERT_MASTER_EUR',
      'FINAL_EXAM_BACHELOR_EUR',
      'FINAL_EXAM_MASTER_EUR'
    )
  ),
  constraint exam_fee_purchases_scope_chk check (
    (
      pricing_item_code in ('EXAM_CERT_BACHELOR_EUR', 'EXAM_CERT_MASTER_EUR')
      and course_id is not null
    )
    or (
      pricing_item_code in ('FINAL_EXAM_BACHELOR_EUR', 'FINAL_EXAM_MASTER_EUR')
      and course_id is null
    )
  )
);

create unique index if not exists exam_fee_purchases_user_course_cert
  on exam_fee_purchases (user_id, course_id)
  where course_id is not null;

create unique index if not exists exam_fee_purchases_user_final_code
  on exam_fee_purchases (user_id, pricing_item_code)
  where course_id is null;

create index if not exists exam_fee_purchases_user_idx on exam_fee_purchases (user_id);

alter table exam_fee_purchases enable row level security;

drop policy if exists "exam_fee_purchases_select_own" on exam_fee_purchases;
create policy "exam_fee_purchases_select_own" on exam_fee_purchases for select using (auth.uid() = user_id);
