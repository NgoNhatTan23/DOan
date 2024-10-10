import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

type Service = {
  id: string;
  Creator: string;
  Price: number;
  ServiceName: string;
  ImageUrl: string;
};

type FavouriteProps = {
  route: {
    params: {
      favourites: Service[];
    };
  };
};

const Favourite: React.FC<FavouriteProps> = ({ route }) => {
  const { favourites } = route.params;

  const renderItem = ({ item }: { item: Service }) => (
    <View style={styles.itemContainer}>
      <Image source={{ uri: item.ImageUrl }} style={styles.itemImage} />
      <View style={styles.itemDetails}>
        <Text style={styles.itemName}>{item.ServiceName}</Text>
        <Text style={styles.itemPrice}>{item.Price} ₫</Text>
      </View>
      <TouchableOpacity style={styles.removeButton}>
        <Icon name="favorite" size={24} color="#ff3d00" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Danh sách yêu thích</Text>
      {favourites.length === 0 ? (
        <Text style={styles.emptyText}>Chưa có sản phẩm nào trong danh sách yêu thích.</Text>
      ) : (
        <FlatList
          data={favourites}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 10,
    marginBottom: 15,
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
  },
  itemPrice: {
    fontSize: 14,
    color: '#666',
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#888',
  },
});

export default Favourite;