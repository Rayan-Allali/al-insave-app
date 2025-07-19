import AsyncStorage from '@react-native-async-storage/async-storage';

export const saveToUnsyncedData = async (donationId: string, videoPath: string, filename: string,router:any) => {
  const takenAt = new Date().toISOString();
  const newEntry = {
    donationId,
    filename,
    videoPath,
    takenAt,
    status: 'proceeded',
  };

  try {
    const existing = await AsyncStorage.getItem('UnsyncedData');
    const parsed = existing ? JSON.parse(existing) : {};
    parsed[donationId] = newEntry;

    await AsyncStorage.setItem('UnsyncedData', JSON.stringify(parsed));


     const localRaw = await AsyncStorage.getItem('offlineDonations');
     console.log("localRaw ",localRaw)
    if (localRaw) {
      const parsed = JSON.parse(localRaw);
      console.log("parsed length ", parsed.length)
      const filtered = parsed.filter((item: any) => item._id !== donationId);
      console.log("filtered length ", filtered.length)
      await AsyncStorage.setItem('offlineDonations', JSON.stringify(filtered));
    }

    console.log(`[✔] Saved ${donationId} to UnsyncedData and removed from offlineDonations`);
    console.log(`Saved offline video for donation ${donationId}`);
    //reload force
   router.push({ pathname: '/(tabs)/index', params: { refresh: Date.now().toString() } });
  } catch (e) {
    console.error('Error saving to UnsyncedData', e);
  }
};
