import React from 'react';
import { StyleSheet, Text, View, Dimensions, Image, ImageBackground } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

export default function Header({navigation}) {

    const openMenu = () =>{
        navigation.openDrawer();
    }

    return (
        <View style = {{flexDirection: 'row'}}>
            <Text>   </Text>
            <MaterialIcons name='menu' size={26} onPress={openMenu}/>
                <View>
                    
                </View>
        </View>
    )
}
