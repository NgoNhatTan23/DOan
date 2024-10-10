import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { FIRESTORE_DB } from '../firebaseConfig';
import { collection, addDoc } from 'firebase/firestore';

const RegisterScreen = ({ navigation }: any) => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (phone === '' || password === '') {
      setErrorMessage('Vui lòng nhập số điện thoại và mật khẩu');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      // Thêm tài khoản vào Firestore với role mặc định là false
      const newUser = {
        phone: phone,
        password: password,
        role: false,  // role mặc định là false
      };

      await addDoc(collection(FIRESTORE_DB, 'Login'), newUser);
      setErrorMessage('Đăng ký thành công');
      
      // Chuyển hướng sang trang đăng nhập sau khi đăng ký thành công
      navigation.replace('Login');
    } catch (error: any) {
      setErrorMessage('Lỗi khi đăng ký: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Register</Text>
      <TextInput
        style={styles.input}
        placeholder="Phone"
        onChangeText={setPhone}
        value={phone}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        onChangeText={setPassword}
        value={password}
      />
      {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

      <TouchableOpacity 
        style={styles.registerButton} 
        onPress={handleRegister} 
        disabled={loading}
      >
        <Text style={styles.registerText}>{loading ? 'Registering...' : 'Register'}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  input: {
    width: '80%',
    height: 40,
    borderWidth: 1,
    marginBottom: 10,
    paddingLeft: 8,
  },
  registerButton: {
    backgroundColor: '#F08080',
    padding: 15,
    borderRadius: 5,
    width: '80%',
  },
  registerText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 18,
  },
  errorText: {
    color: 'red',
    marginTop: 20,
  },
});

export default RegisterScreen;
