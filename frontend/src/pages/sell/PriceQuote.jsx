import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { theme } from '../../theme';
import Button from '../../components/ui/Button';
import { ArrowLeft } from 'lucide-react';
import { createSellOfferSession } from '../../services/sellService';

const PageContainer = styled.div`
  min-height: calc(100vh - 72px);
  background: ${theme.colors.background.paper};
  padding: ${theme.spacing[4]} 0;
`;

const TopNav = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 ${theme.spacing[4]};
  background: white;
  border-bottom: 1px solid ${theme.colors.grey[200]};
  height: 60px;
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text.secondary};

  .nav-links {
    display: flex;
    gap: ${theme.spacing[4]};

    a {
      color: ${theme.colors.text.secondary};
      text-decoration: none;

      &:hover {
        color: ${theme.colors.primary.main};
      }
    }
  }

  .back-btn {
    display: flex;
    align-items: center;
    gap: ${theme.spacing[2]};
    color: ${theme.colors.primary.main};
    cursor: pointer;
    font-size: ${theme.typography.fontSize.sm};
  }
`;

const MainContent = styled.div`
  display: flex;
  max-width: 1200px;
  margin: 0 auto;
  padding: ${theme.spacing[4]};
  gap: ${theme.spacing[6]};

  @media (max-width: ${theme.breakpoints.lg}) {
    flex-direction: column;
    padding: ${theme.spacing[2]};
  }
`;

const ProductSection = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing[4]};
`;

const ProductImage = styled.div`
  width: 100%;
  height: 400px;
  background: ${theme.colors.grey[100]};
  border-radius: ${theme.borderRadius.lg};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48px;
  color: ${theme.colors.text.secondary};

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: ${theme.borderRadius.lg};
  }
`;

const ProductInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing[2]};
`;

const ProductName = styled.h2`
  font-size: ${theme.typography.fontSize['2xl']};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.text.primary};
  margin: 0;
`;

const SellingPrice = styled.div`
  font-size: ${theme.typography.fontSize['3xl']};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.error.main};
  margin: ${theme.spacing[1]} 0;
`;

const RecalculateBtn = styled(Button)`
  align-self: flex-start;
  padding: ${theme.spacing[2]} ${theme.spacing[3]};
  font-size: ${theme.typography.fontSize.sm};
`;

const FeaturesRow = styled.div`
  display: flex;
  gap: ${theme.spacing[4]};
  margin-top: auto;
`;

const FeatureItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${theme.spacing[1]};
  flex: 1;

  .icon {
    width: 40px;
    height: 40px;
    background: ${theme.colors.primary[100]};
    border-radius: ${theme.borderRadius.full};
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${theme.colors.primary.main};
    font-size: 20px;
  }

  .label {
    font-size: ${theme.typography.fontSize.sm};
    text-align: center;
    color: ${theme.colors.text.primary};
  }
`;

const PriceSummarySection = styled.div`
  flex: 0 0 300px;
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing[4]};
`;

const PriceSummaryBox = styled.div`
  background: white;
  border: 1px solid ${theme.colors.grey[200]};
  border-radius: ${theme.borderRadius.lg};
  padding: ${theme.spacing[4]};
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing[3]};
`;

const PriceRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: ${theme.typography.fontSize.sm};

  .label {
    color: ${theme.colors.text.secondary};
  }

  .value {
    font-weight: ${theme.typography.fontWeight.medium};
    color: ${theme.colors.text.primary};
  }
`;

const TotalRow = styled(PriceRow)`
  border-top: 1px solid ${theme.colors.grey[200]};
  padding-top: ${theme.spacing[3]};
  margin-top: ${theme.spacing[2]};
  font-size: ${theme.typography.fontSize.base};

  .value {
    font-weight: ${theme.typography.fontWeight.bold};
    color: ${theme.colors.text.primary};
  }
`;

const SellNowBtn = styled(Button)`
  background: ${theme.colors.success.main};
  color: white;
  padding: ${theme.spacing[3]};
  font-size: ${theme.typography.fontSize.base};
  font-weight: ${theme.typography.fontWeight.semibold};
  border-radius: ${theme.borderRadius.md};
  border: none;

  &:hover {
    background: ${theme.colors.success[600]};
  }
`;

const SpecialOffers = styled.div`
  background: white;
  border: 1px solid ${theme.colors.grey[200]};
  border-radius: ${theme.borderRadius.lg};
  padding: ${theme.spacing[4]};
`;

const OffersTitle = styled.div`
  font-size: ${theme.typography.fontSize.base};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.text.primary};
  margin-bottom: ${theme.spacing[3]};
