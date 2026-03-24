import { useEffect, useState } from 'react'
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

  const [loading, setLoading] = useState(false)
  const [forecast, setForecast] = useState([])


  const getforecast = () => {
    setLoading(true)
    //fetch('https://api.openweathermap.org/data/2.5/forecast?q=Sydney&units=metric&appid=198d3d20321030722aee50a83798f2a2')
    fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${task}&units=metric&appid=198d3d20321030722aee50a83798f2a2`)
      .then((response) => response.json() )
      .then((json) => {
        console.log('JSON RESPONSE received', json)
        setForecast(json.list)
        setLoading(false)
      })
  }







  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Loading...</Text>
      </View>
    )
  }





  return (
    <View style={styles.container}>
      <Text style={styles.title}>Open Weather API POC</Text>

      <TextInput
        style={styles.input}
        placeholder="Enter a city"
        value={task}
        onChangeText={setTask}
      />



      <Button title="get forecast" onPress={getforecast} />

      <FlatList
        data={forecast}
        keyExtractor={(item: any) => item.dt}
        renderItem={({ item }) => (
          <View style={styles.taskContainer}>



            {/* Task Text */}
            <Text style={[styles.task]}>{item.dt_txt}</Text>
            <Text style={[styles.task]}>{item.main.temp} Celcius</Text>



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