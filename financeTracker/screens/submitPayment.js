//submitPayment is the form screen when a user wants to add a payment on a specific date
//it is the screen that is shown when trying to add a payment (from dayInfo.js)
//Uses Formik in combination with yup for form validation 


import React, { useState, useEffect } from 'react';
import { StyleSheet, TextInput, Button, View, Text, TouchableWithoutFeedback, Keyboard, ScrollView } from 'react-native';
import { Formik } from 'formik';
import * as yup from 'yup';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Input } from 'react-native-elements';

const validationForm = yup.object({
    title: yup.string().required(),
    time: yup.string(),
    cardUsed: yup.string(),
    userNotes: yup.string(),
    paymentAmount: yup.number().required()
  });
  

export default function SubmitPayment({navigation, route}){//({ addPayment, initialVal }) {

    const {initialVal, username, existingPaymentID, day, paymentInfoFromDB, index, amountSpentOnDay} = route.params
    //console.log(paymentInfoFromDB)
    const [paymentInfoOfDay, setPaymentInfoOfDay] = useState([]);
    const SubmitInfoToDB = (userSubmittedInfo) =>{
      
      setPaymentInfoOfDay(paymentInfoFromDB);
      userSubmittedInfo.date = day.dateString;
      userSubmittedInfo.day = day.day;
      userSubmittedInfo.month = day.month;
      userSubmittedInfo.year = day.year;
      userSubmittedInfo.username = username;
      //setPaymentInfoOfDay({...userSubmittedInfo});
      if(index === ""){
          fetch('http://192.168.50.105:3000/postTest',{
              method: 'POST',
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(userSubmittedInfo)
          })
          .then(response => response.json())
          .then(data => {
              setPaymentInfoOfDay([...paymentInfoOfDay, userSubmittedInfo]);
              
              userSubmittedInfo["id"] =  data.insertedId;
              paymentInfoFromDB.push(userSubmittedInfo);
              //const toSend = paymentInfoFromDB;
              console.log("Successful post from SubmitInfoToDB func");
              const setData = async () => {
                try {
                  await AsyncStorage.setItem('needToRefreshCalendar', "true")
                  console.log('needToRefreshCalendar successfully changed in global async')
                } catch (e) {
                  alert('Failed to change the needToRefreshCalendar in async storage')
                  console.error(e);
                  }
                }
              //setData();

              var totalSpentOnDayNew = parseFloat(amountSpentOnDay + parseFloat(userSubmittedInfo.paymentAmount))
              // console.log(amountSpentOnDay, " <-- amt spent on day", typeof(amountSpentOnDay))
              // console.log(totalSpentOnDayNew, " <-- amt from inside submitPayment", typeof(totalSpentOnDayNew))
              navigation.navigate('DayInfo',{
                day: day,
                paymentInfoFromDB: paymentInfoFromDB,
                username: username,
                totalSpentOnDay: totalSpentOnDayNew
              })
              setData();
              console.log("post-navigate here")
          }).catch((error) => {
              console.error(error);
          })
      }
      else{
          console.log(existingPaymentID)
          const updateInfo = {userSubmittedInfo, existingPaymentID}
          fetch('http://192.168.50.105:3000/updatePaymentInfo',{
              method: 'POST',
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(updateInfo)
          })
          .then(response => response.json())
          .then(data => {
              var currAmount = parseFloat(paymentInfoFromDB[index].paymentAmount);
              var newAmount = parseFloat(amountSpentOnDay) - currAmount + parseFloat(userSubmittedInfo.paymentAmount)

              paymentInfoFromDB[index] = userSubmittedInfo;
              console.log(paymentInfoFromDB[index])
              const updatedPayments = [paymentInfoFromDB];

              //setPaymentInfoOfDay(updatedPayments);
              //const toSend = paymentInfoFromDB.push(userSubmittedInfo);
              console.log("Successful update from SubmitInfoToDB func");
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
              navigation.navigate('DayInfo',{
                day: day,
                paymentInfoFromDB: paymentInfoFromDB,
                username: username,
                totalSpentOnDay: newAmount
            })
                
          }).catch((error) => {
              console.error(error);
          })
      }
  }

    return (
      <ScrollView>
      <TouchableWithoutFeedback onPress={() => {Keyboard.dismiss()}}>
      <View style={styles.main}>
        {/* {console.log(initialVal)} */}
        <Formik
          initialValues={initialVal}
          validationSchema={validationForm}
          onSubmit={(values, actions) => {
            actions.resetForm();
            SubmitInfoToDB(values);


            //addPayment(values);
          }}
        >
          {({handleChange, handleSubmit, values, errors, handleBlur, touched}) => (
            <View>
                <Input
                    //style={globalStyles.input}
                    label = "Title (required)"
                    placeholder='Title (e.g. Grocery, Bar, Online Order, etc.)'
                    onChangeText={handleChange('title')}
                    value={values.title}
                    onBlur={handleBlur('title')}
                    errorMessage = {touched.title && errors.title}
                />

                {/* <Text style = {styles.errorMsg}>{touched.title && errors.title}</Text> */}

                <Input
                    //style={globalStyles.input}
                    //multiline minHeight={60}
                    label = "Payment Amount (required)"
                    placeholder='Payment Amount'
                    onChangeText={handleChange('paymentAmount')}
                    value={values.paymentAmount}
                    keyboardType='numeric'
                    onBlur={handleBlur('paymentAmount')}
                    errorMessage = {touched.paymentAmount && errors.paymentAmount}
                />
                
                {/* <Text style = {styles.errorMsg}>{touched.paymentAmount && errors.paymentAmount}</Text> */}

                <Input
                    //style={globalStyles.input}
                    //multiline minHeight={60}
                    label = "Time"
                    placeholder='Time'
                    onChangeText={handleChange('time')}
                    value={values.time}
                    onBlur={handleBlur('time')}
                />

                <Input
                    //style={globalStyles.input}
                    //multiline minHeight={60}
                    label = "Card Used"
                    placeholder='Card Used'
                    onChangeText={handleChange('cardUsed')}
                    value={values.cardUsed}
                    onBlur={handleBlur('cardUsed')}
                />

                <Input
                    //style={globalStyles.input}
                    //multiline minHeight={60}
                    label = "Additional Notes"
                    placeholder='Additional Notes'
                    onChangeText={handleChange('userNotes')}
                    value={values.userNotes}
                    onBlur={handleBlur('userNotes')}
                />

                
              {initialVal.title==""? (<Button color='maroon' title="Submit" onPress={handleSubmit}/>):<Button color='orange' title="Edit" onPress={handleSubmit} />}
              {/* <Button color='maroon' title="Submit" onPress={handleSubmit} /> */}
            </View>
          )}
        </Formik>
      </View>
      </TouchableWithoutFeedback>
      </ScrollView>
      
    );
  }
  const styles = StyleSheet.create({
    main: {
        height: '100%',
        justifyContent: 'center',
    },
    errorMsg:{
        color: 'red'
    }
  });