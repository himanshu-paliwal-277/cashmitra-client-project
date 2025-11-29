import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import sellService from '../../services/sellService';

const Container = styled.div`
  min-height: 100vh;
  background: #f8f9fa;
  padding: 20px 0;
`;

const Header = styled.div`
  background: white;
  padding: 16px 0;
  border-bottom: 1px solid #e9ecef;
  margin-bottom: 40px;
`;

const HeaderContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Logo = styled.div`
  font-size: 24px;
  font-weight: bold;
  color: #00c853;
`;

const LoginButton = styled.button`
  background: #00c853;
  color: white;
  border: none;
  padding: 8px 20px;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
`;

const MainContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
`;

const Breadcrumb = styled.div`
  font-size: 14px;
  color: #666;
  margin-bottom: 20px;

  a {
    color: #666;
    text-decoration: none;

    &:hover {
      color: #00c853;
    }
  }

  span {
    margin: 0 8px;
  }
`;

const Title = styled.h1`
  font-size: 28px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
`;

const Subtitle = styled.p`
  color: #666;
  margin-bottom: 40px;
`;

const ContentWrapper = styled.div`
  display: grid;
  grid-template-columns: 1fr 350px;
  gap: 40px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 20px;
  }
`;

const DefectsSection = styled.div`
  background: white;
  border-radius: 12px;
  padding: 40px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const SectionTitle = styled.h3`
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin-bottom: 30px;
  text-align: center;
`;

const DefectGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 16px;
  margin-bottom: 20px;
`;

const CategoryHeader = styled.div`
  grid-column: 1 / -1;
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 20px 0 10px 0;
  padding-bottom: 8px;
  border-bottom: 2px solid #e0e0e0;
  text-transform: capitalize;

  &:first-child {
    margin-top: 0;
  }
`;

const DefectOption = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  border: 2px solid ${props => (props.selected ? '#00C853' : '#e9ecef')};
  background: ${props => (props.selected ? '#f0fff4' : 'white')};
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: #00c853;
    background: #f0fff4;
  }
`;

const DefectIcon = styled.div`
  width: 60px;
  height: 60px;
  background: #f8f9fa;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
  font-size: 24px;
  color: #666;
`;

const DefectLabel = styled.span`
  font-size: 14px;
  font-weight: 500;
  color: ${props => (props.selected ? '#00C853' : '#333')};
  text-align: center;
`;

const ContinueButton = styled.button`
  width: 100%;
  background: #00c853;
  color: white;
  border: none;
  padding: 16px 24px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  margin-top: 20px;

  &:hover {
    background: #00a844;
  }
`;

const Sidebar = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  height: fit-content;
`;

const SidebarImage = styled.div`
  width: 80px;
  height: 120px;
  background: #f8f9fa;
  border-radius: 8px;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  justify-content: center;

  img {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
  }
`;

const SidebarTitle = styled.h4`
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 16px;
`;

const SidebarSection = styled.div`
  margin-bottom: 20px;
`;

const SidebarSectionTitle = styled.h5`
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
`;

const SidebarText = styled.p`
  font-size: 14px;
  color: #666;
  margin: 0;
`;

const ProgressIndicator = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 20px;

  .step {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #e9ecef;
    margin-right: 8px;

    &.active {
      background: #00c853;
    }
  }

  .label {
    font-size: 14px;
    color: #666;
  }
`;

