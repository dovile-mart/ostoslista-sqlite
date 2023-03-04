import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import * as SQLite from 'expo-sqlite';
import { useEffect, useState } from 'react';
import { TextInput } from 'react-native';
import { Button } from 'react-native';
import { FlatList } from 'react-native';

export default function App() {

  const [product, setProduct] = useState('');   //tuote
  const [amount, setAmount] = useState('');     //määrä
  const [shopitem, setShopitem] = useState([]); //ostoslistan alkiot

  const tietokanta = SQLite.openDatabase('ostosdb.db');

  
  //tietokannan luonti
  useEffect(() => {
    tietokanta.transaction(tx => {
      tx.executeSql('create table if not exists shoppinglist (id integer primary key not null, product text, amount text);');
    }, null, updateList);
  }, []);

  //tuotteen lisäys listaan
  const saveItem = () => {
    tietokanta.transaction(tx => {
      tx.executeSql('insert into shoppinglist (product, amount) values (?,?);', [product, amount]); //parseInt(amount)
    }, null, updateList)
    setProduct('');
    setAmount('');
  }

  //kaikkien shopitems haku shoppinglist-taulusta ja tallennus shopitemsiin.
  const updateList = () => {
    tietokanta.transaction(tx => {
      tx.executeSql('select * from shoppinglist;', [], (_, { rows }) => setShopitem(rows._array)
      );
    }, null, null);
  }

  //tuotteen poisto
  const deleteItem = (id) => {
    tietokanta.transaction(
      tx => {tx.executeSql('delete from shoppinglist where id = ?;', [id]);}, null, updateList)
  }
  

  return (
    <View style={styles.container}>
      <TextInput style={styles.input} placeholder='Tuote' onChangeText={product => setProduct(product)} value={product} />
      <TextInput style={styles.input} placeholder='Määrä'  onChangeText={amount => setAmount(amount)} value={amount} />
      <Button onPress={saveItem} title='Save' />
      
      <Text style={styles.listTitle}>Shopping list</Text>      
      
      <FlatList keyExtractor={item => item.id.toString()} renderItem={({ item }) => 
        <View style={styles.listcontainer}>
          <Text>{item.product}, {item.amount}</Text>
          <Text style={{color: '#0000ff', marginLeft: 10}} onPress={()=> deleteItem(item.id)}>bought</Text>
        </View>}
        data={shopitem}
      />
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 50
  },
  input: {
    height: 30,
    minWidth: 150,
    margin: 5,
    borderWidth: 1,
    borderColor: 'grey',
    paddingLeft: 10,
    paddingRight: 10
  },
  listTitle: {
    marginTop: 30,
    paddingBottom: 10,
    fontSize: 16,
    fontWeight: 'bold'
  },
  listcontainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around'
  }
});
