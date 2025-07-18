import { Picker } from '@react-native-picker/picker';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Text, TouchableOpacity, View } from 'react-native';

interface DonorDetails {
  donorId: {
    _id: string;
    fullName: string;
  };
  sacrifyTo: string[];
}

interface DonationRecord {
  _id: string;
  donorsDetails: DonorDetails;
  status: string;
  trackingCode: string;
  animalType: string;
}

export default function DonationRecordsScreen() {
  const [records, setRecords] = useState<DonationRecord[]>([]);
  const [filtered, setFiltered] = useState<DonationRecord[]>([]);
  const [selectedAnimalType, setSelectedAnimalType] = useState('');
  const [loading, setLoading] = useState(true);

  const navigation = useNavigation();

const fetchRecords = async () => {
  try {
    // Fake records
    const fakeData: DonationRecord[] = [
      {
        _id: '1',
        donorsDetails: {
          donorId: {
            _id: 'd1',
            fullName: 'Ahmed Benali',
          },
          sacrifyTo: ['Family', 'Orphanage'],
        },
        status: 'confirmed',
        trackingCode: 'TRK123',
        animalType: 'sheep',
      },
      {
        _id: '2',
        donorsDetails: {
          donorId: {
            _id: 'd2',
            fullName: 'Fatima Zouaoui',
          },
          sacrifyTo: ['Mosque'],
        },
        status: 'pending',
        trackingCode: 'TRK456',
        animalType: 'cow',
      },
      {
        _id: '3',
        donorsDetails: {
          donorId: {
            _id: 'd3',
            fullName: 'Yacine Bouzid',
          },
          sacrifyTo: ['Neighbors'],
        },
        status: 'proceeded',
        trackingCode: 'TRK789',
        animalType: 'goat',
      },
      {
        _id: '4',
        donorsDetails: {
          donorId: {
            _id: 'd4',
            fullName: 'Nour El Houda',
          },
          sacrifyTo: ['Poor Families'],
        },
        status: 'confirmed',
        trackingCode: 'TRK321',
        animalType: 'sheep',
      },
    ];

    setRecords(fakeData);
    setFiltered(fakeData);
  } catch (err) {
    console.error('Error fetching records', err);
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    fetchRecords();
  }, []);

  useEffect(() => {
    if (selectedAnimalType) {
      setFiltered(records.filter(r => r.animalType === selectedAnimalType));
    } else {
      setFiltered(records);
    }
  }, [selectedAnimalType]);

  if (loading) return <ActivityIndicator size="large" className="mt-10" />;

  return (
        <View style={{ flex: 1, padding: 16, backgroundColor: 'white' }}>
      <Text className="text-2xl font-bold mb-4">My Donation Records</Text>

      {/* Animal Type Filter */}
      <View className="mb-4">
        <Text className="mb-1 font-semibold">Filter by Animal Type:</Text>
        <Picker
          selectedValue={selectedAnimalType}
          onValueChange={setSelectedAnimalType}
          style={{ backgroundColor: '#f0f0f0' }}
        >
          <Picker.Item label="All" value="" />
          <Picker.Item label="Sheep" value="sheep" />
          <Picker.Item label="Cow" value="cow" />
          <Picker.Item label="Goat" value="goat" />
        </Picker>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={item => item._id}
        renderItem={({ item }) => (
          <View className="mb-4 p-4 bg-gray-100 rounded-xl">
            <Text className="font-semibold">Donor: {item.donorsDetails.donorId.fullName}</Text>
            <Text>Status: {item.status}</Text>
            <Text>Tracking Code: {item.trackingCode}</Text>
            <Text>Animal: {item.animalType}</Text>

            <TouchableOpacity
              className="mt-2 bg-blue-600 p-2 rounded"
            //   onPress={() => navigation.navigate('UploadVideo', { donationId: item._id })}
            >
              <Text className="text-white text-center">Select and Upload Video</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}
