import Header from '@src/components/Header';
import Banner from './Banner';
import GatewaysTable from './GatewaysTable';

const Gateways = () => {
  return (
    <div className="flex h-full max-w-full flex-col">
      <div className="mb-6 flex shrink-0 flex-col gap-6">
        <Header />
      </div>
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto scrollbar scrollbar-thin">
          <div className="mb-6 flex flex-col gap-6 pt-0">
            <Banner />
            <GatewaysTable />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Gateways;
