import { BuyProduct } from '../models/buyProduct.model.js';
import { Partner } from '../models/partner.model.js';
import geocodingService from '../utils/geocoding.utils.js';

const pincodeStateMap = {
  // Maharashtra
  40: 'MH',
  41: 'MH',
  42: 'MH',
  43: 'MH',
  44: 'MH',
  // Delhi
  11: 'DL',
  // Karnataka
  56: 'KA',
  57: 'KA',
  58: 'KA',
  59: 'KA',
  // Tamil Nadu
  60: 'TN',
  61: 'TN',
  62: 'TN',
  63: 'TN',
  // Telangana
  50: 'TG',
  51: 'TG',
  // Gujarat
  36: 'GJ',
  37: 'GJ',
  38: 'GJ',
  39: 'GJ',
  // West Bengal
  70: 'WB',
  71: 'WB',
  72: 'WB',
  73: 'WB',
  // Rajasthan
  30: 'RJ',
  31: 'RJ',
  32: 'RJ',
  33: 'RJ',
  34: 'RJ',
  // Uttar Pradesh
  20: 'UP',
  21: 'UP',
  22: 'UP',
  23: 'UP',
  24: 'UP',
  25: 'UP',
  26: 'UP',
  27: 'UP',
  28: 'UP',
  // Madhya Pradesh
  45: 'MP',
  46: 'MP',
  47: 'MP',
  48: 'MP',
  // Punjab
  14: 'PB',
  15: 'PB',
  16: 'PB',
  // Haryana
  12: 'HR',
  13: 'HR',
  // Andhra Pradesh
  51: 'AP',
  52: 'AP',
  53: 'AP',
  // Kerala
  67: 'KL',
  68: 'KL',
  69: 'KL',
  // Odisha
  75: 'OR',
  76: 'OR',
  // Assam
  78: 'AS',
  // Bihar
  80: 'BR',
  81: 'BR',
  82: 'BR',
  83: 'BR',
  84: 'BR',
  85: 'BR',
  // Jharkhand
  81: 'JH',
  82: 'JH',
  83: 'JH',
  84: 'JH',
};

