-- GFA platform seed: pricing, lecturers, faculties, programs, course links.
-- Run after seed.sql and migration-gfa-platform-v1.sql.

-- PDF-aligned pricing: $250 admission (USD), €200 per lecture series (EUR).
INSERT INTO pricing_items (code, label, amount_cents, currency)
VALUES
  ('ADMISSION_USD', 'One-time admission (enrollment) fee — global unlock', 25000, 'usd'),
  ('LECTURE_SERIES_EUR', 'Lecture series (8–10 lectures, per course)', 20000, 'eur'),
  ('EXAM_CERT_BACHELOR_EUR', 'Examination / certificate fee per lecture series (Bachelor)', 2500, 'eur'),
  ('EXAM_CERT_MASTER_EUR', 'Examination / certificate fee per lecture series (Master)', 3500, 'eur'),
  ('FINAL_EXAM_BACHELOR_EUR', 'Final examination fee (Bachelor)', 10000, 'eur'),
  ('FINAL_EXAM_MASTER_EUR', 'Final examination fee (Master)', 20000, 'eur')
ON CONFLICT (code) DO UPDATE SET
  label = EXCLUDED.label,
  amount_cents = EXCLUDED.amount_cents,
  currency = EXCLUDED.currency;

-- Instructor offices: documented team (business plan §7 / §15). Stable UUIDs; ON CONFLICT (id) allows slug renames.
-- Demo Mux sample playback for welcome clips until production assets exist.
INSERT INTO lecturers (id, slug, display_name, bio, office_intro_mux_playback_id, languages)
VALUES
  (
    'a1000000-0001-4001-8001-000000000001',
    'richard-schuetze',
    'Dr. Richard Schütze',
    'Lawyer, entrepreneur, consultant, and coach (Berlin). Foundations of human transaction and leadership.',
    'DS00Spx1CV902MCtPj5WknGlR102V5HFkDe',
    ARRAY['de', 'en']
  ),
  (
    'a1000000-0001-4001-8001-000000000002',
    'antony-p-mueller',
    'Prof. Dr. Antony P. Mueller',
    'Mises Institute São Paulo. Austrian economics, capital theory, business cycles.',
    'DS00Spx1CV902MCtPj5WknGlR102V5HFkDe',
    ARRAY['en', 'pt']
  ),
  (
    'a1000000-0001-4001-8001-000000000003',
    'benjamin-mudlack',
    'Benjamin Mudlack',
    'Business informatics; Der ökonomische IQ. Monetary theory and economic communication.',
    'DS00Spx1CV902MCtPj5WknGlR102V5HFkDe',
    ARRAY['de', 'en']
  ),
  (
    'a1000000-0001-4001-8001-000000000004',
    'thorsten-polleit',
    'Prof. Dr. Thorsten Polleit',
    'Honorary Professor University of Bayreuth; President Ludwig von Mises Institute Germany.',
    'DS00Spx1CV902MCtPj5WknGlR102V5HFkDe',
    ARRAY['de', 'en']
  ),
  (
    'a1000000-0001-4001-8001-000000000005',
    'christian-machek',
    'Mag. Dr. Christian Machek',
    'Vienna/Berlin. Interdisciplinary, intercultural, and scientific-method teaching.',
    'DS00Spx1CV902MCtPj5WknGlR102V5HFkDe',
    ARRAY['de', 'en']
  ),
  (
    'a1000000-0001-4001-8001-000000000006',
    'andreas-tiedtke',
    'Dr. Andreas Tiedtke',
    'Lawyer, publicist, author on praxeology and law.',
    'DS00Spx1CV902MCtPj5WknGlR102V5HFkDe',
    ARRAY['de', 'en']
  ),
  (
    'a1000000-0001-4001-8001-000000000007',
    'thomas-jacob',
    'Thomas Jacob',
    'Economist and financial advisor. Private-law society and institutional design.',
    'DS00Spx1CV902MCtPj5WknGlR102V5HFkDe',
    ARRAY['de', 'en']
  ),
  (
    'a1000000-0001-4001-8001-000000000008',
    'ilyas-kirecci',
    'Ilyas Kirecci',
    'Lecturer in digital transformation and economics; bridges technology and Austrian-school themes.',
    'DS00Spx1CV902MCtPj5WknGlR102V5HFkDe',
    ARRAY['en', 'de']
  ),
  (
    'a1000000-0001-4001-8001-000000000009',
    'jose-cano',
    'Prof. Dr. José Cano',
    'Research & Consulting Director IDC España. Blockchain and decentralisation.',
    'DS00Spx1CV902MCtPj5WknGlR102V5HFkDe',
    ARRAY['es', 'en']
  ),
  (
    'a1000000-0001-4001-8001-000000000010',
    'walter-schoenthaler',
    'Walter Schönthaler',
    'Business executive and management expert.',
    'DS00Spx1CV902MCtPj5WknGlR102V5HFkDe',
    ARRAY['de', 'en']
  ),
  (
    'a1000000-0001-4001-8001-000000000011',
    'pedro-ciesa-peral',
    'Pedro Ciesa Peral',
    'Law modules (4 sub-series) — instructor to be confirmed in final programme.',
    'DS00Spx1CV902MCtPj5WknGlR102V5HFkDe',
    ARRAY['es', 'en']
  ),
  (
    'a1000000-0001-4001-8001-000000000012',
    'damian-roscher',
    'Dr. Damian Roscher',
    'Law modules (4 sub-series) — instructor to be confirmed in final programme.',
    'DS00Spx1CV902MCtPj5WknGlR102V5HFkDe',
    ARRAY['de', 'en']
  )
