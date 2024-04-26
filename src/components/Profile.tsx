import { useState } from 'react';
import Button, { ButtonType } from './Button';
import { ConnectIcon } from './icons';
import ConnectModal from './modals/ConnectModal';

const Profile = () => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  return (
    <div>
      <Button
        buttonType={ButtonType.PRIMARY}
        icon={<ConnectIcon />}
        title="Connect"
        text="Connect"
        onClick={() => setIsModalOpen(true)}
      />
      <ConnectModal open={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};
export default Profile;
