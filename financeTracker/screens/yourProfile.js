//yourProfile.js is an option on the main drawer navigation which will show the user different things about them,
//such as their username, how much they have spent in the current month, and any recurring payments they have
//It also gives the user an option to add a recurring payment, which will then show up when the user navigates back to the main calendar


import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Modal,TouchableWithoutFeedback, Keyboard, FlatList, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RecurringPayment from './recurringPayment';
import { ListItem, Button, Icon } from 'react-native-elements';

export default function YourProfile({navigation}) {

  var date = new Date();
  var currMonth = date.getMonth() + 1;
  var currYear = date.getFullYear();

  const [userInfo, setUserInfo] = useState([]);
  const [monthlyAmountPayed, setMonthlyAmountPayed] = useState(0);
  const [username, setUsername] = useState([]);
  const [recurringPayments, setRecurringPayments] = useState();
  const [modalOpen, setModalOpen] = useState(false);
  const [valuesToSendForEdit, setValuesToSendForEdit] = useState({ title: '', paymentAmount: '', cardUsed: '', userNotes: '', dayOfMonthToBill: '' });

  const [needToRefreshYourProfile, setNeedToRefreshYourProfile] = useState();

  useEffect(() => { setMonthlyAmountPayed(monthlyAmountPayed)}, [monthlyAmountPayed] );

  const SubmitInfoToDB = (userSubmittedInfo) =>{

    userSubmittedInfo.username = username;
    userSubmittedInfo.isRecurringPayment = true;

    var nameAlreadyExists = false;
    for (let i = 0; i < recurringPayments.length; i++){
      if(userSubmittedInfo.title == recurringPayments[i].title){
        nameAlreadyExists = true;
        break;
      }
    }

    if(!nameAlreadyExists){
      fetch('http://192.168.50.105:3000/createRecurringPayment',{
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userSubmittedInfo)
      })
      .then(response => response.json())
      .then(data => {
          //setRecurringPayments([...recurringPayments, userSubmittedInfo]);
          userSubmittedInfo["tempID"] =  data.insertedId;
          const setData = async () => {
            try {
              await AsyncStorage.setItem('needToRefreshYourProfile', "true")
              await AsyncStorage.setItem('needToRefreshCalendar', "true")
              console.log('needToRefreshCalendar successfully changed in global async')
              //setNeedToRefreshYourProfile("true")
              console.log('needToRefreshYourProfile successfully changed in global async')
              setRecurringPayments([...recurringPayments, userSubmittedInfo]);
              var x = monthlyAmountPayed + parseFloat(userSubmittedInfo.paymentAmount)
              setMonthlyAmountPayed(x);
            } catch (e) {
              alert('Failed to change the needToRefreshYourProfile and/or needToRefreshCalendar in async storage')
              console.error(e);
              }
            }
          setData();
          console.log("Successful post from SubmitInfoToDB func on yourProfile.js");
      }).catch((error) => {
          console.error(error);
      })
    }
    else{
      Alert.alert(
        'A recurring payment with that name already exists.',
        'Please create one with a different name.',
        [
          {
            text: "Cancel",
            style: "cancel"
          },
        ]
      );
    }

    
    //console.log(userSubmittedInfo);

    setModalOpen(false);
  }

  testingFunc = () =>{
    setModalOpen(false)
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
    }

  //this function is called in the useEffect (i.e. to be ran on specific renders) to check for recurring payments
  //which we will save in a state and use as display
  checkRecurringPayments = () => {
    fetch('http://192.168.50.105:3000/checkRecurringPayments',{
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({username: username})
    })
    .then(response => response.json())
    .then(data => {
      setRecurringPayments(data);
      console.log("Successful check of recurring payments from checkRecurringPayments func");
    }).catch((error) => {
      console.error(error);
    })
  }

  handleAdd = () => {
    setValuesToSendForEdit({ title: '', paymentAmount: '', cardUsed: '', userNotes: '', dayOfMonthToBill: '' , index: -1});
    setModalOpen(true);
  }

  const [tempID, setTempID] = useState();
  handleEdit = (item, index) => {
    if(item.hasOwnProperty('tempID')){
      setTempID(item.tempID);
    }
    else{
      setTempID(item._id);
    }
    console.log(item, " - checking pre-modal")
    setValuesToSendForEdit({ title: item.title, paymentAmount: item.paymentAmount, cardUsed: item.cardUsed,
      userNotes: item.userNotes, dayOfMonthToBill: item.dayOfMonthToBill, index: index });
    setModalOpen(true);
  }

  const updateRecurringPayment = (userSubmittedInfo, index) =>{
    //console.log(userSubmittedInfo, "CHECKING IN UPDATE")
    userSubmittedInfo.username = username;
    userSubmittedInfo.isRecurringPayment = true;
    userSubmittedInfo.tempID = tempID;
    //var nameAlreadyExists = false;
    var existsCounter = 0;
    for (let i = 0; i < recurringPayments.length; i++){
      if(userSubmittedInfo.title == recurringPayments[i].title){
        //nameAlreadyExists = true;
        existsCounter++;
        if(existsCounter > 1){
          break;
        };
      }
    }

    if (existsCounter <= 1){
      fetch('http://192.168.50.105:3000/updateRecurringPayment',{
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userSubmittedInfo)
      })
      .then(response => response.json())
      .then(data => {
        //setRecurringPayments([...recurringPayments, userSubmittedInfo]);
        var oldPaymentAmount = parseFloat(recurringPayments[index].paymentAmount);
        recurringPayments[index] = userSubmittedInfo;
        
        const setData = async () => {
          try {
            await AsyncStorage.setItem('needToRefreshYourProfile', "true")
            //await AsyncStorage.setItem('needToRefreshCalendar', "true")
            //console.log('needToRefreshCalendar successfully changed in global async')
            setNeedToRefreshYourProfile("true")
            console.log('needToRefreshYourProfile successfully changed in global async')
            
          } catch (e) {
            alert('Failed to change the needToRefreshYourProfile and/or needToRefreshCalendar in async storage')
            console.error(e);
            }
          }
        setData();
        Alert.alert(
          'Update payment for current month or starting next month?',
          '',
          [
            {
              text: "Next Month",
              onPress: () => console.log("Next Month Pressed"),
              style: "cancel"
            },
            { text: "This Month",
              onPress: () => reflectUpdateOnCurrentMonth(userSubmittedInfo, oldPaymentAmount),
              }
          ]
        );
        console.log("Successful post from SubmitInfoToDB func on yourProfile.js");
      }).catch((error) => {
          console.error(error);
      })
    }
    else{
      Alert.alert(
        'A recurring payment with that name already exists.',
        'Please create one with a different name.',
        [
          {
            text: "Cancel",
            style: "cancel"
          },
        ]
      );
    }

    setModalOpen(false);
  }

  //this function is called in the func "updateRecurringPayment" above when the user specifys that they want their updated recurring payment change
  //to be reflected in the current month (e.g. they created a recurring payment to be billed every 7th. that payment is created in recurringPayments & paymentInfo collection.
  //they changed the cardUsed and changed billing to every 9th and want the change reflected. this function will change that aforementioned payment in paymentInfo.)
  reflectUpdateOnCurrentMonth = (userSubmittedInfo, oldPaymentAmount) => {
    var currDay = userSubmittedInfo.dayOfMonthToBill;
    if(parseInt(currDay) < 10){
      currDay = "0" + currDay
    } 

    var date = new Date();
    var currMonth = date.getMonth() + 1;
    var addMonth = currMonth;
    if(currMonth < 10){
      currMonth = "0" + currMonth
    }
  
    var currYear = date.getFullYear();

    const dateString = currYear + "-" + currMonth + "-" + currDay
    
    userSubmittedInfo.date = dateString;
    userSubmittedInfo.month = addMonth;
    userSubmittedInfo.year = currYear;

    console.log(userSubmittedInfo, " - checking payment to update")
    fetch('http://192.168.50.105:3000/reflectUpdatedRecurringPayment',{
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userSubmittedInfo)
    })
    .then(response => response.json())
    .then(data => {
      const setData = async () => {
        try {
          await AsyncStorage.setItem('needToRefreshCalendar', "true")
          console.log('needToRefreshCalendar successfully changed in global async')
        } catch (e) {
          alert('Failed to change the needToRefreshCalendar in async storage')
          console.error(e);
          }
        }
        var x = monthlyAmountPayed - oldPaymentAmount + parseFloat(userSubmittedInfo.paymentAmount)
        setMonthlyAmountPayed(x);
    setData();
      console.log("Successful update of recurring payment in paymentInfo from reflectUpdateOnCurrentMonth func");
    }).catch((error) => {
      console.error(error);
    })
  }

  handleDelete = (item, index) => {
        
    fetch('http://192.168.50.105:3000/deleteFromRecurringPayment',{
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item)
    })
        .then(response => response.json())
        .then(data => {
            console.log("Successful deletion of recurring payment from DB");
            const setData = async () => {
              try {
                await AsyncStorage.setItem('needToRefreshYourProfile', "true")
                console.log('needToRefreshYourProfile successfully changed in global async')
                
              } catch (e) {
                alert('Failed to change the needToRefreshYourProfile and/or needToRefreshCalendar in async storage')
                console.error(e);
                }
              }
            setData();
            Alert.alert(
              'Delete payment that exists for this month?',
              '',
              [
                {
                  text: "No",
                  onPress: () => console.log("No Pressed"),
                  style: "cancel"
                },
                { text: "Yes",
                  onPress: () => reflectDeleteOnCurrentMonth(item),
                  }
              ]
            );
            const temp = [...recurringPayments];
            temp.splice(index, 1);
            setRecurringPayments(temp);
            
        }).catch((error) => {
            console.error(error);
        }) 
}

