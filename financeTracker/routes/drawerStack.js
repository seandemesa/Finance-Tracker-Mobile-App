//drawerStack.js is the main stack for this application (i.e. it is the one we call in "app.js")
//utilizes drawer navigation to navigate to different files/screens and properly respond and show to user
//some screens are separate stacks, such as mainStack (which consists of calendar, dayInfo, & submitPayment)

import React from 'react'
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList, DrawerItem, DrawerItems } from '@react-navigation/drawer';
import YourProfile from '../screens/yourProfile';
import Login from '../screens/login';
import CreateAccount from '../screens/createAccount';
import Search from '../screens/searchPage';
import MainStack from './mainStack';
//import Header from '../header';

//const Stack = createStackNavigator();

const Drawer = createDrawerNavigator();

const CustomDrawerContent = (props) => {
    const { state, ...rest } = props;
    const newState = { ...state }; //copy from state before applying any filter. do not change original state
    // newState.routes = newState.routes.filter(
    //   (item) => item.name !== 'Login',
    // );
    newState.routes = newState.routes.filter(
        (item => !['Login', 'CreateAccount' ].includes(item.name)));
    
    return (
      <DrawerContentScrollView {...props}>
        <DrawerItemList state={newState} {...rest} />
        {/* <DrawerItem label="Logout" onPress={() => navigation.navigate()} /> */}
        <DrawerItem label="Logout" onPress={() => props.navigation.navigate("Login")} />
      </DrawerContentScrollView>
    );
  };

const ShowDrawer = () => {
    return(
        <Button title = 'open' onPress = {() =>navigation.openDrawer()}/>
    )
}

export default function DrawerStack(){

    return(
        <NavigationContainer>
             <Drawer.Navigator 
                initialRouteName="Login"
                drawerContent={props => <CustomDrawerContent {...props}/>}>

                {/* <Drawer.Screen 
                    name="Login" 
                    component={Login}
                    options={{
                        title:'Login',
                        //swipeEnabled: false,
                        drawerLabel: () => null
                    }}
                    
                    /> */}
                <Drawer.Screen
                    name="Calendar" 
                    component={MainStack}
                    options={{
                        headerShown: false,
                        headerLeft: null,
                        //headerTitle: () => <Header/>,
                        //headerTitle:'asdf'
                    }}
                />
                <Drawer.Screen 
                    name="Your Profile" 
                    component={YourProfile}
                    options={{
                        headerShown: true,
                        headerTitle:'Your Profile Info',
                    }}
                />
                <Drawer.Screen 
                    name="Search" 
                    component={Search}
                    options={{
                        headerShown: true,
                        headerTitle:'Search'
                    }}
                />
                <Drawer.Screen 
                    name="Login" 
                    component={Login}
                    options={{
                        title:'Login',
                        //swipeEnabled: false,
                        drawerLabel: () => null
                    }}
                    
                    />
                    <Drawer.Screen
                    name="CreateAccount" 
                    component={CreateAccount}
                    options={{
                        title:'Create an account',
                        //swipeEnabled: false,
                    }}
                />
            </Drawer.Navigator>
        </NavigationContainer>
    )
}