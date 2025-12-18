import React, { useState, useEffect } from 'react';
import { X, MapPin, Navigation, AlertCircle, CheckCircle } from 'lucide-react';
import { partnerService } from '../../services/partnerService';

interface LocationSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

const LocationSetupModal: React.FC<LocationSetupModalProps> = ({ isOpen, onClose, onComplete }) => {
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [serviceRadius, setServiceRadius] = useState('5000'); // 5km default
  const [customRadius, setCustomRadius] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [gettingLocation, setGettingLocation] = useState(false);

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    setGettingLocation(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      position => {
        setLatitude(position.coords.latitude.toFixed(6));
        setLongitude(position.coords.longitude.toFixed(6));
        setGettingLocation(false);
      },
      error => {
        setError('Unable to get your location. Please enter manually.');
        setGettingLocation(false);
        console.error('Geolocation error:', error);
      }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    const radius = serviceRadius === 'custom' ? parseInt(customRadius) : parseInt(serviceRadius);

    // Validation
    if (isNaN(lat) || lat < -90 || lat > 90) {
      setError('Latitude must be between -90 and 90');
      return;
    }

    if (isNaN(lng) || lng < -180 || lng > 180) {
      setError('Longitude must be between -180 and 180');
      return;
    }

    if (isNaN(radius) || radius < 1000) {
      setError('Service radius must be at least 1km (1000 meters)');
      return;
    }

    if (serviceRadius === 'custom' && !customRadius) {
      setError('Please enter a custom service radius');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await partnerService.updateLocation({
        latitude: lat,
        longitude: lng,
        serviceRadius: radius,
      });

      if (response.success) {
        onComplete();
      }
    } catch (err: any) {
      console.error('Error updating location:', err);
      setError(err.message || 'Failed to update location');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <MapPin size={20} className="text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Setup Location</h2>
              <p className="text-sm text-gray-600">Configure your service area</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <AlertCircle size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-900">
              <p className="font-medium mb-1">Why do we need this?</p>
              <p className="text-blue-700">
                We use your location to show you orders available for pickup in your service area.
                This helps match you with nearby customers.
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Get Current Location Button */}
          <button
            type="button"
            onClick={handleGetCurrentLocation}
            disabled={gettingLocation}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 transition-colors"
          >
            <Navigation size={16} />
            {gettingLocation ? 'Getting location...' : 'Use Current Location'}
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">or enter manually</span>
            </div>
          </div>

          {/* Latitude */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Latitude</label>
            <input
              type="text"
              value={latitude}
              onChange={e => setLatitude(e.target.value)}
              placeholder="e.g., 28.6139"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {/* Longitude */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Longitude</label>
            <input
              type="text"
              value={longitude}
              onChange={e => setLongitude(e.target.value)}
              placeholder="e.g., 77.2090"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {/* Service Radius */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Service Radius</label>
            <select
              value={serviceRadius}
              onChange={e => setServiceRadius(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="1000">1 km</option>
              <option value="2000">2 km</option>
              <option value="3000">3 km</option>
              <option value="5000">5 km</option>
              <option value="10000">10 km</option>
              <option value="15000">15 km</option>
              <option value="20000">20 km</option>
              <option value="30000">30 km</option>
              <option value="50000">50 km</option>
              <option value="75000">75 km</option>
              <option value="100000">100 km</option>
              <option value="150000">150 km</option>
              <option value="200000">200 km</option>
              <option value="300000">300 km</option>
              <option value="500000">500 km</option>
              <option value="1000000">1000 km (Nationwide)</option>
              <option value="custom">Custom Distance</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Orders within this radius will be shown to you
            </p>
          </div>

          {/* Custom Radius Input */}
          {serviceRadius === 'custom' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Custom Service Radius (in meters)
              </label>
              <input
                type="number"
                value={customRadius}
                onChange={e => setCustomRadius(e.target.value)}
                placeholder="e.g., 75000 for 75km"
                min="1000"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                Enter distance in meters (minimum 1000m = 1km)
              </p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Saving...
                </>
              ) : (
                <>
                  <CheckCircle size={16} />
                  Save Location
                </>
              )}
            </button>
          </div>
        </form>

        {/* Help Text */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            <strong>Tip:</strong> You can find your coordinates using Google Maps. Right-click on
            your shop location and select "What's here?" to see the coordinates.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LocationSetupModal;