//this function is called in the func "handleDelete" above when the user specifys that they want their deleted recurring payment change
//to be reflected in the current month (e.g. they created a recurring payment to be billed every 7th. that payment is created in recurringPayments & paymentInfo collection.
//they delete the recurring payment and also want the payment of it in paymentInfo deleted. this function will delete the payment in paymentInfo)
reflectDeleteOnCurrentMonth = (item) => {
  var date = new Date();
    var currMonth = date.getMonth() + 1;
    // if(currMonth < 10){
    //   currMonth = "0" + currMonth
    // }
    item.month = currMonth;
  fetch('http://192.168.50.105:3000/reflectDeletedRecurringPayment',{
    method: 'POST',
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(item)
  })
  .then(response => response.json())
  .then(data => {
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
    var x = monthlyAmountPayed - parseFloat(item.paymentAmount);
    setMonthlyAmountPayed(x);
    console.log("Successful deletion of a payment in paymentInfo to reflect deletion of a recurring payment");
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

  useEffect(() => {
      const unsubscribe = navigation.addListener('focus', () => {
        const joeSchmo = async () =>{
          try {
            const usernameGlobal = await AsyncStorage.getItem('usernameGlobal');
      
            setUsername(usernameGlobal);
      
            const userPaymentsOnDay = {month: currMonth, year: currYear, username: usernameGlobal}

            const needToRefreshYourProfile = await AsyncStorage.getItem('needToRefreshYourProfile');

            //first thing we do on the page is get all payments by the current month
            if(needToRefreshYourProfile == "true"){
              fetch('http://192.168.50.105:3000/paymentsByCurrentMonth',{
                      method: 'POST',
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify(userPaymentsOnDay)
                  })
                  .then(response => response.json())
                  .then(data => {
                      console.log("successful fetch call from client side for /paymentsByCurrentMonth on yourProfile.js");
                      if(data.length > 0){
                        var hauh = 0;
                        for (let i = 0; i < data.length; i++) {
                          hauh += parseFloat(data[i].paymentAmount)
                        } 
                        setMonthlyAmountPayed(hauh);
                      }
                      checkRecurringPayments();
                  }).catch((error) => {
                      console.error(error);
                  })
              }
              await AsyncStorage.setItem('needToRefreshYourProfile', "false")
              setNeedToRefreshYourProfile("false");
              
          } catch (e) {
            alert('Failed to fetch the username from async storage - cannot call /paymentsByCurrentMonth')
          }  
        }
        joeSchmo();
      })
    
    return unsubscribe;
    
  },[navigation, recurringPayments, monthlyAmountPayed])//, [needToRefreshYourProfile])

  keyExtractor = (item,index) => index.toString();
  renderItem = ({item, index}) => {
    //console.log(item, "SOMETHING SOMETHING SOMETHING")
    var daySuffix;
    if(item.dayOfMonthToBill[item.dayOfMonthToBill.length - 1] == "1"){
      daySuffix = "st"
    }
    else if(item.dayOfMonthToBill[item.dayOfMonthToBill.length - 1] == "2"){
      daySuffix = "nd"
    }else if(item.dayOfMonthToBill[item.dayOfMonthToBill.length - 1] == "3"){
      daySuffix = "rd"
    }
    else{
      daySuffix = "th"
    }
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
              <ListItem.Content>
                  <ListItem.Title>{item.title}   -   ${item.paymentAmount}</ListItem.Title>
                  <ListItem.Subtitle>{item.hasOwnProperty("cardUsed") ? <Text>Card: {item.cardUsed}</Text>: <Text></Text>}</ListItem.Subtitle>
                  <ListItem.Subtitle>Billed every {item.dayOfMonthToBill}{daySuffix}</ListItem.Subtitle>
                  {item.hasOwnProperty("userNotes") && item.userNotes.length > 0 ? 
                  <ListItem.Subtitle>{item.userNotes}</ListItem.Subtitle>: null}
              </ListItem.Content>
          </ListItem.Swipeable>
      )
  }

  return (
      <View style={styles.main}>

        <Modal visible={modalOpen} animationType='slide'>
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
              <View>
                  <RecurringPayment addPayment = {SubmitInfoToDB} updatePayment = {updateRecurringPayment} valuesInit = {valuesToSendForEdit}/>
                  <Button title="close" onPress={() => setModalOpen(false)}/>
                  {/* <Button title="Reset Calendar" onPress={() => testingFunc()}/> */}
              </View>
          </TouchableWithoutFeedback>
        </Modal>

        <Text style={styles.textStyle}>Username: {username}</Text>
        <Text></Text>
        <Text style={styles.textStyle}>Current amount payed for this month: ${monthlyAmountPayed.toFixed(2)}</Text>
        <Button title="Create Reccuring payment" onPress={() => handleAdd()}/>

        {recurringPayments && recurringPayments.length ?
          (<FlatList
              keyExtractor={keyExtractor}
              data={recurringPayments}
              renderItem={renderItem}
          />): <Text>You have no reccuring payments.</Text>}
          
      </View>
  );
}

const styles = StyleSheet.create({
  main: {
      height: '90%',
  },
  textStyle: {
    textAlign: 'center'
},
});