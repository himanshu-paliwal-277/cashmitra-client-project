const processArrayFields = (data) => {
  const processedData = { ...data };

  const convertToArray = (obj) => {
    if (!obj) return [];
    if (Array.isArray(obj)) {
      return obj.filter(
        (item) =>
          item && typeof item === 'object' && Object.keys(item).length > 0
      );
    }
    if (typeof obj === 'object') {
      return Object.values(obj).filter(
        (item) =>
          item && typeof item === 'object' && Object.keys(item).length > 0
      );
    }
    return [];
  };

  const convertStringArray = (obj) => {
    if (!obj) return [];
    if (Array.isArray(obj)) {
      return obj.filter(
        (item) => item && typeof item === 'string' && item.trim() !== ''
      );
    }
    if (typeof obj === 'object') {
      return Object.values(obj).filter(
        (item) => item && typeof item === 'string' && item.trim() !== ''
      );
    }
    return [];
  };

  // Helper function to filter empty objects from arrays
  const filterEmptyObjects = (arr) => {
    if (!Array.isArray(arr)) return arr;
    return arr.filter((item) => {
      if (typeof item === 'string') return item.trim() !== '';
      if (typeof item === 'object' && item !== null) {
        return Object.keys(item).length > 0;
      }
      return item !== null && item !== undefined;
    });
  };

  if (processedData.images) {
    processedData.images = convertStringArray(processedData.images);
  }

  if (processedData.conditionOptions) {
    processedData.conditionOptions = filterEmptyObjects(
      convertToArray(processedData.conditionOptions)
    );
  }

  if (processedData.variants) {
    const variantsArray = Array.isArray(processedData.variants)
      ? processedData.variants
      : Object.values(processedData.variants || {});

    processedData.variants = variantsArray.filter(
      (item) =>
        item &&
        typeof item === 'object' &&
        item !== null &&
        Object.keys(item).length > 0
    );
  }

  if (processedData.addOns) {
    const addOnsArray = Array.isArray(processedData.addOns)
      ? processedData.addOns
      : Object.values(processedData.addOns || {});

    processedData.addOns = addOnsArray.filter(
      (item) =>
        item &&
        typeof item === 'object' &&
        item !== null &&
        Object.keys(item).length > 0
    );
  }

  if (processedData.offers) {
    processedData.offers = filterEmptyObjects(
      convertToArray(processedData.offers)
    );
  }

  if (processedData.relatedProducts) {
    processedData.relatedProducts = convertToArray(
      processedData.relatedProducts
    );
  }

  if (processedData.topSpecs) {
    processedData.topSpecs = convertStringArray(processedData.topSpecs);
  }

  if (processedData.badges) {
    processedData.badges = convertStringArray(processedData.badges);
  }

  if (processedData.reviews) {
    processedData.reviews = filterEmptyObjects(
      convertToArray(processedData.reviews)
    );
  }

  if (processedData.paymentOptions) {
    if (processedData.paymentOptions.emiPlans) {
      processedData.paymentOptions.emiPlans = filterEmptyObjects(
        convertToArray(processedData.paymentOptions.emiPlans)
      );
    }
    if (processedData.paymentOptions.methods) {
      processedData.paymentOptions.methods = convertStringArray(
        processedData.paymentOptions.methods
      );
    }
  }

  if (processedData.productDetails) {
    const details = processedData.productDetails;

    if (details.rearCamera) {
      if (details.rearCamera.features) {
        details.rearCamera.features = convertStringArray(
          details.rearCamera.features
        );
      }
      if (details.rearCamera.videoRecording) {
        details.rearCamera.videoRecording = convertStringArray(
          details.rearCamera.videoRecording
        );
      }
    }
    if (details.frontCamera) {
      if (details.frontCamera.features) {
        details.frontCamera.features = convertStringArray(
          details.frontCamera.features
        );
      }
      if (details.frontCamera.videoRecording) {
        details.frontCamera.videoRecording = convertStringArray(
          details.frontCamera.videoRecording
        );
      }
    }
    if (details.camera) {
      if (details.camera.rear) {
        if (details.camera.rear.features) {
          details.camera.rear.features = convertStringArray(
            details.camera.rear.features
          );
        }
        if (details.camera.rear.videoRecording) {
          details.camera.rear.videoRecording = convertStringArray(
            details.camera.rear.videoRecording
          );
        }
      }
      if (details.camera.front) {
        if (details.camera.front.features) {
          details.camera.front.features = convertStringArray(
            details.camera.front.features
          );
        }
        if (details.camera.front.videoRecording) {
          details.camera.front.videoRecording = convertStringArray(
            details.camera.front.videoRecording
          );
        }
      }
    }

    if (details.display && details.display.features) {
      details.display.features = convertStringArray(details.display.features);
    }

    if (details.design && details.design.colors) {
      details.design.colors = convertStringArray(details.design.colors);
    }

    if (details.networkConnectivity) {
      if (details.networkConnectivity.wifiFeatures) {
        details.networkConnectivity.wifiFeatures = convertStringArray(
          details.networkConnectivity.wifiFeatures
        );
      }
      if (details.networkConnectivity.audioFeatures) {
        details.networkConnectivity.audioFeatures = convertStringArray(
          details.networkConnectivity.audioFeatures
        );
      }
    }

    if (details.memoryStorage && details.memoryStorage.phoneVariants) {
      details.memoryStorage.phoneVariants = convertStringArray(
        details.memoryStorage.phoneVariants
      );
    }

    if (details.sensorsMisc && details.sensorsMisc.sensors) {
      details.sensorsMisc.sensors = convertStringArray(
        details.sensorsMisc.sensors
      );
    }
    if (details.sensors) {
      details.sensors = convertStringArray(details.sensors);
    }
  }

  if (processedData.sortOrder !== undefined) {
    processedData.sortOrder = Number(processedData.sortOrder) || 0;
  }

  return processedData;
};

module.exports = {
  processArrayFields,
};
