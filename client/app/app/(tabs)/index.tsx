import { useEffect, useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert
} from 'react-native'

type Expense = {
  id: number
  title: string
  category: string
  amount: number
  date: string
}

const API_URL = 'http://localhost:3000/api'

export default function HomeScreen() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null)

  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('')
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState('')

  const loadExpenses = async () => {
    try {
      const response = await fetch(API_URL)
      const data = await response.json()
      setExpenses(data)
    } catch (error) {
      Alert.alert('Error', 'Could not load expenses from the server')
    }
  }

  useEffect(() => {
    loadExpenses()
  }, [])

  const handleRefresh = async () => {
    await loadExpenses()
  }

  const handleClearAll = () => {
    Alert.alert('Clear All button pressed')
  }

  const handleAddExpense = async () => {
  if (!title || !category || !amount || !date) {
    Alert.alert('Error', 'Please fill in all fields')
    return
  }

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title,
        category,
        amount: Number(amount),
        date
      })
    })

    const data = await response.json()

    if (!response.ok) {
      Alert.alert('Error', data.error || 'Could not add expense')
      return
    }
  } catch (error) {
    Alert.alert('Error', 'Could not connect to the server')
  }
}

  const renderExpenseItem = ({ item }: { item: Expense }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => setSelectedExpense(item)}
    >
      <Text style={styles.cardTitle}>{item.title}</Text>
      <Text style={styles.cardText}>Category: {item.category}</Text>
      <Text style={styles.cardText}>Amount: ${item.amount.toFixed(2)}</Text>
      <Text style={styles.cardText}>Date: {item.date}</Text>

      <View style={styles.cardButtons}>
        <TouchableOpacity
          style={styles.smallButton}
          onPress={() => setSelectedExpense(item)}
        >
          <Text style={styles.buttonText}>View</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.smallDeleteButton}
          onPress={() => Alert.alert('Delete button pressed')}
        >
          <Text style={styles.buttonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  )

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Expense Tracker</Text>

      <View style={styles.topButtons}>
        <TouchableOpacity style={styles.actionButton} onPress={handleRefresh}>
          <Text style={styles.buttonText}>Refresh</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.clearButton} onPress={handleClearAll}>
          <Text style={styles.buttonText}>Clear All</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Expense List</Text>

      <FlatList
        data={expenses}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderExpenseItem}
        style={styles.list}
      />

      <Text style={styles.sectionTitle}>Add New Expense</Text>

      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Title"
          value={title}
          onChangeText={setTitle}
        />

        <TextInput
          style={styles.input}
          placeholder="Category"
          value={category}
          onChangeText={setCategory}
        />

        <TextInput
          style={styles.input}
          placeholder="Amount"
          value={amount}
          onChangeText={setAmount}
          keyboardType="numeric"
        />

        <TextInput
          style={styles.input}
          placeholder="Date (YYYY-MM-DD)"
          value={date}
          onChangeText={setDate}
        />

        <TouchableOpacity style={styles.addButton} onPress={handleAddExpense}>
          <Text style={styles.buttonText}>Add Expense</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Selected Expense Details</Text>

      <View style={styles.detailBox}>
        {selectedExpense ? (
          <>
            <Text style={styles.detailText}>Title: {selectedExpense.title}</Text>
            <Text style={styles.detailText}>Category: {selectedExpense.category}</Text>
            <Text style={styles.detailText}>
              Amount: ${selectedExpense.amount.toFixed(2)}
            </Text>
            <Text style={styles.detailText}>Date: {selectedExpense.date}</Text>

            <View style={styles.detailButtons}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => Alert.alert('Edit button pressed')}
              >
                <Text style={styles.buttonText}>Edit</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.smallDeleteButton}
                onPress={() => Alert.alert('Delete button pressed')}
              >
                <Text style={styles.buttonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <Text style={styles.placeholderText}>Tap an expense to view details</Text>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f4f4',
    padding: 16
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 16
  },
  topButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 10
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#4a90e2',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center'
  },
  clearButton: {
    flex: 1,
    backgroundColor: '#d9534f',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center'
  },
  addButton: {
    backgroundColor: '#5cb85c',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 4
  },
  smallButton: {
    backgroundColor: '#4a90e2',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 6
  },
  smallDeleteButton: {
    backgroundColor: '#d9534f',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 6
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold'
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 12,
    marginBottom: 8
  },
  list: {
    maxHeight: 240,
    marginBottom: 10
  },
  card: {
    backgroundColor: 'white',
    padding: 14,
    borderRadius: 10,
    marginBottom: 10
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4
  },
  cardText: {
    fontSize: 14,
    marginBottom: 2
  },
  cardButtons: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10
  },
  form: {
    backgroundColor: 'white',
    padding: 14,
    borderRadius: 10,
    marginBottom: 10
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    backgroundColor: '#fff'
  },
  detailBox: {
    backgroundColor: 'white',
    padding: 14,
    borderRadius: 10,
    marginBottom: 20
  },
  detailText: {
    fontSize: 15,
    marginBottom: 6
  },
  detailButtons: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10
  },
  placeholderText: {
    color: '#666'
  }
})