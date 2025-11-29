import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { DollarSign, Plus, Search, Filter, Eye, Edit, Trash2, TrendingUp, TrendingDown } from 'lucide-react';

const Container = styled.div`
  padding: 2rem;
  background-color: #f8fafc;
  min-height: 100vh;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const ActionButton = styled.button`
  background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(139, 92, 246, 0.4);
  }
`;

const TabsContainer = styled.div`
  background: white;
  border-radius: 0.75rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
  overflow: hidden;
`;

const TabsList = styled.div`
  display: flex;
  border-bottom: 1px solid #e5e7eb;
`;

const Tab = styled.button`
  flex: 1;
  padding: 1rem 1.5rem;
  background: ${props => props.active ? '#f9fafb' : 'white'};
  border: none;
  border-bottom: 2px solid ${props => props.active ? '#8b5cf6' : 'transparent'};
  font-weight: ${props => props.active ? '600' : '500'};
  color: ${props => props.active ? '#8b5cf6' : '#6b7280'};
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: #f9fafb;
  }
`;

const TabContent = styled.div`
  padding: 2rem;
`;

const FilterSection = styled.div`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  align-items: center;
  margin-bottom: 2rem;
`;

const SearchInput = styled.input`
  flex: 1;
  min-width: 300px;
  padding: 0.75rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  
  &:focus {
    outline: none;
    border-color: #8b5cf6;
    box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
  }
`;

const FilterButton = styled.button`
  background: #f3f4f6;
  border: 1px solid #d1d5db;
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;
  
  &:hover {
    background: #e5e7eb;
  }
`;

const PricingGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
`;

const PricingCard = styled.div`
  background: white;
  border-radius: 0.75rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  transition: all 0.2s;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
`;

const ProductHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
`;

const ProductName = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
`;

const PriceChange = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: ${props => props.positive ? '#10b981' : '#ef4444'};
`;

const PriceDetails = styled.div`
  margin-bottom: 1.5rem;
`;

const PriceRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
  padding: 0.75rem;
  background: #f9fafb;
  border-radius: 0.5rem;
`;

const ConditionLabel = styled.span`
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 500;
`;

const PriceValue = styled.span`
  font-size: 1rem;
  color: #1f2937;
  font-weight: 600;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const IconButton = styled.button`
  flex: 1;
  background: ${props => props.primary ? '#8b5cf6' : '#f3f4f6'};
  color: ${props => props.primary ? 'white' : '#6b7280'};
  border: none;
  padding: 0.75rem;
  border-radius: 0.375rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.2s;
  
  &:hover {
    background: ${props => props.primary ? '#7c3aed' : '#e5e7eb'};
    color: ${props => props.primary ? 'white' : '#374151'};
  }
`;

const TableContainer = styled.div`
  background: white;
  border-radius: 0.75rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const TableHeader = styled.thead`
  background: #f9fafb;
`;

const TableRow = styled.tr`
  border-bottom: 1px solid #e5e7eb;
  
  &:hover {
    background: #f9fafb;
  }
`;

const TableCell = styled.td`
  padding: 1rem;
  text-align: left;
  font-size: 0.875rem;
  color: #374151;
`;