// Major city pincode prefixes
const majorCities = {
  // Mumbai
  400: { city: 'Mumbai', state: 'MH' },
  401: { city: 'Mumbai', state: 'MH' },
  // Delhi
  110: { city: 'Delhi', state: 'DL' },
  // Bangalore
  560: { city: 'Bangalore', state: 'KA' },
  // Chennai
  600: { city: 'Chennai', state: 'TN' },
  // Hyderabad
  500: { city: 'Hyderabad', state: 'TG' },
  // Pune
  411: { city: 'Pune', state: 'MH' },
  // Kolkata
  700: { city: 'Kolkata', state: 'WB' },
  // Ahmedabad
  380: { city: 'Ahmedabad', state: 'GJ' },
  // Jaipur
  302: { city: 'Jaipur', state: 'RJ' },
  // Lucknow
  226: { city: 'Lucknow', state: 'UP' },
  // Kanpur
  208: { city: 'Kanpur', state: 'UP' },
  // Nagpur
  440: { city: 'Nagpur', state: 'MH' },
  // Indore
  452: { city: 'Indore', state: 'MP' },
  // Bhopal
  462: { city: 'Bhopal', state: 'MP' },
  // Visakhapatnam
  530: { city: 'Visakhapatnam', state: 'AP' },
  // Patna
  800: { city: 'Patna', state: 'BR' },
  // Vadodara
  390: { city: 'Vadodara', state: 'GJ' },
  // Ludhiana
  141: { city: 'Ludhiana', state: 'PB' },
  // Agra
  282: { city: 'Agra', state: 'UP' },
  // Nashik
  422: { city: 'Nashik', state: 'MH' },
  // Faridabad
  121: { city: 'Faridabad', state: 'HR' },
  // Meerut
  250: { city: 'Meerut', state: 'UP' },
  // Rajkot
  360: { city: 'Rajkot', state: 'GJ' },
  // Kalyan-Dombivali
  421: { city: 'Kalyan', state: 'MH' },
  // Vasai-Virar
  401: { city: 'Vasai', state: 'MH' },
  // Varanasi
  221: { city: 'Varanasi', state: 'UP' },
  // Srinagar
  190: { city: 'Srinagar', state: 'JK' },
  // Aurangabad
  431: { city: 'Aurangabad', state: 'MH' },
  // Dhanbad
  826: { city: 'Dhanbad', state: 'JH' },
  // Amritsar
  143: { city: 'Amritsar', state: 'PB' },
  // Navi Mumbai
  400: { city: 'Navi Mumbai', state: 'MH' },
  // Allahabad
  211: { city: 'Allahabad', state: 'UP' },
  // Ranchi
  834: { city: 'Ranchi', state: 'JH' },
  // Howrah
  711: { city: 'Howrah', state: 'WB' },
  // Coimbatore
  641: { city: 'Coimbatore', state: 'TN' },
  // Jabalpur
  482: { city: 'Jabalpur', state: 'MP' },
  // Gwalior
  474: { city: 'Gwalior', state: 'MP' },
  // Vijayawada
  520: { city: 'Vijayawada', state: 'AP' },
  // Jodhpur
  342: { city: 'Jodhpur', state: 'RJ' },
  // Madurai
  625: { city: 'Madurai', state: 'TN' },
  // Raipur
  492: { city: 'Raipur', state: 'CG' },
  // Kota
  324: { city: 'Kota', state: 'RJ' },
  // Guwahati
  781: { city: 'Guwahati', state: 'AS' },
  // Chandigarh
  160: { city: 'Chandigarh', state: 'CH' },
  // Thiruvananthapuram
  695: { city: 'Thiruvananthapuram', state: 'KL' },
  // Solapur
  413: { city: 'Solapur', state: 'MH' },
  // Hubballi-Dharwad
  580: { city: 'Hubballi', state: 'KA' },
  // Tiruchirappalli
  620: { city: 'Tiruchirappalli', state: 'TN' },
  // Bareilly
  243: { city: 'Bareilly', state: 'UP' },
  // Mysore
  570: { city: 'Mysore', state: 'KA' },
  // Tiruppur
  641: { city: 'Tiruppur', state: 'TN' },
  // Gurgaon
  122: { city: 'Gurgaon', state: 'HR' },
  // Aligarh
  202: { city: 'Aligarh', state: 'UP' },
  // Jalandhar
  144: { city: 'Jalandhar', state: 'PB' },
  // Bhubaneswar
  751: { city: 'Bhubaneswar', state: 'OR' },
  // Salem
  636: { city: 'Salem', state: 'TN' },
  // Warangal
  506: { city: 'Warangal', state: 'TG' },
  // Guntur
  522: { city: 'Guntur', state: 'AP' },
  // Bhiwandi
  421: { city: 'Bhiwandi', state: 'MH' },
  // Saharanpur
  247: { city: 'Saharanpur', state: 'UP' },
  // Gorakhpur
  273: { city: 'Gorakhpur', state: 'UP' },
  // Bikaner
  334: { city: 'Bikaner', state: 'RJ' },
  // Amravati
  444: { city: 'Amravati', state: 'MH' },
  // Noida
  201: { city: 'Noida', state: 'UP' },
  // Jamshedpur
  831: { city: 'Jamshedpur', state: 'JH' },
  // Bhilai Nagar
  490: { city: 'Bhilai', state: 'CG' },
  // Cuttack
  753: { city: 'Cuttack', state: 'OR' },
  // Firozabad
  283: { city: 'Firozabad', state: 'UP' },
  // Kochi
  682: { city: 'Kochi', state: 'KL' },
  // Bhavnagar
  364: { city: 'Bhavnagar', state: 'GJ' },
  // Dehradun
  248: { city: 'Dehradun', state: 'UK' },
  // Durgapur
  713: { city: 'Durgapur', state: 'WB' },
  // Asansol
  713: { city: 'Asansol', state: 'WB' },
  // Nanded-Waghala
  431: { city: 'Nanded', state: 'MH' },
  // Kolhapur
  416: { city: 'Kolhapur', state: 'MH' },
  // Ajmer
  305: { city: 'Ajmer', state: 'RJ' },
  // Gulbarga
  585: { city: 'Gulbarga', state: 'KA' },
  // Jamnagar
  361: { city: 'Jamnagar', state: 'GJ' },
  // Ujjain
  456: { city: 'Ujjain', state: 'MP' },
  // Loni
  201: { city: 'Loni', state: 'UP' },
  // Siliguri
  734: { city: 'Siliguri', state: 'WB' },
  // Jhansi
  284: { city: 'Jhansi', state: 'UP' },
  // Ulhasnagar
  421: { city: 'Ulhasnagar', state: 'MH' },
  // Nellore
  524: { city: 'Nellore', state: 'AP' },
  // Jammu
  180: { city: 'Jammu', state: 'JK' },
  // Sangli-Miraj & Kupwad
  416: { city: 'Sangli', state: 'MH' },
  // Belgaum
  590: { city: 'Belgaum', state: 'KA' },
  // Mangalore
  575: { city: 'Mangalore', state: 'KA' },
  // Ambattur
  600: { city: 'Ambattur', state: 'TN' },
  // Tirunelveli
  627: { city: 'Tirunelveli', state: 'TN' },
  // Malegaon
  423: { city: 'Malegaon', state: 'MH' },
  // Gaya
  823: { city: 'Gaya', state: 'BR' },
  // Jalgaon
  425: { city: 'Jalgaon', state: 'MH' },
  // Udaipur
  313: { city: 'Udaipur', state: 'RJ' },
  // Maheshtala
  700: { city: 'Maheshtala', state: 'WB' },
};

