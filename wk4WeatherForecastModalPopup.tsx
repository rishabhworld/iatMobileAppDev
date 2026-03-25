import { useEffect, useState } from 'react'
import {
    View,
    Text,
    TextInput,
    Button,
    FlatList,
    TouchableOpacity,
    Modal,
    StyleSheet,
} from 'react-native'

type ForecastItem = {
    dt: number
    dt_txt: string
    main: {
        temp: number
        feels_like: number
    }
    weather: {
        description: string
    }[]
}

export default function App() {
    const [task, setTask] = useState('')
    const [loading, setLoading] = useState(false)
    const [forecast, setForecast] = useState<ForecastItem[]>([])
    const [modalVisible, setModalVisible] = useState(false)


    const getforecast = () => {
        setLoading(true)
        //fetch('https://api.openweathermap.org/data/2.5/forecast?q=Sydney&units=metric&appid=198d3d20321030722aee50a83798f2a2')
        fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${task}&units=metric&appid=198d3d20321030722aee50a83798f2a2`)
            .then((response) => response.json())
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

            {forecast.length > 0 && (
                <View style={styles.taskContainer}>
                    <View style={styles.leftContainer}>
                        <Text style={styles.task}>{forecast[0].main.temp}°C</Text>
                        <Text style={styles.task}>{forecast[0].weather[0].description}</Text>
                    </View>
                    <TouchableOpacity onPress={() => setModalVisible(true)}>
                        <Text style={styles.seeForecast}>see forecast</Text>
                    </TouchableOpacity>
                </View>
            )}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>5-Day Forecast</Text>
                        <FlatList
                            data={forecast}
                            keyExtractor={(item) => item.dt.toString()}
                            renderItem={({ item }) => (
                                <View style={styles.forecastItem}>
                                    <Text style={styles.forecastTime}>{item.dt_txt}</Text>
                                    <Text style={styles.forecastTemp}>{item.main.temp}°C</Text>
                                </View>
                            )}
                        />
                        <Button title="Close" onPress={() => setModalVisible(false)} />
                    </View>
                </View>
            </Modal>
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
        justifyContent: 'space-between',
    },
    leftContainer: {
        flex: 1,
    },
    seeForecast: {
        color: 'blue',
        fontSize: 16,
        textDecorationLine: 'underline',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 10,
        width: '90%',
        maxHeight: '80%',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
        textAlign: 'center',
    },
    forecastItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: 'lightgray',
    },
    forecastTime: {
        fontSize: 16,
    },
    forecastTemp: {
        fontSize: 16,
        fontWeight: 'bold',
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