const TableHeaderCell = styled.th`
  padding: 1rem;
  text-align: left;
  font-size: 0.75rem;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const Pricing = () => {
  const [activeTab, setActiveTab] = useState('price-table');
  const [searchTerm, setSearchTerm] = useState('');
  const [priceData, setPriceData] = useState([]);
  const [adjustments, setAdjustments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data - replace with actual API call
    const mockPriceData = [
      {
        id: 1,
        product: 'iPhone 13 Pro',
        brand: 'Apple',
        prices: {
          excellent: 48000,
          good: 42000,
          fair: 36000,
          poor: 28000,
        },
        change: 2.5,
        lastUpdated: '2024-01-15',
      },
      {
        id: 2,
        product: 'Samsung Galaxy S21',
        brand: 'Samsung',
        prices: {
          excellent: 35000,
          good: 30000,
          fair: 25000,
          poor: 18000,
        },
        change: -1.8,
        lastUpdated: '2024-01-14',
      },
      {
        id: 3,
        product: 'MacBook Pro 2021',
        brand: 'Apple',
        prices: {
          excellent: 88000,
          good: 78000,
          fair: 68000,
          poor: 55000,
        },
        change: 3.2,
        lastUpdated: '2024-01-13',
      },
    ];

    const mockAdjustments = [
      {
        id: 1,
        product: 'iPhone 13 Pro',
        condition: 'Excellent',
        oldPrice: 46000,
        newPrice: 48000,
        reason: 'Market demand increase',
        adjustedBy: 'Admin',
        adjustedAt: '2024-01-15 10:30',
      },
      {
        id: 2,
        product: 'Samsung Galaxy S21',
        condition: 'Good',
        oldPrice: 31000,
        newPrice: 30000,
        reason: 'Competitor pricing',
        adjustedBy: 'Admin',
        adjustedAt: '2024-01-14 15:45',
      },
    ];
    
    setTimeout(() => {
      setPriceData(mockPriceData);
      setAdjustments(mockAdjustments);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredPriceData = priceData.filter(item =>
    item.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.brand.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredAdjustments = adjustments.filter(item =>
    item.product.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Container>
      <Header>
        <Title>
          <DollarSign size={32} />
          Pricing Management
        </Title>
        <ActionButton>
          <Plus size={20} />
          Add Price Rule
        </ActionButton>
      </Header>

      <TabsContainer>
        <TabsList>
          <Tab 
            active={activeTab === 'price-table'} 
            onClick={() => setActiveTab('price-table')}
          >
            Price Table
          </Tab>
          <Tab 
            active={activeTab === 'adjustments'} 
            onClick={() => setActiveTab('adjustments')}
          >
            Condition Adjustments
          </Tab>
        </TabsList>

        <TabContent>
          <FilterSection>
            <SearchInput
              type="text"
              placeholder="Search by product or brand..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <FilterButton>
              <Filter size={16} />
              Filters
            </FilterButton>
          </FilterSection>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}>Loading...</div>
          ) : activeTab === 'price-table' ? (
            <PricingGrid>
              {filteredPriceData.map((item) => (
                <PricingCard key={item.id}>
                  <ProductHeader>
                    <ProductName>{item.product}</ProductName>
                    <PriceChange positive={item.change > 0}>
                      {item.change > 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                      {Math.abs(item.change)}%
                    </PriceChange>
                  </ProductHeader>
                  
                  <PriceDetails>
                    <PriceRow>
                      <ConditionLabel>Excellent</ConditionLabel>
                      <PriceValue>₹{item.prices.excellent.toLocaleString()}</PriceValue>
                    </PriceRow>
                    <PriceRow>
                      <ConditionLabel>Good</ConditionLabel>
                      <PriceValue>₹{item.prices.good.toLocaleString()}</PriceValue>
                    </PriceRow>
                    <PriceRow>
                      <ConditionLabel>Fair</ConditionLabel>
                      <PriceValue>₹{item.prices.fair.toLocaleString()}</PriceValue>
                    </PriceRow>
                    <PriceRow>
                      <ConditionLabel>Poor</ConditionLabel>
                      <PriceValue>₹{item.prices.poor.toLocaleString()}</PriceValue>
                    </PriceRow>
                  </PriceDetails>
                  
                  <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '1rem' }}>
                    Last updated: {item.lastUpdated}
                  </div>
                  
                  <ActionButtons>
                    <IconButton primary>
                      <Edit size={16} />
                      Edit Prices
                    </IconButton>
                    <IconButton>
                      <Eye size={16} />
                      View History
                    </IconButton>
                  </ActionButtons>
                </PricingCard>
              ))}
            </PricingGrid>
          ) : (
            <TableContainer>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHeaderCell>Product</TableHeaderCell>
                    <TableHeaderCell>Condition</TableHeaderCell>
                    <TableHeaderCell>Old Price</TableHeaderCell>
                    <TableHeaderCell>New Price</TableHeaderCell>
                    <TableHeaderCell>Reason</TableHeaderCell>
                    <TableHeaderCell>Adjusted By</TableHeaderCell>
                    <TableHeaderCell>Date</TableHeaderCell>
                    <TableHeaderCell>Actions</TableHeaderCell>
                  </TableRow>
                </TableHeader>
                <tbody>
                  {filteredAdjustments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan="8" style={{ textAlign: 'center', padding: '2rem' }}>
                        No adjustments found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredAdjustments.map((adjustment) => (
                      <TableRow key={adjustment.id}>
                        <TableCell>{adjustment.product}</TableCell>
                        <TableCell>{adjustment.condition}</TableCell>
                        <TableCell>₹{adjustment.oldPrice.toLocaleString()}</TableCell>
                        <TableCell>₹{adjustment.newPrice.toLocaleString()}</TableCell>
                        <TableCell>{adjustment.reason}</TableCell>
                        <TableCell>{adjustment.adjustedBy}</TableCell>
                        <TableCell>{adjustment.adjustedAt}</TableCell>
                        <TableCell>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <IconButton style={{ padding: '0.25rem' }}>
                              <Eye size={14} />
                            </IconButton>
                            <IconButton style={{ padding: '0.25rem' }}>
                              <Trash2 size={14} />
                            </IconButton>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </tbody>
              </Table>
            </TableContainer>
          )}
        </TabContent>
      </TabsContainer>
    </Container>
  );
};

export default Pricing;