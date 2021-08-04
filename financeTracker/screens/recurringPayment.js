//recurringPayment.js is the screen shown when the user wants to add a recurring payment (from yourProfile.js)
//it serves a similar purpose to and is very similar in nature (code-wise) to submitPayment.js, which is where the bulk of the code is from
//I considered just having a single page for submissions, and modifying it according to the actual submission type
//but this was an easy solution, and it's still intuitive so I kept it as is


import React, { useState } from 'react';
import { StyleSheet, TextInput, Button, View, Text, ScollView } from 'react-native';
import { Formik } from 'formik';
import * as yup from 'yup';
import { Input } from 'react-native-elements';
import { ScrollView } from 'react-native-gesture-handler';

const validationForm = yup.object({
    title: yup.string().required(),
    time: yup.string(),
    cardUsed: yup.string(),
    userNotes: yup.string(),
    paymentAmount: yup.number().required(),
    dayOfMonthToBill: yup.number().required()
  });
  

export default function RecurringPayment ({ addPayment, updatePayment, valuesInit }) {

    return (
      <ScrollView>
      <View styles = {styles.main}>
        <Formik
          initialValues={{ title: valuesInit.title, paymentAmount: valuesInit.paymentAmount, cardUsed: valuesInit.cardUsed,
             userNotes: valuesInit.userNotes, dayOfMonthToBill: valuesInit.dayOfMonthToBill }}
          validationSchema={validationForm}
          onSubmit={(values, actions) => {
            //console.log(values);
            actions.resetForm();
            //addReview(values);
            if (valuesInit.index == -1){
              addPayment(values);
            }
            else{
              updatePayment(values, valuesInit.index);
            }
          }}
        >
          {({handleChange, handleSubmit, values, errors, handleBlur, touched}) => (
            <View>
                <Input
                    //style={globalStyles.input}
                    label = 'Title (required)'
                    placeholder='Title (e.g. Netflix subscription, Rent, etc.)'
                    onChangeText={handleChange('title')}
                    value={values.title}
                    onBlur={handleBlur('title')}
                    errorMessage = {touched.title && errors.title}
                />

                {/* <Text style = {styles.errorMsg}>{touched.title && errors.title}</Text> */}

                <Input
                    //style={globalStyles.input}
                    //multiline minHeight={60}
                    label = 'Payment Amount (required)'
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
                    label = 'Day of month to bill (required)'
                    placeholder='Day of month to bill'
                    onChangeText={handleChange('dayOfMonthToBill')}
                    value={values.dayOfMonthToBill}
                    onBlur={handleBlur('dayOfMonthToBill')}
                    keyboardType='numeric'
                    errorMessage = {touched.dayOfMonthToBill && errors.dayOfMonthToBill}
                />
                
                <Input
                    //style={globalStyles.input}
                    //multiline minHeight={60}
                    label = 'Card Used'
                    placeholder='Card Used'
                    onChangeText={handleChange('cardUsed')}
                    value={values.cardUsed}
                    onBlur={handleBlur('cardUsed')}
                />

                <Input
                    //style={globalStyles.input}
                    //multiline minHeight={60}
                    label = 'Additional Notes'
                    placeholder='Additional Notes'
                    onChangeText={handleChange('userNotes')}
                    value={values.userNotes}
                    onBlur={handleBlur('userNotes')}
                />

              <Button color='maroon' title="Submit" onPress={handleSubmit} />
            </View>
          )}
        </Formik>
      </View>
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