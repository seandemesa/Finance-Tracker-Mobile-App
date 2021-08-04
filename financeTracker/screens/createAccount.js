//createAccount.js is used to create an account for the user which, if acceptable, will get inserted into the database


import React,{ useState, useEffect } from 'react';
import { StyleSheet, Text, View, Button, TextInput, Alert  } from 'react-native';
import { Input } from 'react-native-elements';

export default function Login({navigation}){

    const[username, setUsername] = useState('');
    const[password, setPassword] = useState('');
    const[confirmPassword, setConfirmPassword] = useState('');

    const[passwordMatch, setPasswordMatch] = useState('');

    handleSubmit = () => {
        if(password != confirmPassword){
            console.log("Passwords do not match");
            setPasswordMatch('Passwords do not match')
        }
        else{
            console.log("Passwords match! Sending over to DB...")

            const userAndPass = {username: username, password: password}

            fetch('http://192.168.50.105:3000/insertUserInfo',{
                method: 'POST',
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(userAndPass)
            })
            .then(response => response.json())
            .then(data => {
                console.log("Successful post & hash of user info from client (createAccount.js)");
                Alert.alert(
                    "Account created successfully",
                    "",
                    [
                      { text: "OK", onPress: () => navigation.navigate('Login') }
                    ]
                  );
                //navigation.navigate('Login')
            }).catch((error) => {
                console.error(error);
            })
            }
        
    }

    return(
        <View style={styles.main}>
            {/* <TextInput
                placeholder="Username"
                onChangeText={text => setUsername(text)}
            />
            <TextInput
                placeholder="Password"
                onChangeText={text => setPassword(text)}
            />
            <TextInput
                placeholder="Confirm Password"
                onChangeText={text => setConfirmPassword(text)}
            /> */}
            <Input
                placeholder='Username'
                label='Username'
                leftIcon={{ type: 'antdesign', name: 'adduser' }}
                onChangeText={text => setUsername(text)}
            />
            <Input
                placeholder='Password'
                label='Password'
                secureTextEntry={true} 
                leftIcon={{ type: 'material-community', name: 'lock' }}
                onChangeText={text => setPassword(text)}
            />
            <Input
                placeholder='Confirm Password'
                label='Confirm Password'
                secureTextEntry={true} 
                leftIcon={{ type: 'material-community', name: 'lock-check' }}
                onChangeText={text => setConfirmPassword(text)}
            />

        
            <Button color="pink"title="Create Account" onPress={handleSubmit}/>
            <Button color="purple"title="Go back to login screen" onPress={() => navigation.navigate('Login')}/>
            <Text style={styles.red} >{passwordMatch}</Text>
        </View>
    )
};

const styles = StyleSheet.create({
    red: {
      color: 'red',
    },
    main: {
        height: '100%',
        width: '75%',
        justifyContent: 'center',
        marginLeft: '15%',
    },
  });
  
