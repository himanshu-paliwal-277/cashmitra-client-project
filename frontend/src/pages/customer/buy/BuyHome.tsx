import { useSearchParams } from 'react-router-dom';
import BuySuperCategorySelection from './BuySuperCategorySelection';
import Marketplace from './Marketplace';

const BuyHome = () => {
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('search');
  const category = searchParams.get('category');

  if (searchQuery || category) {
    return <Marketplace />;
  }

  return <BuySuperCategorySelection />;
};

export default BuyHome;