const SellScreenDefects = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { product, answers, productId, variantId, selectedVariant, deviceEvaluation } =
    location.state || {};

  // Use deviceEvaluation if answers is not available (coming from SellDeviceEvaluation)
  const evaluationData = answers || deviceEvaluation || {};
  console.log({ answers });
  const [selectedDefects, setSelectedDefects] = useState([]);
  const [selectedDefectsDetails, setSelectedDefectsDetails] = useState([]); // Store complete defect information
  const [defectOptions, setDefectOptions] = useState([]);
  const [groupedDefects, setGroupedDefects] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Helper function to get category-specific icons
  const getCategoryIcon = category => {
    const categoryIcons = {
      screen: '📱',
      body: '🔨',
      camera: '📷',
      battery: '🔋',
      audio: '🔊',
      connectivity: '📶',
      buttons: '🔘',
      charging: '🔌',
      default: '🔧',
    };
    return categoryIcons[category] || categoryIcons.default;
  };

  // Fetch defects from API
  useEffect(() => {
    const fetchDefects = async () => {
      console.log('Fetching defects for product:', product);
      if (!product?.data?.categoryId) {
        setError('Product category not found');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await sellService.getCustomerDefects(product.data.categoryId._id);

        console.log('API Response:', response); // Debug logging

        // Handle the API response structure
        let defects = [];
        let groupedDefectsFromAPI = {};

        // Handle the actual API response format: {defects: Array, grouped: Object}
        if (response && response.defects && Array.isArray(response.defects)) {
          defects = response.defects;
          console.log('Using defects from response.defects:', defects.length, 'items');

          // Use grouped data from API if available
          if (response.grouped && typeof response.grouped === 'object') {
            groupedDefectsFromAPI = response.grouped;
            console.log('Using grouped defects from API:', Object.keys(groupedDefectsFromAPI));
          }
        } else if (response && response.success && response.data) {
          // Handle wrapped response format: {success: true, data: {defects: Array, grouped: Object}}
          if (response.data.defects && Array.isArray(response.data.defects)) {
            defects = response.data.defects;
            console.log('Using defects from response.data.defects:', defects.length, 'items');

            if (response.data.grouped && typeof response.data.grouped === 'object') {
              groupedDefectsFromAPI = response.data.grouped;
              console.log('Using grouped defects from API:', Object.keys(groupedDefectsFromAPI));
            }
          } else {
            console.warn('No defects array found in response.data');
            defects = [];
          }
        } else if (response && response.data && Array.isArray(response.data)) {
          // Handle case where defects are directly in response.data
          defects = response.data;
          console.log('Using defects from response.data array:', defects.length, 'items');
        } else if (response && Array.isArray(response)) {
          // Handle case where response is directly an array
          defects = response;
          console.log('Using defects from response array:', defects.length, 'items');
        } else {
          console.warn('Unexpected API response format:', response);
          defects = []; // Use empty array instead of throwing error
        }

        let transformedDefects = [];

        if (defects && Array.isArray(defects) && defects.length > 0) {
          // Transform flat defects array
          transformedDefects = defects.map(defect => ({
            id: defect._id || defect.key || defect.id,
            label: defect.title || defect.label || defect.name,
            icon: defect.icon || getCategoryIcon(defect.category),
            category: defect.category || 'other',
            delta: defect.delta,
            order: defect.order || 0,
          }));
        }

        // Sort defects by category and order
        transformedDefects.sort((a, b) => {
          if (a.category !== b.category) {
            return a.category.localeCompare(b.category);
          }
          return (a.order || 0) - (b.order || 0);
        });

        // Use grouped defects from API if available, otherwise create our own
        let finalGroupedDefects = {};

        if (Object.keys(groupedDefectsFromAPI).length > 0) {
          // Transform API grouped defects to match our UI format
          finalGroupedDefects = Object.keys(groupedDefectsFromAPI).reduce((acc, category) => {
            acc[category] = groupedDefectsFromAPI[category].map(defect => ({
              id: defect._id || defect.key || defect.id,
              label: defect.title || defect.label || defect.name,
              icon: defect.icon || getCategoryIcon(defect.category),
              category: defect.category || category,
              delta: defect.delta,
              order: defect.order || 0,
            }));
            return acc;
          }, {});
          console.log('Using API grouped defects:', Object.keys(finalGroupedDefects));
        } else {
          // Create our own grouping from transformed defects
          finalGroupedDefects = transformedDefects.reduce((acc, defect) => {
            if (!acc[defect.category]) {
              acc[defect.category] = [];
            }
            acc[defect.category].push(defect);
            return acc;
          }, {});
          console.log('Created client-side grouped defects:', Object.keys(finalGroupedDefects));
        }

        // Add "No Defects" option at the beginning
        const defectOptionsWithNoDefects = [
          { id: 'no-defects', label: 'No Defects', icon: '✓', category: 'none', order: -1 },
          ...transformedDefects,
        ];

        setDefectOptions(defectOptionsWithNoDefects);
        setGroupedDefects(finalGroupedDefects);

        console.log('Processed defects:', defectOptionsWithNoDefects); // Debug logging
      } catch (err) {
        console.error('Error fetching defects:', err);
        setError('Failed to load defects');

        // Fallback to hardcoded defects if API fails
        const fallbackDefects = [
          { id: 'no-defects', label: 'No Defects', icon: '✓' },
          { id: 'screen-burn', label: 'Screen Burn', icon: '🔥' },
          { id: 'dead-pixels', label: 'Dead Pixels', icon: '⚫' },
          { id: 'screen-lines', label: 'Screen Lines', icon: '📱' },
          { id: 'cracked-screen', label: 'Cracked Screen', icon: '💔' },
          { id: 'body-damage', label: 'Body Damage', icon: '🔨' },
          { id: 'water-damage', label: 'Water Damage', icon: '💧' },
          { id: 'button-issues', label: 'Button Issues', icon: '🔘' },
        ];
        setDefectOptions(fallbackDefects);
      } finally {
        setLoading(false);
      }
    };

    fetchDefects();
  }, [product?._id]);

  const handleDefectToggle = defectId => {
    if (defectId === 'no-defects') {
      setSelectedDefects(['no-defects']);
      setSelectedDefectsDetails([
        {
          id: 'no-defects',
          label: 'No Defects',
          icon: '✓',
          category: 'none',
          delta: 0,
          questionText: 'Screen/Body Condition',
          answerText: 'No Defects',
          questionType: 'defect_selection',
          section: 'screen_defects',
        },
      ]);
    } else {
      setSelectedDefects(prev => {
        const filtered = prev.filter(id => id !== 'no-defects');
        if (filtered.includes(defectId)) {
          // Remove defect
          const newSelected = filtered.filter(id => id !== defectId);

          // Update detailed defects
          setSelectedDefectsDetails(prevDetails =>
            prevDetails.filter(defect => defect.id !== defectId)
          );

          return newSelected;
        } else {
          // Add defect
          const defectToAdd =
            defectOptions.find(d => d.id === defectId) ||
            Object.values(groupedDefects)
              .flat()
              .find(d => d.id === defectId);

          if (defectToAdd) {
            // Update detailed defects
            setSelectedDefectsDetails(prevDetails => [
              ...prevDetails.filter(d => d.id !== 'no-defects'), // Remove no-defects if adding actual defects
              {
                id: defectToAdd.id,
                label: defectToAdd.label,
                icon: defectToAdd.icon,
                category: defectToAdd.category,
                delta: defectToAdd.delta || 0,
                questionText: 'Screen/Body Condition',
                answerText: defectToAdd.label,
                questionType: 'defect_selection',
                section: 'screen_defects',
              },
            ]);
          }

          return [...filtered, defectId];
        }
      });
    }
  };

  const handleContinue = () => {
    console.log('Product object:', product); // Debug logging
    console.log('Product ID:', product?._id); // Debug logging
    console.log('Selected defects details:', selectedDefectsDetails); // Debug logging for defect details

    // Use product.id as fallback if _id is not available
    const productId = product?._id || product?.data.id;

    if (!productId) {
      console.error('No product ID found. Product object:', product);
      alert('Product information is missing. Please go back and select a product again.');
      return;
    }

    navigate(`/sell/accessories/${productId}`, {
      state: {
        selectedVariant,
        product,
        answers: evaluationData,
        screenDefects: selectedDefectsDetails,
        screenDefectsDetails: selectedDefectsDetails, // Pass complete defect information
      },
    });
  };

  if (!product) {
    return (
      <Container>
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '50vh',
          }}
        >
          Product information not found
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <HeaderContent>
          <Logo>CASHIFY</Logo>
          <LoginButton>Login</LoginButton>
        </HeaderContent>
      </Header>

      <MainContent>
        <Breadcrumb>
          <a href="/">Home</a>
          <span>&gt;</span>
          <a href="/sell">Sell Old Mobile Phone</a>
          <span>&gt;</span>
          <a href="/sell/apple">Sell Old Apple</a>
          <span>&gt;</span>
          <span>Sell Old Apple iPhone 6S</span>
        </Breadcrumb>

        <Title>Sell Old Apple iPhone 6S (2 GB/16 GB)</Title>
        <Subtitle>
          <span style={{ color: '#00C853' }}>₹2,160+</span> already sold on Cashify
        </Subtitle>

        <ContentWrapper>
          <DefectsSection>
            <ProgressIndicator>
              <div className="step active"></div>
              <div className="step active"></div>
              <div className="step"></div>
              <div className="step"></div>
              <span className="label">Screen Condition</span>
            </ProgressIndicator>

            <SectionTitle>Select screen/body defects (if any)</SectionTitle>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <div style={{ fontSize: '18px', color: '#666' }}>Loading defects...</div>
              </div>
            ) : error ? (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <div style={{ fontSize: '16px', color: '#e74c3c', marginBottom: '10px' }}>
                  {error}
                </div>
                <div style={{ fontSize: '14px', color: '#666' }}>Using fallback options</div>
              </div>
            ) : null}

            <DefectGrid>
              {/* No Defects option */}
              <DefectOption
                key="no-defects"
                selected={selectedDefects.includes('no-defects')}
                onClick={() => handleDefectToggle('no-defects')}
              >
                <DefectIcon>✓</DefectIcon>
                <DefectLabel selected={selectedDefects.includes('no-defects')}>
                  No Defects
                </DefectLabel>
              </DefectOption>

              {/* Grouped defects by category */}
              {Object.entries(groupedDefects).map(([category, categoryDefects]) => (
                <React.Fragment key={category}>
                  <CategoryHeader>{category}</CategoryHeader>
                  {categoryDefects.map(defect => (
                    <DefectOption
                      key={defect.id}
                      selected={selectedDefects.includes(defect.id)}
                      onClick={() => handleDefectToggle(defect.id)}
                    >
                      <DefectIcon>{defect.icon}</DefectIcon>
                      <DefectLabel selected={selectedDefects.includes(defect.id)}>
                        {defect.label}
                      </DefectLabel>
                    </DefectOption>
                  ))}
                </React.Fragment>
              ))}
            </DefectGrid>

            <ContinueButton onClick={handleContinue}>Continue</ContinueButton>
          </DefectsSection>

          <Sidebar>
            <SidebarImage>
              {product.images && product.images['0'] ? (
                <img src={product.images['0'].replace(/["`]/g, '')} alt={product.name} />
              ) : (
                <div style={{ color: '#999' }}>No Image</div>
              )}
            </SidebarImage>

            <SidebarTitle>
              Apple iPhone 6S ({selectedVariant?.label || selectedVariant || 'Unknown Variant'})
            </SidebarTitle>

            <SidebarSection>
              <SidebarSectionTitle>Get Upto</SidebarSectionTitle>
              <SidebarText style={{ color: '#00C853', fontSize: '18px', fontWeight: '600' }}>
                ₹{product.pricing?.discountedPrice || '2,160'}
              </SidebarText>
            </SidebarSection>

            <SidebarSection>
              <SidebarSectionTitle>Device Evaluation</SidebarSectionTitle>
              {evaluationData &&
                Object.entries(evaluationData).map(([questionId, answer], index) => {
                  console.log('Rendering answer:', { questionId, answer, type: typeof answer });

                  // Handle both old format (simple strings) and new format (objects)
                  if (typeof answer === 'string') {
                    // Old format from SellDeviceEvaluation
                    const questionLabels = {
                      calls: 'Calls',
                      touchScreen: 'Touch Screen',
                      originalScreen: 'Original Screen',
                    };
                    const answerLabels = {
                      yes: 'Working',
                      no: 'Not Working',
                    };
                    return (
                      <SidebarText key={questionId}>
                        {questionLabels[questionId] || questionId}: {answerLabels[answer] || answer}
                      </SidebarText>
                    );
                  } else if (
                    answer &&
                    typeof answer === 'object' &&
                    answer.questionText &&
                    answer.answerText
                  ) {
                    // New format from ProductCondition
                    return (
                      <SidebarText key={questionId}>
                        {String(answer.questionText)}: {String(answer.answerText)}
                      </SidebarText>
                    );
                  }
                  return null;
                })}
            </SidebarSection>

            <SidebarSection>
              <SidebarSectionTitle>Screen Condition</SidebarSectionTitle>
              {selectedDefects.length > 0 && (
                <div>
                  {selectedDefects.includes('no-defects') ? (
                    <SidebarText>No Defects</SidebarText>
                  ) : (
                    <div>
                      <SidebarText>{selectedDefects.length} defect(s) selected</SidebarText>
                      {selectedDefectsDetails.map((defect, index) => (
                        <SidebarText
                          key={defect.id}
                          style={{ fontSize: '12px', color: '#888', marginTop: '4px' }}
                        >
                          • {defect.label}{' '}
                          {defect.delta !== 0 && `(${defect.delta > 0 ? '+' : ''}₹${defect.delta})`}
                        </SidebarText>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </SidebarSection>

            <SidebarSection>
              <SidebarSectionTitle>Accessories</SidebarSectionTitle>
            </SidebarSection>
          </Sidebar>
        </ContentWrapper>
      </MainContent>
    </Container>
  );
};

export default SellScreenDefects;
