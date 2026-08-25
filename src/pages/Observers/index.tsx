import Header from '@src/components/Header';
import Banner from './Banner';
import ObserversTable from './ObserversTable';
import PrescribedNamesBar from './PrescribedNamesBar';

const Observers = () => {
  return (
    <div className="pl-4 lg:pl-6 flex h-full max-w-full flex-col">
      <div className="mb-4 shrink-0 pr-4 lg:pr-6">
        <Header />
      </div>
      <div className="flex-1 overflow-y-auto overflow-x-hidden pr-2 scrollbar scrollbar-thin lg:pr-3">
        <div className="mb-6 flex flex-col gap-6 pt-0">
          <Banner />
          <PrescribedNamesBar />
          <ObserversTable />
        </div>
      </div>
    </div>
  );
};

export default Observers;
