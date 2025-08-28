import Header from '@src/components/Header';
import Banner from './Banner';
import ObserversTable from './ObserversTable';

const Observers = () => {
  return (
    <div className="flex h-full max-w-full flex-col">
      <div className="mb-6 shrink-0">
        <Header />
      </div>
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto">
          <div className="mb-6 flex flex-col gap-6 pt-0">
            <Banner />
            <ObserversTable />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Observers;
