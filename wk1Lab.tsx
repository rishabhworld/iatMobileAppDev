import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View, TextInput } from 'react-native';

export default function App() {
  console.log("App() function called"); // this will be printed in the console every time the app is re-rendered

  function myfunc() {
    console.log("button pressed");
  }

  const myfunc2 = () => { console.log("button pressed"); } // this is the same as the above function, just written as lambda function

  const [myvar, setMyvar] = useState('rg'); // this is a state variable, it will be re-rendered every time it is updated

  useEffect(() => {
    console.log("useEffect called"); // this will be printed in the console every time the app is re-rendered
  }, [myvar]); // this will be called every time myvar is updated

  return (
    <View style={styles.container}>

      {console.log("App() function returns something")}

      <Text style={styles.redHeader}>
        Varshu, Open up App.tsx to start working on your app!
        current value of myvar (state variable) is {myvar}
      </Text>

      <Pressable onPress={myfunc}><Text style={styles.buttons}>Press me</Text></Pressable>

      <TextInput
        placeholder='Enter text here'
        onChangeText={(newText) => setMyvar(newText)}
      />

      <StatusBar style="auto" />

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },

  redHeader: {
    color: 'red',
    fontSize: 20,
    fontWeight: 'bold'
  },

  buttons: {
    color: 'blue',
    fontSize: 50,
    fontWeight: 'bold'
  },
});
