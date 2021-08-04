import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput } from 'react-native';
import { SearchBar, Button } from 'react-native-elements';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Search() {

  const [search, setSearch] = useState('');
  const [firstDateYear, setFirstDateYear] = useState([]);
  const [firstDateMonth, setFirstDateMonth] = useState([]);
  const [firstDateDay, setFirstDateDay] = useState([]);
  const [secondDateYear, setSecondDateYear] = useState([]);
  const [secondDateMonth, setSecondDateMonth] = useState([]);
  const [secondDateDay, setSecondDateDay] = useState([]);
  const [totalSpent, setTotalSpent] = useState();

  searchForPayments = async() => {

    const firstDate = new Date(firstDateYear + '-' + firstDateMonth + '-' + firstDateDay);
    const secondDate = new Date(secondDateYear + '-' + secondDateMonth + '-' + secondDateDay);
    const username = await AsyncStorage.getItem('usernameGlobal');

    console.log(firstDate, "HAUH")
    console.log("OK",secondDate)
    console.log(search, 'ajklhsdbajkshdb')

    const infoToSend = {username: username, search: search, firstDate: firstDate, secondDate: secondDate};
    fetch('http://192.168.50.105:3000/TESTINGFINDDATES',{
      method: 'POST',
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(infoToSend)
    })
    .then(response => response.json())
    .then(data => {
      if(data && data.length > 0){
        var total = 0;
        for(let i = 0; i < data.length;i++){
          total+= parseFloat(data[i].paymentAmount);
        }
        setTotalSpent(total);
      }
      else{
        setTotalSpent(-1);
      }
      console.log(data);
    }).catch((error) => {
      console.error(error);
    }) 
  }

  useEffect(() => {

  },[totalSpent])

  return (
      <View>
        <Text></Text>
        <Text style = {{textAlign: 'center'}}>Check how much you've spent on</Text>
        <View style = {styles.ok}>
          <TextInput
            placeholder="name"
            onChangeText={text => setSearch(text)}
          />
        </View>
        <View style = {styles.inputStyle}>
          
          <Text>FROM   </Text>
          <TextInput
            placeholder="Year"
            onChangeText={text => setFirstDateYear(text)}
            keyboardType = 'number-pad'
          />
          <Text> / </Text>
          <TextInput
            placeholder="Month"
            onChangeText={text => setFirstDateMonth(text)}
            keyboardType = 'number-pad'
          />
          <Text> / </Text>
          <TextInput
            placeholder="Day"
            onChangeText={text => setFirstDateDay(text)}
            keyboardType = 'number-pad'
          />
          <Text>   TO   </Text>
          <TextInput
            placeholder="Year"
            onChangeText={text => setSecondDateYear(text)}
            keyboardType = 'number-pad'
          />
          <Text> / </Text>
          <TextInput
            placeholder="Month"
            onChangeText={text => setSecondDateMonth(text)}
            keyboardType = 'number-pad'
          />
          <Text> / </Text>
          <TextInput
            placeholder="Day"
            onChangeText={text => setSecondDateDay(text)}
            keyboardType = 'number-pad'
          />
          
        </View>
        <Text></Text>
        <Button title="Enter" onPress = {() => searchForPayments()}/>
        <Text></Text>
        {totalSpent ? 
        (totalSpent != -1 ? 
        (<Text style={{textAlign: 'center'}}>You've spent a total of ${totalSpent.toFixed(2)} on {search}</Text>):<Text style={{textAlign: 'center'}}>Cannot find any payments for "{search}".</Text> ):
        null}
      </View>
  );
}

const styles = StyleSheet.create({
  inputStyle: {
     flexDirection: "row",
     justifyContent: 'center',
  },
  ok: {
    justifyContent: 'center',
    width: '50%',
    marginLeft:'45%'
  }
});