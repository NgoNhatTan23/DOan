import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Image, // Import the Image component
} from 'react-native';
import { FIRESTORE_DB } from '../firebaseConfig';
import { collection, query, where, getDocs } from 'firebase/firestore';

const LoginScreen = ({ navigation }: any) => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (phone === '' || password === '') {
      setErrorMessage('Vui lòng nhập đầy đủ số điện thoại và mật khẩu');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      const q = query(
        collection(FIRESTORE_DB, 'Login'),
        where('phone', '==', phone)
      );
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        querySnapshot.forEach((doc) => {
          const userData = doc.data();
          if (userData.password === password) {
            // Kiểm tra role
            if (userData.role === true) {
              // Admin
              navigation.replace('AdminListService');
            } else {
              // Customer
              navigation.replace('CustomerListService');
            }
          } else {
            setErrorMessage('Mật khẩu không chính xác');
          }
        });
      } else {
        setErrorMessage('Số điện thoại không tồn tại');
      }
    } catch (error: any) {
      setErrorMessage('Lỗi khi đăng nhập: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>

      {/* Avatar Image */}
      <Image 
        source={{ uri: 'data:image/jpeg;base64,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' }} 
        style={styles.avatar}
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Phone"
          onChangeText={setPhone}
          value={phone}
          keyboardType="phone-pad"
        />
      </View>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Password"
          onChangeText={setPassword}
          value={password}
          secureTextEntry
        />
      </View>

      {/* Hiển thị lỗi nếu có */}
      {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

      <TouchableOpacity 
        style={styles.loginButton} 
        onPress={handleLogin} 
        disabled={loading}
      >
        <Text style={styles.loginText}>{loading ? 'Loading...' : 'Login'}</Text>
      </TouchableOpacity>

      {/* Nút để chuyển hướng đến trang đăng ký */}
      <TouchableOpacity 
        style={styles.registerButton} 
        onPress={() => navigation.navigate('Register')}
      >
        <Text style={styles.registerText}>Đăng ký tài khoản mới</Text>
      </TouchableOpacity>

      {/* Nút để chuyển hướng đến trang quên mật khẩu */}
      <TouchableOpacity 
        style={styles.forgotPasswordButton} 
        onPress={() => navigation.navigate('ChangePassword')}
      >
        <Text style={styles.forgotPasswordText}>Đổi mật khẩu</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 48,
    color: '#F08080',
    marginBottom: 20, // Adjusted margin for avatar space
  },
  avatar: {
    width: 100,  // Avatar width
    height: 100, // Avatar height
    borderRadius: 50, // Makes the image circular
    marginBottom: 30, // Space between avatar and input fields
  },
  inputContainer: {
    width: '80%',
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    paddingHorizontal: 10,
  },
  input: {
    flex: 1,
    height: 40,
  },
  loginButton: {
    backgroundColor: '#F08080',
    padding: 15,
    borderRadius: 5,
    width: '80%',
  },
  loginText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 18,
  },
  errorText: {
    color: 'red',
    marginTop: 20,
  },
  registerButton: {
    marginTop: 20,
  },
  registerText: {
    color: '#F08080',
    fontSize: 16,
  },
  forgotPasswordButton: {
    marginTop: 20,
  },
  forgotPasswordText: {
    color: '#F08080',
    fontSize: 16,
  },
});

export default LoginScreen;
