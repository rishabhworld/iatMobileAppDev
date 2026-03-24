import { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native'

type Task = {
  title: string
  completed: boolean
}

export default function App() {
  const [task, setTask] = useState('')
  const [tasks, setTasks] = useState<Task[]>([])

  const addTask = () => {
    if (task.trim()) {
      setTasks([...tasks, { title: task, completed: false }])
      setTask('')
    }
  }

  const deleteTask = (index: number) => {
    setTasks(tasks.filter((_, i) => i !== index))
  }

  const toggleComplete = (index: number) => {
    const updatedTasks = [...tasks]
    updatedTasks[index].completed = !updatedTasks[index].completed
    setTasks(updatedTasks)
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>To-Do List</Text>

      <TextInput
        style={styles.input}
        placeholder="Enter a task"
        value={task}
        onChangeText={setTask}
      />

      <Button title="Add Task" onPress={addTask} />

      <FlatList
        data={tasks}
        keyExtractor={(_, index) => index.toString()}
        renderItem={({ item, index }) => (
          <View style={styles.taskContainer}>

            {/* Toggle Complete */}
            <TouchableOpacity onPress={() => toggleComplete(index)}>
              <Text style={styles.checkbox}>
                {item.completed ? '✅' : '⬜'}
              </Text>
            </TouchableOpacity>

            {/* Task Text */}
            <Text
              style={[
                styles.task,
                item.completed && styles.completedTask,
              ]}
            >
              {item.title}
            </Text>

            {/* Delete */}
            <TouchableOpacity onPress={() => deleteTask(index)}>
              <Text style={styles.delete}>🗑️</Text>
            </TouchableOpacity>

          </View>
        )}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: 'gray',
    padding: 10,
    marginBottom: 10,
  },
  taskContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'lightgray',
  },
  checkbox: {
    fontSize: 18,
    marginRight: 10,
  },
  task: {
    flex: 1,
    fontSize: 18,
  },
  completedTask: {
    textDecorationLine: 'line-through',
    color: 'gray',
  },
  delete: {
    color: 'orange',
    fontSize: 15,
  },
})