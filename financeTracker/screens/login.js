//login.js is the first screen the user seees which is to login, or to have an option to create an account if they already haven't
//on backend it will validate the info and respond appropriately


import React,{ useState, useEffect } from 'react';
import { StyleSheet, Text, View, Button, TextInput, TouchableWithoutFeedback, Keyboard  } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/FontAwesome';
import { Input } from 'react-native-elements';


export default function Login({navigation}){

    const[username, setUsername] = useState('');
    const[password, setPassword] = useState('');

    const saveData = async () => {
        try {
          await AsyncStorage.setItem('usernameGlobal', username)
          console.log('Username successfully saved in global async');
        } catch (e) {
          alert('Failed to save the username to the async storage')
          console.error(e);
        }

        try {
            await AsyncStorage.setItem('needToRefreshCalendar', "true")
            console.log('needToRefreshCalendar successfully saved in global async')
        } catch (e) {
            alert('Failed to save the needToRefreshCalendar to the async storage')
            console.error(e);
        }

        try {
            await AsyncStorage.setItem('needToRefreshYourProfile', "true")
            console.log('needToRefreshYourProfile successfully saved in global async')
        } catch (e) {
            alert('Failed to save the needToRefreshYourProfile to the async storage')
            console.error(e);
        }
    }

    handleSubmit = () => {

        console.log("Attemping to validate user submitted info...")

        const userAndPass = {username: username, password: password}

        fetch('http://192.168.50.105:3000/validateUserLogin',{
            method: 'POST',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(userAndPass)
        })
        .then(response => response.json())
        .then(data => {
            if(data){
                saveData().then(() =>{
                    console.log("Validation successful.")
                    setUsername('');
                    setPassword('');
                    navigation.navigate('Calendar', {
                    user: username
                    })
                })
                
                
                // console.log("Validation successful.");
                // navigation.navigate('Calendar', {
                //     user: username
                // })
            }
            else{
                console.log("wrong user/pass combo or something else went wrong");
            }
            
        }).catch((error) => {
            console.error(error);
        })
    }

    useEffect(() => {
        console.log("calling from login.js useEffect - testing")
    },[navigation])

    return(
            <TouchableWithoutFeedback onPress={() => {Keyboard.dismiss()}}>
                <View>
                    {/* <Text style = {styles.title}>{"\n"}Your Finance Tracker</Text> */}
                    <View style={styles.main}>
                        <Input
                            placeholder='Username'
                            label='Username'
                            leftIcon={{ type: 'antdesign', name: 'user' }}
                            onChangeText={text => setUsername(text)}
                        />
                        <Input
                            placeholder='Password'
                            label='Password'
                            secureTextEntry={true} 
                            leftIcon={{ type: 'feather', name: 'lock' }}
                            onChangeText={text => setPassword(text)}
                        />
                        <Button style={styles.button} title="Submit" onPress={handleSubmit}/>
                        <Button color="green" title="Create An Account" onPress={() => navigation.navigate('CreateAccount')}/>
                    </View>
                </View>
            </TouchableWithoutFeedback>
    )
};

const styles = StyleSheet.create({
    main: {
        height: '100%',
        width: '75%',
        justifyContent: 'center',
        marginLeft: '15%',
        paddingBottom: '10%',
        //marginHorizontal: 110,
    },
    button: {
        alignItems: "center",
        backgroundColor: "#DDDDDD",
        color: 'red'
      },
      title: {
          textAlign: 'center',
          paddingTop: '10%',
          fontSize: 25
      }
  });