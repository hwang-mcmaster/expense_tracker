const express = require('express')
const cors = require('cors')
const sqlite3 = require('sqlite3').verbose()

const app = express()
const PORT = 3000

app.use(cors())
app.use(express.json())

const db = new sqlite3.Database('./expenses.db', (err) => {
  if (err) {
    console.error('Database connection error:', err.message)
  } else {
    console.log('Connected to SQLite database.')
  }
})

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS expenses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      amount REAL NOT NULL,
      date TEXT NOT NULL
    )
  `)

  db.get('SELECT COUNT(*) AS count FROM expenses', (err, row) => {
    if (err) {
      console.error('Count query error:', err.message)
      return
    }

    if (row.count === 0) {
      const stmt = db.prepare(`
        INSERT INTO expenses (title, category, amount, date)
        VALUES (?, ?, ?, ?)
      `)

      stmt.run('Groceries', 'Food', 42.50, '2026-03-20')
      stmt.run('Bus Fare', 'Transport', 3.25, '2026-03-21')
      stmt.run('Internet Bill', 'Bills', 59.99, '2026-03-22')

      stmt.finalize()
      console.log('Seed data inserted.')
    }
  })
})

app.get('/api', (req, res) => {
  res.json({ message: 'Expense Tracker API is running' })
})

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/api`)
})