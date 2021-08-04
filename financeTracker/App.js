import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import CalendarMain from './screens/calendarMain';
import MainStack from './routes/mainStack';
import Navigator from './routes/drawer';
import DrawerStack from './routes/drawerStack';

export default function App() {
  return (
      //<MainStack/>
      <DrawerStack/>
      //<Navigator/>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
