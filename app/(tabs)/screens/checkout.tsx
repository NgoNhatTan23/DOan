import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image } from 'react-native';

type Service = {
  id: string;
  Creator: string;
  Price: number;
  ServiceName: string;
  Quantity?: number;
  Sizes?: string[]; // Thêm thuộc tính Sizes để lưu kích thước
  ImageUrl?: string; // Thêm thuộc tính ImageUrl để lưu ảnh
};

type CheckoutScreenProps = {
  route: {
    params: {
      cartItems: Service[];
      totalAmount: number;
    };
  };
  navigation: any; // Thay đổi kiểu này nếu bạn có kiểu rõ ràng cho navigation
};

const CheckoutScreen: React.FC<CheckoutScreenProps> = ({ route, navigation }) => {
  const { cartItems, totalAmount } = route.params;

  const handleConfirmPayment = () => {
    // Xử lý thanh toán ở đây (gọi API thanh toán, v.v.)
    alert('Thanh toán thành công! Cảm ơn bạn đã đặt hàng.');
    navigation.goBack(); // Trở lại màn hình trước đó
  };

  const renderItem = ({ item }: { item: Service }) => {
    const itemTotal = item.Price * (item.Quantity || 1); // Tính tổng tiền cho từng sản phẩm

    return (
      <View style={styles.itemContainer}>
        <Image source={{ uri: item.ImageUrl }} style={styles.itemImage} />
        <View style={styles.itemDetails}>
          <Text style={styles.itemName}>{item.ServiceName}</Text>
          <Text style={styles.itemPrice}>{item.Price} ₫</Text>
          <Text style={styles.itemQuantity}>Số lượng: {item.Quantity}</Text>
          <Text style={styles.itemSize}>Kích thước: {item.Sizes?.join(', ')}</Text>
          <Text style={styles.itemTotal}>Tổng: {itemTotal.toFixed(2)} ₫</Text> {/* Hiển thị tổng tiền */}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Xác Nhận Đơn Hàng</Text>
      <Text style={styles.totalText}>Tổng cộng: {totalAmount} ₫</Text>
      <Text style={styles.itemsText}>Sản phẩm:</Text>
      <FlatList
        data={cartItems}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
      />
      <TouchableOpacity style={styles.confirmButton} onPress={handleConfirmPayment}>
        <Text style={styles.confirmButtonText}>Xác nhận thanh toán</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F7F7F7',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  totalText: {
    fontSize: 18,
    marginBottom: 10,
  },
  itemsText: {
    fontSize: 18,
    marginBottom: 10,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 5,
    marginRight: 10,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  itemPrice: {
    fontSize: 14,
    color: '#666',
  },
  itemQuantity: {
    fontSize: 14,
  },
  itemSize: {
    fontSize: 14,
    color: '#666',
  },
  itemTotal: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#E60026', // Màu cho tổng tiền
  },
  confirmButton: {
    backgroundColor: '#E60026',
    padding: 15,
    borderRadius: 5,
    marginTop: 20,
  },
  confirmButtonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default CheckoutScreen;