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
  db.all('SELECT * FROM expenses', (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message })
    }
    res.json(rows)
  })
})

app.post('/api', (req, res) => {
  const { title, category, amount, date } = req.body

  if (!title || !category || amount === undefined || !date) {
    return res.status(400).json({ error: 'Missing required fields' })
  }

  const sql = `
    INSERT INTO expenses (title, category, amount, date)
    VALUES (?, ?, ?, ?)
  `

  db.run(sql, [title, category, amount, date], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message })
    }

    res.json({ status: `New record created with id=${this.lastID}` })
  })
})

app.put('/api', (req, res) => {
  const expenses = req.body

  if (!Array.isArray(expenses)) {
    return res.status(400).json({ error: 'Request body must be an array' })
  }

  db.serialize(() => {
    db.run('DELETE FROM expenses', (err) => {
      if (err) {
        return res.status(500).json({ error: err.message })
      }

      const stmt = db.prepare(`
        INSERT INTO expenses (title, category, amount, date)
        VALUES (?, ?, ?, ?)
      `)

      for (const expense of expenses) {
        stmt.run(expense.title, expense.category, expense.amount, expense.date)
      }

      stmt.finalize((finalizeErr) => {
        if (finalizeErr) {
          return res.status(500).json({ error: finalizeErr.message })
        }

        res.json({ status: 'Collection replaced' })
      })
    })
  })
})

app.delete('/api', (req, res) => {
  db.run('DELETE FROM expenses', (err) => {
    if (err) {
      return res.status(500).json({ error: err.message })
    }

    res.json({ status: 'Collection deleted' })
  })
})

app.get('/api/:id', (req, res) => {
  const id = req.params.id

  db.get('SELECT * FROM expenses WHERE id = ?', [id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message })
    }

    if (!row) {
      return res.status(404).json({ error: 'Record not found' })
    }

    res.json(row)
  })
})

app.put('/api/:id', (req, res) => {
  const id = req.params.id
  const { title, category, amount, date } = req.body

  if (!title || !category || amount === undefined || !date) {
    return res.status(400).json({ error: 'Missing required fields' })
  }

  const sql = `
    UPDATE expenses
    SET title = ?, category = ?, amount = ?, date = ?
    WHERE id = ?
  `

  db.run(sql, [title, category, amount, date, id], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message })
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Record not found' })
    }

    res.json({ status: `Record id=${id} updated` })
  })
})

app.delete('/api/:id', (req, res) => {
  const id = req.params.id

  db.run('DELETE FROM expenses WHERE id = ?', [id], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message })
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Record not found' })
    }

    res.json({ status: `Record id=${id} deleted` })
  })
})

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/api`)
})