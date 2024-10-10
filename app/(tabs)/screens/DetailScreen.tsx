import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Alert, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Cart from './Cart';

type Service = {
  id: string;
  Creator: string;
  Price: number;
  ServiceName: string;
  ImageUrl?: string;
  Description?: string;
  Sizes?: string[];
  Quantity?: number;
};

const DetailScreen = ({ route, navigation }: any) => {
  const { service } = route.params;
  const [cart, setCart] = useState<Service[]>([]);
  const [isCartVisible, setCartVisible] = useState(false);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [isModalVisible, setModalVisible] = useState(false);
  const [cartQuantity, setCartQuantity] = useState(0);

  const sizes = service.Sizes || ['36', '37', '38', '39', '40', '41', '42'];

  useEffect(() => {
    const loadCart = async () => {
      try {
        const jsonValue = await AsyncStorage.getItem('@cart');
        if (jsonValue != null) {
          const loadedCart = JSON.parse(jsonValue);
          setCart(loadedCart);
          const totalQuantity = loadedCart.reduce((sum: number, item: Service) => sum + (item.Quantity || 0), 0);
          setCartQuantity(totalQuantity);
        }
      } catch (e) {
        console.error("Không thể tải giỏ hàng:", e);
      }
    };

    loadCart();
  }, []);

  useEffect(() => {
    const saveCart = async () => {
      try {
        const jsonValue = JSON.stringify(cart);
        await AsyncStorage.setItem('@cart', jsonValue);
      } catch (e) {
        console.error("Không thể lưu giỏ hàng:", e);
      }
    };

    saveCart();
  }, [cart]);

  useEffect(() => {
    const totalQuantity = cart.reduce((sum, item) => sum + (item.Quantity || 0), 0);
    setCartQuantity(totalQuantity);
  }, [cart]);

  const handleAddToCart = () => {
    if (!selectedSize) {
      Alert.alert('Vui lòng chọn kích thước!');
      return;
    }

    const existingItemIndex = cart.findIndex(item => item.id === service.id && item.Sizes?.includes(selectedSize!));

    if (existingItemIndex !== -1) {
      const updatedCart = [...cart];
      updatedCart[existingItemIndex].Quantity += 1;
      setCart(updatedCart);
      Alert.alert(`${service.ServiceName} kích thước ${selectedSize} đã được cập nhật số lượng thành ${updatedCart[existingItemIndex].Quantity}!`);
    } else {
      const itemToAdd = { 
        ...service, 
        Sizes: [selectedSize], 
        Quantity: 1,
        ImageUrl: service.ImageUrl 
      }; 
      setCart(prevCart => [...prevCart, itemToAdd]);
      Alert.alert(`${service.ServiceName} kích thước ${selectedSize} với số lượng 1 đã được thêm vào giỏ hàng!`);
    }

    Alert.alert('Đặt hàng thành công!', 'Sản phẩm đã được thêm vào giỏ hàng.');
  };

  const handleGoToCart = () => {
    setCartVisible(true);
  };

  const handleRemoveItem = (id: string, size: string) => {
    setCart(prevCart => {
      const updatedCart = prevCart.filter(item => item.id !== id || (item.Sizes && item.Sizes[0] !== size));
      const totalQuantity = updatedCart.reduce((sum, item) => sum + (item.Quantity || 0), 0);
      setCartQuantity(totalQuantity);
      return updatedCart;
    });
    Alert.alert('Sản phẩm đã được xóa khỏi giỏ hàng!');
  };

  const handleCheckout = () => {
    setModalVisible(true);
    setCartVisible(false);
    navigation.navigate('CheckoutScreen', { cartItems: cart });
  };

  const closeModal = () => {
    setModalVisible(false);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity style={styles.cartIcon} onPress={handleGoToCart}>
        <Ionicons name="cart" size={24} color="black" />
        {cartQuantity > 0 && (
          <View style={styles.cartCount}>
            <Text style={styles.cartCountText}>{cartQuantity}</Text>
          </View>
        )}
      </TouchableOpacity>
      
      <Text style={styles.title}>{service.ServiceName}</Text>
      
      {service.ImageUrl && (
        <View style={styles.imageContainer}>
          <Image 
            source={{ uri: service.ImageUrl }} 
            style={styles.image} 
            resizeMode="contain"
          />
        </View>
      )}

      <View style={styles.infoContainer}>
        <Text style={styles.text}>Giá: <Text style={styles.price}>{service.Price} ₫</Text></Text>
        <Text style={styles.text}>Loại: <Text style={styles.creator}>{service.Creator}</Text></Text>
        
        {service.Description && (
          <Text style={styles.description}>{service.Description}</Text>
        )}

        <Text style={styles.text}>Chọn kích thước:</Text>
        <View style={styles.sizeContainer}>
          {sizes.map(size => (
            <TouchableOpacity
              key={size}
              style={[styles.sizeButton, selectedSize === size && styles.selectedSizeButton]}
              onPress={() => setSelectedSize(size)}
            >
              <Text style={[styles.sizeButtonText, selectedSize === size && styles.selectedSizeText]}>{size}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.addButton} onPress={handleAddToCart}>
          <Text style={styles.addButtonText}>Thêm vào giỏ hàng</Text>
        </TouchableOpacity>
      </View>



      <Cart
        isVisible={isCartVisible}
        cartItems={cart}
        onClose={() => setCartVisible(false)}
        onRemove={handleRemoveItem}
        onCheckout={handleCheckout}
        onUpdateQuantity={(id, size, newQuantity) => {
          const updatedCart = cart.map(item =>
            item.id === id && item.Sizes?.[0] === size ? { ...item, Quantity: newQuantity } : item
          );
          setCart(updatedCart);
          const totalQuantity = updatedCart.reduce((sum, item) => sum + (item.Quantity || 0), 0);
          setCartQuantity(totalQuantity);
        }}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#FFFFFF',
  },
  cartIcon: {
    position: 'absolute',
    right: 20,
    top: 20,
    zIndex: 1000,
  },
  cartCount: {
    position: 'absolute',
    right: 0,
    top: -5,
    backgroundColor: '#000000',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartCountText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#000000',
    textAlign: 'center',
  },
  imageContainer: {
    width: '100%',
    height: 250,
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 20,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  infoContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  text: {
    fontSize: 18,
    marginBottom: 10,
    color: '#000000',
  },
  price: {
    fontWeight: 'bold',
    color: '#000000',
  },
  creator: {
    fontStyle: 'italic',
    color: '#666666',
  },
  description: {
    fontSize: 16,
    color: '#000000',
    marginBottom: 10,
  },
  sizeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 10,
  },
  sizeButton: {
    borderWidth: 1,
    borderColor: '#000000',
    borderRadius: 5,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginHorizontal: 5,
  },
  selectedSizeButton: {
    backgroundColor: '#000000',
  },
  sizeButtonText: {
    color: '#000000',
  },
  selectedSizeText: {
    color: '#FFFFFF',
  },
  addButton: {
    backgroundColor: '#000000',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 20,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalMessage: {
    fontSize: 16,
    marginBottom: 20,
  },
  modalButton: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 5,
  },
  modalButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});

export default DetailScreen;