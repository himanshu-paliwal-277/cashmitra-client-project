/**
 * @fileoverview Price Calculation Component
 * @description Component for displaying price calculation and final offer in the sell flow
 * @author Cashify Development Team
 * @version 1.0.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import { theme } from '../../theme';
import {
  Calculator,
  TrendingUp,
  TrendingDown,
  DollarSign,
  CheckCircle,
  AlertTriangle,
  Package,
  Minus,
  Plus,
  Info,
  RefreshCw,
  Loader,
  ArrowRight,
  ArrowLeft,
  Smartphone,
  Star,
  Clock,
  Shield,
  Zap
} from 'lucide-react';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing[6]};
`;

const Header = styled.div`
  background: white;
  border: 1px solid ${theme.colors.grey[200]};
  border-radius: ${theme.borderRadius.lg};
  padding: ${theme.spacing[6]};
  text-align: center;
`;

const HeaderTitle = styled.h2`
  font-size: ${theme.typography.fontSize.xl};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.text.primary};
  margin: 0 0 ${theme.spacing[2]} 0;
`;

const HeaderSubtitle = styled.p`
  font-size: ${theme.typography.fontSize.base};
  color: ${theme.colors.text.secondary};
  margin: 0;
  line-height: ${theme.typography.lineHeight.relaxed};
`;

const PriceCard = styled.div`
  background: linear-gradient(135deg, ${theme.colors.primary.main}, ${theme.colors.primary[600]});
  border-radius: ${theme.borderRadius.xl};
  padding: ${theme.spacing[8]};
  color: white;
  text-align: center;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
    animation: shimmer 3s ease-in-out infinite;
  }

  @keyframes shimmer {
    0%, 100% { transform: rotate(0deg); }
    50% { transform: rotate(180deg); }
  }
`;

const FinalPrice = styled.div`
  font-size: ${theme.typography.fontSize['4xl']};
  font-weight: ${theme.typography.fontWeight.bold};
  margin-bottom: ${theme.spacing[2]};
  position: relative;
  z-index: 1;
`;

const PriceLabel = styled.div`
  font-size: ${theme.typography.fontSize.lg};
  opacity: 0.9;
  margin-bottom: ${theme.spacing[4]};
  position: relative;
  z-index: 1;
`;

const PriceValidityBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: ${theme.spacing[2]};
  padding: ${theme.spacing[2]} ${theme.spacing[4]};
  background: rgba(255, 255, 255, 0.2);
  border-radius: ${theme.borderRadius.full};
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.medium};
  position: relative;
  z-index: 1;
`;

const BreakdownCard = styled.div`
  background: white;
  border: 1px solid ${theme.colors.grey[200]};
  border-radius: ${theme.borderRadius.lg};
  overflow: hidden;
`;

const BreakdownHeader = styled.div`
  padding: ${theme.spacing[4]} ${theme.spacing[6]};
  background: ${theme.colors.grey[50]};
  border-bottom: 1px solid ${theme.colors.grey[200]};
  display: flex;
  align-items: center;
  justify-content: between;
  gap: ${theme.spacing[3]};
`;

const BreakdownTitle = styled.h3`
  font-size: ${theme.typography.fontSize.lg};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.text.primary};
  margin: 0;
  flex: 1;
`;

const RefreshButton = styled.button`
  padding: ${theme.spacing[2]};
  border: 1px solid ${theme.colors.grey[300]};
  border-radius: ${theme.borderRadius.md};
  background: white;
  color: ${theme.colors.text.secondary};
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: ${theme.spacing[2]};
  font-size: ${theme.typography.fontSize.sm};
  transition: all ${theme.transitions.duration.normal};

  &:hover:not(:disabled) {
    border-color: ${theme.colors.primary.main};
    color: ${theme.colors.primary.main};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const BreakdownContent = styled.div`
  padding: ${theme.spacing[6]};
`;

const BreakdownSection = styled.div`
  margin-bottom: ${theme.spacing[6]};

  &:last-child {
    margin-bottom: 0;
  }
`;

const SectionTitle = styled.h4`
  font-size: ${theme.typography.fontSize.base};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.text.primary};
  margin: 0 0 ${theme.spacing[3]} 0;
  display: flex;
  align-items: center;
  gap: ${theme.spacing[2]};
`;

const BreakdownItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${theme.spacing[3]} 0;
  border-bottom: 1px solid ${theme.colors.grey[100]};

  &:last-child {
    border-bottom: none;
  }
`;

const ItemLabel = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing[2]};
  flex: 1;
`;

const ItemIcon = styled.div`
  width: 24px;
  height: 24px;
  border-radius: ${theme.borderRadius.sm};
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => {
    switch (props.type) {
      case 'base': return theme.colors.primary[50];
      case 'condition': return theme.colors.accent[50];
      case 'defect': return theme.colors.error[50];
      case 'accessory': return theme.colors.accent[50];
      default: return theme.colors.grey[50];
    }
  }};
  color: ${props => {
    switch (props.type) {
      case 'base': return theme.colors.primary.main;
      case 'condition': return theme.colors.accent.main;
      case 'defect': return theme.colors.error.main;
      case 'accessory': return theme.colors.accent.main;
      default: return theme.colors.text.secondary;
    }
  }};
`;

const ItemText = styled.div`
  flex: 1;
`;

const ItemName = styled.div`
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.medium};
  color: ${theme.colors.text.primary};
`;

const ItemDescription = styled.div`
  font-size: ${theme.typography.fontSize.xs};
  color: ${theme.colors.text.secondary};
  margin-top: ${theme.spacing[1]};
`;

const ItemValue = styled.div`
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${props => {
    if (props.value > 0) return theme.colors.accent.main;
    if (props.value < 0) return theme.colors.error.main;
    return theme.colors.text.primary;
  }};
  display: flex;
  align-items: center;
  gap: ${theme.spacing[1]};
`;

const TotalRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${theme.spacing[4]} 0;
  border-top: 2px solid ${theme.colors.grey[200]};
  margin-top: ${theme.spacing[4]};
`;

const TotalLabel = styled.div`
  font-size: ${theme.typography.fontSize.lg};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.text.primary};
`;

const TotalValue = styled.div`
  font-size: ${theme.typography.fontSize.xl};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.primary.main};
`;

const DeviceInfoCard = styled.div`
  background: white;
  border: 1px solid ${theme.colors.grey[200]};
  border-radius: ${theme.borderRadius.lg};
  padding: ${theme.spacing[6]};
`;

const DeviceHeader = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing[4]};
  margin-bottom: ${theme.spacing[4]};
`;

const DeviceIcon = styled.div`
  width: 48px;
  height: 48px;
  background: ${theme.colors.primary[50]};
  border-radius: ${theme.borderRadius.lg};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${theme.colors.primary.main};
`;

const DeviceDetails = styled.div`
  flex: 1;
`;

const DeviceName = styled.h3`
  font-size: ${theme.typography.fontSize.lg};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.text.primary};
  margin: 0 0 ${theme.spacing[1]} 0;
`;

const DeviceVariant = styled.div`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text.secondary};
`;

const DeviceSpecs = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${theme.spacing[4]};
`;

const SpecItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing[2]};
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text.secondary};
`;

const SpecLabel = styled.span`
  font-weight: ${theme.typography.fontWeight.medium};
`;

const SpecValue = styled.span`
  color: ${theme.colors.text.primary};
`;

const NavigationButtons = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: ${theme.spacing[4]};
  margin-top: ${theme.spacing[8]};

  @media (max-width: ${theme.breakpoints.sm}) {
    flex-direction: column;
    
    > * {
      width: 100%;
    }
  }
`;

const NavButton = styled.button`
  padding: ${theme.spacing[3]} ${theme.spacing[6]};
  border: ${props => props.variant === 'primary' ? 'none' : `1px solid ${theme.colors.grey[300]}`};
  border-radius: ${theme.borderRadius.md};
  background: ${props => props.variant === 'primary' ? theme.colors.primary.main : 'white'};
  color: ${props => props.variant === 'primary' ? 'white' : theme.colors.text.primary};
  font-size: ${theme.typography.fontSize.base};
  font-weight: ${theme.typography.fontWeight.medium};
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: ${theme.spacing[2]};
  transition: all ${theme.transitions.duration.normal};
  min-width: 120px;
  justify-content: center;

  &:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: ${theme.shadows.md};
    background: ${props => props.variant === 'primary' ? theme.colors.primary[600] : theme.colors.grey[50]};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const LoadingState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${theme.spacing[12]};
  color: ${theme.colors.text.secondary};
  gap: ${theme.spacing[4]};
`;

const ErrorState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${theme.spacing[12]};
  color: ${theme.colors.text.secondary};
  text-align: center;
  gap: ${theme.spacing[4]};
`;

const PriceCalculation = ({ sessionData, onComplete, onError, hooks }) => {
  const { sellSessions, sellProducts, sellQuestions, sellDefects, sellAccessories } = hooks;
  
  const [priceData, setPriceData] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [calculationError, setCalculationError] = useState(null);

  // Calculate price when component mounts or session data changes
  useEffect(() => {
    calculatePrice();
  }, [sessionData]);

  const calculatePrice = async () => {
    if (!sessionData.sessionId) {
      setCalculationError('No session found');
      return;
    }

    setIsCalculating(true);
    setCalculationError(null);

    try {
      const result = await sellSessions.calculatePrice(sessionData.sessionId);
      setPriceData(result);
    } catch (error) {
      setCalculationError(error.message || 'Failed to calculate price');
      onError?.(error);
    } finally {
      setIsCalculating(false);
    }
  };

  // Get device details
  const deviceDetails = useMemo(() => {
    if (!sessionData.selectedProduct || !sellProducts.publicProducts) return null;
    
    const product = sellProducts.publicProducts.find(p => p._id === sessionData.selectedProduct);
    const variant = product?.variants?.find(v => v._id === sessionData.selectedVariant);
    
    return { product, variant };
  }, [sessionData.selectedProduct, sessionData.selectedVariant, sellProducts.publicProducts]);

  // Get selected items details
  const selectedItems = useMemo(() => {
    const defects = (sessionData.selectedDefects || []).map(id => 
      sellDefects.publicDefects?.find(d => d._id === id)
    ).filter(Boolean);

    const accessories = (sessionData.selectedAccessories || []).map(id => 
      sellAccessories.publicAccessories?.find(a => a._id === id)
    ).filter(Boolean);

    return { defects, accessories };
  }, [sessionData, sellDefects.publicDefects, sellAccessories.publicAccessories]);

  const handleComplete = () => {
    if (!priceData) {
      onError?.(new Error('Price calculation not available'));
      return;
    }

    onComplete({ 
      priceData,
      finalPrice: priceData.finalPrice,
      breakdown: priceData.breakdown
    });
  };

  if (isCalculating) {
    return (
      <LoadingState>
        <Loader size={32} className="animate-spin" />
        <div>Calculating your device's value...</div>
        <div style={{ fontSize: theme.typography.fontSize.sm, color: theme.colors.text.secondary }}>
          This may take a few moments
        </div>
      </LoadingState>
    );
  }

  if (calculationError) {
    return (
      <ErrorState>
        <AlertTriangle size={48} />
        <div>
          <h3>Calculation Error</h3>
          <p>{calculationError}</p>
        </div>
        <RefreshButton onClick={calculatePrice}>
          <RefreshCw size={16} />
          Try Again
        </RefreshButton>
      </ErrorState>
    );
  }

  if (!priceData) {
    return (
      <ErrorState>
        <Calculator size={48} />
        <div>
          <h3>No Price Data</h3>
          <p>Unable to calculate device value</p>
        </div>
      </ErrorState>
    );
  }

  const { product, variant } = deviceDetails || {};

  return (
    <Container>
      <Header>
        <HeaderTitle>Your Device Valuation</HeaderTitle>
        <HeaderSubtitle>
          Based on your device condition and included accessories, here's our offer
        </HeaderSubtitle>
      </Header>

      <PriceCard>
        <FinalPrice>₹{priceData.finalPrice?.toLocaleString() || '0'}</FinalPrice>
        <PriceLabel>Final Offer Price</PriceLabel>
        <PriceValidityBadge>
          <Clock size={16} />
          Valid for {priceData.validityHours || 24} hours
        </PriceValidityBadge>
      </PriceCard>

      {product && (
        <DeviceInfoCard>
          <DeviceHeader>
            <DeviceIcon>
              <Smartphone size={24} />
            </DeviceIcon>
            <DeviceDetails>
              <DeviceName>{product.name}</DeviceName>
              <DeviceVariant>
                {variant ? `${variant.storage} • ${variant.color}` : 'Standard variant'}
              </DeviceVariant>
            </DeviceDetails>
          </DeviceHeader>
          
          <DeviceSpecs>
            <SpecItem>
              <SpecLabel>Brand:</SpecLabel>
              <SpecValue>{product.brand}</SpecValue>
            </SpecItem>
            <SpecItem>
              <SpecLabel>Category:</SpecLabel>
              <SpecValue>{product.category}</SpecValue>
            </SpecItem>
            {variant?.storage && (
              <SpecItem>
                <SpecLabel>Storage:</SpecLabel>
                <SpecValue>{variant.storage}</SpecValue>
              </SpecItem>
            )}
            {variant?.color && (
              <SpecItem>
                <SpecLabel>Color:</SpecLabel>
                <SpecValue>{variant.color}</SpecValue>
              </SpecItem>
            )}
          </DeviceSpecs>
        </DeviceInfoCard>
      )}

      <BreakdownCard>
        <BreakdownHeader>
          <BreakdownTitle>Price Breakdown</BreakdownTitle>
          <RefreshButton onClick={calculatePrice} disabled={isCalculating}>
            <RefreshCw size={16} className={isCalculating ? 'animate-spin' : ''} />
            Recalculate
          </RefreshButton>
        </BreakdownHeader>

        <BreakdownContent>
          <BreakdownSection>
            <SectionTitle>
              <Smartphone size={16} />
              Base Value
            </SectionTitle>
            <BreakdownItem>
              <ItemLabel>
                <ItemIcon type="base">
                  <DollarSign size={12} />
                </ItemIcon>
                <ItemText>
                  <ItemName>Device Base Price</ItemName>
                  <ItemDescription>Market value for {product?.name}</ItemDescription>
                </ItemText>
              </ItemLabel>
              <ItemValue value={priceData.breakdown?.basePrice || 0}>
                ₹{(priceData.breakdown?.basePrice || 0).toLocaleString()}
              </ItemValue>
            </BreakdownItem>
          </BreakdownSection>

          {priceData.breakdown?.conditionAdjustment !== 0 && (
            <BreakdownSection>
              <SectionTitle>
                <Star size={16} />
                Condition Assessment
              </SectionTitle>
              <BreakdownItem>
                <ItemLabel>
                  <ItemIcon type="condition">
                    <Star size={12} />
                  </ItemIcon>
                  <ItemText>
                    <ItemName>Condition Adjustment</ItemName>
                    <ItemDescription>Based on questionnaire responses</ItemDescription>
                  </ItemText>
                </ItemLabel>
                <ItemValue value={priceData.breakdown.conditionAdjustment}>
                  {priceData.breakdown.conditionAdjustment > 0 ? <Plus size={12} /> : <Minus size={12} />}
                  ₹{Math.abs(priceData.breakdown.conditionAdjustment).toLocaleString()}
                </ItemValue>
              </BreakdownItem>
            </BreakdownSection>
          )}

          {selectedItems.defects.length > 0 && (
            <BreakdownSection>
              <SectionTitle>
                <AlertTriangle size={16} />
                Defects Impact
              </SectionTitle>
              {selectedItems.defects.map(defect => (
                <BreakdownItem key={defect._id}>
                  <ItemLabel>
                    <ItemIcon type="defect">
                      <Minus size={12} />
                    </ItemIcon>
                    <ItemText>
                      <ItemName>{defect.name}</ItemName>
                      <ItemDescription>{defect.description}</ItemDescription>
                    </ItemText>
                  </ItemLabel>
                  <ItemValue value={defect.priceImpact || 0}>
                    <Minus size={12} />
                    ₹{Math.abs(defect.priceImpact || 0).toLocaleString()}
                  </ItemValue>
                </BreakdownItem>
              ))}
            </BreakdownSection>
          )}

          {selectedItems.accessories.length > 0 && (
            <BreakdownSection>
              <SectionTitle>
                <Package size={16} />
                Accessories Bonus
              </SectionTitle>
              {selectedItems.accessories.map(accessory => (
                <BreakdownItem key={accessory._id}>
                  <ItemLabel>
                    <ItemIcon type="accessory">
                      <Plus size={12} />
                    </ItemIcon>
                    <ItemText>
                      <ItemName>{accessory.name}</ItemName>
                      <ItemDescription>{accessory.description}</ItemDescription>
                    </ItemText>
                  </ItemLabel>
                  <ItemValue value={accessory.priceBonus || 0}>
                    <Plus size={12} />
                    ₹{(accessory.priceBonus || 0).toLocaleString()}
                  </ItemValue>
                </BreakdownItem>
              ))}
            </BreakdownSection>
          )}

          <TotalRow>
            <TotalLabel>Final Offer Price</TotalLabel>
            <TotalValue>₹{priceData.finalPrice?.toLocaleString() || '0'}</TotalValue>
          </TotalRow>
        </BreakdownContent>
      </BreakdownCard>

      <NavigationButtons>
        <NavButton>
          <ArrowLeft size={16} />
          Back
        </NavButton>

        <div style={{ textAlign: 'center', color: theme.colors.text.secondary, fontSize: theme.typography.fontSize.sm }}>
          <Shield size={16} style={{ marginRight: theme.spacing[2] }} />
          Price guaranteed for {priceData.validityHours || 24} hours
        </div>

        <NavButton
          variant="primary"
          onClick={handleComplete}
        >
          Accept Offer
          <ArrowRight size={16} />
        </NavButton>
      </NavigationButtons>
    </Container>
  );
};

export default PriceCalculation;