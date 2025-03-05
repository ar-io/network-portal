import Header from '@src/components/Header';
import Banner from './Banner';
import VaultsTable from './VaultsTable';

const Balances = () => {
  return (
    <div className="flex max-w-full flex-col gap-6 overflow-auto pb-6">
      <Header />
      <Banner />
      <VaultsTable />
    </div>
  );
};

export default Balances;