`;

const OfferItem = styled.label`
  display: flex;
  align-items: center;
  gap: ${theme.spacing[3]};
  padding: ${theme.spacing[2]};
  border: 1px solid ${theme.colors.grey[200]};
  border-radius: ${theme.borderRadius.md};
  cursor: pointer;
  margin-bottom: ${theme.spacing[2]};

  input[type='radio'] {
    margin: 0;
  }

  .offer-content {
    flex: 1;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .offer-brand {
    display: flex;
    align-items: center;
    gap: ${theme.spacing[2]};

    .logo {
      width: 32px;
      height: 32px;
      background: ${theme.colors.grey[100]};
      border-radius: ${theme.borderRadius.full};
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: ${theme.typography.fontSize.sm};
      font-weight: ${theme.typography.fontWeight.bold};
    }
  }

  .offer-extra {
    text-align: right;

    .percent {
      font-size: ${theme.typography.fontSize.sm};
      color: ${theme.colors.text.secondary};
    }

    .amount {
      font-size: ${theme.typography.fontSize.base};
      font-weight: ${theme.typography.fontWeight.medium};
      color: ${theme.colors.text.primary};
    }

    .tcs {
      font-size: ${theme.typography.fontSize.xs};
      color: ${theme.colors.text.hint};
    }
  }
`;

const BottomSection = styled.div`
  background: white;
  border: 1px solid ${theme.colors.grey[200]};
  border-radius: ${theme.borderRadius.lg};
  padding: ${theme.spacing[4]};
  display: flex;
  justify-content: space-between;
  align-items: center;

  @media (max-width: ${theme.breakpoints.sm}) {
    flex-direction: column;
    gap: ${theme.spacing[3]};
    text-align: center;
  }
`;

const WhatsappToggle = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing[2]};
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text.secondary};
`;

const PaymentOptions = styled.div`
  display: flex;
  gap: ${theme.spacing[2]};

  .option {
    width: 40px;
    height: 40px;
    background: ${theme.colors.grey[100]};
    border-radius: ${theme.borderRadius.full};
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: ${theme.typography.fontSize.xs};
    font-weight: ${theme.typography.fontWeight.bold};
  }
`;

const PriceQuote = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();

  const { assessmentData, product } = location.state || {};
  const [priceData, setPriceData] = useState(null);
  const [productDetails, setProductDetails] = useState(null);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [whatsappOptIn, setWhatsappOptIn] = useState(false);
  const [offerSessionData, setOfferSessionData] = useState(null);
  const [isLoadingOffers, setIsLoadingOffers] = useState(false);

  const category = searchParams.get('category');
  const brand = searchParams.get('brand');
  const model = searchParams.get('model');

  const calculatePrice = data => {
    const basePrice = data.selectedVariant?.basePrice || 0;
    let percentDelta = 0;
    let absDelta = 0;
    console.log('basePrice', basePrice);
    // Process answers
    Object.values(data.answers || {}).forEach(ans => {
      if (ans.delta) {
        const adjust = ans.delta.sign === '-' ? -1 : 1;
        if (ans.delta.type === 'percent') {
          percentDelta += adjust * (ans.delta.value || 0);
        } else {
          absDelta += adjust * (ans.delta.value || 0);
        }
      }
    });

    // Process defects (note: data has duplicates, but we sum all)
    (data.selectedDefects || []).forEach(def => {
      if (def.delta) {
        const adjust = def.delta.sign === '-' ? -1 : 1;
        if (def.delta.type === 'percent') {
          percentDelta += adjust * (def.delta.value || 0);
        } else {
          absDelta += adjust * (def.delta.value || 0);
        }
      }
    });

    // Process accessories
    (data.selectedAccessories || []).forEach(acc => {
      if (acc.delta) {
        const adjust = acc.delta.sign === '-' ? -1 : 1;
        if (acc.delta.type === 'percent') {
          percentDelta += adjust * (acc.delta.value || 0);
        } else {
          absDelta += adjust * (acc.delta.value || 0);
        }
      }
    });

    const adjustedPrice = Math.round(basePrice * (1 + percentDelta / 100) + absDelta);
    console.log('adjustedPrice', adjustedPrice);
    return adjustedPrice;
  };

  // Use offers from API response or fallback to default offers
  const offers = offerSessionData?.offers || [
    { id: 'amazon', brand: 'a', percent: 2, tcs: true },
    { id: 'flipkart', brand: 'F', percent: 3.5, tcs: true },
    { id: 'croma', brand: 'C', percent: 1, tcs: true },
  ];

  useEffect(() => {
    if (assessmentData && product) {
      const quotedPrice = calculatePrice(assessmentData);
      const processingFee = 49;
      const pickupCharge = 0;
      const totalAmount = quotedPrice - processingFee; // As per screenshot logic

      setPriceData({
        quotedPrice,
        processingFee,
        pickupCharge,
        totalAmount,
      });

      setProductDetails({
        ...product.data,
        variant: assessmentData.selectedVariant.label,
      });

      // Call sell offer session API
      createOfferSession();
    }
  }, [assessmentData, product]);

  const createOfferSession = async () => {
    console.log('assessmentData', assessmentData);
    console.log('product', product);
    if (!assessmentData || !product) return;
    setIsLoadingOffers(true);
    try {
      // Extract the variant ID from assessment data
      const variantId = assessmentData.selectedVariant?.id || assessmentData.selectedVariant?._id;
      const userData = JSON.parse(localStorage.getItem('userData'));

      const offerData = {
        userId: userData?.id || userData?._id,
        productId: product.data?.id || product.data?._id,
        variantId: variantId,
        answers: assessmentData.answers || {},
        defects: assessmentData.selectedDefects?.map(d => d.key || d.id) || [],
        accessories:
          assessmentData.selectedAccessories?.map(a => {
            // Handle different data structures:
            // - If it's a full object, use _id or id
            // - If it's already a string/ID, use it directly
            if (typeof a === 'object' && a !== null) {
              return a._id || a.id || a.key;
            }
            return a;
          }) || [],
      };

      console.log('Sending offer data:', offerData);
      const response = await createSellOfferSession(offerData);
      setOfferSessionData(response.data);
    } catch (error) {
      console.error('Error creating sell offer session:', error);
    } finally {
      setIsLoadingOffers(false);
    }
  };

  const formatPrice = price => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handleBack = () => {
    navigate(`/sell?category=${category}&brand=${brand}&model=${model}`);
  };

  const handleSellNow = async () => {
    try {
      // Create offer session first and wait for the response
      // await createOfferSession();

      navigate('/sell/pickup', {
        state: {
          assessmentData,
          product,
          sessionId: offerSessionData?.sessionId, // Add sessionId from the API response
          priceData: {
            quotedPrice: calculatePrice(assessmentData),
            processingFee: 49,
            pickupCharge: 0,
            totalAmount: calculatePrice(assessmentData) - 49,
          },
        },
      });
    } catch (error) {
      console.error('Error creating session before navigation:', error);
      // Still navigate but without sessionId if there's an error
      navigate('/sell/pickup', {
        state: {
          assessmentData,
          product,
          priceData: {
            quotedPrice: calculatePrice(assessmentData),
            processingFee: 49,
            pickupCharge: 0,
            totalAmount: calculatePrice(assessmentData) - 49,
          },
        },
      });
    }
  };

  const handleOfferChange = offerId => {
    setSelectedOffer(offerId);
  };

  if (!priceData || !productDetails) {
    return <div>Loading...</div>;
  }

  return (
    <PageContainer>
      <MainContent>
        <ProductSection>
          <ProductImage>
            <img src={productDetails.images?.[0] || ''} alt={productDetails.name} />
          </ProductImage>

          <ProductInfo>
            <ProductName>
              Apple {productDetails.name} ({productDetails.variant})
            </ProductName>
            <SellingPrice>{formatPrice(priceData.quotedPrice)}</SellingPrice>
            <RecalculateBtn
              variant="outline"
              onClick={() => {
                /* Recalculate logic */
              }}
            >
              Recalculate
            </RecalculateBtn>
          </ProductInfo>

          <FeaturesRow>
            <FeatureItem>
              <div className="icon">⚡</div>
              <div className="label">Fast Payments</div>
            </FeatureItem>
            <FeatureItem>
              <div className="icon">🚚</div>
              <div className="label">Free Pickup</div>
            </FeatureItem>
            <FeatureItem>
              <div className="icon">🛡️</div>
              <div className="label">100% Safe</div>
            </FeatureItem>
          </FeaturesRow>
        </ProductSection>

        <PriceSummarySection>
          <PriceSummaryBox>
            <div style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: theme.spacing[3] }}>
              Price Summary
            </div>
            <PriceRow>
              <span className="label">Base Price</span>
              <span className="value">{formatPrice(priceData.quotedPrice)}</span>
            </PriceRow>
            <PriceRow>
              <span className="label">Pickup charges</span>
              <span className="value">Free ₹0</span>
            </PriceRow>
            <PriceRow>
              <span className="label">Processing Fee</span>
              <span className="value">₹49</span>
            </PriceRow>
            <TotalRow>
              <span className="label">Total Amount</span>
              <span className="value">{formatPrice(priceData.totalAmount)}</span>
            </TotalRow>
            <SellNowBtn onClick={handleSellNow}>Sell Now</SellNowBtn>
          </PriceSummaryBox>

          <SpecialOffers>
            <OffersTitle>Special Offers</OffersTitle>
            {isLoadingOffers ? (
              <div style={{ textAlign: 'center', padding: theme.spacing[4] }}>
                Loading offers...
              </div>
            ) : (
              offers.map(offer => (
                <OfferItem key={offer.id}>
                  <input
                    type="radio"
                    name="offer"
                    value={offer.id}
                    checked={selectedOffer === offer.id}
                    onChange={() => handleOfferChange(offer.id)}
                  />
                  <div className="offer-content">
                    <div className="offer-brand">
                      <div className="logo">{offer.brand}</div>
                      <span>{offer.id.charAt(0).toUpperCase() + offer.id.slice(1)}</span>
                    </div>
                    <div className="offer-extra">
                      <div className="percent">+{offer.percent}%</div>
                      <div className="amount">
                        ₹{Math.round((priceData.quotedPrice * offer.percent) / 100)}
                      </div>
                      {offer.tcs && <div className="tcs">TCS applicable</div>}
                    </div>
                  </div>
                </OfferItem>
              ))
            )}
          </SpecialOffers>
        </PriceSummarySection>
      </MainContent>
    </PageContainer>
  );
};

export default PriceQuote;
