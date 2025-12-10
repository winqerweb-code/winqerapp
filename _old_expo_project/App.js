import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function App() {
  return (
    <View style={styles.container}>
      <View style={styles.square1}>
        <Text>hello </Text>
        </View>
      <Text style={styles.text}>Opewn up App.js to start working on your app!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'red',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text:{
    fontWeight:"bold",
    fontSize:100
  },
  square1:{
    width:100,
    height:100,
    backgroundColor:"yellow"
  }
  
});
