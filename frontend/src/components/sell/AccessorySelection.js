/**
 * @fileoverview Accessory Selection Component
 * @description Component for customers to specify included accessories in the sell flow
 * @author Cashify Development Team
 * @version 1.0.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import { theme } from '../../theme';
import {
  Package,
  CheckCircle,
  X,
  Search,
  Filter,
  Eye,
  EyeOff,
  Info,
  Plus,
  Loader,
  ArrowRight,
  ArrowLeft,
  Smartphone,
  Headphones,
  Zap,
  Cable,
  Box,
  Gift
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
  margin: 0 0 ${theme.spacing[4]} 0;
  line-height: ${theme.typography.lineHeight.relaxed};
`;

const SelectionSummary = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${theme.spacing[4]};
  padding: ${theme.spacing[4]};
  background: ${theme.colors.grey[50]};
  border-radius: ${theme.borderRadius.md};
`;

const SummaryItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing[2]};
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text.secondary};
`;

const SummaryValue = styled.span`
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${props => {
    if (props.type === 'selected' && props.value > 0) return theme.colors.accent.main;
    if (props.type === 'bonus' && props.value > 0) return theme.colors.accent.main;
    return theme.colors.text.primary;
  }};
`;

const SearchAndFilters = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing[4]};

  @media (min-width: ${theme.breakpoints.md}) {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
`;

const SearchContainer = styled.div`
  position: relative;
  flex: 1;
  max-width: 400px;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: ${theme.spacing[3]} ${theme.spacing[4]} ${theme.spacing[3]} ${theme.spacing[12]};
  border: 1px solid ${theme.colors.grey[300]};
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.typography.fontSize.base};
  background: white;
  transition: all ${theme.transitions.duration.normal};

  &:focus {
    outline: none;
    border-color: ${theme.colors.primary.main};
    box-shadow: 0 0 0 3px ${theme.colors.primary.main}20;
  }

  &::placeholder {
    color: ${theme.colors.text.secondary};
  }
`;

const SearchIcon = styled.div`
  position: absolute;
  left: ${theme.spacing[4]};
  top: 50%;
  transform: translateY(-50%);
  color: ${theme.colors.text.secondary};
`;

const FiltersContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing[3]};
  flex-wrap: wrap;
`;

const FilterButton = styled.button`
  padding: ${theme.spacing[2]} ${theme.spacing[4]};
  border: 1px solid ${theme.colors.grey[300]};
  border-radius: ${theme.borderRadius.md};
  background: ${props => props.active ? theme.colors.primary.main : 'white'};
  color: ${props => props.active ? 'white' : theme.colors.text.primary};
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.medium};
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: ${theme.spacing[2]};
  transition: all ${theme.transitions.duration.normal};

  &:hover {
    border-color: ${theme.colors.primary.main};
    background: ${props => props.active ? theme.colors.primary[600] : theme.colors.primary[50]};
  }
`;

const ToggleButton = styled.button`
  padding: ${theme.spacing[2]} ${theme.spacing[3]};
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

  &:hover {
    border-color: ${theme.colors.primary.main};
    color: ${theme.colors.primary.main};
  }
`;

const CategoryTabs = styled.div`
  display: flex;
  gap: ${theme.spacing[2]};
  overflow-x: auto;
  padding-bottom: ${theme.spacing[2]};
  
  &::-webkit-scrollbar {
    height: 4px;
  }
  
  &::-webkit-scrollbar-track {
    background: ${theme.colors.grey[100]};
    border-radius: ${theme.borderRadius.full};
  }
  
  &::-webkit-scrollbar-thumb {
    background: ${theme.colors.grey[300]};
    border-radius: ${theme.borderRadius.full};
  }
`;

const CategoryTab = styled.button`
  padding: ${theme.spacing[3]} ${theme.spacing[4]};
  border: 1px solid ${props => props.active ? theme.colors.primary.main : theme.colors.grey[300]};
  border-radius: ${theme.borderRadius.md};
  background: ${props => props.active ? theme.colors.primary[50] : 'white'};
  color: ${props => props.active ? theme.colors.primary.main : theme.colors.text.primary};
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.medium};
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: ${theme.spacing[2]};
  white-space: nowrap;
  transition: all ${theme.transitions.duration.normal};

  &:hover {
    border-color: ${theme.colors.primary.main};
    background: ${theme.colors.primary[50]};
  }
`;

const AccessoriesGrid = styled.div`
  display: grid;
  gap: ${theme.spacing[4]};
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
`;

const AccessoryCard = styled.div`
  background: white;
  border: 1px solid ${props => props.selected ? theme.colors.accent.main : theme.colors.grey[200]};
  border-radius: ${theme.borderRadius.lg};
  overflow: hidden;
  transition: all ${theme.transitions.duration.normal};
  cursor: pointer;

  ${props => props.selected && `
    background: ${theme.colors.accent[50]};
    box-shadow: 0 0 0 1px ${theme.colors.accent.main}20;
  `}

  &:hover {
    border-color: ${props => props.selected ? theme.colors.accent[600] : theme.colors.accent.main};
    transform: translateY(-1px);
    box-shadow: ${theme.shadows.md};
  }
`;

const AccessoryHeader = styled.div`
  padding: ${theme.spacing[4]};
  display: flex;
  align-items: flex-start;
  gap: ${theme.spacing[3]};
`;

const AccessoryIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: ${theme.borderRadius.full};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background: ${props => props.selected ? theme.colors.accent.main : theme.colors.grey[100]};
  color: ${props => props.selected ? 'white' : theme.colors.text.secondary};
  transition: all ${theme.transitions.duration.normal};
`;

const AccessoryContent = styled.div`
  flex: 1;
`;

const AccessoryTitle = styled.h3`
  font-size: ${theme.typography.fontSize.base};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.text.primary};
  margin: 0 0 ${theme.spacing[1]} 0;
`;

const AccessoryDescription = styled.p`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text.secondary};
  margin: 0 0 ${theme.spacing[2]} 0;
  line-height: ${theme.typography.lineHeight.relaxed};
`;

const AccessoryBonus = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing[1]};
  font-size: ${theme.typography.fontSize.xs};
  font-weight: ${theme.typography.fontWeight.medium};
  color: ${theme.colors.accent.main};
`;

const AccessoryCheckbox = styled.div`
  width: 20px;
  height: 20px;
  border: 2px solid ${props => props.selected ? theme.colors.accent.main : theme.colors.grey[300]};
  border-radius: ${theme.borderRadius.sm};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all ${theme.transitions.duration.normal};
  background: ${props => props.selected ? theme.colors.accent.main : 'white'};
  color: white;
`;

const RequiredBadge = styled.div`
  padding: ${theme.spacing[1]} ${theme.spacing[2]};
  border-radius: ${theme.borderRadius.sm};
  font-size: ${theme.typography.fontSize.xs};
  font-weight: ${theme.typography.fontWeight.medium};
  background: ${props => props.required ? theme.colors.warning[50] : theme.colors.grey[50]};
  color: ${props => props.required ? theme.colors.warning.main : theme.colors.text.secondary};
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

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${theme.spacing[12]};
  color: ${theme.colors.text.secondary};
  text-align: center;
  gap: ${theme.spacing[4]};
`;

const NoAccessoriesCard = styled.div`
  background: ${theme.colors.grey[50]};
  border: 1px solid ${theme.colors.grey[300]};
  border-radius: ${theme.borderRadius.lg};
  padding: ${theme.spacing[6]};
  text-align: center;
  cursor: pointer;
  transition: all ${theme.transitions.duration.normal};

  &:hover {
    background: ${theme.colors.grey[100]};
    transform: translateY(-1px);
    box-shadow: ${theme.shadows.md};
  }
`;

const NoAccessoriesIcon = styled.div`
  width: 64px;
  height: 64px;
  background: ${theme.colors.grey[400]};
  border-radius: ${theme.borderRadius.full};
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto ${theme.spacing[4]} auto;
  color: white;
`;

const NoAccessoriesTitle = styled.h3`
  font-size: ${theme.typography.fontSize.lg};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.text.primary};
  margin: 0 0 ${theme.spacing[2]} 0;
`;

const NoAccessoriesText = styled.p`
  font-size: ${theme.typography.fontSize.base};
  color: ${theme.colors.text.secondary};
  margin: 0;
`;

// Category icons mapping
const CATEGORY_ICONS = {
  charger: Zap,
  cable: Cable,
  audio: Headphones,
  case: Smartphone,
  box: Box,
  documentation: Package,
  other: Gift
};

const AccessorySelection = ({ sessionData, onComplete, onError, hooks }) => {
  const { sellAccessories } = hooks;
  
  const [selectedAccessories, setSelectedAccessories] = useState(sessionData.selectedAccessories || []);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showOnlySelected, setShowOnlySelected] = useState(false);
  const [sortBy, setSortBy] = useState('bonus');

  // Fetch accessories for the selected product
  useEffect(() => {
    if (sessionData.selectedProduct) {
      sellAccessories.fetchPublicAccessories({
        productId: sessionData.selectedProduct
      });
    }
  }, [sessionData.selectedProduct]);

  // Filter and sort accessories
  const filteredAccessories = useMemo(() => {
    let filtered = sellAccessories.publicAccessories || [];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(accessory =>
        accessory.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        accessory.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        accessory.category?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(accessory => 
        accessory.category?.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    // Filter by selection status
    if (showOnlySelected) {
      filtered = filtered.filter(accessory => 
        selectedAccessories.includes(accessory._id)
      );
    }

    // Sort accessories
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'bonus':
          return (b.priceBonus || 0) - (a.priceBonus || 0);
        case 'required':
          return (b.required ? 1 : 0) - (a.required ? 1 : 0);
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

    return filtered;
  }, [sellAccessories.publicAccessories, searchTerm, selectedCategory, showOnlySelected, sortBy, selectedAccessories]);

  // Get unique categories
  const categories = useMemo(() => {
    const cats = new Set();
    (sellAccessories.publicAccessories || []).forEach(accessory => {
      if (accessory.category) {
        cats.add(accessory.category.toLowerCase());
      }
    });
    return Array.from(cats);
  }, [sellAccessories.publicAccessories]);

  // Calculate total bonus
  const totalBonus = useMemo(() => {
    return selectedAccessories.reduce((total, accessoryId) => {
      const accessory = sellAccessories.publicAccessories?.find(a => a._id === accessoryId);
      return total + (accessory?.priceBonus || 0);
    }, 0);
  }, [selectedAccessories, sellAccessories.publicAccessories]);

  const handleAccessoryToggle = (accessoryId) => {
    setSelectedAccessories(prev => {
      if (prev.includes(accessoryId)) {
        return prev.filter(id => id !== accessoryId);
      } else {
        return [...prev, accessoryId];
      }
    });
  };

  const handleNoAccessories = () => {
    setSelectedAccessories([]);
  };

  const handleComplete = () => {
    onComplete({ accessories: selectedAccessories });
  };

  if (sellAccessories.loading) {
    return (
      <LoadingState>
        <Loader size={32} className="animate-spin" />
        <div>Loading accessories...</div>
      </LoadingState>
    );
  }

  if (sellAccessories.error) {
    return (
      <EmptyState>
        <X size={48} />
        <div>
          <h3>Failed to load accessories</h3>
          <p>{sellAccessories.error}</p>
        </div>
      </EmptyState>
    );
  }

  const accessories = sellAccessories.publicAccessories || [];

  return (
    <Container>
      <Header>
        <HeaderTitle>Include Accessories</HeaderTitle>
        <HeaderSubtitle>
          Select any original accessories you have with your device. Including accessories can increase your device's value.
        </HeaderSubtitle>
        <SelectionSummary>
          <SummaryItem>
            <Package size={16} />
            <SummaryValue type="selected" value={selectedAccessories.length}>
              {selectedAccessories.length}
            </SummaryValue>
            accessories selected
          </SummaryItem>
          <SummaryItem>
            <Plus size={16} />
            Bonus value:
            <SummaryValue type="bonus" value={totalBonus}>
              ₹{totalBonus.toLocaleString()}
            </SummaryValue>
          </SummaryItem>
        </SelectionSummary>
      </Header>

      <SearchAndFilters>
        <SearchContainer>
          <SearchIcon>
            <Search size={16} />
          </SearchIcon>
          <SearchInput
            type="text"
            placeholder="Search accessories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </SearchContainer>

        <FiltersContainer>
          <FilterButton
            active={sortBy === 'bonus'}
            onClick={() => setSortBy('bonus')}
          >
            <Plus size={14} />
            Bonus
          </FilterButton>
          <FilterButton
            active={sortBy === 'required'}
            onClick={() => setSortBy('required')}
          >
            <Info size={14} />
            Required
          </FilterButton>
          <FilterButton
            active={sortBy === 'name'}
            onClick={() => setSortBy('name')}
          >
            Name
          </FilterButton>

          <ToggleButton onClick={() => setShowOnlySelected(!showOnlySelected)}>
            {showOnlySelected ? <Eye size={14} /> : <EyeOff size={14} />}
            {showOnlySelected ? 'Show All' : 'Show Selected'}
          </ToggleButton>
        </FiltersContainer>
      </SearchAndFilters>

      <CategoryTabs>
        <CategoryTab
          active={selectedCategory === 'all'}
          onClick={() => setSelectedCategory('all')}
        >
          All Categories
        </CategoryTab>
        {categories.map(category => {
          const IconComponent = CATEGORY_ICONS[category] || Package;
          return (
            <CategoryTab
              key={category}
              active={selectedCategory === category}
              onClick={() => setSelectedCategory(category)}
            >
              <IconComponent size={16} />
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </CategoryTab>
          );
        })}
      </CategoryTabs>

      {accessories.length === 0 ? (
        <EmptyState>
          <Package size={48} />
          <div>
            <h3>No Accessories Available</h3>
            <p>No accessories are defined for this device.</p>
          </div>
        </EmptyState>
      ) : (
        <>
          <NoAccessoriesCard onClick={handleNoAccessories}>
            <NoAccessoriesIcon>
              <X size={32} />
            </NoAccessoriesIcon>
            <NoAccessoriesTitle>I Don't Have Any Accessories</NoAccessoriesTitle>
            <NoAccessoriesText>
              Select this if you don't have any original accessories
            </NoAccessoriesText>
          </NoAccessoriesCard>

          {filteredAccessories.length === 0 ? (
            <EmptyState>
              <Search size={48} />
              <div>
                <h3>No accessories found</h3>
                <p>Try adjusting your search or filters</p>
              </div>
            </EmptyState>
          ) : (
            <AccessoriesGrid>
              {filteredAccessories.map(accessory => {
                const isSelected = selectedAccessories.includes(accessory._id);
                const IconComponent = CATEGORY_ICONS[accessory.category] || Package;

                return (
                  <AccessoryCard
                    key={accessory._id}
                    selected={isSelected}
                    onClick={() => handleAccessoryToggle(accessory._id)}
                  >
                    <AccessoryHeader>
                      <AccessoryIcon selected={isSelected}>
                        <IconComponent size={20} />
                      </AccessoryIcon>

                      <AccessoryContent>
                        <AccessoryTitle>{accessory.name}</AccessoryTitle>
                        <AccessoryDescription>
                          {accessory.description}
                        </AccessoryDescription>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <AccessoryBonus>
                            <Plus size={12} />
                            ₹{(accessory.priceBonus || 0).toLocaleString()}
                          </AccessoryBonus>
                          <RequiredBadge required={accessory.required}>
                            {accessory.required ? 'Required' : 'Optional'}
                          </RequiredBadge>
                        </div>
                      </AccessoryContent>

                      <AccessoryCheckbox selected={isSelected}>
                        {isSelected && <CheckCircle size={12} />}
                      </AccessoryCheckbox>
                    </AccessoryHeader>
                  </AccessoryCard>
                );
              })}
            </AccessoriesGrid>
          )}
        </>
      )}

      <NavigationButtons>
        <NavButton>
          <ArrowLeft size={16} />
          Back
        </NavButton>

        <div style={{ textAlign: 'center', color: theme.colors.text.secondary, fontSize: theme.typography.fontSize.sm }}>
          {selectedAccessories.length === 0 ? 'No accessories selected' : `${selectedAccessories.length} accessories selected`}
        </div>

        <NavButton
          variant="primary"
          onClick={handleComplete}
        >
          Continue
          <ArrowRight size={16} />
        </NavButton>
      </NavigationButtons>
    </Container>
  );
};

export default AccessorySelection;