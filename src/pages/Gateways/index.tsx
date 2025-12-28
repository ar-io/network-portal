import Header from '@src/components/Header';
import Banner from './Banner';
import GatewaysTable from './GatewaysTable';

const Gateways = () => {
  return (
    <div className="flex h-full max-w-full flex-col">
      <div className="mb-4 px-4 lg:px-6 shrink-0">
        <Header />
      </div>
      <div className="flex-1 px-4 lg:px-6 py-2 overflow-scroll scrollbar scrollbar-thin">
        <div className="mb-6 flex flex-col gap-6 pt-0">
          <Banner />
          <GatewaysTable />
        </div>
      </div>
    </div>
  );
};

export default Gateways;