export const validatePincode = (pincode) => {
  if (!pincode) return false;

  const cleanPincode = pincode.toString().replace(/\D/g, '');

  if (cleanPincode.length !== 6) return false;

  const firstDigit = parseInt(cleanPincode[0]);
  if (firstDigit < 1 || firstDigit > 8) return false;

  return true;
};

export const getStateFromPincode = (pincode) => {
  const prefix2 = pincode.substring(0, 2);
  return pincodeStateMap[prefix2] || 'Unknown';
};

export const getCityFromPincode = (pincode) => {
  const prefix3 = pincode.substring(0, 3);
  return (
    majorCities[prefix3] || {
      city: 'Unknown',
      state: getStateFromPincode(pincode),
    }
  );
};

export const calculateDeliveryDays = (fromPincode, toPincode) => {
  if (fromPincode === toPincode) {
    return { min: 1, max: 1, range: '1' };
  }

  const fromState = getStateFromPincode(fromPincode);
  const toState = getStateFromPincode(toPincode);
  const fromCity = getCityFromPincode(fromPincode);
  const toCity = getCityFromPincode(toPincode);

  if (fromCity.city === toCity.city) {
    return { min: 1, max: 2, range: '1-2' };
  }

  if (fromState === toState) {
    return { min: 2, max: 3, range: '2-3' };
  }

  const neighboringStates = {
    MH: ['GJ', 'MP', 'KA', 'AP', 'TG', 'CG'],
    DL: ['HR', 'UP', 'RJ', 'PB'],
    KA: ['MH', 'AP', 'TG', 'TN', 'KL', 'GJ'],
    TN: ['KA', 'AP', 'KL'],
    GJ: ['MH', 'MP', 'RJ'],
    WB: ['JH', 'OR', 'AS', 'SK', 'BR'],
    UP: ['DL', 'HR', 'RJ', 'MP', 'CG', 'JH', 'BR'],
    RJ: ['GJ', 'MP', 'HR', 'DL', 'UP', 'PB'],
    MP: ['MH', 'GJ', 'RJ', 'UP', 'CG', 'JH'],
    PB: ['HR', 'DL', 'RJ', 'HP', 'JK'],
    HR: ['DL', 'UP', 'RJ', 'PB', 'HP'],
    AP: ['TG', 'KA', 'TN', 'OR', 'CG'],
    TG: ['AP', 'KA', 'MH', 'CG', 'OR'],
    KL: ['TN', 'KA'],
    OR: ['WB', 'JH', 'CG', 'AP', 'TG'],
    AS: ['WB', 'ML', 'TR', 'NL', 'MN', 'MZ', 'AR'],
    BR: ['WB', 'JH', 'UP', 'MP'],
    JH: ['WB', 'OR', 'CG', 'UP', 'BR'],
    CG: ['MP', 'MH', 'TG', 'AP', 'OR', 'JH', 'UP'],
    HP: ['PB', 'HR', 'UK', 'JK'],
    UK: ['HP', 'UP', 'HR'],
    JK: ['PB', 'HP', 'LD'],
  };

  if (neighboringStates[fromState]?.includes(toState)) {
    return { min: 3, max: 4, range: '3-4' };
  }

  return { min: 4, max: 5, range: '4-5' };
};

