-- 1. Insert Core Topics
INSERT INTO public.topics (name, category, description)
VALUES 
  ('Managing Exam Stress & Anxiety', 'mental_health', 'Strategies for handling academic pressure and maintaining well-being during finals.'),
  ('Software Engineering CV Review', 'career', 'Peer and mentor guidance on structuring impactful resumes for tech roles.'),
  ('First-Year Campus Adaptation', 'peer_support', 'Open discussion on time management, living away from home, and building community.')
ON CONFLICT DO NOTHING;

-- 2. Insert Sample Scheduled Circle
INSERT INTO public.circles (topic_id, title, description, max_capacity, starts_at, status)
SELECT 
  id,
  'Conquering Academic Burnout',
  'A safe space to discuss burnout symptoms, recovery strategies, and maintaining balance.',
  8,
  NOW() + INTERVAL '2 days',
  'scheduled'
FROM public.topics
WHERE name = 'Managing Exam Stress & Anxiety'
LIMIT 1
ON CONFLICT DO NOTHING;