// gsmarenaService.js
// Updated prompt to match form field names exactly for seamless population
// Improved error handling and fallback logic
// Professionalized code with comments and better structure

import axios from 'axios';

// Note: In production, use process.env.OPENAI_API_KEY instead of hardcoding
const OPENAI_API_KEY =
  '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';

class GSMArenaService {
  constructor() {    this.openaiClient = axios.create({
      baseURL: 'https://api.openai.com/v1',
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      timeout: 30000, // 30 second default timeout
    });
  }

  /**
   * Search for product details using OpenAI to simulate GSMArena data
   * @param {string} productName - The product name to search for
   * @returns {Promise<Object>} - Product details object
   */
  async searchProduct(productName: any) {
    try {
      if (!productName || productName.trim().length < 2) {
        throw new Error('Product name must be at least 2 characters long');
      }

      const prompt = this.buildSearchPrompt(productName);      const response = await this.openaiClient.post('/chat/completions', {
        model: 'gpt-4o', // Updated to more recent model for better accuracy
        messages: [
          {
            role: 'system',
            content:
              'You are a mobile phone specification expert with comprehensive knowledge of smartphone specifications from various manufacturers. Provide accurate technical specifications based on your training data. Always return complete, valid JSON responses with all requested fields filled. Use "N/A" for unknown fields.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: 2000,
        temperature: 0.1,
      });

      if (!response.data?.choices?.[0]?.message?.content) {
        throw new Error('No response received from OpenAI API. Please try again.');
      }

      const content = response.data.choices[0].message.content.trim();

      // Handle cases where OpenAI can't provide data
      if (
        content.toLowerCase().includes('sorry') &&
        (content.toLowerCase().includes('browse') || content.toLowerCase().includes('internet'))
      ) {
        throw new Error(
          `Unable to retrieve specifications for "${productName}". This product may not be in the database. Please try a different product name or enter manually.`
        );
      }

      if (content.toLowerCase().includes('not found') || content === 'null') {
        throw new Error(
          `Product "${productName}" specifications not available. Please check the name or enter manually.`
        );
      }

      // Extract JSON
      const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/) || content.match(/\{[\s\S]*\}/);
      const jsonString = jsonMatch ? jsonMatch[1] || jsonMatch[0] : content;

      let productData;
      try {
        productData = JSON.parse(jsonString);
      } catch (parseError) {
        console.error('JSON parsing error:', parseError);
        console.error('Raw content:', content);
        throw new Error('Invalid response format from API. Please try again.');
      }

      return this.formatProductData(productData);
    } catch (error) {
      console.error('GSMArena search error:', error);      const status = error.response?.status;
      if (status === 401) {
        throw new Error('API authentication failed. Check your API key.');
      } else if (status === 429) {
        throw new Error('Rate limit exceeded. Try again later.');
      } else if (status === 402) {
        throw new Error('API quota exceeded. Contact support.');
      } else if (status >= 500) {
        throw new Error('API service unavailable. Try again later.');      } else if (error.code === 'ETIMEDOUT') {
        throw new Error('Request timed out. Try again.');
      } else {
        throw error; // Re-throw for user-friendly messages
      }
    }
  }

  /**
   * Build the search prompt for OpenAI, aligned with form fields
   * @param {string} productName - Product name
   * @returns {string} - Prompt string
   */
  buildSearchPrompt(productName: any) {
    return `
Provide detailed specifications for the smartphone "${productName}" in this exact JSON structure. Use your knowledge to fill in accurate data. Use "N/A" for unavailable fields. Return only the JSON object.

{
  "name": "Full product name",
  "brand": "Brand name",
  "description": "Brief product description",
  "topSpecs": {
    "screenSize": "Screen size with unit",
    "chipset": "Processor/Chipset name",
    "pixelDensity": "PPI value",
    "networkSupport": "Network support (e.g., 5G, 4G)",
    "simSlots": "Number of SIM slots"
  },
  "productDetails": {
    "display": {
      "size": "Screen size (e.g., 6.1 inches)",
      "resolution": "Display resolution",
      "technology": "Display technology (e.g., OLED)",
      "refreshRate": "Refresh rate (e.g., 120Hz)",
      "pixelDensity": "PPI",
      "aspectRatio": "Aspect ratio",
      "screenToBodyRatio": "Screen-to-body ratio",
      "brightness": "Brightness level",
      "protection": "Protection type (e.g., Gorilla Glass)"
    },
    "performance": {
      "chipset": "Chipset name",
      "cpu": "CPU details",
      "clockSpeed": "CPU clock speed",
      "gpu": "GPU name",
      "os": "Operating system",
      "architecture": "Architecture",
      "processTechnology": "Process technology"
    },
    "general": {
      "announcedOn": "Announcement date",
      "priceMrp": "MRP price",
      "brand": "Brand name",
      "marketStatus": "Available/Discontinued",
      "priceStatus": "Official/Unofficial",
      "modelNumber": "Model number"
    },
    "memoryStorage": {
      "phoneVariants": [{"ram": "RAM size", "storage": "Storage size", "price": 0}],
      "expandableStorage": false,
      "ramType": "RAM type",
      "storageType": "Storage type"
    },
    "frontCamera": {
      "resolution": "Resolution",
      "setup": "Single/Dual",
      "aperture": "Aperture",
      "flash": "Flash type",
      "videoRecording": ["Video formats"],
      "type": "Camera type",
      "features": ["Features list"]
    },
    "rearCamera": {
      "setup": "Setup description",
      "camera1": {
        "resolution": "Resolution",
        "aperture": "Aperture",
        "type": "Type",
        "lens": "Lens details"
      },
      "camera2": {
        "resolution": "Resolution",
        "aperture": "Aperture",
        "type": "Type",
        "lens": "Lens details"
      },
      "flash": "Flash type",
      "sensor": "Sensor type",
      "ois": "OIS support",
      "videoRecording": ["Video formats"],
      "features": ["Features list"]
    },
    "battery": {
      "capacity": "Capacity (e.g., 3200mAh)",
      "fastCharging": "Fast charging speed",
      "wirelessCharging": "Wireless charging speed",
      "type": "Battery type",
      "features": ["Features list"]
    },
    "networkConnectivity": {
      "wifi": "WiFi standards",
      "wifiFeatures": ["Features list"],
      "bluetooth": "Bluetooth version",
      "nfc": "NFC support",
      "gps": "GPS support",
      "volte": "VoLTE support",
      "esim": "eSIM support",
      "audioJack": "Audio jack type",
      "has3p5mmJack": false,
      "audioFeatures": ["Audio features"],
      "simSize": "SIM size",
      "simSlots": "SIM slots",
      "sim1Bands": "SIM1 bands",
      "sim2Bands": "SIM2 bands",
      "networkSupport": "Network support"
    },
    "design": {
      "weight": "Weight with unit",
      "dimensions": {"height": "Height", "width": "Width", "thickness": "Thickness"},
      "colors": ["Color list"],
      "build": "Build materials",
      "sarValue": "SAR value"
    },
    "sensorsMisc": {
      "fingerprintScanner": false,
      "sensors": ["Sensors list"]
    }
  },
  "availability": {
    "inStock": true,
    "deliveryPincode": "",
    "estimatedDelivery": ""
  }
}

Important: Return only valid JSON. Fill based on known data for the product. If product not known, use reasonable defaults for similar models.
`;
  }

  /**
   * Format product data to ensure consistency
   * @param {Object} rawData - Parsed JSON from API
   * @returns {Object} - Formatted data
   */
  formatProductData(rawData: any) {
    // Ensure numbers, booleans, arrays are correctly typed
    const formatArray = (val: any) => Array.isArray(val) ? val : [];
    const formatBool = (val: any) => !!val;
    const formatNum = (val: any) => Number(val) || 0;

    return {
      name: rawData.name || '',
      brand: rawData.brand || '',
      description: rawData.description || '',
      topSpecs: {
        screenSize: rawData.topSpecs?.screenSize || '',
        chipset: rawData.topSpecs?.chipset || '',
        pixelDensity: rawData.topSpecs?.pixelDensity || '',
        networkSupport: rawData.topSpecs?.networkSupport || '',
        simSlots: rawData.topSpecs?.simSlots || '',
      },
      productDetails: {
        display: {
          size: rawData.productDetails?.display?.size || '',
          resolution: rawData.productDetails?.display?.resolution || '',
          technology: rawData.productDetails?.display?.technology || '',
          refreshRate: rawData.productDetails?.display?.refreshRate || '',
          pixelDensity: rawData.productDetails?.display?.pixelDensity || '',
          aspectRatio: rawData.productDetails?.display?.aspectRatio || '',
          screenToBodyRatio: rawData.productDetails?.display?.screenToBodyRatio || '',
          brightness: rawData.productDetails?.display?.brightness || '',
          protection: rawData.productDetails?.display?.protection || '',
        },
        performance: {
          chipset: rawData.productDetails?.performance?.chipset || '',
          cpu: rawData.productDetails?.performance?.cpu || '',
          clockSpeed: rawData.productDetails?.performance?.clockSpeed || '',
          gpu: rawData.productDetails?.performance?.gpu || '',
          os: rawData.productDetails?.performance?.os || '',
          architecture: rawData.productDetails?.performance?.architecture || '',
          processTechnology: rawData.productDetails?.performance?.processTechnology || '',
        },
        general: {
          announcedOn: rawData.productDetails?.general?.announcedOn || '',
          priceMrp: formatNum(rawData.productDetails?.general?.priceMrp),
          brand: rawData.productDetails?.general?.brand || '',
          marketStatus: rawData.productDetails?.general?.marketStatus || '',
          priceStatus: rawData.productDetails?.general?.priceStatus || '',
          modelNumber: rawData.productDetails?.general?.modelNumber || '',
        },
        memoryStorage: {
          phoneVariants:
            rawData.productDetails?.memoryStorage?.phoneVariants.map((v: any) => ({
              ram: v.ram || '',
              storage: v.storage || '',
              price: formatNum(v.price)
            })) || [],
          expandableStorage: formatBool(rawData.productDetails?.memoryStorage?.expandableStorage),
          ramType: rawData.productDetails?.memoryStorage?.ramType || '',
          storageType: rawData.productDetails?.memoryStorage?.storageType || '',
        },
        frontCamera: {
          resolution: rawData.productDetails?.frontCamera?.resolution || '',
          setup: rawData.productDetails?.frontCamera?.setup || '',
          aperture: rawData.productDetails?.frontCamera?.aperture || '',
          flash: rawData.productDetails?.frontCamera?.flash || '',
          videoRecording: formatArray(rawData.productDetails?.frontCamera?.videoRecording),
          type: rawData.productDetails?.frontCamera?.type || '',
          features: formatArray(rawData.productDetails?.frontCamera?.features),
        },
        rearCamera: {
          setup: rawData.productDetails?.rearCamera?.setup || '',
          camera1: {
            resolution: rawData.productDetails?.rearCamera?.camera1?.resolution || '',
            aperture: rawData.productDetails?.rearCamera?.camera1?.aperture || '',
            type: rawData.productDetails?.rearCamera?.camera1?.type || '',
            lens: rawData.productDetails?.rearCamera?.camera1?.lens || '',
          },
          camera2: {
            resolution: rawData.productDetails?.rearCamera?.camera2?.resolution || '',
            aperture: rawData.productDetails?.rearCamera?.camera2?.aperture || '',
            type: rawData.productDetails?.rearCamera?.camera2?.type || '',
            lens: rawData.productDetails?.rearCamera?.camera2?.lens || '',
          },
          flash: rawData.productDetails?.rearCamera?.flash || '',
          sensor: rawData.productDetails?.rearCamera?.sensor || '',
          ois: rawData.productDetails?.rearCamera?.ois || '',
          videoRecording: formatArray(rawData.productDetails?.rearCamera?.videoRecording),
          features: formatArray(rawData.productDetails?.rearCamera?.features),
        },
        battery: {
          capacity: rawData.productDetails?.battery?.capacity || '',
          fastCharging: rawData.productDetails?.battery?.fastCharging || '',
          wirelessCharging: rawData.productDetails?.battery?.wirelessCharging || '',
          type: rawData.productDetails?.battery?.type || '',
          features: formatArray(rawData.productDetails?.battery?.features),
        },
        networkConnectivity: {
          wifi: rawData.productDetails?.networkConnectivity?.wifi || '',
          wifiFeatures: formatArray(rawData.productDetails?.networkConnectivity?.wifiFeatures),
          bluetooth: rawData.productDetails?.networkConnectivity?.bluetooth || '',
          nfc: rawData.productDetails?.networkConnectivity?.nfc || '',
          gps: rawData.productDetails?.networkConnectivity?.gps || '',
          volte: rawData.productDetails?.networkConnectivity?.volte || '',
          esim: rawData.productDetails?.networkConnectivity?.esim || '',
          audioJack: rawData.productDetails?.networkConnectivity?.audioJack || '',
          has3p5mmJack: formatBool(rawData.productDetails?.networkConnectivity?.has3p5mmJack),
          audioFeatures: formatArray(rawData.productDetails?.networkConnectivity?.audioFeatures),
          simSize: rawData.productDetails?.networkConnectivity?.simSize || '',
          simSlots: rawData.productDetails?.networkConnectivity?.simSlots || '',
          sim1Bands: rawData.productDetails?.networkConnectivity?.sim1Bands || '',
          sim2Bands: rawData.productDetails?.networkConnectivity?.sim2Bands || '',
          networkSupport: rawData.productDetails?.networkConnectivity?.networkSupport || '',
        },
        design: {
          weight: rawData.productDetails?.design?.weight || '',
          dimensions: rawData.productDetails?.design?.dimensions || {},
          colors: formatArray(rawData.productDetails?.design?.colors),
          build: rawData.productDetails?.design?.build || '',
          sarValue: rawData.productDetails?.design?.sarValue || '',
        },
        sensorsMisc: {
          fingerprintScanner: formatBool(rawData.productDetails?.sensorsMisc?.fingerprintScanner),
          sensors: formatArray(rawData.productDetails?.sensorsMisc?.sensors),
        },
      },
      availability: {
        inStock: formatBool(rawData.availability?.inStock),
        deliveryPincode: rawData.availability?.deliveryPincode || '',
        estimatedDelivery: rawData.availability?.estimatedDelivery || '',
      },
    };
  }

  /**
   * Get product suggestions
   * @param {string} query - Search query
   * @returns {Promise<Array<string>>} - List of suggestions
   */
  async getProductSuggestions(query: any) {
    try {
      if (!query || query.trim().length < 2) return [];      const response = await this.openaiClient.post('/chat/completions', {
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content:
              'You are a mobile phone expert. Suggest popular models matching the query. Return only JSON array of strings.',
          },
          {
            role: 'user',
            content: `Suggest 5-10 popular smartphone models matching "${query}". Return only ["Model1", "Model2", ...]. Focus on recent models.`,
          },
        ],
        max_tokens: 200,
        temperature: 0.3,
      });

      const content = response.data.choices[0].message.content.trim();
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (!jsonMatch) return [];

      return JSON.parse(jsonMatch[0]).slice(0, 10);
    } catch (error) {
      console.error('Suggestions error:', error);
      return []; // Fail silently for suggestions
    }
  }
}

const gsmarenaService = new GSMArenaService();
export default gsmarenaService;
