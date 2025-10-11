import AsyncStorage from '@react-native-async-storage/async-storage';

const ALERT_KEY_PREFIX = '@alert_id_';

export const saveAlertID = async (id: string, value: string) => {
  try {
    await AsyncStorage.setItem(ALERT_KEY_PREFIX + id, value);
    return true;
  } catch (e) {
    console.error('Failed to save alert ID:', e);
    return false;
  }
};

export const getAlertID = async (id: string) => {
  try {
    return await AsyncStorage.getItem(ALERT_KEY_PREFIX + id);
  } catch (e) {
    console.error('Failed to get alert ID:', e);
    return null;
  }
};

export const deleteAlertID = async (id: string) => {
  try {
    await AsyncStorage.removeItem(ALERT_KEY_PREFIX + id);
    return true;
  } catch (e) {
    console.error('Failed to delete alert ID:', e);
    return false;
  }
};