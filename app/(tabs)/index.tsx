import { DonationRecord, getAllDonations } from '@/backend/donation.backend';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';

export default function DonationListScreen() {
  const { refresh } = useLocalSearchParams();
const [donations, setDonations] = useState<DonationRecord[] | null>(null);
const [isLoading, setIsLoading] = useState(true);
const [error, setError] = useState<Error | null>(null);

useEffect(() => {
  const fetchDonations = async () => {
    try {
      console.log("Fetching donations...");
      setIsLoading(true);

      const localRaw = await AsyncStorage.getItem('offlineDonations');

      if (localRaw) {
        console.log("local data exist....")
        setDonations(JSON.parse(localRaw));
      } else {
        const response = await getAllDonations();
        console.log("Donations fetched:", response.data.length);
        await AsyncStorage.setItem('offlineDonations', JSON.stringify(response.data));
        setDonations(response.data);
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  };

  fetchDonations();
}, [refresh]);


  const [selectedAnimal, setSelectedAnimal] = useState<string>('all');

  

  const router = useRouter();

const goToUpload = (donationId: string) => {
  router.push('/uploadPreuve/'+ donationId as any);
};

  const filteredDonations =
    selectedAnimal === 'all'
      ? donations
      : (donations || []).filter((d) => d.animalType === selectedAnimal);

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
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Donation #{item.trackingCode}</Text>
            <Text style={styles.cardSubtitle}>
              Animal Type: {item.animalType}
            </Text>
            <Text style={styles.donorTitle}>Donor Names:</Text>
            {item.donorsDetails.map((donor, idx) => (
              <Text key={idx} style={styles.donorName}>
                - {donor.donorId.firstName +donor.donorId.lastName }
              </Text>
            ))}
            <TouchableOpacity
              style={styles.button}
              onPress={() => goToUpload(item._id)}
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
