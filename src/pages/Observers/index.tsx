import Header from '@src/components/Header';
import Banner from './Banner';
import ObserversTable from './ObserversTable';

const Observers = () => {
  return (
    <div className="flex max-w-full flex-col gap-6 overflow-auto pb-6">
      <Header />
      <Banner />
      <ObserversTable />
    </div>
  );
};

export default Observers;
