# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.11.7] - 2025-04-08

## Added

- Gateway: Shows passed/failed for epoch in Reported On By card 
- Observers: Tooltip added to Observer Performance column to show observed and prescribed counts

## [1.11.6] - 2025-03-28

## Changed

- Improved error handling when loading historical epoch data

## [1.11.5] - 2025-03-25

### Fixed

- Disable delegate stake button for gateways operated by logged-in user and direct them to use operator staking. 

## [1.11.4] - 2025-03-20

### Updated

- Gateway Details page: show actual number of observers per epoch in "Failed by x/y Observers" card 

## [1.11.3] - 2025-03-20

### Added

- Added an error notification when app is unable to retrieve epoch data for an epoch index
- Added fallback retrieval method for epochs when Epoch-Distribution-Notice is not available

### Updated

- Set default graphql endpoint to arweave.net


## [1.11.2] - 2025-03-19

### Changed

- Always show transfer button in Profile menu

## [1.11.1] - 2025-03-12

### Fixed

- Fixed display of controller for vaults in Balances page

## [1.11.0] - 2025-03-06

### Added

- New Balances page for viewing breakdown of ARIO balances and vaulted funds

### Changed

- Update to read min operator stake and max reward share ratio values from process
- Update GQL endpoint to use Goldsky
- Dashboard: Modified from "Rewards Claimed" to "Rewards Distributed" to more accurately represent
  the system
- Dashboard: ArNS Stats panel: Replaced Active Names with Names Purchased in tooltip

### Fixed

- Read error that caused page crash in Dashboard when switching processes in settings
- Fixed handling account switching with Wander
- Fix display of total stake as ARIO instead of mARIO on gateway selector for redelegation

## [1.10.3] - 2025-02-25

### Changed

- Updated to ar.io SDK 3.8.2-alpha.1 for improved retry logic on AO interactions
- Made info icon red on redelegation modal to make it more noticeable for users

## [1.10.2] - 2025-02-20

### Changed

- Updated fee message on Redelegation modal

## [1.10.1] - 2025-02-20

### Changed

- Updated to ar.io SDK 3.8.0

### Fixed

- Allow editing ArNS names for observations when prescribed names are unavailable

## [1.10.0] - 2025-02-20

### Updated

- Application configured for mainnet process
- Modified to handle pre-epoch-zero state

## [1.9.5] - 2025-02-14

### Fixed

- Adjusted rewards calculation to work with new scheme where rewards were unavailable on current epoch

## [1.9.4] - 2025-02-13

### Fixed

- Fixed profile menu errant display of 0 when ARIO balance is 0

## [1.9.3] - 2025-02-13

### Changed

- Added support for account switching with Metamask

### Fixed

- Observer page banner performance field fixed to use updated field from process

## [1.9.2] - 2025-02-12

### Updated

- Revised observations to use ky library and use 5000ms timeout to better match with gateway observer scheme

### Fixed

- Added better error handling for observations

## [1.9.1] - 2025-02-10

### Fixed

- Updated to latest ar.io SDK and updated Dashboard to fix refresh issues when
  switching AR.IO Process in Settings

## [1.9.0] - 2025-02-07

### Added

- Added support for Metamask Wallet
- Added support for sending ARIO using "Transfer ARIO" modal, accessible from Profile menu
- Added Info icon to ArNS Stats panel with tooltip to view additional ArNS stats

### Changed

- Updated wallet name from ArConnect to Wander to reflect new branding
- Minor optimizations for queries

## [1.8.3] - 2025-02-03

### Changed

- Minor fix for property name change.

## [1.8.2] - 2025-02-03

### Changed

- Updated to latest ar.io SDK to support changes in property names for data returned by the network

## [1.8.1] - 2025-01-29

### Fixed

- Clear congestion banner when network returns to normal

## [1.8.0] - 2025-01-28

### Added

- Show ArNS ANT Logo in profile if user is using primary name
- Applications Settings: use new sidebar Settings option to open modal to
  configure ARIO Process ID and AO CU URL
- Added copy button for domain name columns in tables
- Show Delegate EAY for gateways in Active Stakes table

### Changed

- Signing with ArConnect now uses signDataItem API, providing a more informed signing experience.

### Fixed

