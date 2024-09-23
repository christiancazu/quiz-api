import express from 'express'
import bodyParser from 'body-parser';
import cors from 'cors';

import { config } from 'dotenv'
import pg from 'pg'
import questions from './src/questions.js';

config()

const pool = new pg.Pool({
  connectionString: process.env.CONNECTION_STRING,
  ssl: true
})

let correctAnswers = []
const ANSWER_SCORE = 1000

const app = express()
app.use(bodyParser.json())
app.use(cors())

app.get('/correct_answers', async (req, res) => {
  res.json(correctAnswers)
})

app.get('/questions', async (req, res) => {
  res.json(questions)
})

app.get('/results', async (req, res) => {
  try {
    const users = await pool.query('SELECT * FROM users')

    res.json(users.rows)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.post('/create_answer', async (req, res) => {
  try {

    const { user_id, question_id, answer, delay } = req.body

    const answerExists = await pool.query('SELECT * FROM users_questions WHERE user_id = $1 AND question_id = $2', [user_id, question_id])

    if (answerExists.rowCount > 0) {
      res.status(500).json({ error: 'Answer already exists' })
      return
    }

    const correctAnswer = correctAnswers.find(q => q.id === question_id && q.correct_answer === answer)

    let selectUser = await pool.query('SELECT * from users WHERE id = $1', [user_id])

    if (correctAnswer) {
      const { score } = selectUser.rows[0]

      let newDelay = 0

      if (delay > 0) {
        newDelay = delay
      }

      selectUser = await pool.query('UPDATE users SET score = $1 WHERE id = $2 RETURNING *', [score + ANSWER_SCORE + newDelay, user_id])
    }

    await pool.query(`INSERT INTO users_questions (user_id, question_id, answer) VALUES ($1, $2, $3) RETURNING *`, [user_id, question_id, answer])

    res.json(selectUser.rows[0], { correctAnswer }, { correctAnswers })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.post('/create_user', async (req, res) => {
  if (!req.body.name) {
    res.status(500).send()
    return
  }

  try {
    const result = await pool.query(`INSERT INTO users (name, score) VALUES ($1, $2) RETURNING *`, [req.body.name, 0])
    const { id, name } = result.rows[0]
    res.send({ id, name })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.listen(process.env.PORT || 3000, async () => {
  // const result = await pool.query('SELECT * FROM questions')
  correctAnswers = [
    {
      "id": 1,
      "correct_answer": "b"
    },
    {
      "id": 2,
      "correct_answer": "c"
    },
    {
      "id": 3,
      "correct_answer": "a"
    },
    {
      "id": 4,
      "correct_answer": "d"
    },
    {
      "id": 5,
      "correct_answer": "b"
    }
  ]
})