export const calculateDeliveryDates = (deliveryDays) => {
  const today = new Date();
  const earliestDate = new Date(today);
  const latestDate = new Date(today);

  let addedDays = 0;
  let currentDate = new Date(today);

  while (addedDays < deliveryDays.min) {
    currentDate.setDate(currentDate.getDate() + 1);
    if (currentDate.getDay() !== 0) {
      addedDays++;
    }
  }
  earliestDate.setTime(currentDate.getTime());

  addedDays = 0;
  currentDate = new Date(today);
  while (addedDays < deliveryDays.max) {
    currentDate.setDate(currentDate.getDate() + 1);
    if (currentDate.getDay() !== 0) {
      addedDays++;
    }
  }
  latestDate.setTime(currentDate.getTime());

  return {
    earliest: earliestDate.toISOString().split('T')[0],
    latest: latestDate.toISOString().split('T')[0],
  };
};

export const getDeliveryEstimate = async (productId, customerPincode) => {
  try {
    if (!validatePincode(customerPincode)) {
      throw new Error('Please enter a valid 6-digit pincode');
    }

    const product = await BuyProduct.findById(productId).populate('partnerId');
    if (!product) {
      throw new Error('Product not found');
    }

    const partner = await Partner.findById(product.partnerId);
    if (!partner || !partner.shopAddress?.pincode) {
      const partnerPincode = '400001';
      const deliveryDays = calculateDeliveryDays(
        partnerPincode,
        customerPincode
      );
      const deliveryDates = calculateDeliveryDates(deliveryDays);

      return {
        estimatedDays: deliveryDays.range,
        deliveryDate: deliveryDates,
        partnerLocation: {
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: partnerPincode,
        },
      };
    }

    const partnerPincode = partner.shopAddress.pincode;
    const deliveryDays = calculateDeliveryDays(partnerPincode, customerPincode);
    const deliveryDates = calculateDeliveryDates(deliveryDays);

    const partnerCity = getCityFromPincode(partnerPincode);

    return {
      estimatedDays: deliveryDays.range,
      deliveryDate: deliveryDates,
      partnerLocation: {
        city: partnerCity.city,
        state: partnerCity.state,
        pincode: partnerPincode,
      },
    };
  } catch (error) {
    console.error('Delivery estimation error:', error);
    throw error;
  }
};

const deliveryService = {
  validatePincode,
  getStateFromPincode,
  getCityFromPincode,
  calculateDeliveryDays,
  calculateDeliveryDates,
  getDeliveryEstimate,
};

export default deliveryService;
