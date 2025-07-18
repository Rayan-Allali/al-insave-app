import React, { useState } from 'react';
import {
  Alert,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

type Donor = {
  name: string;
};

type DonationRecord = {
  id: string;
  animalType: 'sheep' | 'goat' | 'cow';
  donors: Donor[];
};

const MOCK_DONATIONS: DonationRecord[] = [
  {
    id: '1',
    animalType: 'sheep',
    donors: [
      { name: 'Karina MKJ' },
      { name: 'Manel' },
      { name: 'Amira' },
      { name: 'Kamel Rabi' },
    ],
  },
  {
    id: '2',
    animalType: 'goat',
    donors: [{ name: 'Sofiane Ben' }],
  },
  {
    id: '3',
    animalType: 'cow',
    donors: [{ name: 'Tariq Father' }],
  },
];

export default function DonationListScreen() {
  const [donations, setDonations] = useState<DonationRecord[]>(MOCK_DONATIONS);
  const [selectedAnimal, setSelectedAnimal] = useState<string>('all');

  const handleSubmit = (id: string) => {
    Alert.alert(
      'Upload Video',
      'Are you sure you want to submit the video?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Submit',
          onPress: () => {
            // Simulate upload
            setDonations((prev) => prev.filter((d) => d.id !== id));
          },
        },
      ],
      { cancelable: true }
    );
  };

  const filteredDonations =
    selectedAnimal === 'all'
      ? donations
      : donations.filter((d) => d.animalType === selectedAnimal);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>My Donations</Text>

      <View style={styles.filterContainer}>
        {['all', 'sheep', 'goat', 'cow'].map((type) => (
          <TouchableOpacity
            key={type}
            style={[
              styles.filterButton,
              selectedAnimal === type && styles.selectedFilter,
            ]}
            onPress={() => setSelectedAnimal(type)}
          >
            <Text
              style={[
                styles.filterText,
                selectedAnimal === type && styles.selectedFilterText,
              ]}
            >
              {type.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filteredDonations}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Donation #{item.id}</Text>
            <Text style={styles.cardSubtitle}>
              Animal Type: {item.animalType}
            </Text>
            <Text style={styles.donorTitle}>Donor Names:</Text>
            {item.donors.map((donor, idx) => (
              <Text key={idx} style={styles.donorName}>
                - {donor.name}
              </Text>
            ))}
            <TouchableOpacity
              style={styles.button}
              onPress={() => handleSubmit(item.id)}
            >
              <Text style={styles.buttonText}>Submit Video</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    paddingTop: 50,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#2ecc71',
    textAlign: 'center',
    marginBottom: 10,
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  card: {
    backgroundColor: '#f7f7f7',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2ecc71',
  },
  cardSubtitle: {
    fontSize: 14,
    marginTop: 4,
    color: '#555',
  },
  donorTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
    color: '#333',
  },
  donorName: {
    fontSize: 14,
    marginLeft: 8,
    color: '#000',
  },
  button: {
    marginTop: 14,
    backgroundColor: '#2ecc71',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 16,
    flexWrap: 'wrap',
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#eee',
    borderRadius: 20,
    marginHorizontal: 4,
  },
  selectedFilter: {
    backgroundColor: '#2ecc71',
  },
  filterText: {
    color: '#555',
    fontWeight: '600',
  },
  selectedFilterText: {
    color: '#fff',
  },
});
