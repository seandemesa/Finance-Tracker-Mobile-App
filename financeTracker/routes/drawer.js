import React from 'react';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList, DrawerItem } from '@react-navigation/drawer';
import { NavigationContainer } from '@react-navigation/native';

import MainStack from './mainStack';

const Drawer = createDrawerNavigator();

export default Navigator = () => {
  return (
    //<NavigationContainer>
      <Drawer.Navigator initialRouteName="Login" drawerContent={props => {
        return (
            <DrawerContentScrollView {...props}>
                <DrawerItemList {...props} />
                <DrawerItem label="Logout" onPress={() => props.navigation.navigate("Login")} />
            </DrawerContentScrollView>
        )
        }}>
        <Drawer.Screen name="Home" component={MainStack} />
      </Drawer.Navigator>
    //</NavigationContainer>
  );
}