import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, TextInput, Image } from 'react-native';
import { FIRESTORE_DB } from '../firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';
import CartScreen from './Cart';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Toast from 'react-native-toast-message';
import CheckoutScreen from './checkout';

type Service = {
  id: string;
  Creator: string;
  Price: number;
  ServiceName: string;
  ImageUrl: string;
};

const CustomerListService = ({ navigation }: any) => {
  const [services, setServices] = useState<Service[]>([]);
  const [filteredServices, setFilteredServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [cart, setCart] = useState<Service[]>([]);
  const [isCartVisible, setCartVisible] = useState(false);
  const [favourites, setFavourites] = useState<Service[]>([]);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const querySnapshot = await getDocs(collection(FIRESTORE_DB, 'Service'));
        const serviceList: Service[] = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data() as Omit<Service, 'id'>,
        }));
        setServices(serviceList);
        setFilteredServices(serviceList);
      } catch (error) {
        console.error('Lỗi khi lấy danh sách dịch vụ:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  const handleSearch = (text: string) => {
    setSearchText(text);
    if (text) {
      const filteredData = services.filter(service =>
        service.ServiceName.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredServices(filteredData);
    } else {
      setFilteredServices(services);
    }
  };

  const handleCheckout = () => {
    const totalAmount = cart.reduce((total, item) => total + item.Price * (item.Quantity || 1), 0);
    navigation.navigate('CheckoutScreen', {
      cartItems: cart,
      totalAmount,
      onPaymentConfirmed: () => setCart([]), // Xóa giỏ hàng sau khi thanh toán
    });
    setCartVisible(false);
  };

  const handleAddToFavourites = (service: Service) => {
    if (!favourites.some(fav => fav.id === service.id)) {
      setFavourites([...favourites, service]);
      Toast.show({
        text1: 'Đã thêm vào danh sách yêu thích!',
        visibilityTime: 2000,
        position: 'bottom',
        type: 'success',
      });
    } else {
      Toast.show({
        text1: 'Sản phẩm đã có trong danh sách yêu thích!',
        visibilityTime: 2000,
        position: 'bottom',
        type: 'info',
      });
    }
  };

  const renderItem = ({ item }: { item: Service }) => (
    <View style={styles.itemContainer}>
      <TouchableOpacity
        style={styles.item}
        onPress={() => navigation.navigate('DetailScreen', { service: item, cart, setCart })}
        activeOpacity={0.7}
      >
        <TouchableOpacity
          style={styles.heartIconContainer}
          onPress={() => handleAddToFavourites(item)}
        >
          <Icon name="favorite-border" size={24} color="#ff3d00" />
        </TouchableOpacity>
        <Image source={{ uri: item.ImageUrl }} style={styles.itemImage} />
        <View style={styles.itemDetails}>
          <Text style={styles.itemName} numberOfLines={2}>
            {item.ServiceName}
          </Text>
          <Text style={styles.itemPrice}>{item.Price} ₫</Text>
        </View>
      </TouchableOpacity>
    </View>
  );

  const groupedServices = filteredServices.reduce<Service[][]>((acc, service, index) => {
    if (index % 2 === 0) {
      acc.push([service]);
    } else {
      acc[acc.length - 1].push(service);
    }
    return acc;
  }, []);

  if (loading) {
    return <ActivityIndicator size="large" color="#000" style={{ flex: 1, justifyContent: 'center' }} />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate('HomeScreen')}>
          <Text style={styles.headerText}>Trang chủ</Text>
        </TouchableOpacity>
        <Text style={styles.logo}>KAMI SPA</Text>
        <TouchableOpacity onPress={() => navigation.navigate('SettingsScreen')}>
          <Text style={styles.headerText}>Cài đặt</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.content}>
        <View style={styles.searchContainer}>
          <Icon name="search" size={24} color="#888" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm"
            value={searchText}
            onChangeText={handleSearch}
            placeholderTextColor="#888"
          />
        </View>
        <Text style={styles.serviceListHeaderText}>Danh sách Sản Phẩm</Text>
        <FlatList
          data={groupedServices}
          renderItem={({ item }) => (
            <View style={styles.row}>
              {item.map(service => renderItem({ item: service }))}
            </View>
          )}
          keyExtractor={(item, index) => index.toString()}
        />
      </View>
      <View style={styles.bottomNav}>
        <Text style={styles.navItem}>Trang chủ</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Favourite', { favourites })}>
          <Text style={styles.navItem}>Yêu thích</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('SettingsScreen')}>
          <Text style={styles.navItem}>Cài đặt</Text>
        </TouchableOpacity>
      </View>

      <CartScreen
        isVisible={isCartVisible}
        cartItems={cart}
        onClose={() => setCartVisible(false)}
        onRemove={(itemId: string) => setCart(cart.filter(item => item.id !== itemId))}
        onCheckout={handleCheckout}
      />

      <Toast />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    backgroundColor: '#000',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  logo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
    textAlign: 'center',
  },
  headerText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginHorizontal: 10,
  },
  content: {
    flex: 1,
    padding: 10,
    backgroundColor: '#fff',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 15,
    marginHorizontal: 10,
    backgroundColor: '#fff',
  },
  searchInput: {
    flex: 1,
    padding: 10,
    color: '#000',
  },
  searchIcon: {
    padding: 10,
  },
  serviceListHeaderText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  itemContainer: {
    width: '48%',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    backgroundColor: '#fff',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  item: {
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  heartIconContainer: {
    position: 'absolute',
    top: 10,
    left: 10,
    zIndex: 1,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
    marginRight: 10,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 5,
  },
  itemPrice: {
    fontSize: 14,
    color: '#666',
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#000',
  },
  navItem: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
});

export default CustomerListService;