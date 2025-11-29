/**
 * @fileoverview Defect Selection Component
 * @description Component for customers to identify device defects in the sell flow
 * @author Cashify Development Team
 * @version 1.0.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import { theme } from '../../theme';
import {
  AlertTriangle,
  CheckCircle,
  X,
  Search,
  Filter,
  Eye,
  EyeOff,
  Info,
  Minus,
  Plus,
  Loader,
  ArrowRight,
  ArrowLeft,
  Smartphone,
  Zap,
  Volume2,
  Wifi,
  Camera,
  Battery
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
    if (props.type === 'selected' && props.value > 0) return theme.colors.error.main;
    if (props.type === 'impact' && props.value < 0) return theme.colors.error.main;
    if (props.type === 'impact' && props.value > 0) return theme.colors.accent.main;
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

const DefectsGrid = styled.div`
  display: grid;
  gap: ${theme.spacing[4]};
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
`;

const DefectCard = styled.div`
  background: white;
  border: 1px solid ${props => props.selected ? theme.colors.error.main : theme.colors.grey[200]};
  border-radius: ${theme.borderRadius.lg};
  overflow: hidden;
  transition: all ${theme.transitions.duration.normal};
  cursor: pointer;

  ${props => props.selected && `
    background: ${theme.colors.error[50]};
    box-shadow: 0 0 0 1px ${theme.colors.error.main}20;
  `}

  &:hover {
    border-color: ${props => props.selected ? theme.colors.error[600] : theme.colors.error.main};
    transform: translateY(-1px);
    box-shadow: ${theme.shadows.md};
  }
`;

const DefectHeader = styled.div`
  padding: ${theme.spacing[4]};
  display: flex;
  align-items: flex-start;
  gap: ${theme.spacing[3]};
`;

const DefectIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: ${theme.borderRadius.full};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background: ${props => props.selected ? theme.colors.error.main : theme.colors.grey[100]};
  color: ${props => props.selected ? 'white' : theme.colors.text.secondary};
  transition: all ${theme.transitions.duration.normal};
`;

const DefectContent = styled.div`
  flex: 1;
`;

const DefectTitle = styled.h3`
  font-size: ${theme.typography.fontSize.base};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.text.primary};
  margin: 0 0 ${theme.spacing[1]} 0;
`;

const DefectDescription = styled.p`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text.secondary};
  margin: 0 0 ${theme.spacing[2]} 0;
  line-height: ${theme.typography.lineHeight.relaxed};
`;

const DefectImpact = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing[1]};
  font-size: ${theme.typography.fontSize.xs};
  font-weight: ${theme.typography.fontWeight.medium};
  color: ${props => props.impact < 0 ? theme.colors.error.main : theme.colors.text.secondary};
`;

const DefectCheckbox = styled.div`
  width: 20px;
  height: 20px;
  border: 2px solid ${props => props.selected ? theme.colors.error.main : theme.colors.grey[300]};
  border-radius: ${theme.borderRadius.sm};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all ${theme.transitions.duration.normal};
  background: ${props => props.selected ? theme.colors.error.main : 'white'};
  color: white;
`;

const SeverityBadge = styled.div`
  padding: ${theme.spacing[1]} ${theme.spacing[2]};
  border-radius: ${theme.borderRadius.sm};
  font-size: ${theme.typography.fontSize.xs};
  font-weight: ${theme.typography.fontWeight.medium};
  background: ${props => {
    switch (props.severity) {
      case 'critical': return theme.colors.error[50];
      case 'major': return theme.colors.warning[50];
      case 'minor': return theme.colors.grey[50];
      default: return theme.colors.grey[50];
    }
  }};
  color: ${props => {
    switch (props.severity) {
      case 'critical': return theme.colors.error.main;
      case 'major': return theme.colors.warning.main;
      case 'minor': return theme.colors.text.secondary;
      default: return theme.colors.text.secondary;
    }
  }};
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

const NoDefectsCard = styled.div`
  background: ${theme.colors.accent[50]};
  border: 1px solid ${theme.colors.accent.main};
  border-radius: ${theme.borderRadius.lg};
  padding: ${theme.spacing[6]};
  text-align: center;
  cursor: pointer;
  transition: all ${theme.transitions.duration.normal};

  &:hover {
    background: ${theme.colors.accent[100]};
    transform: translateY(-1px);
    box-shadow: ${theme.shadows.md};
  }
`;

const NoDefectsIcon = styled.div`
  width: 64px;
  height: 64px;
  background: ${theme.colors.accent.main};
  border-radius: ${theme.borderRadius.full};
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto ${theme.spacing[4]} auto;
  color: white;
`;

const NoDefectsTitle = styled.h3`
  font-size: ${theme.typography.fontSize.lg};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.text.primary};
  margin: 0 0 ${theme.spacing[2]} 0;
`;

const NoDefectsText = styled.p`
  font-size: ${theme.typography.fontSize.base};
  color: ${theme.colors.text.secondary};
  margin: 0;
`;

// Category icons mapping
const CATEGORY_ICONS = {
  screen: Smartphone,
  battery: Battery,
  camera: Camera,
  audio: Volume2,
  connectivity: Wifi,
  performance: Zap,
  physical: AlertTriangle
};

const DefectSelection = ({ sessionData, onComplete, onError, hooks }) => {
  const { sellDefects } = hooks;
  
  const [selectedDefects, setSelectedDefects] = useState(sessionData.selectedDefects || []);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showOnlySelected, setShowOnlySelected] = useState(false);
  const [sortBy, setSortBy] = useState('severity');

  // Fetch defects for the selected product
  useEffect(() => {
    if (sessionData.selectedProduct) {
      sellDefects.fetchPublicDefects({
        productId: sessionData.selectedProduct
      });
    }
  }, [sessionData.selectedProduct]);

  // Filter and sort defects
  const filteredDefects = useMemo(() => {
    let filtered = sellDefects.publicDefects || [];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(defect =>
        defect.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        defect.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        defect.category?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(defect => 
        defect.category?.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    // Filter by selection status
    if (showOnlySelected) {
      filtered = filtered.filter(defect => 
        selectedDefects.includes(defect._id)
      );
    }

    // Sort defects
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'severity':
          const severityOrder = { critical: 3, major: 2, minor: 1 };
          return (severityOrder[b.severity] || 0) - (severityOrder[a.severity] || 0);
        case 'impact':
          return (a.priceImpact || 0) - (b.priceImpact || 0);
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

    return filtered;
  }, [sellDefects.publicDefects, searchTerm, selectedCategory, showOnlySelected, sortBy, selectedDefects]);

  // Get unique categories
  const categories = useMemo(() => {
    const cats = new Set();
    (sellDefects.publicDefects || []).forEach(defect => {
      if (defect.category) {
        cats.add(defect.category.toLowerCase());
      }
    });
    return Array.from(cats);
  }, [sellDefects.publicDefects]);

  // Calculate total impact
  const totalImpact = useMemo(() => {
    return selectedDefects.reduce((total, defectId) => {
      const defect = sellDefects.publicDefects?.find(d => d._id === defectId);
      return total + (defect?.priceImpact || 0);
    }, 0);
  }, [selectedDefects, sellDefects.publicDefects]);

  const handleDefectToggle = (defectId) => {
    setSelectedDefects(prev => {
      if (prev.includes(defectId)) {
        return prev.filter(id => id !== defectId);
      } else {
        return [...prev, defectId];
      }
    });
  };

  const handleNoDefects = () => {
    setSelectedDefects([]);
  };

  const handleComplete = () => {
    onComplete({ defects: selectedDefects });
  };

  if (sellDefects.loading) {
    return (
      <LoadingState>
        <Loader size={32} className="animate-spin" />
        <div>Loading defects...</div>
      </LoadingState>
    );
  }

  if (sellDefects.error) {
    return (
      <EmptyState>
        <X size={48} />
        <div>
          <h3>Failed to load defects</h3>
          <p>{sellDefects.error}</p>
        </div>
      </EmptyState>
    );
  }

  const defects = sellDefects.publicDefects || [];

  return (
    <Container>
      <Header>
        <HeaderTitle>Check for Defects</HeaderTitle>
        <HeaderSubtitle>
          Select any issues or defects with your device. Being honest helps us provide the most accurate valuation.
        </HeaderSubtitle>
        <SelectionSummary>
          <SummaryItem>
            <AlertTriangle size={16} />
            <SummaryValue type="selected" value={selectedDefects.length}>
              {selectedDefects.length}
            </SummaryValue>
            defects selected
          </SummaryItem>
          <SummaryItem>
            <Minus size={16} />
            Price impact:
            <SummaryValue type="impact" value={totalImpact}>
              ₹{totalImpact.toLocaleString()}
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
            placeholder="Search defects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </SearchContainer>

        <FiltersContainer>
          <FilterButton
            active={sortBy === 'severity'}
            onClick={() => setSortBy('severity')}
          >
            <AlertTriangle size={14} />
            Severity
          </FilterButton>
          <FilterButton
            active={sortBy === 'impact'}
            onClick={() => setSortBy('impact')}
          >
            <Minus size={14} />
            Impact
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
          const IconComponent = CATEGORY_ICONS[category] || AlertTriangle;
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

      {defects.length === 0 ? (
        <EmptyState>
          <CheckCircle size={48} />
          <div>
            <h3>No Defects Available</h3>
            <p>Great! No defects are defined for this device.</p>
          </div>
        </EmptyState>
      ) : (
        <>
          <NoDefectsCard onClick={handleNoDefects}>
            <NoDefectsIcon>
              <CheckCircle size={32} />
            </NoDefectsIcon>
            <NoDefectsTitle>My Device Has No Defects</NoDefectsTitle>
            <NoDefectsText>
              Select this if your device is in perfect working condition
            </NoDefectsText>
          </NoDefectsCard>

          {filteredDefects.length === 0 ? (
            <EmptyState>
              <Search size={48} />
              <div>
                <h3>No defects found</h3>
                <p>Try adjusting your search or filters</p>
              </div>
            </EmptyState>
          ) : (
            <DefectsGrid>
              {filteredDefects.map(defect => {
                const isSelected = selectedDefects.includes(defect._id);
                const IconComponent = CATEGORY_ICONS[defect.category] || AlertTriangle;

                return (
                  <DefectCard
                    key={defect._id}
                    selected={isSelected}
                    onClick={() => handleDefectToggle(defect._id)}
                  >
                    <DefectHeader>
                      <DefectIcon selected={isSelected}>
                        <IconComponent size={20} />
                      </DefectIcon>

                      <DefectContent>
                        <DefectTitle>{defect.name}</DefectTitle>
                        <DefectDescription>
                          {defect.description}
                        </DefectDescription>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <DefectImpact impact={defect.priceImpact}>
                            <Minus size={12} />
                            ₹{Math.abs(defect.priceImpact || 0).toLocaleString()}
                          </DefectImpact>
                          <SeverityBadge severity={defect.severity}>
                            {defect.severity}
                          </SeverityBadge>
                        </div>
                      </DefectContent>

                      <DefectCheckbox selected={isSelected}>
                        {isSelected && <CheckCircle size={12} />}
                      </DefectCheckbox>
                    </DefectHeader>
                  </DefectCard>
                );
              })}
            </DefectsGrid>
          )}
        </>
      )}

      <NavigationButtons>
        <NavButton>
          <ArrowLeft size={16} />
          Back
        </NavButton>

        <div style={{ textAlign: 'center', color: theme.colors.text.secondary, fontSize: theme.typography.fontSize.sm }}>
          {selectedDefects.length === 0 ? 'No defects selected' : `${selectedDefects.length} defects selected`}
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

export default DefectSelection;