ON CONFLICT (id) DO UPDATE SET
  slug = EXCLUDED.slug,
  display_name = EXCLUDED.display_name,
  bio = EXCLUDED.bio,
  office_intro_mux_playback_id = EXCLUDED.office_intro_mux_playback_id,
  languages = EXCLUDED.languages;

UPDATE courses SET lecturer_id = 'a1000000-0001-4001-8001-000000000001' WHERE slug = 'foundations-of-human-transaction';
UPDATE courses SET lecturer_id = 'a1000000-0001-4001-8001-000000000002' WHERE slug = 'austrian-economics-capital-theory';
UPDATE courses SET lecturer_id = 'a1000000-0001-4001-8001-000000000003' WHERE slug = 'monetary-theory-i';
UPDATE courses SET lecturer_id = 'a1000000-0001-4001-8001-000000000003' WHERE slug = 'monetary-theory-ii';
UPDATE courses SET lecturer_id = 'a1000000-0001-4001-8001-000000000004' WHERE slug = 'foundations-of-the-austrian-school';
UPDATE courses SET lecturer_id = 'a1000000-0001-4001-8001-000000000005' WHERE slug = 'interdisciplinary-intercultural-work';
UPDATE courses SET lecturer_id = 'a1000000-0001-4001-8001-000000000005' WHERE slug = 'scientific-work';
UPDATE courses SET lecturer_id = 'a1000000-0001-4001-8001-000000000006' WHERE slug = 'praxeology-of-law';
UPDATE courses SET lecturer_id = 'a1000000-0001-4001-8001-000000000007' WHERE slug = 'obox-planet-private-law-society';
UPDATE courses SET lecturer_id = 'a1000000-0001-4001-8001-000000000010' WHERE slug = 'sales-innovation-management';
UPDATE courses SET lecturer_id = 'a1000000-0001-4001-8001-000000000008' WHERE slug = 'applied-economics';
UPDATE courses SET lecturer_id = 'a1000000-0001-4001-8001-000000000008' WHERE slug = 'hr-economics-business-economics';
UPDATE courses SET lecturer_id = 'a1000000-0001-4001-8001-000000000009' WHERE slug = 'blockchain-technology-decentralized-apps';
UPDATE courses SET lecturer_id = 'a1000000-0001-4001-8001-000000000011' WHERE slug = 'law-modules';

UPDATE courses
SET lecture_series_price_cents = 0, lecture_series_currency = 'eur'
WHERE price_cents = 0;

UPDATE courses
SET lecture_series_price_cents = 20000, lecture_series_currency = 'eur'
WHERE price_cents > 0;

INSERT INTO faculties (id, slug, name, description, sort_order)
VALUES
  (
    'f1000000-0001-4001-8001-000000000001',
    'human-action-law-society',
    'Human Action, Law & Society',
    'Leadership, ethics, interdisciplinary work, scientific writing, praxeology of law, and private-law society themes.',
    1
  ),
  (
    'f1000000-0001-4001-8001-000000000002',
    'austrian-economics-money-technology',
    'Austrian Economics, Money & Technology',
    'Core Austrian-school series, monetary theory, digital transformation, and blockchain — aligned with Master College curriculum.',
    2
  ),
  (
    'f1000000-0001-4001-8001-000000000003',
    'business-innovation-management',
    'Business, Innovation & Management',
    'MBA-aligned lecture series: sales, innovation, applied economics, HR and business economics, process and change management.',
    3
  ),
  (
    'f1000000-0001-4001-8001-000000000004',
    'law-and-legal-order',
    'Law & Legal Order',
    'Praxeology of law and structured law modules (4 sub-series).',
    4
  )
ON CONFLICT (id) DO UPDATE SET
  slug = EXCLUDED.slug,
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  sort_order = EXCLUDED.sort_order;

DELETE FROM faculty_lecturers WHERE faculty_id IN (
  'f1000000-0001-4001-8001-000000000001',
  'f1000000-0001-4001-8001-000000000002',
  'f1000000-0001-4001-8001-000000000003',
  'f1000000-0001-4001-8001-000000000004'
);

