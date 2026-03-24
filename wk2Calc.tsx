import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View, TextInput } from 'react-native';


const calcButtons = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '+', '-', '='];

export default function App() {

  const [myvar, setMyvar] = useState(0); // this is a state variable, it will be re-rendered every time it is updated
  const [myoperator, setMyoperator] = useState(''); // this is a state variable, it will be re-rendered every time it is updated
  const [result, setResult] = useState(0); // this is a state variable, it will be re-rendered every time it is updated
  const [displayString, setDisplayString] = useState(''); // this is the string of numbers and operators that the user has inputted so far


  useEffect(() => {
    console.log("useEffect called"); // this will be printed in the console every time the app is re-rendered
    console.log('useEffect log: result: ', result, ', myvar: ', myvar, ', myoperator: ', myoperator, ', displayString: ', displayString);
  }, [myvar, myoperator, result, displayString]); // this will be called every time myvar, myoperator, result or displayString is updated


  function myCalc(button: string) {

    // If number is pressed
    if (!isNaN(Number(button))) {
      setDisplayString(displayString + button);
      setMyvar(prev => prev * 10 + Number(button)); // this will add the new number to the end of the current number
      //console.log('isNaN log: result: ', result, ', myvar: ', myvar, ', displayString: ', displayString);
      return;
    }

    // If + or - is pressed
    if (button === '+' || button === '-') {
      setDisplayString(displayString + button);
      //if (myoperator === '+') { setResult(prev => prev + myvar) }
      //else if (myoperator === '-') { setResult(prev => prev - myvar) }
      setResult(myvar);
      setMyvar(0);
      setMyoperator(button);
      //console.log('operator log: result: ', result, ', myvar: ', myvar, ', displayString: ', displayString);
      return;
    }

    // If = is pressed
    if (button === '=') {
      let localresult = 0;
      if (myoperator === '+') { localresult = result + myvar }
      else if (myoperator === '-') { localresult = result - myvar }
      setDisplayString(localresult.toString());
      setMyvar(0);
      setResult(0);
      setMyoperator('');
      //console.log('equals log: result: ', result, ', myvar: ', myvar, ', displayString: ', displayString);
      return;
    }
  }


  return (
    <View style={styles.container}>

      {/*console.log("App() function return jsx called")*/}

      <Text style={{ color: 'red', fontSize: 20, fontWeight: 'bold' }}>
        result: {displayString}
      </Text>


      {calcButtons.map((button) => (
        <Pressable onPress={() => { myCalc(button); console.log('button: ', button); }}><Text style={styles.buttons}>   {button}   </Text></Pressable>
      ))}


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

  buttons: {
    backgroundColor: 'blue',
    color: 'white',
    fontSize: 50,
    fontWeight: 'bold'
  },
});
