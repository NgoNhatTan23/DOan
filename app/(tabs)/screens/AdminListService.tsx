import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Modal, TextInput, Image } from 'react-native';
import { FIRESTORE_DB } from '../firebaseConfig'; 
import { collection, getDocs, addDoc } from 'firebase/firestore';
import * as ImagePicker from 'expo-image-picker';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';



type Service = {
  id: string;
  Creator: string;
  Price: number;
  ServiceName: string;
  ImageUrl?: string;
};

const AdminListScreen = ({ navigation }: any) => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setModalVisible] = useState(false);
  const [creator, setCreator] = useState('');
  const [price, setPrice] = useState('');
  const [serviceName, setServiceName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedImage, setSelectedImage] = useState<any>(null);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const querySnapshot = await getDocs(collection(FIRESTORE_DB, 'Service'));
        const serviceList: Service[] = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data() as Omit<Service, 'id'>,
        }));
        setServices(serviceList);
      } catch (error) {
        console.error('Error fetching service list:', error);
      } finally {
        setLoading(false);
      }
    };

    const unsubscribe = navigation.addListener('focus', fetchServices); 
    fetchServices();

    return unsubscribe;
  }, [navigation]);

  const filteredServices = services.filter((service) =>
    service.ServiceName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderItem = ({ item }: { item: Service }) => (
    <TouchableOpacity
      style={styles.item}
      onPress={() => navigation.navigate('AdminDetailScreen', { service: item })}
      activeOpacity={0.7}
    >
      <Text style={styles.itemName}>{item.ServiceName}</Text>
      {item.ImageUrl && <Image source={{ uri: item.ImageUrl }} style={styles.itemImage} />}
      <Text style={styles.itemPrice}>{item.Price} ₫</Text>
      <Text style={styles.itemCreator}>{item.Creator}</Text> 
    </TouchableOpacity>
  );

  const selectImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
  
    if (permissionResult.granted === false) {
      alert('Permission to access camera roll is required!');
      return;
    }
  
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
  
    if (result.canceled) {
      console.log('User cancelled image picker');
    } else {
      // Sửa đổi tại đây để lấy URI từ assets
      const uri = result.assets[0].uri; // Lấy URI đúng từ assets
      console.log('Image selected:', uri); // Kiểm tra kết quả
      setSelectedImage({ uri }); // Đặt selectedImage là một đối tượng với thuộc tính uri
    }
  };
  
  const handleAddService = async () => {
    if (!creator || !price || !serviceName || !selectedImage || !selectedImage.uri) {
      alert('Please fill in all the information, including selecting an image.');
      return;
    }
  
    const priceValue = parseInt(price);
    if (isNaN(priceValue) || priceValue <= 0) {
      alert('Service price must be a positive number');
      return;
    }
  
    const storage = getStorage();
    const imageRef = ref(storage, `services/${Date.now()}.jpg`);
  
    try {
      const response = await fetch(selectedImage.uri);
      if (!response.ok) {
        throw new Error('Failed to fetch the image from the selected URI.');
      }
      const blob = await response.blob();
      await uploadBytes(imageRef, blob);
      const imageUrl = await getDownloadURL(imageRef);
      
      const newService = {
        Creator: creator,
        Price: priceValue,
        ServiceName: serviceName,
        ImageUrl: imageUrl,
      };
  
      const docRef = await addDoc(collection(FIRESTORE_DB, 'Service'), newService);
      setServices(prevServices => [...prevServices, { ...newService, id: docRef.id }]);
      setCreator('');
      setPrice('');
      setServiceName('');
      setSelectedImage(null);
      setModalVisible(false);
    } catch (error) {
      console.error('Error adding service:', error);
      alert('An error occurred while adding the service: ' + error.message);
    }
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" style={{ flex: 1, justifyContent: 'center' }} />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>ADMIN</Text>
        <Text style={styles.logo}>Shop Spoot Clothes</Text>
      </View>
      <View style={styles.content}>
        <View style={styles.serviceListHeader}>
          <Text style={styles.serviceListHeaderText}>Danh sách dịch vụ</Text>
          <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
            <Text style={styles.addButtonText}>+</Text>
          </TouchableOpacity>
        </View>

        <TextInput
          style={styles.searchInput}
          placeholder="Tìm kiếm dịch vụ..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />

        <FlatList
          data={filteredServices}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
        />
      </View>

      <View style={styles.bottomNav}>
        <Text style={styles.navItem}>Home</Text>       
        <TouchableOpacity onPress={() => navigation.navigate('Customer')}>
          <Text style={styles.navItem}>Customer</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('SettingsScreen')}>
          <Text style={styles.navItem}>Setting</Text>
        </TouchableOpacity>
      </View>

      <Modal
        transparent={true}
        visible={isModalVisible}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New Service</Text>
            <TextInput
              style={styles.input}
              placeholder="Creator's Name"
              value={creator}
              onChangeText={setCreator}
            />
            <TextInput
              style={styles.input}
              placeholder="Service Price"
              value={price}
              onChangeText={setPrice}
              keyboardType="numeric"
            />
            <TextInput
              style={styles.input}
              placeholder="Service Name"
              value={serviceName}
              onChangeText={setServiceName}
            />
            <TouchableOpacity style={styles.imageButton} onPress={selectImage}>
              <Text style={styles.imageButtonText}>{selectedImage ? 'Change Image' : 'Select Image'}</Text>
            </TouchableOpacity>
            {selectedImage && (
              <View style={styles.imageContainer}>
                <Image source={{ uri: selectedImage.uri }} style={styles.imagePreview} />
              </View>
            )}
            <TouchableOpacity style={styles.submitButton} onPress={handleAddService}>
              <Text style={styles.submitButtonText}>Add Service</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7F7',
  },
  header: {
    backgroundColor: '#F8C0C8',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
  },
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  logo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#E60026',
  },
  content: {
    flex: 1,
    padding: 10,
    backgroundColor: '#FFFFFF',
  },
  serviceListHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  serviceListHeaderText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
  },
  addButton: {
    backgroundColor: '#E60026',
    padding: 10,
    borderRadius: 10,
  },
  addButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  item: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
  },
  itemPrice: {
    fontSize: 14,
    color: '#666666',
  },
  itemCreator: {
    fontSize: 14,
    color: '#999999',
  },
  itemImage: {
    width: 50,
    height: 50,
    borderRadius: 5,
    marginVertical: 5,
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#F8C0C8',
  },
  navItem: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
  },
  submitButton: {
    backgroundColor: '#E60026',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 10,
  },
  submitButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  closeButton: {
    backgroundColor: '#E5E5E5',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#333333',
    fontWeight: 'bold',
  },
  searchInput: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
    marginHorizontal: 10,
    backgroundColor: '#fff',
  },
  imageButton: {
    backgroundColor: '#E60026',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  imageButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  imageContainer: {
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 5,
    padding: 5,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
  },
  imagePreview: {
    width: 100,
    height: 100,
    borderRadius: 5,
  },
});

export default AdminListScreen;