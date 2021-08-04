//calendarMain.js acts as the main UI/UX for the application. It shows a calendar with marked dates for already existing payments.
//There exists a menu button in the top left to navigate to other parts of the application
//Pressing on a date will navigate to another screen, showing existing payments for that date, if any.
//On said screen there is an option to create a new payment, which should insert into the DB and also respond appropriately by showing up in the date info screen


import {Calendar, CalendarList, Agenda} from 'react-native-calendars';
import React,{ useState, useEffect } from 'react';
import { StyleSheet, Text, View, Modal, Button } from 'react-native';
import { HeaderBackButton } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function CalendarMain({navigation, route}){

    const [modalOpen, setModalOpen] = useState(false);

    const {user} = route.params;

    var date = new Date();
    var currMonth = date.getMonth() + 1;
    var currYear = date.getFullYear();

    //handleDayPress is the function called in <Calendar> in the return below which
    //will navigate to the dayInfo page and pass in the pressed dates info via
    //routes / params
    const handleDayPress = (day) =>{

        const userPaymentsOnDay = {date: day.dateString, username: user}

        var paymentArrToSend = [];
        var totalSpentOnDay = 0.00;
        for(let i = 0; i < allPaymentInfo.length;i++){
            if(day.dateString == allPaymentInfo[i].date){
                paymentArrToSend.push(allPaymentInfo[i]);
                totalSpentOnDay += parseFloat(allPaymentInfo[i].paymentAmount);
            }
        }
        navigation.navigate('DayInfo',{
            day: day,
            paymentInfoFromDB: paymentArrToSend,
            username: user,
            totalSpentOnDay: totalSpentOnDay
        })

    }

    const [allPaymentInfo, setAllPaymentInfo] = useState([]);   //for all payment info from the user
    const [recurringPayments, setRecurringPayments] = useState([]);
    const [datesWithPayments, setDatesWithPayments] = useState();   //for markedDates on Calendar

    //this useEffect with [navigation] as the second argument, in combination with a variable taken from async, will be the main bulk of code for calendarMain.js
    //It performs (at worst) many calls to server/DB and at best a few
    //First it calls upon the async storage variable "needToRefreshCalendar" which is true on default and changed to true on changes to DB
    //such as additions, edits, deletions
    //Second, it will call "/getAllUserPaymentsForCalendar" which retrieves all user payments. I mention some doubts about this method in the server.js file above said call
    //the user payments are then stored in a useState and can be used when a user presses on a date to send the necessary pressed-date info
    //Third, it will call "/checkRecurringPayments" which checks to see if the user has any recurring payments. 
    //If so, it checks against the stored user payments info arr from above to see if the recurring payment already exists for the current month
    //If it does NOT exist, then add it into the DB.
    //Since we are already circulating through the payment info array, I also take this time to create another array of objects to specifiy dates w/ payments 
    //and dates with recurring payments which will be used in <Calendar> in the return below in "markedDates" so a small dot will show up on dates w/ payments
    //Finally, we set the async storage variable 'needToRefreshCalendar' to FALSE so that if we navigate on and off the calendar page, it doesn't "refresh"
    //every new navigation (i.e. performing unecessary calls to DB) and will be set to TRUE on a new update/edit/delete since then we actually affected the DB
    useEffect(()=> {
        
        //this line of code, in combination w/ useEffect's 2nd argument way down below [navigation], will make the page
        //re-render upon navigating back to it (e.g. go to your profile page, come back to calendar, it will re-render)
        //but we only call upon the code when a change was spotted elsewhere (i.e. in "needToRefreshCalendar" which we change on additions,updates, & deletions)
        const unsubscribe = navigation.addListener('focus', () => {
            const getData = async () => {
                try {
                    const needToRefreshCalendar = await AsyncStorage.getItem('needToRefreshCalendar');
                    var tempPaymentInfoArr;
                    var tempRecurringPaymentArr;
                    if(needToRefreshCalendar != "false"){
                        //get all user payments (i.e. check for user in DB) and store in allPaymentInfo State
                        fetch('http://192.168.50.105:3000/getAllUserPaymentsForCalendar',{
                            method: 'POST',
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({username: user})
                        })
                        .then(response => response.json())
                        .then(data => {
                            setAllPaymentInfo(data);
                            tempPaymentInfoArr = data;

                            fetch('http://192.168.50.105:3000/checkRecurringPayments',{ 
                                method: 'POST',
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({username: user})
                            })
                            .then(response => response.json())
                            .then(data => {
                                tempRecurringPaymentArr = data;
                                    
                                    var obj = {};
                                    for (let i = 0; i < tempPaymentInfoArr.length; i++) {   //checking payment info against recurring payments
                                        for (let j = 0; j < tempRecurringPaymentArr.length; j++) {
                                            //&& tempPaymentInfoArr[i].paymentAmount == tempRecurringPaymentArr[j].paymentAmount
                                            if(tempPaymentInfoArr[i].hasOwnProperty("parentRecurringPaymentID") && tempPaymentInfoArr[i].parentRecurringPaymentID == tempRecurringPaymentArr[j]._id && tempPaymentInfoArr[i].hasOwnProperty("isRecurringPayment")){
                                                
                                                tempRecurringPaymentArr.splice(j,1);
                                            }
                                        }
                                        //creating obj for markedDates on <Calendar>
                                        //we will call setDatesWithPayments after we check if there are additional payments to be added (i.e. recurring payments)
                                        var xyz = tempPaymentInfoArr[i].date
                                        if(tempPaymentInfoArr[i].hasOwnProperty("isRecurringPayment")){
                                            const regularP = {key:'regularPayment', color: 'blue'};
                                            const recurringP = {key:'recurringPayment', color: 'black'};
                                            obj[xyz] = {dots:[regularP, recurringP]};
                                            const someDate = obj[xyz];
                                            continue;
                                        }
                                        else{
                                            const regularP = {key:'regularPayment', color: 'blue'};
                                            if(!obj.hasOwnProperty(xyz)){
                                                obj[xyz] = {dots:[regularP]};
                                            }
                                            const someDate = obj[xyz];
                                        }
                                        
                                    }//end for
                                if(data.length > 0){    //checking if there exists any recurring payments & if so, check if the payment for it exists in the paymentInfo collection/table
                                    console.log("There exists at least 1 recurring payment for this user.");
                                    setRecurringPayments(data);

                                    //above we spliced (removed) the existing recurringPayments and now will add the ones that don't exist yet into paymentInfo table
                                    if(tempRecurringPaymentArr.length > 0){
                                        for(let i = 0; i < tempRecurringPaymentArr.length; i++){  

                                            //weird shenanigans with the month & day variables because when they are single digit numbers, we need them to be in
                                            //the format of "0X" since thats how they are presented in native day's dateString
                                            var currMonth = date.getMonth() + 1;
                                            var addMonth = currMonth;
                                            if(currMonth < 10){
                                                currMonth = "0" + currMonth
                                            }
                                            var currDay = tempRecurringPaymentArr[i].dayOfMonthToBill;
                                            if(parseInt(currDay) < 10){
                                                currDay = "0" + currDay
                                            }
                                            const dateString = currYear + "-" + currMonth + "-" + currDay
        
                                            const paymentToInsert = {username: user, title: tempRecurringPaymentArr[i].title, paymentAmount: tempRecurringPaymentArr[i].paymentAmount,
                                                 cardUsed: tempRecurringPaymentArr[i].cardUsed, userNotes: tempRecurringPaymentArr[i].userNotes, month: addMonth, year: currYear, 
                                                 day: tempRecurringPaymentArr[i].dayOfMonthToBill, date: dateString, isRecurringPayment: true, parentRecurringPaymentID: tempRecurringPaymentArr[i]._id}
        
                                            fetch('http://192.168.50.105:3000/postTest',{ 
                                                method: 'POST',
                                                headers: { "Content-Type": "application/json" },
                                                body: JSON.stringify(paymentToInsert)
                                            })
                                            .then(response => response.json())
                                            .then(data => {
                                                var xyz = dateString;
                                                const regularP = {key:'regularPayment', color: 'blue'};
                                                const recurringP = {key:'recurringPayment', color: 'black'};
                                                obj[xyz] = {dots:[regularP, recurringP]};
                                                if(i == tempRecurringPaymentArr.length - 1){
                                                    setDatesWithPayments(obj)
                                                }
                                                
                                                // var temp = allPaymentInfo;
                                                // temp.push(paymentToInsert);
                                                tempPaymentInfoArr.push(paymentToInsert);
                                                    
                                                setAllPaymentInfo(tempPaymentInfoArr);
                                                //setAllPaymentInfo([...allPaymentInfo, paymentToInsert]);
                                                console.log("Inserting ", paymentToInsert.title, "payment from recurringPayment...")
                                                
                                            })
                                        }
                                    }//end if
                                    else{
                                        setDatesWithPayments(obj)
                                        console.log("All existing recurring payments for this user already exist within the DB.")
                                    }
                                }
                                else{
                                    setDatesWithPayments(obj)
                                    console.log("No recurring payments for this user OR All existing recurring payments for this user already exist within the DB.")
                                }
                            })
                        })
                    }
                    await AsyncStorage.setItem('needToRefreshCalendar', "false")
                }
                catch (e) {
                    alert('Failed to retrieve needToRefreshCalendar from async storage')
                    console.error(e);
                }
            }
            getData();
           
        }); //end unsubscribe
    
        return unsubscribe;
      }, [navigation]);

    return(
        <View>
            <Calendar 
                onDayPress={(day) => {handleDayPress(day)}}
                markedDates= {datesWithPayments}
                markingType={'multi-dot'}
            />
        </View>
    )
};
