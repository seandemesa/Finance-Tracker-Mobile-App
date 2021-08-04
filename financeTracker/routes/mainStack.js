//mainStack.js is an separate stack that is part of the main drawer stack
//the reason it is separate is because I wanted the screen that had a specific day's information/payments to be independant of the main stack
//However, looking back I think it is not as necessary since I didn't know I could tweak certain things about certain screens in drawer nav
//such as removing the ability to open the drawer or having it show up/represented on the drawer


import React from 'react'
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator, HeaderBackButton  } from '@react-navigation/stack';
import { Button } from 'react-native';
import CalendarMain from '../screens/calendarMain';
import DayInfo from '../screens/dayInfo';
import SubmitPayment from '../screens/submitPayment';
import Login from '../screens/login';
import CreateAccount from '../screens/createAccount';

import Header from '../header';

const Stack = createStackNavigator();

export default function MainStack({route}){

    const {user} = route.params;

    return(
        //<NavigationContainer>
            <Stack.Navigator 
            initialRouteName="Calendar"
            screenOptions={{
                headerStyle:{
                    backgroundColor: "#eee",
                    height: 100,
                },
                headerTintColor: "#444"
            }}
            >
                {/* <Stack.Screen 
                name="Login" 
                component={Login}
                options={{
                    title:'Login'
                }}
                />
                <Stack.Screen 
                name="CreateAccount" 
                component={CreateAccount}
                options={{
                    title:'Create an account'
                }}
                />
                <Stack.Screen 
                name="Drawer" 
                component={DrawerStack}
                /> */}
                <Stack.Screen 
                name="Calendar" 
                component={CalendarMain}
                initialParams={{ user: user }}
                options={({navigation})=> ({
                    title:'Payment Calendar',
                    headerLeft: ()=><Header navigation={navigation}/>,
                })}
                />
                <Stack.Screen 
                name="DayInfo" 
                component={DayInfo}
                options={({route}) => ({title: route.params.day.dateString})}
                />
                <Stack.Screen 
                name="SubmitPayment" 
                component={SubmitPayment}
                options={{title: 'Create a new payment'}}
                />
            </Stack.Navigator>
        //</NavigationContainer>
    )
}