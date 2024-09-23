
CREATE TABLE users
(
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(40),
  score INT
);

CREATE TABLE questions
(
  id SERIAL PRIMARY KEY,
  correct_answer VARCHAR(1)
);

CREATE TABLE users_questions
(
  id SERIAL PRIMARY KEY,
  user_id uuid,
  question_id INTEGER,
  answer VARCHAR(1),
  CONSTRAINT fk_users FOREIGN KEY(user_id) REFERENCES users(id),
  CONSTRAINT fk_questions FOREIGN KEY(question_id) REFERENCES questions(id)
);


INSERT INTO questions
  (correct_answer)
VALUES
  ('b'),
  ('c'),
  ('a'),
  ('d'),
  ('b')


INSERT INTO users_questions(user_id, question_id, answer) VALUES('bfc2af8b-fde4-4ef7-bb9d-05b5e1391016', 5, 'a');