- Fixed height sizing issue of view port when network congestion banner is shown

## [1.7.0] - 2024-12-20

### Added

- Redelegate Stake: Users can now redelegate stake and pending withdrawals between gateways. Includes moving to/from operator stake and delegated stake.
  Redelegation fees are assessed at 10% per redelegation performed since the last fee reset, up to 60%. Fees are reset when no redelegations are performed in the last 7 days.

### Changed

- Leave Network: text updated to 90-days for vaulted funds
- Staking: Staking and Withdrawal are now separate modals that are initiated from unique popup menu options

### Fixed

- Gateway Details: Restored "Leave" (when viewing own gateway) and "Stake" (when viewing other gateways) buttons

## [1.6.0] - 2024-12-10

### Added

- Gateway Details
  - Added Operator Stake card showing operator stake and EAY, as well as manage stake button for updating operator stake.
  - Added collapsible Pending Withdrawals card for viewing current withdrawals as well as managing
    them (canceling a withdrawal or initiating an expedited withdrawal). Visible only to the gateway operator.
  - Added collapsible Active Delegates card showing the list of active delegates for the gateway.

## [1.5.0] - 2024-12-04

### Added

- Profile button shows user's ArNS Primary Name (if available) or wallet address when logged in
- Download buttons added to Reports page and individual Report page
- Observers: Added epoch selector to view prescribed observers for previous epochs
- Gateway Details Page
  - Reported On By card: text links to gateway for observer, report button links to report
  - Reported On card: Report button shows in header that links to that report's page

### Updated

- Staking and Withdrawal modals updated to show Review page for user to confirm operation before processing
- Withdrawal Modal: Added option for Standard and Expedited Withdrawal
- Modal dialog styles refreshed
- Reward Share Ratio capped to 95% when joining network and updating gateway settings

## [1.4.3] - 2024-11-27

### Updated

- Settings updated for staking:
  - Staking withdrawals are now 90 days
  - Gateway Operator Stake minimum is now 10,000 IO
  - Minimum Delegated Staking amount for gateway configuration is now 10 IO

## [1.4.2] - 2024-11-20

### Updated

- Show error message toast if the application is unable to retrieve the current epoch

## [1.4.1] - 2024-11-18

### Updated

- Optimized loading of user stakes and pending withdrawals.

### Fixed

- Gateways count in site header should only count active gateways.

## [1.4.0] - 2024-11-14

### Added

- View Pending Withdrawals on Staking page and support cancelling pending withdrawals as well as performing expedited withdrawals
- View Changelog in app by clicking version number in sidebar

### Updated

- Staking page top cards now show balance, amount staking + pending withdrawals, and rewards earned last 14 epochs and last epoch

### Changed

- Updated header style of cards
- Observations: Updated to use arweave.net for reference domain when generating observation report
- Observe: Default to using prescribed names

## [1.3.0] - 2024-10-21

### Added

- New Dashboard home page that visualizes data for the state of the gateway network

## [1.2.0] - 2024-10-17

### Added

- “Reported On” and “Reported On By” cards on Gateway Details page for viewing observation status by epoch for a gateway
- “Software” card on gateway details page that shows gateway software version and available bundlers (if gateway has listed them)

### Changed

- Updated Gateway Details page for leaving gateways to hide non-relevant cards and show leave date

## [1.1.0] - 2024-10-08

### Added

- Gateways > Reports: Add “AR.IOEpoch #” Column
- Gateways>Reports>Individual Reports
  - Add Epoch #
  - Remove Epoch start height
- Implemented Leave Network Flow:
  - Adds button to Gateway Detail page to leave network when gateway shown is the user’s own gateway
  - Hitting Leave shows a modal with information. User has to type “LEAVE NETWORK” before Leave Network button is enabled.
  - Hitting Leave Network button initiates signature request and then a success message.
  - Site is refreshed after leaving.
- Release version shown on sidebar

### Changed

- Gateway Details: rename “Reward Ratios” to “Performance Ratios”
- Gateway Details: Fixes text bubble cut off when copying wallet address

### Fixed

- Gateway Details: Remove Edit and Stake Buttons from gateways that are leaving

## [1.0.0]

- Initial versions of application; version was bumped to 1.1.0 for first public versioned release.
