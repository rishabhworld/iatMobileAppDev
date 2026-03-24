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


export default function App() {

  const [task, setTask] = useState('')
  const [tasks, setTasks] = useState<string[]>([])
  const addTask = () => {
    if (task.trim()) {  // this will check if the task is not just empty spaces
      setTasks([...tasks, task])  // this will add the new task to the end of the tasks array
      setTask('') // this will clear the input field after adding the task
    }
  }
  const deleteTask = (index: number) => {
    setTasks(tasks.filter((_, i) => i !== index)) // this will remove the task at the given index from the tasks array
  }



  return (
    <View style={styles.container}>
      <Text style={styles.title}>To-Do List</Text>

      <TextInput
        style={styles.input}
        placeholder="Enter a task"
        value={task}  // this will set the value of the input field to the task state variable
        onChangeText={setTask}  // this will update the task state variable every time the text in the input field changes
      />

      <Button title="Add Task" onPress={addTask} />

      <FlatList
        data={tasks}
        keyExtractor={(_, index) => index.toString()}
        renderItem={({ item, index }) => (
          <View style={styles.taskContainer}>
            <Text style={styles.task}>{item}</Text>

            <TouchableOpacity onPress={() => deleteTask(index)}>
              <Text style={styles.delete}>delete</Text>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'lightgray',
  },
  task: {
    fontSize: 18,
  },
  delete: {
    color: 'orange',
    fontSize: 20,
  },
})