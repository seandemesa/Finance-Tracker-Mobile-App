//dayInfo.js is the day screen that is navigated to when pressing a specific date in calendarMain.js
//shows payments for pressed date (if any), and gives user an option to add, edit, & delete payments


import React, { useState, useEffect } from 'react';
import { View, Text, Modal,TouchableWithoutFeedback, Keyboard, StyleSheet, FlatList, Alert } from 'react-native';
import { TouchableOpacity} from 'react-native-gesture-handler';
import SubmitPayment from './submitPayment';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ListItem, Button, Icon } from 'react-native-elements';

export default function DayInfo({ navigation, route }){

    const { day, paymentInfoFromDB, username, totalSpentOnDay} = route.params;
    const [modalOpen, setModalOpen] = useState(false);

    const [amountSpentOnDay, setAmountSpentOnDay] = useState(totalSpentOnDay);
    useEffect(() => { setAmountSpentOnDay(totalSpentOnDay)}, [totalSpentOnDay] );

    const [paymentInfoOfDay, setPaymentInfoOfDay] = useState(paymentInfoFromDB);

    const [initialVal, setInitialVal] = useState();
    const [existingPaymentID, setExistingPaymentID] = useState();
    const [indexToChange, setIndexToChange] = useState();

    handleEdit = (info, i) => {
        var valuesToSend;
        var IdToSend;
        var indexToSend;
        if(info == "new"){
            valuesToSend = { title: '', time: '', paymentAmount: '', cardUsed: '', userNotes: '' };
            IdToSend = info.id;
            indexToSend = "";
            setInitialVal({ title: '', time: '', paymentAmount: '', cardUsed: '', userNotes: '' });
            setExistingPaymentID("");
        }
        else{
            valuesToSend = { title: info.title, time: info.time, paymentAmount: info.paymentAmount, cardUsed: info.cardUsed, userNotes: info.userNotes };
            if(info.hasOwnProperty("id")){
                IdToSend = info.id;
            }
            else{
                IdToSend = info._id;
            }
            
            indexToSend = i;
            setExistingPaymentID(info._id);
            setIndexToChange(i);
            setInitialVal({ title: info.title, time: info.time, paymentAmount: info.paymentAmount, cardUsed: info.cardUsed, userNotes: info.userNotes });
        }
        navigation.navigate('SubmitPayment',{
            initialVal: valuesToSend,
            username: username,
            existingPaymentID: IdToSend,
            day: day,
            paymentInfoFromDB: paymentInfoOfDay,
            index: indexToSend,
            amountSpentOnDay: amountSpentOnDay
        })
    }

    handleDelete = (item, index) => {

        fetch('http://192.168.50.105:3000/deleteFromPaymentInfo',{
            method: 'POST',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(item)
        })
            .then(response => response.json())
            .then(data => {
                console.log("Successful deletion of payment from DB");
                const setData = async () => {
                    try {
                      await AsyncStorage.setItem('needToRefreshCalendar', "true")
                      console.log('needToRefreshCalendar successfully changed in global async')
                    } catch (e) {
                      alert('Failed to change the needToRefreshCalendar in async storage')
                      console.error(e);
                      }
                    }
                setData();
                const temp = [...paymentInfoOfDay];

                var newAmountSpent = totalSpentOnDay - temp[index].paymentAmount;
                console.log(newAmountSpent);
                temp.splice(index, 1);
                setAmountSpentOnDay(newAmountSpent);
                setPaymentInfoOfDay(temp);
                
            }).catch((error) => {
                console.error(error);
            }) 
    }
    

    deleteWarning = (item, index) => {
        Alert.alert(
            'Are you sure you want to delete ' + item.title + '?',
            '',
            [
              {
                text: "Cancel",
                onPress: () => console.log("Cancel Pressed"),
                style: "cancel"
              },
              { text: "Yes",
               onPress: () => handleDelete(item, index)
                }
            ]
          );
    }

    keyExtractor = (item,index) => index.toString();
    renderItem = ({item, index}) => {
        if(item.hasOwnProperty("title")){
        return(
            <ListItem.Swipeable bottomDivider
                leftContent={
                    <Button
                    title = "Edit"
                    icon={{name: 'edit', color: 'white'}}
                    buttonStyle={{minHeight: '100%'}}
                    onPress={() => handleEdit(item, index)}
                    />
                }
                rightContent={
                    <Button
                    title = "Delete"
                    icon={{name: 'delete', color: 'white'}}
                    buttonStyle={{minHeight: '100%', backgroundColor: 'red'}}
                    onPress={() => deleteWarning(item, index)}
                    />
                }
            >
                {item.hasOwnProperty("isRecurringPayment") ? <Icon name={'loop'}/>: null}
                <ListItem.Content>
                    <ListItem.Title>${item.paymentAmount}   -   {item.title}</ListItem.Title>
                    <ListItem.Subtitle>{item.hasOwnProperty("cardUsed") ? (item.cardUsed): <Text></Text>}{item.hasOwnProperty("time") && item.time.length > 0 ? (<Text>  -  {item.time}</Text>): <Text></Text>}</ListItem.Subtitle>
                    {item.hasOwnProperty("userNotes") && item.userNotes.length > 0 ? 
                    <ListItem.Subtitle>{item.userNotes}</ListItem.Subtitle>: null}
                </ListItem.Content>
            </ListItem.Swipeable>
            
        )
            }
    }

     useEffect(() => {
        
     },[paymentInfoOfDay, amountSpentOnDay])

    return(
        <View style = {styles.main}>
            <Button styles={styles.button} title="Add new payment" onPress={() => handleEdit("new",0)} />
            <Text></Text>
            {paymentInfoOfDay && paymentInfoOfDay.length ? 
            <Text style = {styles.textStyle}>Total spent for this day: ${amountSpentOnDay.toFixed(2)}</Text> : null}
            <Text></Text>
                {/* {console.log(amountSpentOnDay, "<-- amountSpentOnDay   ", totalSpentOnDay, "<-- totalSpentOnDay")} */}
            {paymentInfoOfDay && paymentInfoOfDay.length ?
            (<FlatList
                keyExtractor={keyExtractor}
                data={paymentInfoOfDay}
                renderItem={renderItem}
            />): <Text style = {styles.textStyle}>You have no payments for this day.</Text>}
            
        </View>
    )
}

const styles = StyleSheet.create({
    button: {
      alignItems: "center",
      width: '50%',
    },
    main: {
        height: '100%',
    },
    textStyle: {
        textAlign: 'center'
    }
  });