INSERT INTO faculty_lecturers (faculty_id, lecturer_id, sort_order) VALUES
  ('f1000000-0001-4001-8001-000000000001', 'a1000000-0001-4001-8001-000000000001', 1),
  ('f1000000-0001-4001-8001-000000000001', 'a1000000-0001-4001-8001-000000000005', 2),
  ('f1000000-0001-4001-8001-000000000001', 'a1000000-0001-4001-8001-000000000006', 3),
  ('f1000000-0001-4001-8001-000000000001', 'a1000000-0001-4001-8001-000000000007', 4),
  ('f1000000-0001-4001-8001-000000000002', 'a1000000-0001-4001-8001-000000000002', 1),
  ('f1000000-0001-4001-8001-000000000002', 'a1000000-0001-4001-8001-000000000003', 2),
  ('f1000000-0001-4001-8001-000000000002', 'a1000000-0001-4001-8001-000000000004', 3),
  ('f1000000-0001-4001-8001-000000000002', 'a1000000-0001-4001-8001-000000000008', 4),
  ('f1000000-0001-4001-8001-000000000002', 'a1000000-0001-4001-8001-000000000009', 5),
  ('f1000000-0001-4001-8001-000000000002', 'a1000000-0001-4001-8001-000000000010', 6),
  ('f1000000-0001-4001-8001-000000000003', 'a1000000-0001-4001-8001-000000000010', 1),
  ('f1000000-0001-4001-8001-000000000003', 'a1000000-0001-4001-8001-000000000008', 2),
  ('f1000000-0001-4001-8001-000000000004', 'a1000000-0001-4001-8001-000000000006', 1),
  ('f1000000-0001-4001-8001-000000000004', 'a1000000-0001-4001-8001-000000000011', 2),
  ('f1000000-0001-4001-8001-000000000004', 'a1000000-0001-4001-8001-000000000012', 3)
ON CONFLICT (faculty_id, lecturer_id) DO UPDATE SET sort_order = EXCLUDED.sort_order;

-- Bachelor: 4 semesters, 8 lecture series (PDF). Master: ~3 semesters, 6 series.
INSERT INTO gfa_programs (id, slug, title, kind, description, semester_count, lecture_series_count)
VALUES
  (
    'b1000000-0001-4001-8001-000000000001',
    'bachelor',
    'Bachelor''s programme',
    'bachelor',
    'Theoretical foundations and analytical competence: consistent economic worldview, methodological clarity, basic institutional and legal context, Enlightenment ethics of freedom and responsibility, intercultural communication. Four flexible semesters, two lecture series per semester (eight total), each series examined separately.',
    4,
    8
  ),
  (
    'b1000000-0001-4001-8001-000000000002',
    'master',
    'Master''s programme',
    'master',
    'Builds on Bachelor studies with application, analysis, and transfer: deeper theory, real problems, specialisation (e.g. entrepreneurship, media, institutions, technology), independent positions. About three flexible semesters, two series per semester (six total), project- and application-oriented.',
    3,
    6
  )
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  kind = EXCLUDED.kind,
  description = EXCLUDED.description,
  semester_count = EXCLUDED.semester_count,
  lecture_series_count = EXCLUDED.lecture_series_count;

INSERT INTO gfa_program_courses (program_id, course_id, sequence_order) VALUES
  ('b1000000-0001-4001-8001-000000000001', '11111111-1111-4111-8111-111111111101', 1),
  ('b1000000-0001-4001-8001-000000000001', '11111111-1111-4111-8111-111111111102', 2),
  ('b1000000-0001-4001-8001-000000000001', '11111111-1111-4111-8111-111111111103', 3),
  ('b1000000-0001-4001-8001-000000000001', '11111111-1111-4111-8111-111111111104', 4),
  ('b1000000-0001-4001-8001-000000000001', '11111111-1111-4111-8111-111111111105', 5),
  ('b1000000-0001-4001-8001-000000000001', '11111111-1111-4111-8111-111111111106', 6),
  ('b1000000-0001-4001-8001-000000000001', '11111111-1111-4111-8111-111111111107', 7),
  ('b1000000-0001-4001-8001-000000000001', '11111111-1111-4111-8111-111111111108', 8),
  ('b1000000-0001-4001-8001-000000000002', '11111111-1111-4111-8111-111111111104', 1),
  ('b1000000-0001-4001-8001-000000000002', '11111111-1111-4111-8111-111111111105', 2),
  ('b1000000-0001-4001-8001-000000000002', '11111111-1111-4111-8111-111111111106', 3),
  ('b1000000-0001-4001-8001-000000000002', '11111111-1111-4111-8111-111111111107', 4),
  ('b1000000-0001-4001-8001-000000000002', '11111111-1111-4111-8111-111111111108', 5),
  ('b1000000-0001-4001-8001-000000000002', '11111111-1111-4111-8111-111111111109', 6)
ON CONFLICT (program_id, course_id) DO UPDATE SET sequence_order = EXCLUDED.sequence_order;
